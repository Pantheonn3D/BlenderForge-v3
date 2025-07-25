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
  generateUniqueSlug // NEW: Import generateUniqueSlug
} from '../services/productService';
import Button from '../components/UI/Button/Button';
import Spinner from '../components/UI/Spinner/Spinner';
import UploadIcon from '../assets/icons/UploadIcon';
import XMarkIcon from '../assets/icons/XMarkIcon';
import TextBlockEditor from '../features/articleCreator/components/TextBlockEditor';
// import { getUserProfile } from '../services/userService';

const NAME_MAX_LENGTH = 80;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_PRODUCT_FILE_SIZE = 50 * 1024 * 1024; // 50MB for product files
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']; // Already includes gif
const MAX_GALLERY_IMAGES = 5;

// Local Storage Keys for Autosave
const AUTOSAVE_KEY_PREFIX = 'blenderforge_product_draft_';

const CreateProductPage = () => {
  const { slug } = useParams(); // This is the CURRENT slug from the URL
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
          alert('Unsaved draft loaded. Remember to save your changes!');
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
      alert("Please correct the errors before submitting.");
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

      let finalSlug = slug; // Default to current slug
      if (isEditMode) {
        // NEW: Generate new slug if name has changed
        const baseSlug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        // Only generate new slug if the base slug derived from the new name is different from the current slug
        // and also ensure it's unique if it's indeed different.
        // For simplicity, we just generate a new unique slug based on current name.
        // A more complex check might compare to *original* product name, but this is safer.
        const generatedSlug = await generateUniqueSlug(baseSlug);
        if (generatedSlug !== slug) { // Only update slug if it's truly changed
            finalSlug = generatedSlug;
        }
        
        const updatedProduct = await updateProduct(
            slug, // Current slug to find the product
            productData,
            thumbnailFile,
            productFile,
            existingGalleryImageUrlsToKeep,
            galleryFiles,
            finalSlug // Pass the potentially new slug
        );

        localStorage.removeItem(autosaveKey);
        navigate(`/marketplace/${finalSlug}`, { state: { message: 'Product updated successfully!', type: 'success' } }); // Navigate to new slug

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
      setErrors(prev => ({...prev, thumbnail: `Invalid file. Max 5MB, JPG/PNG, WebP, GIF, SVG only.`}));
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
        newErrors.gallery = newErrors.gallery || `Some files were invalid. Max 5MB per image, JPG/PNG, WebP, GIF, SVG only.`;
        hasError = true;
      } else {
        validNewFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), isNew: true, file: file });
      }
    });

    setErrors(newErrors);
    setGalleryFiles(prev => [...prev, ...validNewFiles]);
    setGalleryPreviews(prev => [...prev, ...newPreviews]);

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
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
        <Spinner size={48} />
      </div>
    );
  }

  const canAddMoreGalleryImages = galleryPreviews.length < MAX_GALLERY_IMAGES;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{isEditMode ? 'Edit Product' : 'Upload New Product'}</h1>
        <p className={styles.subtitle}>
          {isEditMode ? `Now editing: ${name}` : 'Share your creation with the BlenderForge community.'}
        </p>
      </header>

      <div className={styles.contentWrapper}>
        {errors.general && <div className={styles.errorBanner}><span>{errors.general}</span></div>}
        <section className={styles.section}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Product Name*</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} maxLength={NAME_MAX_LENGTH} className={`${styles.input} ${errors.name ? styles.error : ''}`} placeholder="e.g., Super Slicer Pro" />
            {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description*</label>
            <TextBlockEditor
              content={description}
              onUpdate={({ editor, json }) => {
                setDescription(json);
              }}
              placeholder="Describe your product in detail. Add headings, lists, and images to make it stand out..."
            />
            {errors.description && <p className={styles.errorText}>{errors.description}</p>}
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
              <label htmlFor="price" className={styles.label}>Price (USD)*</label>
              <input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" className={`${styles.input} ${errors.price ? styles.error : ''}`} placeholder="0.00 for free" />
              {errors.price && <p className={styles.errorText}>{errors.price}</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tags" className={styles.label}>Optional Tags</label>
            <input id="tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className={styles.input} placeholder="e.g., sci-fi, procedural, low-poly" />
             <small className={styles.helperText}>Comma-separated. For extra search keywords.</small>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="version" className={styles.label}>Addon Version</label>
              <input id="version" type="text" value={version} onChange={e => setVersion(e.target.value)} className={styles.input} placeholder="e.g., 1.2.1" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="blenderVersion" className={styles.label}>Min. Blender Version</label>
              <input id="blenderVersion" type="text" value={blenderVersion} onChange={e => setBlenderVersion(e.target.value)} className={styles.input} placeholder="e.g., 4.1" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Thumbnail Image*</label>
            <input type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleThumbnailChange} ref={thumbnailInputRef} style={{ display: 'none' }} />
            <div className={`${styles.thumbnailUploader} ${errors.thumbnail ? styles.error : ''}`} onClick={() => thumbnailInputRef.current?.click()}>
              {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" className={styles.thumbnailPreviewImg} /> : <div className={styles.uploadPrompt}><UploadIcon/> <p>Click to upload thumbnail</p><span>PNG, JPG, WebP, GIF, SVG (max 5MB)</span></div>}
            </div>
            {errors.thumbnail && <p className={styles.errorText}>{errors.thumbnail}</p>}
          </div>

          {/* Gallery Images Section */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Gallery Images (Optional)</label>
            <input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleGalleryFileChange}
              ref={galleryInputRef}
              style={{ display: 'none' }}
              multiple
            />
            <div className={styles.galleryPreviewContainer}>
              {galleryPreviews.map((image, index) => (
                <div key={image.url + index} className={styles.galleryPreviewItem}>
                  <img src={image.url} alt={`Gallery preview ${index + 1}`} />
                  <button type="button" className={styles.removeImageBtn} onClick={() => handleRemoveGalleryImage(index)}>
                    <XMarkIcon />
                  </button>
                </div>
              ))}
              {canAddMoreGalleryImages && (
                <div
                  className={styles.galleryUploader}
                  onClick={() => galleryInputRef.current?.click()}
                  style={{ cursor: canAddMoreGalleryImages ? 'pointer' : 'not-allowed' }}
                >
                  <div className={styles.uploadPrompt}>
                    <UploadIcon/>
                    <p>Add Image</p>
                    <span>{galleryPreviews.length}/{MAX_GALLERY_IMAGES} (max 5MB)</span>
                  </div>
                </div>
              )}
            </div>
            {errors.gallery && <p className={styles.errorText}>{errors.gallery}</p>}
             <small className={styles.helperText}>Add up to {MAX_GALLERY_IMAGES} additional images for your product. Click on an image to remove it.</small>
          </div>


          <div className={styles.formGroup}>
            <label className={styles.label}>Product File {isEditMode ? '(Optional: only to update)' : '*'}</label>
            <input type="file" onChange={handleProductFileChange} ref={productFileInputRef} style={{ display: 'none' }}/>
            <div className={`${styles.fileInputDisplay} ${errors.productFile ? styles.error : ''}`} onClick={() => productFileInputRef.current?.click()}>
                {productFile ? <span>{productFile.name}</span> :
                 (isEditMode && existingDownloadUrl ? 'Click to select new product file (current: ' + existingDownloadUrl.split('/').pop() + ')' : 'Click to select new product file')}
            </div>
            {errors.productFile && <p className={styles.errorText}>{errors.productFile}</p>}
          </div>
        </section>

        <section className={styles.publishSection}>
          <div className={styles.publishActions}>
            <Button variant="secondary" size="lg" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" size="lg" onClick={validateAndSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Spinner size="sm" /><span>Saving...</span></> : (isEditMode ? 'Update Product' : 'Submit Product')}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateProductPage;