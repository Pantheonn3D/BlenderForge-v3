// src/pages/CreateProductPage.jsx

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CreateProductPage.module.css';
import { useAuth } from '../context/AuthContext';
import {
  createProduct,
  getMarketplaceCategories,
  getProductBySlug,
  updateProduct,
  generateUniqueSlug
} from '../services/productService';
import Button from '../components/UI/Button/Button';
import Spinner from '../components/UI/Spinner/Spinner';
import UploadIcon from '../assets/icons/UploadIcon';
import XMarkIcon from '../assets/icons/XMarkIcon';
import CheckmarkIcon from '../assets/icons/CheckmarkIcon';
import TextBlockEditor from '../features/articleCreator/components/TextBlockEditor';

const NAME_MAX_LENGTH = 80;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_PRODUCT_FILE_SIZE = 50 * 1024 * 1024; // 50MB for product files
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_GALLERY_IMAGES = 5;

// Local Storage Keys for Autosave
const AUTOSAVE_KEY_PREFIX = 'blenderforge_product_draft_';

const CreateProductPage = () => {
  const { slug } = useParams();
  const isEditMode = Boolean(slug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const thumbnailInputRef = useRef(null);
  const productFileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState(null);
  const [price, setPrice] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [version, setVersion] = useState('');
  const [blenderVersion, setBlenderVersion] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [productFile, setProductFile] = useState(null);
  const [existingDownloadUrl, setExistingDownloadUrl] = useState('');

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // UI/Error state
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [galleryDragActive, setGalleryDragActive] = useState(false);

  // Determine the unique autosave key for this form
  const autosaveKey = useMemo(() => {
    return isEditMode ? `${AUTOSAVE_KEY_PREFIX}edit_${slug}` : `${AUTOSAVE_KEY_PREFIX}new`;
  }, [isEditMode, slug]);

  // Effect for initial data fetch and draft loading/application
  useEffect(() => {
    const fetchAndApplyData = async () => {
      try {
        setIsLoadingPage(true);

        const fetchedCategories = await getMarketplaceCategories();
        setCategories(fetchedCategories);

        let productDataFromDb = {};
        if (isEditMode && slug) {
          const product = await getProductBySlug(slug);
          if (!product || product.user_id !== user?.id) {
            alert(product ? "You are not authorized to edit this product." : "Product not found.");
            navigate('/marketplace');
            return;
          }
          productDataFromDb = product;
        }

        let draftData = {};
        try {
          const savedDraft = localStorage.getItem(autosaveKey);
          if (savedDraft) {
            draftData = JSON.parse(savedDraft);
          }
        } catch (e) {
          console.error("Failed to parse draft from localStorage", e);
          localStorage.removeItem(autosaveKey);
        }

        const combinedData = {
            ...productDataFromDb,
            ...draftData
        };

        if (draftData.description !== undefined && draftData.description !== null) {
            combinedData.description = draftData.description;
        } else if (productDataFromDb.description !== undefined && productDataFromDb.description !== null) {
            combinedData.description = productDataFromDb.description;
        } else {
            combinedData.description = null;
        }
        
        const finalDescription = typeof combinedData.description === 'string' ?
            { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: combinedData.description }] }] } :
            combinedData.description;

        setName(combinedData.name || '');
        setDescription(finalDescription);
        setPrice(String(combinedData.price || '0'));
        setCategoryId(combinedData.categoryId || fetchedCategories[0]?.id || '');
        setTags(Array.isArray(combinedData.tags) ? combinedData.tags.join(', ') : (combinedData.tags || ''));
        setVersion(combinedData.version || '');
        setBlenderVersion(combinedData.blender_version_min || '');
        setThumbnailPreview(combinedData.thumbnailPreview || combinedData.thumbnail_url || '');
        setExistingDownloadUrl(combinedData.existingDownloadUrl || combinedData.download_url || '');
        
        if (Array.isArray(combinedData.galleryPreviews)) {
             setGalleryPreviews(combinedData.galleryPreviews);
        } else if (Array.isArray(combinedData.gallery_images)) {
            setGalleryPreviews(combinedData.gallery_images.map(url => ({ url, isNew: false })));
        } else {
            setGalleryPreviews([]);
        }

        if (Object.keys(draftData).length > 0 && !isEditMode) {
          // Show a more elegant notification instead of alert
          setErrors({ draft: 'Unsaved draft loaded. Remember to save your changes!' });
        }
        
        if (isEditMode && localStorage.getItem(`${AUTOSAVE_KEY_PREFIX}new`)) {
            localStorage.removeItem(`${AUTOSAVE_KEY_PREFIX}new`);
        }

      } catch (error) {
        console.error("Failed to load page data or draft:", error);
        setErrors({ general: "Failed to load page data." });
      } finally {
        setIsLoadingPage(false);
      }
    };
    if (user) {
      fetchAndApplyData();
    }
  }, [slug, isEditMode, navigate, user, autosaveKey]);

  // Effect to autosave form data to local storage
  useEffect(() => {
    if (isLoadingPage) return;

    const timer = setTimeout(() => {
      try {
        const dataToSave = {
          name, description, price, categoryId, tags, version, blenderVersion,
          thumbnailPreview, existingDownloadUrl, galleryPreviews,
        };
        localStorage.setItem(autosaveKey, JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Failed to save draft to localStorage", e);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    name, description, price, categoryId, tags, version, blenderVersion,
    thumbnailPreview, existingDownloadUrl, galleryPreviews, autosaveKey, isLoadingPage
  ]);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > MAX_FILE_SIZE || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors(prev => ({...prev, thumbnail: 'Invalid file. Max 5MB, JPG/PNG/WebP/GIF only.'}));
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setErrors(prev => ({...prev, thumbnail: null}));
    }
  }, []);

  const handleGalleryDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setGalleryDragActive(true);
    } else if (e.type === "dragleave") {
      setGalleryDragActive(false);
    }
  }, []);

  const handleGalleryDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragActive(false);
    
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      handleGalleryFiles(files);
    }
  }, []);

  const handleGalleryFiles = (files) => {
    const newErrors = { ...errors };
    let hasError = false;

    if (galleryPreviews.length + files.length > MAX_GALLERY_IMAGES) {
      newErrors.gallery = `You can upload a maximum of ${MAX_GALLERY_IMAGES} gallery images.`;
      hasError = true;
    } else {
      newErrors.gallery = null;
    }

    const validNewFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        newErrors.gallery = newErrors.gallery || 'Some files were invalid. Max 5MB per image, JPG/PNG/WebP/GIF only.';
        hasError = true;
      } else {
        validNewFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), isNew: true, file: file });
      }
    });

    setErrors(newErrors);
    setGalleryFiles(prev => [...prev, ...validNewFiles]);
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const validateAndSubmit = async () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Product name is required.';
    if (!description || !description.content || description.content.length === 0 ||
        (description.content.length === 1 && description.content[0]?.type === 'paragraph' &&
         (!description.content[0].content || description.content[0].content.length === 0))) {
      newErrors.description = 'Description cannot be empty.';
    }
    if (!categoryId) newErrors.category = 'A category is required.';
    if (parseFloat(price) < 0 || isNaN(parseFloat(price))) newErrors.price = 'Price must be a valid number (0 for free).';
    if (!thumbnailPreview) newErrors.thumbnail = 'A thumbnail image is required.';
    if (!isEditMode && !productFile) newErrors.productFile = 'An addon file is required for new products.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) throw new Error('You must be logged in.');

      const existingGalleryImageUrlsToKeep = galleryPreviews
        .filter(item => !item.isNew)
        .map(item => item.url);

      const productData = {
        name: name.trim(),
        description: description,
        price: parseFloat(price),
        category_id: parseInt(categoryId, 10),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        version: version.trim(),
        blender_version_min: blenderVersion.trim(),
        is_published: true,
        user_id: user.id,
        thumbnail_url: thumbnailPreview,
        download_url: existingDownloadUrl,
      };

      let finalSlug = slug;
      if (isEditMode) {
        const baseSlug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const generatedSlug = await generateUniqueSlug(baseSlug);
        if (generatedSlug !== slug) {
            finalSlug = generatedSlug;
        }
        
        await updateProduct(
            slug,
            productData,
            thumbnailFile,
            productFile,
            existingGalleryImageUrlsToKeep,
            galleryFiles,
            finalSlug
        );

        localStorage.removeItem(autosaveKey);
        navigate(`/marketplace/${finalSlug}`, { state: { message: 'Product updated successfully!', type: 'success' } });

      } else {
        await createProduct(productData, thumbnailFile, productFile, galleryFiles, user.id);
        localStorage.removeItem(autosaveKey);
        navigate('/marketplace', { state: { message: 'Product published successfully!', type: 'success' } });
      }

    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ general: error.message || 'An unknown error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem(autosaveKey);
    navigate(isEditMode ? `/marketplace/${slug}` : '/marketplace');
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({...prev, thumbnail: 'Invalid file. Max 5MB, JPG/PNG/WebP/GIF only.'}));
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setErrors(prev => ({...prev, thumbnail: null}));
  };

  const handleProductFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PRODUCT_FILE_SIZE) {
        setErrors(prev => ({...prev, productFile: `File too large. Max ${MAX_PRODUCT_FILE_SIZE / (1024 * 1024)}MB.`}));
        return;
    }
    setProductFile(file);
    setErrors(prev => ({...prev, productFile: null}));
  };

  const handleGalleryFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    handleGalleryFiles(files);
    e.target.value = null;
  };

  const handleRemoveGalleryImage = useCallback((indexToRemove) => {
    setGalleryPreviews(prevPreviews => {
      const newPreviews = prevPreviews.filter((_, index) => index !== indexToRemove);

      const removedItem = prevPreviews[indexToRemove];
      if (removedItem.isNew && removedItem.file) {
        setGalleryFiles(prevFiles => prevFiles.filter(file => file !== removedItem.file));
      }
      return newPreviews;
    });
  }, []);

  useEffect(() => {
    return () => {
      galleryPreviews.forEach(item => {
        if (item.isNew && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [galleryPreviews]);

  if (isLoadingPage) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <Spinner size={48} />
          <h2>Loading...</h2>
          <p>Setting up your workspace</p>
        </div>
      </div>
    );
  }

  const canAddMoreGalleryImages = galleryPreviews.length < MAX_GALLERY_IMAGES;
  const remainingCharacters = NAME_MAX_LENGTH - name.length;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              {isEditMode ? (
                <>
                  <span className={styles.titleIcon}></span>
                  Edit Product
                </>
              ) : (
                <>
                  <span className={styles.titleIcon}></span>
                  Upload New Product
                </>
              )}
            </h1>
            <p className={styles.subtitle}>
              {isEditMode ? 
                `Updating "${name}" - make your changes and save when ready.` : 
                'Share your amazing Blender creation with the community and start earning from your work.'
              }
            </p>
            {errors.draft && (
              <div className={styles.draftNotification}>
                <CheckmarkIcon />
                <span>{errors.draft}</span>
              </div>
            )}
          </div>
        </header>

        <div className={styles.contentGrid}>
          <main className={styles.mainContent}>
            {errors.general && (
              <div className={styles.errorBanner}>
                <span>⚠️ {errors.general}</span>
              </div>
            )}

            {/* Basic Information Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Basic Information</h2>
                <p>Essential details about your product</p>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Product Name*
                  <span className={styles.charCount}>
                    {remainingCharacters} characters remaining
                  </span>
                </label>
                <input 
                  id="name" 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  maxLength={NAME_MAX_LENGTH} 
                  className={`${styles.input} ${errors.name ? styles.error : ''}`} 
                  placeholder="e.g., Super Slicer Pro - Advanced Mesh Tools"
                />
                {errors.name && <p className={styles.errorText}>{errors.name}</p>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="category" className={styles.label}>Category*</label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={`${styles.select} ${errors.category ? styles.error : ''}`}
                    disabled={!categories.length}
                  >
                    {!categories.length ? (
                      <option>Loading categories...</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                  {errors.category && <p className={styles.errorText}>{errors.category}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="price" className={styles.label}>
                    Price (USD)*
                    {parseFloat(price) === 0 && <span className={styles.badge}>Free</span>}
                  </label>
                  <div className={styles.priceInput}>
                    <span className={styles.currencySymbol}>$</span>
                    <input 
                      id="price" 
                      type="number" 
                      value={price} 
                      onChange={e => setPrice(e.target.value)} 
                      min="0" 
                      step="0.01" 
                      className={`${styles.input} ${styles.priceField} ${errors.price ? styles.error : ''}`} 
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className={styles.errorText}>{errors.price}</p>}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Description</h2>
                <p>Tell the community about your product in detail</p>
              </div>
              
              <div className={styles.formGroup}>
                <TextBlockEditor
                  content={description}
                  onUpdate={({ editor, json }) => {
                    setDescription(json);
                  }}
                  placeholder="Describe your product in detail. What does it do? How does it help? Add headings, lists, and images to make it stand out..."
                />
                {errors.description && <p className={styles.errorText}>{errors.description}</p>}
              </div>
            </div>

            {/* Additional Details Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Additional Details</h2>
                <p>Help users find and understand your product</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tags" className={styles.label}>Tags</label>
                <input 
                  id="tags" 
                  type="text" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  className={styles.input} 
                  placeholder="e.g., sci-fi, procedural, low-poly, animation"
                />
                <small className={styles.helperText}>Comma-separated keywords to help users discover your product</small>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="version" className={styles.label}>Addon Version</label>
                  <input 
                    id="version" 
                    type="text" 
                    value={version} 
                    onChange={e => setVersion(e.target.value)} 
                    className={styles.input} 
                    placeholder="e.g., 1.2.1"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="blenderVersion" className={styles.label}>Min. Blender Version</label>
                  <input 
                    id="blenderVersion" 
                    type="text" 
                    value={blenderVersion} 
                    onChange={e => setBlenderVersion(e.target.value)} 
                    className={styles.input} 
                    placeholder="e.g., 4.1"
                  />
                </div>
              </div>
            </div>

            {/* Files Upload Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Files & Media</h2>
                <p>Upload your product files and showcase images</p>
              </div>

              {/* Thumbnail Upload */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Thumbnail Image*</label>
                <input 
                  type="file" 
                  accept={ALLOWED_IMAGE_TYPES.join(',')} 
                  onChange={handleThumbnailChange} 
                  ref={thumbnailInputRef} 
                  style={{ display: 'none' }} 
                />
                <div 
                  className={`${styles.thumbnailUploader} ${errors.thumbnail ? styles.error : ''} ${dragActive ? styles.dragActive : ''}`}
                  onClick={() => thumbnailInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {thumbnailPreview ? (
                    <div className={styles.thumbnailPreview}>
                      <img src={thumbnailPreview} alt="Thumbnail preview" />
                      <div className={styles.thumbnailOverlay}>
                        <UploadIcon />
                        <span>Click or drag to replace</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <UploadIcon />
                      <h3>Upload Thumbnail</h3>
                      <p>Click to browse or drag & drop your image here</p>
                      <span>PNG, JPG, WebP, GIF (max 5MB)</span>
                    </div>
                  )}
                </div>
                {errors.thumbnail && <p className={styles.errorText}>{errors.thumbnail}</p>}
              </div>

              {/* Gallery Upload */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Gallery Images 
                  <span className={styles.badge}>{galleryPreviews.length}/{MAX_GALLERY_IMAGES}</span>
                </label>
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleGalleryFileChange}
                  ref={galleryInputRef}
                  style={{ display: 'none' }}
                  multiple
                />
                
                <div 
                  className={`${styles.galleryContainer} ${galleryDragActive ? styles.dragActive : ''}`}
                  onDragEnter={handleGalleryDrag}
                  onDragLeave={handleGalleryDrag}
                  onDragOver={handleGalleryDrag}
                  onDrop={handleGalleryDrop}
                >
                  <div className={styles.galleryGrid}>
                    {galleryPreviews.map((image, index) => (
                      <div key={image.url + index} className={styles.galleryItem}>
                        <img src={image.url} alt={`Gallery preview ${index + 1}`} />
                        <button 
                          type="button" 
                          className={styles.removeImageBtn} 
                          onClick={() => handleRemoveGalleryImage(index)}
                          title="Remove image"
                        >
                          <XMarkIcon />
                        </button>
                      </div>
                    ))}
                    
                    {canAddMoreGalleryImages && (
                      <div
                        className={styles.galleryUploader}
                        onClick={() => galleryInputRef.current?.click()}
                      >
                        <UploadIcon />
                        <span>Add Image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {errors.gallery && <p className={styles.errorText}>{errors.gallery}</p>}
                <small className={styles.helperText}>
                  Showcase your product with up to {MAX_GALLERY_IMAGES} additional images. Great for showing different angles, features, or examples.
                </small>
              </div>

              {/* Product File Upload */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Product File {isEditMode ? '(Optional - only to update)' : '*'}
                </label>
                <input 
                  type="file" 
                  onChange={handleProductFileChange} 
                  ref={productFileInputRef} 
                  style={{ display: 'none' }}
                />
                <div 
                  className={`${styles.fileUploader} ${errors.productFile ? styles.error : ''}`} 
                  onClick={() => productFileInputRef.current?.click()}
                >
                  <div className={styles.fileUploaderContent}>
                    <UploadIcon />
                    <div className={styles.fileInfo}>
                      {productFile ? (
                        <>
                          <span className={styles.fileName}>{productFile.name}</span>
                          <span className={styles.fileSize}>
                            {(productFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={styles.fileName}>
                            {isEditMode && existingDownloadUrl ? 
                              `Current: ${existingDownloadUrl.split('/').pop()}` : 
                              'Select your addon file'
                            }
                          </span>
                          <span className={styles.fileSize}>Max 50MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {errors.productFile && <p className={styles.errorText}>{errors.productFile}</p>}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>Publishing Checklist</h3>
              <div className={styles.checklist}>
                <div className={`${styles.checklistItem} ${name.trim() ? styles.completed : ''}`}>
                  <CheckmarkIcon />
                  <span>Product name</span>
                </div>
                <div className={`${styles.checklistItem} ${description && description.content?.length > 0 ? styles.completed : ''}`}>
                  <CheckmarkIcon />
                  <span>Description</span>
                </div>
                <div className={`${styles.checklistItem} ${categoryId ? styles.completed : ''}`}>
                  <CheckmarkIcon />
                  <span>Category</span>
                </div>
                <div className={`${styles.checklistItem} ${thumbnailPreview ? styles.completed : ''}`}>
                  <CheckmarkIcon />
                  <span>Thumbnail image</span>
                </div>
                <div className={`${styles.checklistItem} ${(isEditMode || productFile) ? styles.completed : ''}`}>
                  <CheckmarkIcon />
                  <span>Product file</span>
                </div>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Tips for Success</h3>
              <div className={styles.tipsList}>
                <div className={styles.tip}>
                  <span className={styles.tipIcon}>*</span>
                  <p>Use a clear, descriptive name that explains what your addon does</p>
                </div>
                <div className={styles.tip}>
                  <span className={styles.tipIcon}>*</span>
                  <p>High-quality screenshots significantly increase sales</p>
                </div>
                <div className={styles.tip}>
                  <span className={styles.tipIcon}>*</span>
                  <p>Detailed descriptions help users understand your product's value</p>
                </div>
                <div className={styles.tip}>
                  <span className={styles.tipIcon}>*</span>
                  <p>Relevant tags make your product easier to discover</p>
                </div>
              </div>
            </div>

            <div className={styles.publishActions}>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={validateAndSubmit} 
                disabled={isSubmitting}
                isLoading={isSubmitting}
                fullWidth
              >
                {isEditMode ? 'Update Product' : 'Publish Product'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleCancel} 
                disabled={isSubmitting}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;