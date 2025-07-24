import { useState, useEffect } from 'react';
import { getUserProfile, getArticlesByUserId } from '../services/userService';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Start as false, only set to true when we actually start loading
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Don't do anything if userId is not provided or invalid
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        setIsLoading(false);
        setError(null);
        setProfile(null);
        setArticles([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [profileData, articlesData] = await Promise.all([
          getUserProfile(userId),
          getArticlesByUserId(userId)
        ]);

        setProfile(profileData);
        setArticles(articlesData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
        setProfile(null);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { profile, articles, isLoading, error, setProfile };
};