// src/hooks/useUserProfile.js

import { useState, useEffect } from 'react';
import { getUserProfile, getArticlesByUserId, getUserProducts, getUserReviews, getUserPurchases } from '../services/userService';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // --- DEBUGGING LOG ---
      console.log('useUserProfile: Attempting to fetch data for userId:', userId);
      // --- END DEBUGGING LOG ---

      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        setIsLoading(false);
        setError(null);
        setProfile(null);
        setArticles([]);
        setProducts([]);
        setReviews([]);
        setPurchases([]);
        return;
      }

      setError(null);

      try {
        const [profileData, articlesData, productsData, reviewsData, purchasesData] = await Promise.all([
          getUserProfile(userId),
          getArticlesByUserId(userId),
          getUserProducts(userId),
          getUserReviews(userId),
          getUserPurchases(userId),
        ]);

        setProfile(profileData);
        setArticles(articlesData);
        setProducts(productsData);
        setReviews(reviewsData);
        setPurchases(purchasesData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
        setProfile(null);
        setArticles([]);
        setProducts([]);
        setReviews([]);
        setPurchases([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { profile, articles, products, reviews, purchases, isLoading, error, setProfile };
};