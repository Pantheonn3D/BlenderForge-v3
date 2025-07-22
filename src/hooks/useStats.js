// src/hooks/useStats.js

import { useState, useEffect } from 'react';
import { getStats } from '../services/statsService';

export const useStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    supporters: 0,
    articles: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};