// src/hooks/useProductBySlug.js

import { useState, useEffect } from 'react';
import { getProductBySlug } from '../services/productService';

export const useProductBySlug = (slug) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.error(`Failed to fetch product with slug ${slug}:`, err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, isLoading, error, setProduct }; // <-- Expose setProduct
};