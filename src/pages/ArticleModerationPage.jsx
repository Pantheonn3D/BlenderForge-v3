// src/pages/ArticleModerationPage.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getArticles,
  updateArticleModerationStatus
} from '../services/articleService';
import Spinner from '../components/UI/Spinner/Spinner';
import Button from '../components/UI/Button/Button';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import styles from './ArticleModerationPage.module.css';

const MODERATOR_UID = '2c3ecfda-2f41-4ee6-ba11-57e567eeb618';

const ArticleModerationPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.id !== MODERATOR_UID) {
      setError({ message: 'You are not authorized to view this page.' });
      setIsLoading(false);
      return;
    }

    const fetchArticles = async () => {
      try {
        // Fetch all articles, including pending ones
        const fetchedArticles = await getArticles({ includePending: true, orderBy: 'created_at', ascending: false });
        setArticles(fetchedArticles);
      } catch (err) {
        setError({ message: 'Failed to fetch articles for moderation.' });
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [user]);

  const handleUpdateStatus = async (articleId, newStatus) => {
    setIsUpdating(true);
    try {
      await updateArticleModerationStatus(articleId, newStatus);
      // Optimistically update the local state
      setArticles(prev => prev.map(article =>
        article.id === articleId ? { ...article, moderation_status: newStatus, is_published: newStatus === 'approved' } : article
      ));
    } catch (err) {
      setError({ message: `Failed to update article status: ${err.message}` });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className={styles.container}><Spinner size={48} /></div>;
  }

  if (error) {
    return <div className={styles.container}><EmptyState title="Access Denied" message={error.message} /></div>;
  }

  const pendingArticles = articles.filter(article => article.moderation_status === 'pending');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Article Moderation Dashboard</h1>
        <p className={styles.subtitle}>Review new and updated articles before they go live.</p>
      </header>

      {error && <div className={styles.errorBanner}>{error.message}</div>}

      <div className={styles.articleList}>
        {pendingArticles.length === 0 ? (
          <EmptyState title="No Articles to Review" message="All articles have been approved or rejected. Check back later!" />
        ) : (
          pendingArticles.map(article => (
            <div key={article.id} className={styles.articleCard}>
              {article.image_url && (
                <div className={styles.thumbnailContainer}>
                  <img src={article.image_url} alt={article.title} className={styles.articleThumbnail} />
                </div>
              )}
              <div className={styles.articleInfo}>
                <h3 className={styles.articleTitle}>
                  <Link to={`/knowledge-base/${article.category.toLowerCase()}/${article.slug}`} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </Link>
                </h3>
                <p className={styles.articleAuthor}>By {article.profiles?.username || 'Anonymous'}</p>
                <p className={styles.articleStatus}>Status: <span className={styles.pendingStatus}>{article.moderation_status}</span></p>
                <small className={styles.articleDate}>Submitted on {new Date(article.created_at).toLocaleDateString()}</small>
              </div>
              <div className={styles.actions}>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(article.id, 'approved')}
                  disabled={isUpdating}
                  isLoading={isUpdating}
                  size="sm"
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleUpdateStatus(article.id, 'rejected')}
                  disabled={isUpdating}
                  size="sm"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArticleModerationPage;