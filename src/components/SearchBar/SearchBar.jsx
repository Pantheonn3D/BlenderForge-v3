import React from 'react';
import styles from './SearchBar.module.css';
import { SearchIcon, XMarkIcon } from '../../assets/icons';

const SearchBar = ({ value, onChange, onClear, placeholder }) => {
  return (
    <div className={styles.searchContainer}>
      <SearchIcon className={styles.searchIcon} />
      <input
        type="text"
        className={styles.searchInput}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {value && (
        <button onClick={onClear} className={styles.clearButton} aria-label="Clear search">
          <XMarkIcon />
        </button>
      )}
    </div>
  );
};

export default SearchBar;