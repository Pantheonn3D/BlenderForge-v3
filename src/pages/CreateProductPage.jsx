// src/pages/CreateProductPage.jsx (Using TextBlockEditor)

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CreateProductPage.module.css';
import { useAuth } from '../context/AuthContext';
import { 
  createProduct, 
  getMarketplaceCategories, 
  getProductBySlug, 
  updateProduct 
} from '../services/productService';
import Button from '../components/UI/Button/Button';
import Spinner from '../components/UI/Spinner/Spinner';
import UploadIcon from '../assets/icons/UploadIcon';
import TextBlockEditor from '../features/articleCreator/components/TextBlockEditor';

const NAME_MAX_LENGTH = 80;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PRODUCT_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CreateProductPage = () => {
  const { slug } = useParams();
  const isEditMode = Boolean(slug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const thumbnailInputRef = useRef(null);
  const productFileInputRef = useRef(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState(null); // Will hold TipTap JSON
  const [price, setPrice] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [version, setVersion] = useState('');
  const [blenderVersion, setBlenderVersion] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [productFile, setProductFile] = useState(null);
  const [existingDownloadUrl, setExistingDownloadUrl] = useState('');
  
  // UI/Error state
  const [isLoadingPage, setIsLoadingPage] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedCategories = await getMarketplaceCategories();
        setCategories(fetchedCategories);

        if (isEditMode && slug) {
          const product = await getProductBySlug(slug);
          if (!product || product.user_id !== user?.id) {
            alert(product ? "You are not authorized to edit this product." : "Product not found.");
            navigate('/marketplace');
            return;
          }
          
          setName(product.name);

          // Handle legacy string descriptions vs new JSON descriptions
          if (typeof product.description === 'string') {
            // Convert legacy string to valid TipTap JSON
            setDescription({
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: product.description }] }],
            });
          } else {
            setDescription(product.description); 
          }

          setPrice(String(product.price));
          setCategoryId(product.category_id);
          setTags(product.tags?.join(', ') || '');
          setVersion(product.version || '');
          setBlenderVersion(product.blender_version_min || '');
          setThumbnailPreview(product.thumbnail_url);
          setExistingDownloadUrl(product.download_url);
        } else if (fetchedCategories.length > 0) {
          setCategoryId(fetchedCategories[0].id);
        }
      } catch (error) {
        console.error("Failed to load page data:", error);
        setErrors({ general: "Failed to load page data." });
      } finally {
        setIsLoadingPage(false);
      }
    };
    if (user) { // Only load data once the user is confirmed to be available
      loadData();
    }
  }, [slug, isEditMode, navigate, user]);

  const validateAndSubmit = async () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Product name is required.';
    if (!description || !description.content || description.content[0]?.content?.length === 0) {
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

      const productData = {
        name: name.trim(),
        description: description, // Pass the JSON object
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

      if (isEditMode) {
        await updateProduct(slug, productData, thumbnailFile, productFile);
        navigate(`/marketplace/${slug}`, { state: { message: 'Product updated successfully!', type: 'success' } });
      } else {
        await createProduct(productData, thumbnailFile, productFile, user.id);
        navigate('/marketplace', { state: { message: 'Product published successfully!', type: 'success' } });
      }

    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ general: error.message || 'An unknown error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({...prev, thumbnail: 'Invalid file. Max 5MB, JPG/PNG/WebP only.'}));
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
        setErrors(prev => ({...prev, productFile: 'File too large. Max 50MB.'}));
        return;
    }
    setProductFile(file);
    setErrors(prev => ({...prev, productFile: null}));
  };

  if (isLoadingPage) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
        <Spinner size={48} />
      </div>
    );
  }

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
              onUpdate={({ editor }) => {
                setDescription(editor.getJSON());
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
              {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" className={styles.thumbnailPreviewImg} /> : <div className={styles.uploadPrompt}><UploadIcon/> <p>Click to upload thumbnail</p><span>PNG, JPG, WebP (max 5MB)</span></div>}
            </div>
            {errors.thumbnail && <p className={styles.errorText}>{errors.thumbnail}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Product File {isEditMode ? '(Optional: only to update)' : '*'}</label>
            <input type="file" onChange={handleProductFileChange} ref={productFileInputRef} style={{ display: 'none' }}/>
            <div className={`${styles.fileInputDisplay} ${errors.productFile ? styles.error : ''}`} onClick={() => productFileInputRef.current?.click()}>
                {productFile ? <span>{productFile.name}</span> : 'Click to select new product file'}
            </div>
            {errors.productFile && <p className={styles.errorText}>{errors.productFile}</p>}
          </div>
        </section>

        <section className={styles.publishSection}>
          <div className={styles.publishActions}>
            <Button variant="secondary" size="lg" onClick={() => navigate(isEditMode ? `/marketplace/${slug}` : '/marketplace')} disabled={isSubmitting}>Cancel</Button>
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