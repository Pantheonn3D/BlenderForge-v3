// src/context/NotificationContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUnreadNotifications, markNotificationsAsRead as markAsReadService } from '../services/notificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const data = await getUnreadNotifications(user.id);
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationsAsRead = useCallback(async (ids) => {
    // Optimistically update the UI for a faster user experience
    const unreadNotifications = notifications.filter(n => !ids.includes(n.id));
    setNotifications(unreadNotifications);

    try {
      await markAsReadService(ids);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      // If the API call fails, refetch from the server to get the true state
      fetchNotifications();
    }
  }, [notifications, fetchNotifications]);

  const unreadCount = notifications.length;

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markNotificationsAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};