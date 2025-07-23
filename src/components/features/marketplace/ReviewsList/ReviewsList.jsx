// src/components/features/marketplace/ReviewsList/ReviewsList.jsx (Updated for flat data)

import React from 'react';
import styles from './ReviewsList.module.css';
import StarRating from '../../../UI/StarRating/StarRating';
import UserCircleIcon from '../../../../assets/icons/UserCircleIcon';

const ReviewsList = ({ reviews }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (!reviews || reviews.length === 0) {
    return <p className={styles.noReviews}>No reviews yet. Be the first to leave one!</p>;
  }

  return (
    <div className={styles.reviewsList}>
      {reviews.map(review => (
        <div key={review.id} className={styles.reviewItem}>
          <div className={styles.reviewHeader}>
            <div className={styles.authorInfo}>
              {/* --- THE FIX: Use review.avatar_url directly --- */}
              {review.avatar_url ? (
                <img src={review.avatar_url} alt={review.username} className={styles.authorAvatar} />
              ) : (
                <UserCircleIcon className={styles.authorAvatar} />
              )}
              {/* --- THE FIX: Use review.username directly --- */}
              <span className={styles.authorName}>{review.username}</span>
            </div>
            <div className={styles.reviewMeta}>
              <StarRating rating={review.rating} />
              <time className={styles.reviewDate} dateTime={review.created_at}>
                {formatDate(review.created_at)}
              </time>
            </div>
          </div>
          <p className={styles.reviewComment}>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;