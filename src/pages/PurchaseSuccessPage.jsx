// src/pages/PurchaseSuccessPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';
import { verifyStripePurchase, getPurchaseDetailsBySessionId } from '../services/purchaseService';
import { useAuth } from '../context/AuthContext';
import SuccessIcon from '../assets/icons/SuccessIcon';
import UploadIcon from '../assets/icons/UploadIcon';
import UserIcon from '../assets/icons/UserIcon';

import styles from './PurchaseSuccessPage.module.css';

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = useState(null);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const sessionId = searchParams.get('session_id');

  const handleSuccessfulPurchase = useCallback(async () => {
    if (!sessionId) {
      setError('No session ID found in URL. Your purchase cannot be verified.');
      setStatus('error');
      return;
    }
    if (!authUser) {
      setError('You must be logged in to verify a purchase.');
      setStatus('error');
      return;
    }

    try {
      await verifyStripePurchase(sessionId);
      const details = await getPurchaseDetailsBySessionId(sessionId);
      setPurchaseDetails(details);
      setStatus('success');
      // Trigger confetti after a short delay
      setTimeout(() => setShowConfetti(true), 300);
    } catch (err) {
      console.error('Purchase success processing error:', err);
      setError(err.message || 'An error occurred while confirming your purchase.');
      setStatus('error');
    }
  }, [sessionId, authUser]);

  useEffect(() => {
    if (!authLoading) {
      handleSuccessfulPurchase();
    }
  }, [authLoading, handleSuccessfulPurchase]);

  const shareText = `I just got ${purchaseDetails?.products?.name} from BlenderForge! 🎉`;
  const shareUrl = `${window.location.origin}/marketplace/product/${purchaseDetails?.products?.slug}`;

  const handleShare = (platform) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  if (status === 'verifying') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}>
            <Spinner size={48} />
          </div>
          <h2 className={styles.loadingTitle}>Processing Your Purchase</h2>
          <p className={styles.loadingMessage}>
            We're verifying your payment and preparing your download...
          </p>
          <div className={styles.loadingSteps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>✓</div>
              <span>Payment confirmed</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>⟳</div>
              <span>Preparing download</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>⋯</div>
              <span>Almost ready</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <EmptyState
        title="Purchase Verification Failed"
        message={error}
        button={<Link to="/marketplace"><Button>Back to Marketplace</Button></Link>}
      />
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className={styles.confetti}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={styles.confettiPiece}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: i % 3 === 0 ? '#f3ce02' : i % 3 === 1 ? '#4caf50' : '#ff6b6b'
              }}
            />
          ))}
        </div>
      )}

      <div className={styles.container}>
        {/* Success Header */}
        <div className={styles.heroSection}>
          <div className={styles.successIconContainer}>
            <div className={styles.successIcon}>
              <SuccessIcon className={styles.iconSvg} />
            </div>
            <div className={styles.iconRipple}></div>
            <div className={styles.iconRipple}></div>
          </div>
          
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>Congratulations!</span>
          </h1>
          <p className={styles.subtitle}>Your purchase was successful</p>
        </div>

        {/* Purchase Details Card */}
        <div className={styles.purchaseCard}>
          <div className={styles.cardHeader}>
            <h2>Your New Blender Asset</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>
                {purchaseDetails?.products?.name}
              </h3>
              <p className={styles.purchaseMessage}>
                Welcome to the BlenderForge community! You now have access to this amazing asset.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionSection}>
          {purchaseDetails?.products?.download_url ? (
            <a href={purchaseDetails.products.download_url} download className={styles.downloadButtonWrapper}>
              <Button 
                variant="primary" 
                size="lg" 
                leftIcon={<UploadIcon />}
                className={styles.primaryAction}
              >
                Download Your Asset Now
              </Button>
            </a>
          ) : (
            <div className={styles.downloadError}>
              <p>There was an issue retrieving the download link. Please contact support.</p>
            </div>
          )}

          <div className={styles.secondaryActions}>
            <Link to="/profile">
              <Button variant="secondary" leftIcon={<UserIcon />}>
                View My Library
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="ghost">
                Explore More Assets
              </Button>
            </Link>
          </div>
        </div>

        {/* Social Sharing */}
        <div className={styles.socialSection}>
          <h3>Share Your Discovery</h3>
          <p>Let others know about this awesome Blender asset!</p>
          <div className={styles.socialButtons}>
            <button 
              onClick={() => handleShare('twitter')} 
              className={`${styles.socialBtn} ${styles.twitter}`}
            >
              Share on Twitter
            </button>
            <button 
              onClick={() => handleShare('facebook')} 
              className={`${styles.socialBtn} ${styles.facebook}`}
            >
              Share on Facebook
            </button>
            <button 
              onClick={() => handleShare('linkedin')} 
              className={`${styles.socialBtn} ${styles.linkedin}`}
            >
              Share on LinkedIn
            </button>
          </div>
        </div>

        {/* Footer Message */}
        <div className={styles.footerMessage}>
          <div className={styles.communityBadge}>
            <span className={styles.badgeIcon}>🎯</span>
            <div>
              <strong>You're now part of the BlenderForge community!</strong>
              <p>Access your downloads anytime from your profile page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;