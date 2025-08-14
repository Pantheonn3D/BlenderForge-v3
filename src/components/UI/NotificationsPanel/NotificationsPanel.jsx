// src/components/UI/NotificationsPanel/NotificationsPanel.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useNotificationContext } from '../../../context/NotificationContext';
import styles from './NotificationsPanel.module.css';
import Spinner from '../Spinner/Spinner';
import Button from '../Button/Button';

// Helper to format time since the notification was created
const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Helper to generate the notification message and link
const getNotificationDetails = (notification) => {
  const actorName = notification.actor_username || 'Someone';
  const { type, metadata } = notification;

  switch (type) {
    // --- THIS IS THE MISSING PIECE ---
    case 'new_like_on_article':
      return {
        message: `${actorName} liked your article: "${metadata.article_title}"`,
        link: `/knowledge-base/${metadata.article_slug.toLowerCase()}/${metadata.article_slug}`,
      };
    case 'new_comment_on_article':
      return {
        message: `${actorName} commented on your article: "${metadata.article_title}"`,
        link: `/knowledge-base/${metadata.article_slug.toLowerCase()}/${metadata.article_slug}#comment-${metadata.comment_id}`,
      };
    case 'new_reply_to_comment':
      return {
        message: `${actorName} replied to your comment on: "${metadata.article_title}"`,
        link: `/knowledge-base/${metadata.article_slug.toLowerCase()}/${metadata.article_slug}#comment-${metadata.comment_id}`,
      };
    case 'new_review_on_product':
      return {
        message: `${actorName} left a ${metadata.rating}-star review on your product: "${metadata.product_name}"`,
        link: `/marketplace/${metadata.product_slug}`,
      };
    case 'article_approved':
      return {
        message: `Your article "${metadata.article_title}" has been approved and is now live!`,
        link: `/knowledge-base/${metadata.article_slug.toLowerCase()}/${metadata.article_slug}`,
      };
    case 'article_rejected':
      return {
        message: `Your article "${metadata.article_title}" was reviewed and did not meet our guidelines.`,
        link: `/edit/${metadata.article_slug}`, // Link to the edit page
      };
    default:
      return { message: 'You have a new notification.', link: '/' };
  }
};


const NotificationsPanel = ({ isOpen, onClose }) => {
  const { notifications, isLoading, markNotificationsAsRead, unreadCount } = useNotificationContext();

  if (!isOpen) {
    return null;
  }
  
  const handleMarkAllAsRead = () => {
    const idsToMark = notifications.map(n => n.id);
    if (idsToMark.length > 0) {
      markNotificationsAsRead(idsToMark);
    }
  };

  const handleNotificationClick = (notificationId) => {
    markNotificationsAsRead([notificationId]);
    onClose(); // Close panel after clicking a notification
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="link" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>
      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.stateContainer}>
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.stateContainer}>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <ul className={styles.notificationList}>
            {notifications.map((notification) => {
              const { message, link } = getNotificationDetails(notification);
              return (
                <li key={notification.id} className={styles.notificationItem}>
                  <Link to={link} className={styles.notificationLink} onClick={() => handleNotificationClick(notification.id)}>
                    <span className={styles.dot}></span>
                    <div className={styles.message}>
                      <p>{message}</p>
                      <time className={styles.time}>{timeAgo(notification.created_at)}</time>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;