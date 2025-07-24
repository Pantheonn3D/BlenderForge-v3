// src/components/ProductSection/ProductSection.jsx

import React from 'react';
import styles from './ProductSection.module.css';
import { useProducts } from '../../hooks/useProducts'; // Import the useProducts hook
import ProductGrid from '../ProductGrid/ProductGrid'; // Import the ProductGrid component
import SectionHeader from '../UI/SectionHeader/SectionHeader'; // Re-use SectionHeader
import Spinner from '../UI/Spinner/Spinner'; // Re-use Spinner

const ProductSection = ({ title, description, filters, linkTo }) => {
  const { products, isLoading, error } = useProducts(filters);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.stateContainer}>
          <Spinner size={32} />
          <p>Loading products...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.stateContainer}>
          <p className={styles.errorText}>Failed to load products. Please try again later.</p>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className={styles.stateContainer}>
          <p>No products available yet.</p>
        </div>
      );
    }

    return (
      <ProductGrid products={products} />
    );
  };

  return (
    <section className={styles.productSection}>
      <SectionHeader
        title={title}
        description={description}
        buttonText="View All Products"
        buttonLink={linkTo}
      />
      {renderContent()}
    </section>
  );
};

export default ProductSection;