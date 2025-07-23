// src/hooks/useProducts.js

import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService'; // We'll create this function next

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use JSON.stringify to create a stable dependency for the effect
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // The getProducts service will be called with the filters
        const data = await getProducts(JSON.parse(filtersKey));
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Could not load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filtersKey]); // The effect re-runs whenever the filters change

  return { products, isLoading, error };
};

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products_with_author') // Querying the view
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST204') return null; // Standard way to handle not found
    console.error('Error fetching single product:', error);
    throw new Error(`Database error: ${error.message}`);
  }
  return data;
}