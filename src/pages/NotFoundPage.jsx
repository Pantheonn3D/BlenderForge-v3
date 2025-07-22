// src/pages/NotFoundPage.jsx

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/UI/Button/Button';
import styles from './NotFoundPage.module.css';
import { ChevronRightIcon, AcademicCapIcon, BookOpenIcon } from '../assets/icons';

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = '404 - Page Not Found - BlenderForge';
    return () => {
      document.title = 'BlenderForge';
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        
        <div className={styles.messageSection}>
          <h1 className={styles.title}>Page Not Found... Yet!</h1>
          <p className={styles.description}>
            The page you're looking for doesn't exist right now, but who knows? 
            It might be forged into existence soon! In the meantime, let's get you back on track.
          </p>
          <div className={styles.pathInfo}>
            <span className={styles.pathLabel}>You were looking for:</span>
            <code className={styles.pathValue}>{location.pathname}</code>
          </div>
        </div>

        <div className={styles.suggestions}>
          <h2 className={styles.suggestionsTitle}>Here's what you can do:</h2>
          <div className={styles.suggestionsList}>
            <Link to="/knowledge-base" className={styles.suggestionCard}>
              <div className={styles.suggestionIcon}>
                <AcademicCapIcon />
              </div>
              <div className={styles.suggestionContent}>
                <h3>Explore the Knowledge Base</h3>
                <p>Discover tutorials, workflows, and guides created by our community.</p>
              </div>
              <div className={styles.suggestionArrow}>
                <ChevronRightIcon />
              </div>
            </Link>
            
            <Link to="/" className={styles.suggestionCard}>
              <div className={styles.suggestionIcon}>
                <BookOpenIcon />
              </div>
              <div className={styles.suggestionContent}>
                <h3>Start from Home</h3>
                <p>Head back to our homepage and explore what BlenderForge has to offer.</p>
              </div>
              <div className={styles.suggestionArrow}>
                <ChevronRightIcon />
              </div>
            </Link>
          </div>
        </div>

        <div className={styles.actions}>
          <Button 
            variant="primary" 
            size="lg" 
            as={Link} 
            to="/" 
            className={styles.primaryAction}
            rightIcon={<ChevronRightIcon />}
          >
            Go Home
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            as={Link} 
            to="/knowledge-base"
            rightIcon={<ChevronRightIcon />}
          >
            Browse Articles
          </Button>
        </div>

        <div className={styles.helpText}>
          <p>
            If you think this page should exist, or if you keep ending up here, 
            feel free to let us know! We're always working to improve BlenderForge.
          </p>
        </div>
      </div>

      <div className={styles.backgroundDecoration}>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
      </div>
    </div>
  );
};

export default NotFoundPage;