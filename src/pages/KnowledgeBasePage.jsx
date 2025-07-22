import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './KnowledgeBasePage.module.css';
import { useArticles } from '../hooks/useArticles';
import useDebounce from '../hooks/useDebounce';

// --- Import All UI Components ---
import ArticleGrid from '../components/ArticleGrid/ArticleGrid';
import FilterBar from '../components/FilterBar/FilterBar';
import SearchBar from '../components/SearchBar/SearchBar';
import CategoryNav from '../components/CategoryNav/CategoryNav';
import CategorySection from '../components/CategorySection/CategorySection';
import CategorySectionSkeleton from '../components/CategorySectionSkeleton/CategorySectionSkeleton';

// --- Import All Icons ---
import { AcademicCapIcon, CogIcon, BookOpenIcon, NewspaperIcon } from '../assets/icons';

// --- CONFIGURATION CONSTANTS ---
const CATEGORIES = [
  { id: 'all', name: 'All Articles', IconComponent: AcademicCapIcon },
  { id: 'Tutorial', name: 'Tutorials', description: 'Step-by-step learning guides', IconComponent: AcademicCapIcon, color: '#4caf50' },
  { id: 'Workflow', name: 'Workflows', description: 'Process optimization guides', IconComponent: CogIcon, color: '#2196f3' },
  { id: 'Guide', name: 'Guides', description: 'Comprehensive how-to content', IconComponent: BookOpenIcon, color: '#ff9800' },
  { id: 'News', name: 'News', description: 'Latest updates & announcements', IconComponent: NewspaperIcon, color: '#e91e63' }
];

const DIFFICULTIES = [
  { id: 'all', name: 'All Levels' },
  { id: 'Beginner', name: 'Beginner' },
  { id: 'Intermediate', name: 'Intermediate' },
  { id: 'Advanced', name: 'Advanced' }
];

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'title', name: 'Title (A-Z)' },
  { id: 'difficulty', name: 'By Difficulty' }
];

const KnowledgeBasePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalSearch, setInternalSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(internalSearch, 300);

  // --- State and Data Fetching ---
  const filters = useMemo(() => ({
    searchQuery: debouncedSearch,
    category: searchParams.get('category') || 'all',
    difficulty: searchParams.get('difficulty') || 'all',
    sort: searchParams.get('sort') || 'newest'
  }), [debouncedSearch, searchParams]);

  const { articles, isLoading, error } = useArticles(filters);

  // Update URL search param when debounced search term changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearch, setSearchParams, searchParams]);

  // Group articles by category for the "All Articles" view
  const groupedArticles = useMemo(() => {
    const grouped = {};
    if (!isLoading && articles) {
      CATEGORIES.slice(1).forEach(category => {
        grouped[category.id] = articles.filter(article => article.category === category.id);
      });
    }
    return grouped;
  }, [articles, isLoading]);

  // --- Event Handlers ---
  const handleFilterChange = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || (key === 'sort' && value === 'newest')) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleCategoryClick = useCallback((categoryId) => {
    const newParams = new URLSearchParams();
    if (categoryId !== 'all') {
      newParams.set('category', categoryId);
    }
    setInternalSearch('');
    setSearchParams(newParams, { replace: true });
  }, [setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setInternalSearch('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Determine which view to show
  const shouldShowFilteredView = filters.category !== 'all' || debouncedSearch;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Knowledge Base</h1>
        <p>Discover tutorials, workflows, guides, and the latest news</p>
      </header>

      <div className={styles.controls}>
        <SearchBar 
          value={internalSearch}
          onChange={(e) => setInternalSearch(e.target.value)}
          onClear={() => setInternalSearch('')}
          placeholder="Search articles..."
        />
        <CategoryNav 
          categories={CATEGORIES}
          selectedCategory={filters.category}
          onCategoryClick={handleCategoryClick}
        />
        {shouldShowFilteredView && (
          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearAllFilters}
            difficulties={DIFFICULTIES}
            sortOptions={SORT_OPTIONS}
          />
        )}
      </div>

      <main className={styles.mainContent}>
        {shouldShowFilteredView ? (
          <ArticleGrid 
            articles={articles} 
            isLoading={isLoading} 
            error={error} 
            searchTerm={debouncedSearch}
            onClearFilters={clearAllFilters}
          />
        ) : (
          <div className={styles.groupedView}>
            {isLoading ? (
              <>
                <CategorySectionSkeleton />
                <CategorySectionSkeleton />
                <CategorySectionSkeleton />
              </>
            ) : (
              CATEGORIES.slice(1).map(category => (
                <CategorySection
                  key={category.id}
                  category={category}
                  articles={groupedArticles[category.id] || []}
                  onViewAllClick={handleCategoryClick}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgeBasePage;