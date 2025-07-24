import { useState, useEffect } from 'react';
import { getUserProfile, getArticlesByUserId, getUserProducts, getUserReviews } from '../services/userService'; // Added getUserProducts, getUserReviews

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]); // New state for user products
  const [reviews, setReviews] = useState([]);   // New state for user reviews
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Don't do anything if userId is not provided or invalid
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        setIsLoading(false);
        setError(null);
        setProfile(null);
        setArticles([]);
        setProducts([]); // Reset new states
        setReviews([]);   // Reset new states
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [profileData, articlesData, productsData, reviewsData] = await Promise.all([ // Added productsData, reviewsData
          getUserProfile(userId),
          getArticlesByUserId(userId),
          getUserProducts(userId), // Fetch user's products
          getUserReviews(userId)   // Fetch user's reviews
        ]);

        setProfile(profileData);
        setArticles(articlesData);
        setProducts(productsData); // Set new states
        setReviews(reviewsData);   // Set new states
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
        setProfile(null);
        setArticles([]);
        setProducts([]); // Clear new states on error
        setReviews([]);   // Clear new states on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { profile, articles, products, reviews, isLoading, error, setProfile }; // Returned new states
};