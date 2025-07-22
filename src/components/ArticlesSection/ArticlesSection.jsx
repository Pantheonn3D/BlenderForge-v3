import React from 'react';
import styles from './ArticlesSection.module.css';
import { useArticles } from '../../hooks/useArticles';

// Import our new, reusable components
import SectionHeader from '../UI/SectionHeader/SectionHeader';
import ArticleCard from '../UI/ArticleCard/ArticleCard';
import Spinner from '../UI/Spinner/Spinner';

const ArticlesSection = () => {
  // All the complex data fetching logic is now in this single hook.
  const { articles, isLoading, error } = useArticles({ limit: 3 });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.stateContainer}>
          <Spinner size={32} />
          <p>Loading articles...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.stateContainer}>
          <p className={styles.errorText}>Failed to load articles. Please try again later.</p>
        </div>
      );
    }

    if (!articles || articles.length === 0) {
      return (
        <div className={styles.stateContainer}>
          <p>No articles have been published yet.</p>
        </div>
      );
    }

    return (
      <div className={styles.articlesGrid}>
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    );
  };

  return (
    <section className={styles.articlesSection}>
      <SectionHeader 
        title="Latest Articles" 
        buttonText="View All Articles" 
        buttonLink="/knowledge-base" 
      />
      {renderContent()}
    </section>
  );
};

export default ArticlesSection;