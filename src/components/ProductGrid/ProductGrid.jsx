// src/components/ProductGrid/ProductGrid.jsx

import React from 'react';
import styles from './ProductGrid.module.css';
import ProductCard from '../UI/ProductCard/ProductCard';
import ProductCardSkeleton from '../UI/ProductCardSkeleton/ProductCardSkeleton';
import EmptyState from '../UI/EmptyState/EmptyState';
import { MagnifyingGlassIcon } from '../../assets/icons'; // Using a different icon for products

const ProductGrid = ({ products, isLoading, error, searchTerm }) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[...Array(6)].map((_, index) => <ProductCardSkeleton key={index} />)}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<MagnifyingGlassIcon />}
        title="Something Went Wrong"
        message={error}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<MagnifyingGlassIcon />}
        title="No Products Found"
        message={
          searchTerm
            ? `No products match your search for "${searchTerm}"`
            : "No products match your current filters"
        }
      />
    );
  }

  return (
    <div className={styles.grid}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;