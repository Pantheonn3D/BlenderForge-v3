// src/pages/ProfilePage.jsx

import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import ArticleCard from '../components/UI/ArticleCard/ArticleCard';
import ProductCard from '../components/UI/ProductCard/ProductCard';
import Button from '../components/UI/Button/Button';
import StarRating from '../components/UI/StarRating/StarRating';
import styles from './ProfilePage.module.css';
import { ChevronRightIcon } from '../assets/icons';

const ProfilePage = () => {
  const { userId: paramsUserId } = useParams();
  const { user: authUser, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const userIdToFetch = paramsUserId || authUser?.id;

  const { profile, articles, products, reviews, isLoading, error } = useUserProfile(userIdToFetch);

  const formattedJoinDate = useMemo(() => {
    if (profile?.created_at) {
      return new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric', day: 'numeric' // Changed to include day
      });
    }
    return '';
  }, [profile?.created_at]);

  const isOwnProfile = authUser && profile && authUser.id === profile.id;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isPageLoading = isLoading || authLoading;

  const formatReviewDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (isPageLoading) {
    return <div className={styles.stateContainer}><Spinner /></div>;
  }

  if (error || !profile) {
    return <EmptyState title="User Not Found" message="The user you are looking for does not exist or you may need to log in." />;
  }

  const defaultBanner = 'https://placehold.co/1280x300/1e1e1e/a0a0a0?text=No+Banner';

  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <img
          src={profile.banner_url || defaultBanner}
          alt={`${profile.username}'s banner`}
          className={styles.bannerImage}
        />
        <div className={styles.headerContent}>
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || 'A')}`}
            alt={profile.username}
            className={styles.profileAvatar}
          />
          <div className={styles.profileInfo}>
            <h1 className={styles.username}>{profile.username}</h1>
            
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

            {/* NEW: Profile Details Grid */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <strong>Joined:</strong>
                <span>{formattedJoinDate}</span>
              </div>
              {/* Add more details here if needed, e.g., 'Location:', 'Website:' */}
              {/* Example: {profile.website && <div className={styles.detailItem}><strong>Website:</strong><span><a href={profile.website}>{profile.website}</a></span></div>} */}
            </div>

          </div>

          {isOwnProfile && (
            <div className={styles.profileActions}>
              <Button variant="secondary" as={Link} to="/profile/edit">
                Edit Profile
              </Button>
              <Button variant="danger" onClick={handleLogout} rightIcon={<ChevronRightIcon />}>
                Log Out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Articles Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Articles by {profile.username}</h2>
          {articles.length > 0 ? (
            <div className={styles.grid}>
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>This user hasn't published any articles yet.</p>
          )}
        </section>

        {/* Products Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Products by {profile.username}</h2>
          {products.length > 0 ? (
            <div className={styles.grid}>
              {products.map(product => (
                // Pass username and avatar_url explicitly from the joined profiles
                <ProductCard key={product.id} product={{
                    ...product,
                    username: product.profiles?.username || 'Unknown Author',
                    avatar_url: product.profiles?.avatar_url
                  }}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>This user hasn't uploaded any products yet.</p>
          )}
        </section>

        {/* Reviews Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviews by {profile.username}</h2>
          {reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <StarRating rating={review.rating} />
                    <span className={styles.reviewDate}>{formatReviewDate(review.created_at)}</span>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                  {review.products && (
                    <Link to={`/marketplace/${review.products.slug}`} className={styles.reviewProductLink}>
                      Reviewed: {review.products.name}
                      {/* Added conditional rendering and placeholder for thumbnail */}
                      {review.products.thumbnail_url ? (
                        <img src={review.products.thumbnail_url} alt={review.products.name} className={styles.reviewProductThumbnail} />
                      ) : (
                        <div className={styles.reviewProductThumbnailPlaceholder}></div>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>This user hasn't left any reviews yet.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;