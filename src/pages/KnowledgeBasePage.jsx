import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  { id: 'created_at-desc', name: 'Newest First', orderBy: 'created_at', ascending: false },
  { id: 'created_at-asc', name: 'Oldest First', orderBy: 'created_at', ascending: true },
  { id: 'title-asc', name: 'Title (A-Z)', orderBy: 'title', ascending: true },
  { id: 'view_count-desc', name: 'Most Viewed', orderBy: 'view_count', ascending: false },
  { id: 'likes-desc', name: 'Most Liked', orderBy: 'likes', ascending: false },
  { id: 'dislikes-desc', name: 'Most Disliked', orderBy: 'dislikes', ascending: false }
];

const KnowledgeBasePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [internalSearch, setInternalSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(internalSearch, 300);

  // Initial state for filters, derived from URL params
  const initialCategory = searchParams.get('category') || 'all';
  const initialDifficulty = searchParams.get('difficulty') || 'all';
  const initialSortId = searchParams.get('sort') || 'created_at-desc';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [selectedSortId, setSelectedSortId] = useState(initialSortId);

  // --- Filters for useArticles hook ---
  const articleFilters = useMemo(() => {
    const currentSortOption = SORT_OPTIONS.find(option => option.id === selectedSortId);
    return {
      searchQuery: debouncedSearch,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      orderBy: currentSortOption ? currentSortOption.orderBy : 'created_at',
      ascending: currentSortOption ? currentSortOption.ascending : false,
    };
  }, [debouncedSearch, selectedCategory, selectedDifficulty, selectedSortId]);

  const { articles, isLoading, error } = useArticles(articleFilters);

  // --- Sync state with URL search parameters ---
  useEffect(() => {
    setInternalSearch(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedDifficulty(searchParams.get('difficulty') || 'all');
    setSelectedSortId(searchParams.get('sort') || 'created_at-desc');
  }, [searchParams]);

  // Update URL search parameters when internal state changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (internalSearch) {
      newSearchParams.set('q', internalSearch);
    }
    if (selectedCategory !== 'all') {
      newSearchParams.set('category', selectedCategory);
    }
    if (selectedDifficulty !== 'all') {
      newSearchParams.set('difficulty', selectedDifficulty);
    }
    if (selectedSortId !== 'created_at-desc') {
      newSearchParams.set('sort', selectedSortId);
    }

    navigate(`?${newSearchParams.toString()}`, { replace: true });
  }, [internalSearch, selectedCategory, selectedDifficulty, selectedSortId, navigate]);


  // --- Event Handlers ---
  const handleFilterChange = useCallback((key, value) => {
    if (key === 'category') setSelectedCategory(value);
    else if (key === 'difficulty') setSelectedDifficulty(value);
    else if (key === 'sort') setSelectedSortId(value);
  }, []);

  const handleCategoryClick = useCallback((categoryId) => {
    setInternalSearch('');
    setSelectedCategory(categoryId);
    setSelectedDifficulty('all');
    setSelectedSortId('created_at-desc');
  }, []);

  const clearAllFilters = useCallback(() => {
    setInternalSearch('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedSortId('created_at-desc');
  }, []);

  // Determine which view to show: filtered (grid) or grouped (sections by category)
  const shouldShowFilteredView = selectedCategory !== 'all' || debouncedSearch || selectedDifficulty !== 'all' || selectedSortId !== 'created_at-desc';

  // Group articles by category for the "All Articles" view (when no specific filters are applied)
  const groupedArticles = useMemo(() => {
    const grouped = {};
    if (!isLoading && articles) {
      CATEGORIES.slice(1).forEach(category => {
        grouped[category.id] = articles.filter(article => article.category === category.id);
      });
    }
    return grouped;
  }, [articles, isLoading]);


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
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
        />
        <FilterBar
          filters={{
            // Removed 'category' here as CategoryNav handles it visually
            difficulty: selectedDifficulty,
            sort: selectedSortId,
          }}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          // Removed categories prop here
          difficulties={DIFFICULTIES}
          sortOptions={SORT_OPTIONS}
        />
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