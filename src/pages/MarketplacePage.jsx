// src/pages/MarketplacePage.jsx (Updated)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './MarketplacePage.module.css';
import { useProducts } from '../hooks/useProducts';
import useDebounce from '../hooks/useDebounce';
import { getMarketplaceCategories } from '../services/productService';

// Import Components
import SearchBar from '../components/SearchBar/SearchBar';
import FilterBar from '../components/FilterBar/FilterBar';
import ProductGrid from '../components/ProductGrid/ProductGrid';
import Button from '../components/UI/Button/Button';

// Import Icons
import { UploadIcon } from '../assets/icons';
import { useAuth } from '../context/AuthContext';

const PRICE_FILTERS = [
  { id: 'all', name: 'All Prices' },
  { id: 'free', name: 'Free' },
  { id: 'paid', name: 'Paid' },
];
const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'price_asc', name: 'Price: Low to High' },
  { id: 'price_desc', name: 'Price: High to Low' },
];

const MarketplacePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalSearch, setInternalSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(internalSearch, 300);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetched = await getMarketplaceCategories();
      setCategories([{ id: 'all', name: 'All Categories' }, ...fetched]);
    };
    fetchCategories();
  }, []);

  const filters = useMemo(() => ({
    searchQuery: debouncedSearch,
    category: searchParams.get('category') || 'all',
    price: searchParams.get('price') || 'all',
    sort: searchParams.get('sort') || 'newest'
  }), [debouncedSearch, searchParams]);
  
  const { products, isLoading, error } = useProducts(filters);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearch, setSearchParams, searchParams]);
  
  const handleFilterChange = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || (key === 'sort' && value === 'newest')) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setInternalSearch('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Marketplace</h1>
        <p>Discover community-built addons, themes, and assets.</p>
        {/* 
        {user && (
          <div className={styles.pageActions}>
            <Button as={Link} to="/marketplace/upload" variant="primary" size="lg" leftIcon={<UploadIcon />}>
              Upload Product
            </Button>
          </div>          
        )}
        */}
      </header>

      <div className={styles.contentLayout}>
        <aside className={styles.filtersSidebar}>
          <SearchBar 
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            onClear={() => setInternalSearch('')}
            placeholder="Search products..."
          />
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearAllFilters}
            categories={categories}
            sortOptions={SORT_OPTIONS}
            priceOptions={PRICE_FILTERS}
          />
        </aside>

        <main className={styles.mainContent}>
          <ProductGrid 
            products={products}
            isLoading={isLoading}
            error={error}
            searchTerm={debouncedSearch}
          />
        </main>
      </div>
    </div>
  );
};

export default MarketplacePage;