// src/components/FilterBar/FilterBar.jsx (Updated)

import React from 'react';
import styles from './FilterBar.module.css';
import Button from '../UI/Button/Button';
import { FilterIcon, XMarkIcon } from '../../assets/icons';

const FilterBar = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  difficulties,
  sortOptions,
  priceOptions,
  categoryDisplayMode = 'dropdown', // 'dropdown' or 'buttons'
  onCategoryButtonClick, // Specific handler for button clicks
}) => {
  const hasActiveFilters =
    (filters.category && filters.category !== 'all') ||
    (filters.difficulty && filters.difficulty !== 'all') ||
    (filters.price && filters.price !== 'all') ||
    // Updated to account for different default sort options
    (filters.sort && filters.sort !== 'created_at-desc' && filters.sort !== 'newest');

  return (
    <div className={styles.container}>
      {/* Category Buttons (for Knowledge Base) */}
      {categoryDisplayMode === 'buttons' && categories && (
        <div className={styles.categoryButtons}>
          <label className={styles.sectionLabel}>Type</label>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryButtonClick(category.id)}
              className={`${styles.categoryButton} ${filters.category === category.id ? styles.active : ''}`}
            >
              {category.IconComponent && <category.IconComponent className={styles.buttonIcon} />}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Filters */}
      <div className={styles.dropdownSection}>
        <div className={styles.header}>
          <FilterIcon className={styles.headerIcon} />
          <span>Filter by:</span>
        </div>
        <div className={styles.controls}>
          {/* Category Dropdown (for Marketplace) */}
          {categoryDisplayMode === 'dropdown' && categories && (
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

          <div className={styles.selectWrapper}>
            <label htmlFor="sort-select">Sort By</label>
            <select id="sort-select" value={filters.sort} onChange={(e) => onFilterChange('sort', e.target.value)}>
              {sortOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className={styles.clearButtonWrapper}>
            <Button variant="ghost" onClick={onClearFilters} leftIcon={<XMarkIcon />} className={styles.clearButton}>
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;