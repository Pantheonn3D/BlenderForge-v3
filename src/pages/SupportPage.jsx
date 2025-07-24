// src/pages/SupportPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Removed: import { Elements } from '@stripe/react-stripe-js';
// Removed: import { getStripe, createCheckoutSession } from '../services/stripeService';
import { checkUserSupporterStatus } from '../services/supportersService';
import { useAuth } from '../context/AuthContext';
import styles from './SupportPage.module.css';
import Button from '../components/UI/Button/Button';
import DonationTiers from '../components/DonationTiers/DonationTiers';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';

// Removed: const stripePromise = getStripe(); // This line is no longer needed

const SupportPage = () => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  // isLoading is now permanently true to disable buttons, as payment is disabled
  const [isLoading, setIsLoading] = useState(true);
  const [supporterStatus, setSupporterStatus] = useState({ isSupporter: false, supporterData: null });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Removed: showConfirmModal, showLoginModal, pendingDonation states
  // Re-added them as local state because ConfirmationModal is used for non-payment related messages
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

  // This function is now disabled and will show an alert
  const handleDonate = () => {
    alert("Donations are temporarily disabled. Please check back later.");
    // No actual payment processing here.
  };

  const handleConfirmDuplicate = async () => {
    setShowConfirmModal(false);
    if (pendingDonation) {
      // In the future, this would call your new payment integration for an "extra" donation
      handleDonate(pendingDonation.amount, pendingDonation.tierId); // Still calls the disabled alert for now
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

        {/* NEW BANNER to indicate donations are offline */}
        <div className={styles.disabledBanner}>
          <h3>Donations Temporarily Unavailable</h3>
          <p>
            We're currently upgrading our payment systems to better support the marketplace.
            Donations will be re-enabled soon. Thank you for your patience!
          </p>
        </div>

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
                disabled={true} // Permanently disable as payment is disabled
              />
              <span className={styles.switch}>
                <span className={styles.switchSlider}></span>
              </span>
              <span className={styles.switchText}>
                {isRecurring ? 'Monthly Subscription' : 'One-time Donation'}
              </span>
            </label>
          </div>

          {/* Removed Elements wrapper */}
          <DonationTiers
            tiers={donationTiers}
            selectedTier={selectedTier}
            onTierSelect={setSelectedTier}
            isRecurring={isRecurring}
            onDonate={handleDonate} // Now points to disabled handler
            isLoading={true} // All buttons inside will now be permanently disabled
            isAlreadySupporter={supporterStatus.isSupporter}
          />

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
                  disabled={true} // Permanently disable as payment is disabled
                />
              </div>
              <Button
                variant="primary"
                onClick={() => handleDonate(parseFloat(customAmount))} // Now points to disabled handler
                disabled={true} // Permanently disable as payment is disabled
                isLoading={false} // Don't show spinner
                className={styles.donateButton}
              >
                Donate
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

      {/* Login Required Modal (retained as it's not Stripe-specific) */}
      <ConfirmationModal
        isOpen={showLoginModal}
        onClose={handleLoginModalClose}
        onConfirm={() => {
          handleLoginModalClose();
          window.location.href = '/login';
        }}
        title="Account Required"
        message={`To make a donation of $${pendingDonation?.amount?.toFixed(2) || '0.00'}, please log in to your account first. This helps us track supporters and provide you with recognition for your contribution.`}
        confirmText="Go to Login"
        cancelText="Cancel"
        variant="info"
      />

      {/* Duplicate Donation Confirmation Modal (retained as it's not Stripe-specific) */}
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