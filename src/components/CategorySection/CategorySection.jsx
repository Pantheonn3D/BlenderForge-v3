import React from 'react';
import styles from './CategorySection.module.css';
import ArticleGrid from '../ArticleGrid/ArticleGrid';
import Button from '../UI/Button/Button';

const CategorySection = ({ category, articles, onViewAllClick }) => {
  return (
    <section className={styles.categorySection}>
      <header className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: `${category.color}20`, color: category.color }}>
          <category.IconComponent />
        </div>
        <div className={styles.info}>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </div>
        <div className={styles.stats}>
          <span className={styles.count}>{articles.length}</span>
          <span>article{articles.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      {articles.length > 0 ? (
        <>
          <ArticleGrid articles={articles.slice(0, 3)} />
          {articles.length > 3 && (
            <div className={styles.viewAll}>
              <Button onClick={() => onViewAllClick(category.id)} variant="secondary">
                View All {category.name} ({articles.length})
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <category.IconComponent style={{ width: 48, height: 48, opacity: 0.3 }}/>
          <p>No {category.name.toLowerCase()} available yet.</p>
        </div>
      )}
    </section>
  );
};

export default CategorySection;