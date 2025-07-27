// src/hooks/useUserProfile.js

import { useState, useEffect } from 'react';
import { getUserProfile, getArticlesByUserId, getUserProducts, getUserReviews, getUserPurchases } from '../services/userService';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // <-- FIX IS HERE: Initial state is now true
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        // If there's no user to fetch, we are no longer loading.
        setIsLoading(false);
        setError(null);
        setProfile(null);
        setArticles([]);
        setProducts([]);
        setReviews([]);
        setPurchases([]);
        return;
      }

      // We are already in a loading state, so no need to set it again here.
      // setIsLoading(true); 
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