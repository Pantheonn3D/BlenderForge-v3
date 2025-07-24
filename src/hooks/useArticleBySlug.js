// src/hooks/useArticleBySlug.js

import { useState, useEffect } from 'react';
// Import the specific service function instead of supabase directly for fetching
import { getArticleBySlug as fetchArticleService, incrementArticleViewCount } from '../services/articleService'; // Renamed import to avoid conflict and added increment

export function useArticleBySlug(slug) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If there's no slug, don't fetch.
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchAndIncrementArticle = async () => { // Renamed function
      setIsLoading(true);
      setError(null);
      try {
        // Use the service function to get the article
        const data = await fetchArticleService(slug); // Call the service function

        if (data) {
          setArticle(data);
          // Increment view count AFTER successfully fetching the article
          // This call is intentionally fire-and-forget; no need to await it.
          incrementArticleViewCount(data.id);
        } else {
          setArticle(null); // Article not found
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError({ message: err.message || "A database error occurred. Please try again." }); // Use err.message
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndIncrementArticle();
  }, [slug]); // Rerun this effect only when the slug changes

  return { article, isLoading, error };
}