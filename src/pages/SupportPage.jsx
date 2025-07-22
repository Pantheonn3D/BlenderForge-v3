// src/pages/SupportPage.jsx (Complete updated file)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, createCheckoutSession } from '../services/stripeService';
import { checkUserSupporterStatus } from '../services/supportersService';
import { useAuth } from '../context/AuthContext';
import styles from './SupportPage.module.css';
import Button from '../components/UI/Button/Button';
import DonationTiers from '../components/DonationTiers/DonationTiers';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';

const stripePromise = getStripe();

const SupportPage = () => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supporterStatus, setSupporterStatus] = useState({ isSupporter: false, supporterData: null });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingDonation, setPendingDonation] = useState(null);

  const donationTiers = [
    {
      id: 'supporter',
      name: 'Forge Supporter',
      price: 4.99,
      description: 'Help keep the lights on',
      perks: [
        'Supporter badge on your profile',
        'Name listed on supporters page',
        'Warm fuzzy feeling inside'
      ]
    },
    {
      id: 'advocate',
      name: 'Forge Advocate',
      price: 14.99,
      description: 'Accelerate our growth',
      perks: [
        'All Supporter perks',
        'Special Discord role',
        'Early access to new features',
        'Priority support'
      ],
      featured: true
    }
  ];

  // Check supporter status when user is available
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
      }
    };

    checkStatus();
  }, [user]);

  const processDonation = async (amount, tierId = null) => {
    setIsLoading(true);
    try {
      const priceData = {
        amount: amount,
        name: tierId ? donationTiers.find(t => t.id === tierId)?.name : 'Custom Donation',
        description: tierId ? donationTiers.find(t => t.id === tierId)?.description : 'Custom support donation',
        tierType: tierId || 'custom',
      };

      await createCheckoutSession(priceData, user.id, isRecurring);
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('There was an error processing your donation. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDonate = async (amount, tierId = null) => {
    // Check if user is logged in - show nice modal instead of alert
    if (!user) {
      setPendingDonation({ amount, tierId });
      setShowLoginModal(true);
      return;
    }

    // Check if user is already a supporter
    if (supporterStatus.isSupporter) {
      setPendingDonation({ amount, tierId });
      setShowConfirmModal(true);
      return;
    }

    // Process donation directly if not a supporter
    await processDonation(amount, tierId);
  };

  const handleConfirmDuplicate = async () => {
    setShowConfirmModal(false);
    if (pendingDonation) {
      await processDonation(pendingDonation.amount, pendingDonation.tierId);
      setPendingDonation(null);
    }
  };

  const handleCancelDuplicate = () => {
    setShowConfirmModal(false);
    setPendingDonation(null);
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    setPendingDonation(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Support BlenderForge</h1>
        <p>Help us build the best Blender community platform</p>
      </header>

      <div className={styles.content}>
        {/* Show supporter status banner */}
        {supporterStatus.isSupporter && (
          <div className={styles.alreadySupporterBanner}>
            <h3>You're Already a Supporter!</h3>
            <p>
              Thank you for your continued support! You're already listed on our{' '}
              <Link to="/supporters">supporters page</Link>. 
              Additional donations are welcome but won't change your supporter status.
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
                disabled={supporterStatus.isSupporter}
              />
              <span className={styles.switch}>
                <span className={styles.switchSlider}></span>
              </span>
              <span className={styles.switchText}>
                {isRecurring ? 'Monthly Subscription' : 'One-time Donation'}
                {supporterStatus.isSupporter && ' (Disabled - Already a supporter)'}
              </span>
            </label>
          </div>

          <Elements stripe={stripePromise}>
            <DonationTiers
              tiers={donationTiers}
              selectedTier={selectedTier}
              onTierSelect={setSelectedTier}
              isRecurring={isRecurring}
              onDonate={handleDonate}
              isLoading={isLoading || isCheckingStatus}
              isAlreadySupporter={supporterStatus.isSupporter}
            />
          </Elements>

          <div className={styles.customDonation}>
            <h3>Custom Amount</h3>
            <div className={styles.customInputGroup}>
              <div className={styles.inputWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="25.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className={styles.amountInput}
                />
              </div>
              <Button
                variant={supporterStatus.isSupporter ? "secondary" : "primary"}
                onClick={() => handleDonate(parseFloat(customAmount))}
                disabled={!customAmount || parseFloat(customAmount) < 1 || isLoading || isCheckingStatus}
                isLoading={isLoading}
                className={styles.donateButton}
              >
                {customAmount && parseFloat(customAmount) >= 1
                  ? `${supporterStatus.isSupporter ? 'Donate Extra' : 'Donate'} $${parseFloat(customAmount).toFixed(2)}`
                  : supporterStatus.isSupporter ? 'Donate Extra' : 'Donate'
                }
              </Button>
            </div>
          </div>
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

      {/* Login Required Modal */}
      <ConfirmationModal
        isOpen={showLoginModal}
        onClose={handleLoginModalClose}
        onConfirm={() => {
          handleLoginModalClose();
          // Navigate to login page - you might want to add a redirect back to support page
          window.location.href = '/login';
        }}
        title="Account Required"
        message={`To make a donation of $${pendingDonation?.amount?.toFixed(2) || '0.00'}, please log in to your account first. This helps us track supporters and provide you with recognition for your contribution.`}
        confirmText="Go to Login"
        cancelText="Cancel"
        variant="info"
      />

      {/* Duplicate Donation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelDuplicate}
        onConfirm={handleConfirmDuplicate}
        title="Additional Donation"
        message={`You're already a valued supporter of BlenderForge! Making an additional donation of $${pendingDonation?.amount?.toFixed(2) || '0.00'} won't extend or upgrade your current supporter status, but every contribution helps us grow. Would you like to proceed?`}
        confirmText="Yes, Donate Extra"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
};

export default SupportPage;