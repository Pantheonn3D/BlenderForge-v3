// src/pages/SupportPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStripeCheckoutSession } from '../services/stripeService'; // Use the existing marketplace service
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

  // --- IMPORTANT: Replace with the actual IDs from your database ---
  const supportProductIds = {
    supporter: 16, // Example ID for "Forge Supporter" product
    advocate: 17,  // Example ID for "Forge Advocate" product
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

    const productId = supportProductIds[tierId];
    if (!productId) {
      setError('Invalid support tier selected.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Use the existing marketplace checkout function
      const { url } = await createStripeCheckoutSession(productId);
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
            <p>Thank you for your continued support! You can manage your support status from your profile.</p>
          </div>
        )}
        
        {error && <p className={styles.errorText}>{error}</p>}

        <DonationTiers
          tiers={donationTiers}
          onDonate={handleDonate}
          isLoading={isLoading}
          isAlreadySupporter={supporterStatus.isSupporter}
        />

        <section className={styles.supportersSection}>
          <h2>Join Our Supporters</h2>
          <p>See who's helping make BlenderForge possible on our <Link to="/supporters" className={styles.supportersLink}>supporters page</Link></p>
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