// src/components/DonationForm/DonationForm.jsx
import React, { useState } from 'react';
// Removed: import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import styles from './DonationForm.module.css';
import Button from '../UI/Button/Button';
import { donationService } from '../../services/donationService';

// Removed: cardElementOptions constant

const DonationForm = ({ amount, isRecurring, selectedTier }) => {
  // Removed: const stripe = useStripe();
  // Removed: const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setError('Please log in to make a donation');
      return;
    }

    if (amount < 1) {
      setError('Please enter a valid donation amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // *** Stripe payment processing removed ***
      // In a real application, you would integrate a new payment gateway here
      // For now, we'll simulate success or handle direct recording if applicable
      console.warn("Stripe payment functionality is currently disabled. Simulating donation success.");

      // You might want to add a direct Supabase function call here
      // if donations don't require an external payment gateway for now,
      // or simply log the intention to donate.

      await donationService.recordDonation({
        userId: user.id,
        amount: amount,
        tier: selectedTier,
        isRecurring,
        // Removed: paymentIntentId
      });

      setSuccess(true);

    } catch (err) {
      setError(err.message || 'An error occurred processing your donation. (Payment functionality is currently disabled)');
    }

    setIsProcessing(false);
  };

  if (success) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>Thank you for your support!</h3>
        <p className={styles.successMessage}>
          Your {isRecurring ? 'monthly subscription' : 'donation'} of ${amount.toFixed(2)} has been processed successfully. (Note: Payment functionality is currently disabled on this demo.)
        </p>
        <Button
          onClick={() => window.location.href = '/supporters'}
          variant="primary"
        >
          View Supporters Page
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>
          Complete Your {isRecurring ? 'Monthly Subscription' : 'Donation'}
        </h3>
        <div className={styles.amountDisplay}>
          ${amount.toFixed(2)} {isRecurring && '/month'}
        </div>
      </div>

      {!user && (
        <div className={styles.loginPrompt}>
          <p>Please <a href="/login">log in</a> to make a donation</p>
        </div>
      )}

      {user && (
        <>
          <div className={styles.cardSection}>
            <label className={styles.cardLabel}>
              Payment Information
            </label>
            <div className={styles.cardElementWrapper}>
              {/* Removed: <CardElement options={cardElementOptions} /> */}
              <p className={styles.disabledPaymentMessage}>
                Payment processing is currently disabled. Please contact support.
                {/* This is where a new payment input (e.g., PayPal, new card element) would go. */}
              </p>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.termsSection}>
            <p className={styles.termsText}>
              By completing your donation, you acknowledge that this is for demonstration purposes only and no actual payment will be processed.
              {isRecurring && ' You can cancel your subscription at any time from your profile.'}
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isProcessing}
            // Temporarily disable the button unless you intend for it to "record" without actual payment
            // disabled={!stripe || isProcessing} // Removed Stripe dependency
            disabled={isProcessing} // Keep disabled when processing
          >
            {isProcessing
              ? 'Processing...'
              : `Confirm Donation $${amount.toFixed(2)}${isRecurring ? '/month' : ''}`
            }
          </Button>
        </>
      )}
    </form>
  );
};

export default DonationForm;