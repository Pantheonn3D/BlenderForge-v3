// src/components/UI/ReviewSkeleton/ReviewSkeleton.jsx

import React from 'react';
import styles from './ReviewSkeleton.module.css';

const ReviewSkeleton = () => {
  return (
    <div className={styles.skeletonReview}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonAvatar}></div>
        <div className={styles.skeletonUserInfo}>
          <div className={styles.skeletonUsername}></div>
          <div className={styles.skeletonRating}></div>
        </div>
      </div>
      <div className={styles.skeletonCommentLine}></div>
      <div className={`${styles.skeletonCommentLine} ${styles.short}`}></div>
    </div>
  );
};

export default ReviewSkeleton;