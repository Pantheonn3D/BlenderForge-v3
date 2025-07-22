import React from 'react';
import styles from './CategorySectionSkeleton.module.css';
import ArticleCardSkeleton from '../UI/ArticleCardSkeleton/ArticleCardSkeleton';

const CategorySectionSkeleton = () => {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={`${styles.icon} ${styles.skeleton}`}></div>
        <div className={styles.info}>
          <div className={`${styles.title} ${styles.skeleton}`}></div>
          <div className={`${styles.description} ${styles.skeleton}`}></div>
        </div>
        <div className={`${styles.stats} ${styles.skeleton}`}></div>
      </div>
      <div className={styles.grid}>
        {/* Render 3 card skeletons to match the real layout */}
        <ArticleCardSkeleton />
        <ArticleCardSkeleton />
        <ArticleCardSkeleton />
      </div>
    </div>
  );
};

export default CategorySectionSkeleton;