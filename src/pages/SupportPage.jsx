// src/pages/SupportPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStripeCheckoutSession } from '../services/stripeService';
import { checkUserSupporterStatus } from '../services/supportersService';
import { useAuth } from '../context/AuthContext';
import styles from './SupportPage.module.css';
import Button from '../components/UI/Button/Button';
import DonationTiers from '../components/DonationTiers/DonationTiers';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';

const SupportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [supporterStatus, setSupporterStatus] = useState({ isSupporter: false });
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false); // Retain this for the toggle switch

  // --- IMPORTANT: Replace with the actual IDs from your database ---
  const supportProductIds = {
    supporter: {
      oneTime: 'price_YOUR_SUPPORTER_ONETIME_ID',
      recurring: 'price_YOUR_SUPPORTER_RECURRING_ID'
    },
    advocate: {
      oneTime: 'price_YOUR_ADVOCATE_ONETIME_ID',
      recurring: 'price_YOUR_ADVOCATE_RECURRING_ID'
    }
  };

  const donationTiers = [
    { id: 'supporter', name: 'Forge Supporter', price: 4.99, description: 'Help keep the lights on', perks: ['Supporter badge on your profile', 'Name listed on supporters page', 'Warm fuzzy feeling inside'] },
    { id: 'advocate', name: 'Forge Advocate', price: 14.99, description: 'Accelerate our growth', perks: ['All Supporter perks', 'Special Discord role', 'Early access to new features'], featured: true }
  ];

  useEffect(() => {
    const checkStatus = async () => {
      if (user) {
        setIsCheckingStatus(true);
        try {
          const status = await checkUserSupporterStatus(user.id);
          setSupporterStatus(status);
        } catch (error) {
          console.error('Failed to check supporter status:', error);
        } finally {
          setIsCheckingStatus(false);
        }
      } else {
        setIsCheckingStatus(false);
      }
    };
    checkStatus();
  }, [user]);

  const handleDonate = async (tierId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const tierPriceIds = supportProductIds[tierId];
    if (!tierPriceIds) {
      setError('Invalid support tier selected.');
      return;
    }
    
    const priceId = isRecurring ? tierPriceIds.recurring : tierPriceIds.oneTime;

    setIsLoading(true);
    setError('');
    try {
      const { url } = await createStripeCheckoutSession(priceId);
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Support BlenderForge</h1>
        <p>Help us build the best Blender community platform</p>
      </header>

      <div className={styles.content}>
        {supporterStatus.isSupporter && (
          <div className={styles.alreadySupporterBanner}>
            <h3>You're Already a Supporter!</h3>
            <p>
              Thank you for your continued support! You're already listed on our{' '}
              <Link to="/supporters">supporters page</Link>.
            </p>
          </div>
        )}

        {/* --- RESTORED MISSION SECTION --- */}
        <section className={styles.missionSection}>
          <div className={styles.missionCard}>
            <h2>Our Mission</h2>
            <p>
              BlenderForge is a community-driven platform dedicated to helping Blender artists
              of all levels learn, share, and grow together. Your support helps us maintain our
              servers, develop new features, and keep the platform free for everyone.
            </p>
          </div>
        </section>

        <section className={styles.supportOptions}>
          <div className={styles.switchContainer}>
            <label className={styles.switchLabel}>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className={styles.switchInput}
              />
              <span className={styles.switch}>
                <span className={styles.switchSlider}></span>
              </span>
              <span className={styles.switchText}>
                {isRecurring ? 'Monthly Subscription' : 'One-time Donation'}
              </span>
            </label>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <DonationTiers
            tiers={donationTiers}
            onDonate={handleDonate}
            isLoading={isLoading}
            isRecurring={isRecurring}
            isAlreadySupporter={supporterStatus.isSupporter}
          />
        </section>

        <section className={styles.supportersSection}>
          <h2>Join Our Supporters</h2>
          <p>
            See who's helping make BlenderForge possible on our{' '}
            <Link to="/supporters" className={styles.supportersLink}>
              supporters page
            </Link>
          </p>
        </section>
      </div>

      <ConfirmationModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={() => navigate('/login')}
        title="Account Required"
        message="Please log in or create an account to become a supporter."
        confirmText="Go to Login"
        cancelText="Cancel"
        variant="info"
      />
    </div>
  );
};

export default SupportPage;