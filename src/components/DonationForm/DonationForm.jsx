// src/components/DonationForm/DonationForm.jsx
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import styles from './DonationForm.module.css';
import Button from '../UI/Button/Button';
import { donationService } from '../../services/donationService';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#E0E0E0',
      backgroundColor: '#1e1e1e',
      '::placeholder': {
        color: '#a0a0a0',
      },
      iconColor: '#f3ce02',
    },
    invalid: {
      color: '#f44336',
    },
  },
  hidePostalCode: false,
};

const DonationForm = ({ amount, isRecurring, selectedTier }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      setError('Please log in to make a donation');
      return;
    }

    if (amount < 1) {
      setError('Please enter a valid donation amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment intent
      const { clientSecret } = await donationService.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        isRecurring,
        tier: selectedTier,
        userId: user.id
      });

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user.email,
          },
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        // Handle successful payment
        await donationService.recordDonation({
          userId: user.id,
          amount: amount,
          tier: selectedTier,
          isRecurring,
          paymentIntentId: result.paymentIntent.id
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred processing your donation');
    }

    setIsProcessing(false);
  };

  if (success) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>Thank you for your support!</h3>
        <p className={styles.successMessage}>
          Your {isRecurring ? 'monthly subscription' : 'donation'} of ${amount.toFixed(2)} has been processed successfully.
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
              Card Information
            </label>
            <div className={styles.cardElementWrapper}>
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.termsSection}>
            <p className={styles.termsText}>
              By completing your donation, you agree that this payment is non-refundable.
              {isRecurring && ' You can cancel your subscription at any time from your profile.'}
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isProcessing}
            disabled={!stripe || isProcessing}
          >
            {isProcessing 
              ? 'Processing...' 
              : `Donate $${amount.toFixed(2)}${isRecurring ? '/month' : ''}`
            }
          </Button>
        </>
      )}
    </form>
  );
};

export default DonationForm;