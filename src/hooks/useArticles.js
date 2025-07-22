import { useState, useEffect } from 'react';
import { getArticles } from '../services/articleService';


// The hook now accepts an object of filters
export const useArticles = (filters = {}) => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // We use JSON.stringify to create a stable dependency for the effect
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    // This function is now defined inside the effect
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // The getArticles service is called with the filters
        const data = await getArticles(JSON.parse(filtersKey));
        setArticles(data);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        setError('Could not load articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [filtersKey]); // The effect re-runs whenever the filters change

  return { articles, isLoading, error };
};