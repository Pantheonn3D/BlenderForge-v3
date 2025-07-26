// src/hooks/useUserProfile.js

import { useState, useEffect } from 'react';
import { getUserProfile, getArticlesByUserId, getUserProducts, getUserReviews, getUserPurchases } from '../services/userService';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [purchases, setPurchases] = useState([]); // <-- ADDED state for purchases
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        setIsLoading(false);
        setError(null);
        setProfile(null);
        setArticles([]);
        setProducts([]);
        setReviews([]);
        setPurchases([]); // <-- RESET purchases state
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [profileData, articlesData, productsData, reviewsData, purchasesData] = await Promise.all([
          getUserProfile(userId),
          getArticlesByUserId(userId),
          getUserProducts(userId),
          getUserReviews(userId),
          getUserPurchases(userId), // <-- FETCH user's purchases
        ]);

        setProfile(profileData);
        setArticles(articlesData);
        setProducts(productsData);
        setReviews(reviewsData);
        setPurchases(purchasesData); // <-- SET purchases state
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
        setProfile(null);
        setArticles([]);
        setProducts([]);
        setReviews([]);
        setPurchases([]); // <-- CLEAR purchases state on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { profile, articles, products, reviews, purchases, isLoading, error, setProfile }; // <-- RETURN purchases
};