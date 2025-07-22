import React from 'react';
import styles from './ArticleGrid.module.css';
import ArticleCard from '../UI/ArticleCard/ArticleCard';
import Spinner from '../UI/Spinner/Spinner';
import Button from '../UI/Button/Button';
import ArticleCardSkeleton from '../UI/ArticleCardSkeleton/ArticleCardSkeleton'; // <-- Add this import

// --- 1. IMPORT THE CORRECT COMPONENTS ---
import EmptyState from '../UI/EmptyState/EmptyState';
import { SearchIcon } from '../../assets/icons'; // Using the specific large icon

const ArticleGrid = ({ articles, isLoading, error, searchTerm, onClearFilters }) => {
  if (isLoading) {
    // THIS IS THE KEY CHANGE
    return (
      <div className={styles.grid}>
        {/* Render 6 card skeletons for the filtered view loading state */}
        {[...Array(6)].map((_, index) => <ArticleCardSkeleton key={index} />)}
      </div>
    );
  }

  if (error) {
    // --- 2. USE EMPTYSTATE FOR THE ERROR MESSAGE ---
    return (
      <EmptyState
        icon={<SearchIcon />}
        title="Something Went Wrong"
        message={error}
      />
    );
  }

  if (articles.length === 0) {
    // --- 3. USE EMPTYSTATE FOR THE "NO RESULTS" MESSAGE ---
    // This is the part that was missing and causing the giant icon.
    return (
      <EmptyState
        icon={<SearchIcon />}
        title="No articles found"
        message={
          searchTerm
            ? `No articles match your search for "${searchTerm}"`
            : "No articles match your current filters"
        }
      >
        <Button onClick={onClearFilters} variant="primary" size="lg">
          Clear All Filters
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className={styles.grid}>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticleGrid;