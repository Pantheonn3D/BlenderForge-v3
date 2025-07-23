// src/components/FilterBar/FilterBar.jsx (Updated for true reusability)

import React from 'react';
import styles from './FilterBar.module.css';
import Button from '../UI/Button/Button';
import { FilterIcon, XMarkIcon } from '../../assets/icons';

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  categories,   // <-- Using a generic 'categories' prop now
  difficulties, // For Knowledge Base
  sortOptions,
  priceOptions  // For Marketplace
}) => {
  // A more robust check for active filters
  const hasActiveFilters = 
    (filters.category && filters.category !== 'all') ||
    (filters.difficulty && filters.difficulty !== 'all') ||
    (filters.price && filters.price !== 'all') ||
    (filters.sort && filters.sort !== 'newest');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FilterIcon className={styles.headerIcon} />
        <span>Filter by:</span>
      </div>
      <div className={styles.controls}>
        {/* Render category dropdown if categories are provided */}
        {categories && (
          <div className={styles.selectWrapper}>
            <label htmlFor="category-select">Category</label>
            <select 
              id="category-select" 
              value={filters.category} 
              onChange={(e) => onFilterChange('category', e.target.value)}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Render difficulty dropdown if difficulties are provided */}
        {difficulties && (
          <div className={styles.selectWrapper}>
            <label htmlFor="difficulty-select">Difficulty</label>
            <select 
              id="difficulty-select" 
              value={filters.difficulty} 
              onChange={(e) => onFilterChange('difficulty', e.target.value)}
            >
              {difficulties.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {/* Render price dropdown if priceOptions are provided */}
        {priceOptions && (
          <div className={styles.selectWrapper}>
            <label htmlFor="price-select">Price</label>
            <select 
              id="price-select" 
              value={filters.price} 
              onChange={(e) => onFilterChange('price', e.target.value)}
            >
              {priceOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {/* Sort dropdown is always present */}
        <div className={styles.selectWrapper}>
          <label htmlFor="sort-select">Sort By</label>
          <select id="sort-select" value={filters.sort} onChange={(e) => onFilterChange('sort', e.target.value)}>
            {sortOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters} leftIcon={<XMarkIcon />} className={styles.clearButton}>
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;