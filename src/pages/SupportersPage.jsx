// src/pages/SupportersPage.jsx (Improved)

import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './SupportersPage.module.css';
import { getSupporters, addSupporterAfterPayment } from '../services/supportersService';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';

const SupportersPage = () => {
  const [supporters, setSupporters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const hasProcessedPayment = useRef(false);
  
  const success = searchParams.get('success');

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        setIsLoading(true);
        
        // Process successful payment only once
        if (success === 'true' && user && !hasProcessedPayment.current) {
          hasProcessedPayment.current = true;
          console.log('Processing successful payment for user:', user.id);
          
          try {
            await addSupporterAfterPayment(user.id, 'payment-' + Date.now());
            console.log('Successfully processed payment supporter addition!');
          } catch (error) {
            console.error('Failed to add supporter:', error);
            // Continue anyway - the webhook might have already added them
          }
          
          // Clean up URL after processing (optional)
          setTimeout(() => {
            setSearchParams({}, { replace: true });
          }, 3000);
        }
        
        const data = await getSupporters();
        setSupporters(data || []);
      } catch (err) {
        console.error('Error fetching supporters:', err);
        setError('Failed to load supporters');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupporters();
  }, [success, user, setSearchParams]);

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
      {success === 'true' && (
        <div className={styles.successBanner}>
          <p>Thank you for your generous support! Welcome to the BlenderForge community of supporters.</p>
        </div>
      )}

      {/* Rest of your component stays the same... */}
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
                <div key={supporter.id} className={styles.supporterCard}>
                  <div className={styles.supporterAvatar}>
                    <img 
                      src={supporter.profiles?.avatar_url || 'https://i.pravatar.cc/150'} 
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
                  <div className={styles.supporterBadge}>
                    Supporter
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