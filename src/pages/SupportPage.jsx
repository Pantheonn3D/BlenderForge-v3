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
import Tooltip from '../components/UI/Tooltip/Tooltip'; // <-- 1. IMPORT TOOLTIP
import { QuestionMarkCircleIcon } from '../assets/icons'; // <-- 2. IMPORT ICON

// --- THIS IS THE FIX ---
const SupporterInfoTooltip = () => (
  <div> {/* Removed padding from here */}
    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--color-text-primary)', fontSize: '1rem' }}>How Your Info is Used</h4>
    <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.85rem' }}>
      Upon becoming a supporter, your public profile name and avatar will be displayed on our Supporters page. 
      This is to publicly thank you for your generosity and contribution to the community!
    </p>
  </div>
);

const SupportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [supporterStatus, setSupporterStatus] = useState({ isSupporter: false });
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const supportProductDatabaseIds = {
    supporter: {
      oneTime: '16',
    },
    advocate: {
      oneTime: '17',
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

    const tierProductIds = supportProductDatabaseIds[tierId];
    if (!tierProductIds) {
      setError('Invalid support tier selected.');
      return;
    }
    
    const productIdToUse = tierProductIds.oneTime;

    setIsLoading(true);
    setError('');
    try {
      const { url } = await createStripeCheckoutSession(productIdToUse);
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* --- 4. MODIFY THE HEADER JSX --- */}
        <div className={styles.titleContainer}>
          <h1>Support BlenderForge</h1>
          <Tooltip content={<SupporterInfoTooltip />}>
            <QuestionMarkCircleIcon className={styles.headerTooltipIcon} />
          </Tooltip>
        </div>
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