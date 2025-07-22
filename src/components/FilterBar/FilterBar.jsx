import React from 'react';
import styles from './FilterBar.module.css';
import Button from '../UI/Button/Button';
import { FilterIcon, XMarkIcon } from '../../assets/icons';

// We can remove 'categories' from the props as it's no longer used
const FilterBar = ({ filters, onFilterChange, onClearFilters, difficulties, sortOptions }) => {
  // Update the check to exclude 'category'
  const hasActiveFilters = filters.difficulty !== 'all' || filters.sort !== 'newest';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FilterIcon className={styles.headerIcon} />
        <span>Filter by:</span>
      </div>
      <div className={styles.controls}>
        {/*
          THE CATEGORY SELECT WRAPPER HAS BEEN COMPLETELY REMOVED FROM HERE
        */}
        <div className={styles.selectWrapper}>
          <label htmlFor="difficulty-select">Difficulty</label>
          <select id="difficulty-select" value={filters.difficulty} onChange={(e) => onFilterChange('difficulty', e.target.value)}>
            {difficulties.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
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