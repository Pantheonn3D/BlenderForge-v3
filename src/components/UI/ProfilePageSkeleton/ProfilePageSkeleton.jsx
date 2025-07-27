// src/components/UI/ProfilePageSkeleton/ProfilePageSkeleton.jsx

import React from 'react';
import styles from './ProfilePageSkeleton.module.css';
import ArticleCardSkeleton from '../ArticleCardSkeleton/ArticleCardSkeleton';
import ProductCardSkeleton from '../ProductCardSkeleton/ProductCardSkeleton';

const ProfilePageSkeleton = () => {
  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <div className={styles.bannerSkeleton}></div>
        <div className={styles.headerContent}>
          <div className={styles.avatarSkeleton}></div>
          <div className={styles.profileInfoSkeleton}>
            <div className={styles.usernameSkeleton}></div>
            <div className={styles.bioSkeleton}></div>
            <div className={styles.detailsSkeleton}></div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.section}>
          <div className={styles.sectionTitleSkeleton}></div>
          <div className={styles.grid}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitleSkeleton}></div>
          <div className={styles.grid}>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePageSkeleton;