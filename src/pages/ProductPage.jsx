// src/pages/ProductPage.jsx

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useProductBySlug } from '../hooks/useProductBySlug';
import { useAuth } from '../context/AuthContext';
import {
  deleteProduct,
  getReviewsByProductId,
  submitReview,
  getProductBySlug,
  deleteReview
} from '../services/productService';
import { createPayPalOrder } from '../services/paypalService';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';
import StarRating from '../components/UI/StarRating/StarRating';
import ReviewForm from '../components/features/marketplace/ReviewForm/ReviewForm';
import EditReview from '../components/features/marketplace/EditReview/EditReview';
import ReviewsList from '../components/features/marketplace/ReviewsList/ReviewsList';
import ChevronRightIcon from '../assets/icons/ChevronRightIcon';
import ChevronLeftIcon from '../assets/icons/ChevronLeftIcon';
import ReviewSkeleton from '../components/UI/ReviewSkeleton/ReviewSkeleton';

import styles from './ProductPage.module.css';

// NEW HELPER: Function to extract plain text from TipTap JSON
const getPlainTextFromTiptapJson = (tiptapJson, maxLength = 160) => {
  if (typeof tiptapJson === 'string') {
    // If it's still a plain string (e.g., from old data), use it directly
    return tiptapJson.substring(0, maxLength) + (tiptapJson.length > maxLength ? '...' : '');
  }
  if (!tiptapJson || typeof tiptapJson !== 'object' || tiptapJson.type !== 'doc' || !Array.isArray(tiptapJson.content)) {
    return ''; // Not a valid TipTap doc
  }
  let text = '';
  tiptapJson.content.forEach(node => {
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      node.content.forEach(textNode => {
        if (textNode.type === 'text' && textNode.text) {
          text += textNode.text + ' ';
        }
      });
    } else if (node.type === 'heading' && Array.isArray(node.content)) {
        node.content.forEach(textNode => {
            if (textNode.type === 'text' && textNode.text) {
                text += textNode.text + ' ';
            }
        });
    }
    // You can add more node types here if they contain text you want to include (e.g., list items)
  });
  return text.trim().substring(0, maxLength) + (text.trim().length > maxLength ? '...' : '');
};


const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { product, isLoading, error, setProduct } = useProductBySlug(slug);

  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const [mainImageIndex, setMainImageIndex] = useState(0);

  const isAuthor = useMemo(() => authUser?.id === product?.user_id, [authUser, product]);

  const currentUserReview = useMemo(() =>
    reviews.find(review => review.user_id === authUser?.id),
    [reviews, authUser]
  );

  const otherUsersReviews = useMemo(() =>
    reviews.filter(review => review.user_id !== authUser?.id),
    [reviews, authUser]
  );

  const productDescriptionHtml = useMemo(() => {
    if (!product?.description) return '';
    
    const extensions = [
      StarterKit,
      Image
    ];

    if (typeof product.description === 'string') {
        return `<p>${product.description}</p>`;
    }
    if (typeof product.description === 'object' && product.description.type === 'doc') {
        return generateHTML(product.description, extensions);
    }
    return '';
  }, [product?.description]);

  const allProductImages = useMemo(() => {
    const images = [];
    if (product?.thumbnail_url) {
      images.push(product.thumbnail_url);
    }
    if (product?.gallery_images && Array.isArray(product.gallery_images)) {
      images.push(...product.gallery_images);
    }
    return images;
  }, [product?.thumbnail_url, product?.gallery_images]);

  const showNextMainImage = useCallback(() => {
    setMainImageIndex(prevIndex =>
      (prevIndex + 1) % allProductImages.length
    );
  }, [allProductImages.length]);

  const showPrevMainImage = useCallback(() => {
    setMainImageIndex(prevIndex =>
      (prevIndex - 1 + allProductImages.length) % allProductImages.length
    );
  }, [allProductImages.length]);

  const fetchReviewsAndRatings = useCallback(async () => {
    if (!product?.id) return;
    setIsLoadingReviews(true);
    try {
      const updatedReviews = await getReviewsByProductId(product.id);
      setReviews(updatedReviews);
    } catch (err) {
      console.error("Failed to refresh reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [product?.id]);


  useEffect(() => {
    if (product?.id) {
      fetchReviewsAndRatings();
    }
  }, [product?.id, fetchReviewsAndRatings]);


  // UPDATED EFFECT: Manages document title and meta description
  useEffect(() => {
    let metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (!metaDescriptionTag) {
      metaDescriptionTag = document.createElement('meta');
      metaDescriptionTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionTag);
    }

    // Optional: Open Graph and Twitter Card descriptions for social media
    let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    if (!ogDescriptionTag) {
      ogDescriptionTag = document.createElement('meta');
      ogDescriptionTag.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescriptionTag);
    }

    let twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescriptionTag) {
      twitterDescriptionTag = document.createElement('meta');
      twitterDescriptionTag.setAttribute('name', 'twitter:description');
      document.head.appendChild(twitterDescriptionTag);
    }

    if (product) {
      document.title = `${product.name} - BlenderForge`;
      const descriptionText = getPlainTextFromTiptapJson(product.description || product.description_string_fallback || '');
      metaDescriptionTag.setAttribute('content', descriptionText);
      ogDescriptionTag.setAttribute('content', descriptionText);
      twitterDescriptionTag.setAttribute('content', descriptionText);
    } else {
      // Clear or set default if product is not found/loaded
      document.title = 'Product Not Found - BlenderForge';
      metaDescriptionTag.setAttribute('content', 'Discover amazing Blender addons on BlenderForge.');
      ogDescriptionTag.setAttribute('content', 'Discover amazing Blender addons on BlenderForge.');
      twitterDescriptionTag.setAttribute('content', 'Discover amazing Blender addons on BlenderForge.');
    }

    // Cleanup: remove meta tags when component unmounts to prevent them from lingering on other pages
    return () => {
      if (metaDescriptionTag && metaDescriptionTag.parentNode) {
        metaDescriptionTag.parentNode.removeChild(metaDescriptionTag);
      }
      if (ogDescriptionTag && ogDescriptionTag.parentNode) {
        ogDescriptionTag.parentNode.removeChild(ogDescriptionTag);
      }
      if (twitterDescriptionTag && twitterDescriptionTag.parentNode) {
        twitterDescriptionTag.parentNode.removeChild(twitterDescriptionTag);
      }
      document.title = 'BlenderForge'; // Reset general site title
    };
  }, [product]);


  const handlePurchase = async () => {
    if (!authUser) {
      setPurchaseError('Please log in to purchase this item.');
      return;
    }
    if (!product) {
      setPurchaseError('Product data is missing. Please refresh the page or contact support.');
      return;
    }

    setIsPurchasing(true);
    setPurchaseError('');

    try {
      if (product.price === 0) {
        if (!product.download_url) {
            throw new Error('Free product download URL is missing. Please contact support.');
        }
        window.open(product.download_url, '_blank');
      } else {
        const { approveUrl } = await createPayPalOrder(product.id);
        window.location.href = approveUrl;
      }
    } catch (err) {
      console.error('Purchase/Download error:', err);
      setPurchaseError(err.message || 'An unexpected error occurred during the purchase process.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!product || !authUser) return;
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      const updatedRatings = await submitReview({ productId: product.id, rating, comment });
      
      setProduct(prevProduct => ({
        ...prevProduct,
        avg_rating: updatedRatings.avg_rating,
        rating_count: updatedRatings.rating_count,
      }));
      
      await fetchReviewsAndRatings();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!currentUserReview) return;
    setIsSubmittingReview(true);
    try {
      const updatedRatings = await deleteReview(currentUserReview.id);
      
      setProduct(prevProduct => ({
        ...prevProduct,
        avg_rating: updatedRatings.avg_rating,
        rating_count: updatedRatings.rating_count,
      }));

      await fetchReviewsAndRatings();
    } catch (err) {
      console.error("Failed to delete review", err);
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !authUser || !isAuthor) return;
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    try {
      await deleteProduct(product.slug, authUser.id);
      navigate('/marketplace', { state: { message: 'Product deleted successfully!', type: 'success' } });
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (p) => (p === 0 ? 'Free' : `$${Number(p).toFixed(2)}`);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading && !product) {
      return <div className={styles.stateContainer}><Spinner size={48} /></div>;
  }
  if (error) return <EmptyState title="An Error Occurred" message={error.message} />;
  if (!product && !isLoading) return <EmptyState title="Product Not Found" message="The product you are looking for does not exist." />;

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Yes, Delete It"
        variant="danger"
      />

      <div className={styles.pageContainer}>
        <Link to="/marketplace" className={styles.backLink}>← Back to Marketplace</Link>

        <div className={styles.layoutGrid}>
          <main className={styles.mainContent}>
            {allProductImages.length > 0 && (
              <div className={styles.mainImageViewer}>
                <img
                  src={allProductImages[mainImageIndex]}
                  alt={`${product.name} image ${mainImageIndex + 1}`}
                  className={styles.mainImage}
                />
                {allProductImages.length > 1 && (
                  <>
                    <button className={`${styles.mainImageNavButton} ${styles.mainImageNavButtonLeft}`} onClick={showPrevMainImage}>
                      <ChevronLeftIcon />
                    </button>
                    <button className={`${styles.mainImageNavButton} ${styles.mainImageNavButtonRight}`} onClick={showNextMainImage}>
                      <ChevronRightIcon />
                    </button>
                    <div className={styles.mainImageCounter}>
                      {mainImageIndex + 1} / {allProductImages.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {allProductImages.length > 1 && (
              <div className={styles.gallerySection}>
                <h2>Gallery</h2>
                <div className={styles.galleryGrid}>
                  {allProductImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`${styles.galleryItem} ${index === mainImageIndex ? styles.activeGalleryItem : ''}`}
                      onClick={() => setMainImageIndex(index)}
                    >
                      <img src={imageUrl} alt={`${product.name} gallery thumbnail ${index + 1}`} className={styles.galleryImage} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2>Description</h2>
            <div
              className={styles.productDescription}
              dangerouslySetInnerHTML={{ __html: productDescriptionHtml }}
            />

            {product.tags && product.tags.length > 0 && (
              <>
                <h2>Tags</h2>
                <div className={styles.tagsContainer}>
                  {product.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              </>
            )}

            <div className={styles.reviewsSection}>
              <h2>Reviews ({product.rating_count || 0})</h2>

              {authUser && !isAuthor && (
                currentUserReview ? (
                  <EditReview
                    review={currentUserReview}
                    onUpdate={handleReviewSubmit}
                    onDelete={handleReviewDelete}
                    isSubmitting={isSubmittingReview}
                  />
                ) : (
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    isSubmitting={isSubmittingReview}
                  />
                )
              )}

              {reviewError && <p className={styles.reviewError}>{reviewError}</p>}

              <div className={styles.reviewsListContainer}>
                {isLoadingReviews ? (
                  <>
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                    <ReviewSkeleton />
                  </>
                ) : (
                  <>
                    {currentUserReview && <ReviewsList reviews={[currentUserReview]} />}
                    {currentUserReview && otherUsersReviews.length > 0 && <div className={styles.reviewSeparator} />}
                    {otherUsersReviews.length > 0 && <ReviewsList reviews={otherUsersReviews} />}
                    {reviews.length === 0 && (
                       <div className={styles.noReviewsMessage}>No reviews yet. Be the first to leave one!</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarContent}>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.categoryBadge}>{product.category_name}</div>

              <div className={styles.sidebarRating}>
                <StarRating rating={product.avg_rating} />
                <span className={styles.sidebarRatingText}>
                  {product.avg_rating > 0 ? `${product.avg_rating?.toFixed(1)} (${product.rating_count} ratings)` : 'No ratings yet'}
                </span>
              </div>

              <div className={styles.purchaseActions}>
                {isAuthor ? (
                  <div className={styles.authorActions}>
                    <Button variant="secondary" as={Link} to={`/marketplace/edit/${product.slug}`} disabled={isDeleting} fullWidth>Edit</Button>
                    <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} disabled={isDeleting} isLoading={isDeleting} fullWidth>Delete</Button>
                  </div>
                ) : (
                   <Button variant="primary" size="lg" onClick={handlePurchase} isLoading={isPurchasing} disabled={isPurchasing} fullWidth>
                     {product.price === 0 ? 'Download for Free' : `Buy for ${formatPrice(product.price)}`}
                   </Button>
                )}
                {purchaseError && <p className={styles.reviewError}>{purchaseError}</p>}
              </div>

              <div className={styles.authorInfo}>
                <img
                  src={product.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.username || 'A')}`}
                  alt={product.username}
                  className={styles.authorAvatar}
                />
                <div className={styles.authorDetails}>
                  <Link to={`/profile/${product.user_id}`} className={styles.authorName}>
                    By {product.username || 'Anonymous'}
                  </Link>
                  <time className={styles.publishDate} dateTime={product.created_at}>
                    Published on {formatDate(product.created_at)}
                  </time>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                {product.version && <div className={styles.detailItem}><strong>Version:</strong><span>{product.version}</span></div>}
                {product.blender_version_min && <div className={styles.detailItem}><strong>Min. Blender:</strong><span>{product.blender_version_min}</span></div>}
                {product.updated_at && <div className={styles.detailItem}><strong>Last Updated:</strong><span>{formatDate(product.updated_at)}</span></div>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default ProductPage;