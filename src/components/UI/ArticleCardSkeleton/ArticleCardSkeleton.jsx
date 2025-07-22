import React from 'react';
import styles from './ArticleCardSkeleton.module.css';

const ArticleCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={`${styles.image} ${styles.skeleton}`}></div>
      <div className={styles.content}>
        <div className={`${styles.meta} ${styles.skeleton}`}></div>
        <div className={`${styles.title} ${styles.skeleton}`}></div>
        <div className={`${styles.description} ${styles.skeleton}`}></div>
        <div className={`${styles.footer} ${styles.skeleton}`}></div>
      </div>
    </div>
  );
};

export default ArticleCardSkeleton;