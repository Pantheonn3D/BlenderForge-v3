// src/pages/ProductPage.jsx

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { useProductBySlug } from '../hooks/useProductBySlug';
import { useAuth } from '../context/AuthContext';
import {
  deleteProduct,
  getReviewsByProductId,
  submitReview,
  getProductBySlug,
  deleteReview
} from '../services/productService';
// Removed: import { getStripe } from '../services/stripeService';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';
import StarRating from '../components/UI/StarRating/StarRating';
import ReviewForm from '../components/features/marketplace/ReviewForm/ReviewForm';
import EditReview from '../components/features/marketplace/EditReview/EditReview';
import ReviewsList from '../components/features/marketplace/ReviewsList/ReviewsList';
import styles from './ProductPage.module.css';

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
    if (typeof product.description === 'string') {
        return `<p>${product.description}</p>`;
    }
    if (typeof product.description === 'object' && product.description.type === 'doc') {
        return generateHTML(product.description, [StarterKit]);
    }
    return '';
  }, [product?.description]);

  const fetchAllData = useCallback(async () => {
    if (!slug) return;
    try {
      setIsLoadingReviews(true);
      const updatedProduct = await getProductBySlug(slug);
      if (setProduct) setProduct(updatedProduct);

      if (updatedProduct?.id) {
        const updatedReviews = await getReviewsByProductId(updatedProduct.id);
        setReviews(updatedReviews);
      }
    } catch (err) {
      console.error("Failed to refresh data", err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [slug, setProduct]);

  useEffect(() => {
    if (product?.id) {
      fetchAllData();
    }
  }, [product?.id, fetchAllData]);

  useEffect(() => {
    if (product) document.title = `${product.name} - BlenderForge`;
    return () => { document.title = 'BlenderForge'; };
  }, [product]);

  const handlePurchase = async () => {
    if (!authUser) {
      setPurchaseError('Please log in to purchase this item.');
      return;
    }
    if (!product || !product.download_url) {
      setPurchaseError('Product download URL is missing. Please refresh the page or contact support.');
      return;
    }

    setIsPurchasing(true);
    setPurchaseError('');

    try {
      // For all products, including those that were previously paid,
      // we now directly provide the download URL.
      // You would implement new payment logic here if desired in the future.
      window.open(product.download_url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      setPurchaseError(err.message || 'An unexpected error occurred during download.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!product || !authUser) return;
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      await submitReview({ productId: product.id, rating, comment });
      await fetchAllData();
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
      await deleteReview(currentUserReview.id);
      await fetchAllData();
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

  if (isLoading) return <div className={styles.stateContainer}><Spinner size={48} /></div>;
  if (error) return <EmptyState title="An Error Occurred" message={error.message} />;
  if (!product) return <EmptyState title="Product Not Found" message="The product you are looking for does not exist." />;

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
             <div className={styles.heroSection}>
              {product.thumbnail_url && <img src={product.thumbnail_url} alt={product.name} className={styles.heroImage} />}
            </div>

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
                {isLoadingReviews ? <Spinner /> : (
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
                  // Purchase button now always initiates a download
                   <Button variant="primary" size="lg" onClick={handlePurchase} isLoading={isPurchasing} disabled={isPurchasing} fullWidth>
                     Download {product.price === 0 ? 'for Free' : `for ${formatPrice(product.price)}`}
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