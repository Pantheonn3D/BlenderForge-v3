// src/hooks/useUserProfile.js (New File)

import { useState, useEffect } from 'react';
import { getUserProfile, getArticlesByUserId } from '../services/userService';

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch profile and articles in parallel for speed
        const [profileData, articlesData] = await Promise.all([
          getUserProfile(userId),
          getArticlesByUserId(userId)
        ]);

        setProfile(profileData);
        setArticles(articlesData);

      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  return { profile, articles, isLoading, error };
}