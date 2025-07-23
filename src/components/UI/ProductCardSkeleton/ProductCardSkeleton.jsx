// src/components/UI/ProductCardSkeleton/ProductCardSkeleton.jsx

import React from 'react';
import styles from './ProductCardSkeleton.module.css';

const ProductCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}></div>
      <div className={styles.content}>
        <div className={styles.name}></div>
        <div className={styles.description}></div>
        <div className={styles.descriptionShort}></div>
      </div>
      <div className={styles.footer}>
        <div className={styles.authorInfo}>
          <div className={styles.authorAvatar}></div>
          <div className={styles.authorName}></div>
        </div>
        <div className={styles.footerLink}></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;