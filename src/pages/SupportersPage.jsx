// src/pages/SupportersPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './SupportersPage.module.css';
import { getSupporters } from '../services/supportersService';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';

const SupportersPage = () => {
  const [supporters, setSupporters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  
  const success = searchParams.get('support');

  useEffect(() => {
    const fetchSupporters = async () => {
      setIsLoading(true);
      try {
        // Fetch supporters and sort them
        const data = await getSupporters();
        if (data) {
          // Sort advocates first, then by creation date
          const sortedSupporters = [...data].sort((a, b) => {
            // Define a custom order for tiers, if 'advocate' is highest, then 'supporter', etc.
            const tierOrder = { 'advocate': 2, 'supporter': 1 }; 
            const aTierOrder = tierOrder[a.tier] || 0; // Default to 0 if tier is unknown
            const bTierOrder = tierOrder[b.tier] || 0; // Default to 0 if tier is unknown

            if (aTierOrder !== bTierOrder) {
              return bTierOrder - aTierOrder; // Sort by tier order (advocate first)
            }
            // If tiers are the same, sort by creation date (newest first)
            return new Date(b.created_at) - new Date(a.created_at); 
          });
          setSupporters(sortedSupporters);
        } else {
          setSupporters([]);
        }
      } catch (err) {
        console.error('Error fetching supporters:', err);
        setError('Failed to load supporters');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupporters();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState 
        title="Unable to Load Supporters" 
        message={error}
      />
    );
  }

  return (
    <div className={styles.container}>
      {success === 'success' && (
        <div className={styles.successBanner}>
          <p>Thank you for your generous support! Your supporter status will appear here shortly.</p>
        </div>
      )}

      <header className={styles.header}>
        <h1>Our Amazing Supporters</h1>
        <p>These wonderful people help make BlenderForge possible</p>
      </header>

      <div className={styles.content}>
        <div className={styles.supportCallout}>
          <h2>Join Our Community of Supporters</h2>
          <p>Help us continue building the best Blender learning platform</p>
          <Button as={Link} to="/support" variant="primary" size="lg">
            Become a Supporter
          </Button>
        </div>

        {supporters.length > 0 ? (
          <section className={styles.supportersSection}>
            <h2>Current Supporters ({supporters.length})</h2>
            <div className={styles.supportersGrid}>
              {supporters.map((supporter) => (
                <div 
                  key={supporter.id} 
                  className={`${styles.supporterCard} ${supporter.tier === 'advocate' ? styles.advocateCard : ''}`}
                >
                  <div className={`${styles.supporterAvatar} ${supporter.tier === 'advocate' ? styles.advocateAvatar : ''}`}>
                    <img 
                      src={supporter.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(supporter.profiles?.username || 'A') + '&background=random'} // Fallback with initial
                      alt={supporter.profiles?.username || 'Anonymous Supporter'} 
                    />
                  </div>
                  <div className={styles.supporterInfo}>
                    <h3 className={styles.supporterName}>
                      {supporter.profiles?.username || 'Anonymous Supporter'}
                    </h3>
                    <p className={styles.supporterDate}>
                      Supporter since {new Date(supporter.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {supporter.social_media_link && (
                      <a 
                        href={supporter.social_media_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        Visit Profile
                      </a>
                    )}
                  </div>
                  <div className={`${styles.supporterBadge} ${supporter.tier === 'advocate' ? styles.advocateBadge : ''}`}>
                    {/* Capitalize first letter of tier for display */}
                    {supporter.tier ? supporter.tier.charAt(0).toUpperCase() + supporter.tier.slice(1) : 'Supporter'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <EmptyState 
            title="No Supporters Yet" 
            message="Be the first to support BlenderForge and help us grow!"
          />
        )}

        <section className={styles.impactSection}>
          <h2>Your Support Makes a Difference</h2>
          <div className={styles.impactGrid}>
            <div className={styles.impactItem}>
              <h3>Server Costs</h3>
              <p>Keep our platform running smoothly and quickly for everyone</p>
            </div>
            <div className={styles.impactItem}>
              <h3>New Features</h3>
              <p>Fund development of new tools and improvements</p>
            </div>
            <div className={styles.impactItem}>
              <h3>Community Growth</h3>
              <p>Invest in marketing and outreach to grow our community</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportersPage;