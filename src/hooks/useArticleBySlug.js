// src/hooks/useArticleBySlug.js (New File)

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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

    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*, profiles(username, avatar_url)') // Join with profiles table
          .eq('slug', slug) // Query by the clean slug
          .single(); // We expect only one result

        if (error) {
          // Supabase error pgrst 204 means 'no rows found', which isn't a "real" error for us.
          if (error.code === 'PGRST204') {
            setArticle(null);
          } else {
            throw error;
          }
        } else {
          setArticle(data);
        }

      } catch (err) {
        console.error("Error fetching article:", err);
        setError({ message: "A database error occurred. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]); // Rerun this effect only when the slug changes

  return { article, isLoading, error };
}