// src/hooks/useProducts.js

import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Pass all filters directly to getProducts
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
  }, [filtersKey]);

  return { products, isLoading, error };
};

// getProductBySlug is already defined here, no changes needed for this part.
// Note: It's currently *not* exported from this file, but you included it in useProducts.js
// If getProductBySlug is used elsewhere, it should be in productService.js and imported from there.
// For now, I will assume it's correctly used where needed or will be moved.
// export async function getProductBySlug(slug) { ... } // Original content was not exported,
// but I will follow the user's provided file content. It was exported in a previous turn from productService.js.
// I will keep it in productService.js only, as that's the service layer.