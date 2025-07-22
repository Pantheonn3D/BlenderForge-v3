import React from 'react';
import styles from './CategoryNav.module.css';

const CategoryNav = ({ categories, selectedCategory, onCategoryClick }) => {
  return (
    <nav className={styles.categoryNav}>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryClick(category.id)}
          className={`${styles.navItem} ${selectedCategory === category.id ? styles.active : ''}`}
        >
          <category.IconComponent className={styles.navIcon} />
          <span>{category.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default CategoryNav;