// src/pages/EditProfilePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { getStripeConnectOAuthUrl } from '../services/stripeService';
import styles from './EditProfilePage.module.css';
import Spinner from '../components/UI/Spinner/Spinner';
import Button from '../components/UI/Button/Button';
import SuccessPopup from '../components/UI/SuccessPopup/SuccessPopup';

const EditProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const bioTextareaRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stripeConnectUrl, setStripeConnectUrl] = useState(null);

  useEffect(() => {
    const textarea = bioTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [bio]);

  const fetchProfile = async (userId) => {
    try {
      const profileData = await getUserProfile(userId);
      setProfile(profileData);
      setUsername(profileData.username || '');
      setBio(profileData.bio || '');
      setAvatarUrl(profileData.avatar_url || '');
      setBannerUrl(profileData.banner_url || '');
    } catch (err) {
      setError('Failed to load profile data.');
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchProfile(user.id);

      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get('stripe_connected') === 'true') {
        setSuccessMessage('Stripe account connected successfully!');
        setShowSuccess(true);
        navigate(location.pathname, { replace: true });
      }
    }
  }, [user, loading, location.search, navigate]);
  
  useEffect(() => {
    if (!profile || profile.stripe_user_id) return;

    const fetchStripeUrl = async () => {
      try {
        const url = await getStripeConnectOAuthUrl(location.pathname);
        setStripeConnectUrl(url);
      } catch (err) {
        console.error("Failed to fetch Stripe URL:", err);
        setError('Failed to load Stripe connect button.');
      }
    };
    fetchStripeUrl();
  }, [profile, location.pathname]);

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (fileType === 'avatar') {
      setAvatarFile(file);
      setAvatarUrl(previewUrl);
    } else {
      setBannerFile(file);
      setBannerUrl(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError('');
    try {
      const updates = { username, bio, avatar_url: avatarUrl, banner_url: bannerUrl };
      await updateUserProfile(user.id, updates, { avatarFile, bannerFile });
      setSuccessMessage('Profile updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={48} />
      </div>
    );
  }
  
  const isStripeButtonLoading = !profile.stripe_user_id && !stripeConnectUrl;

  return (
    <>
      <SuccessPopup
        message={successMessage}
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Edit Your Profile</h1>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.stripeSection}>
          <div className={styles.stripeSectionContent}>
            <div className={styles.stripeHeader}>
              <div className={styles.stripeBadge}>
                <span>Payments by</span>
                <img src="/stripe-wordmark-large.png" alt="Stripe" className={styles.stripeHeaderLogo} />
              </div>
              <h2 className={styles.stripeSectionTitle}>
                {profile.stripe_user_id ? 'Payment Account Connected' : 'Connect Your Payment Account'}
              </h2>
            </div>
            
            {profile.stripe_user_id ? (
              <div className={styles.stripeConnected}>
                <p className={styles.stripeConnectedText}>
                  Your Stripe account is connected and ready to receive payments from marketplace sales.
                </p>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
                >
                  Manage Stripe Account
                </Button>
              </div>
            ) : (
              <div className={styles.stripeConnect}>
                <p className={styles.stripeConnectText}>
                  Connect your Stripe account to start selling products in the marketplace. 
                  All transactions are secured with bank-level encryption.
                </p>
                {isStripeButtonLoading ? (
                  <div className={styles.stripeLoading}>
                    <Spinner />
                    <span>Loading Stripe connection...</span>
                  </div>
                ) : (
                  <>
                    <a href={stripeConnectUrl} className={styles.stripeConnectButton}>
                      <img src="/stripe-wordmark-large-blurple.png" alt="Connect with Stripe" />
                      <span>Connect Account</span>
                    </a>
                    <div className={styles.stripeCompanies}>
                      <p className={styles.stripeCompaniesText}>
                        Stripe Connect is also used by these companies
                      </p>
                      <img 
                        src="/stripe-companies.png" 
                        alt="Companies using Stripe Connect including Booking.com, ClassPass, ASOS Marketplace, Salesforce, Kickstarter, Lyft, TipTapp, and Karma" 
                        className={styles.stripeCompaniesImage}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.mainColumn}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Public Information</h2>
                <div className={styles.formGroup}>
                  <label htmlFor="username" className={styles.label}>Username</label>
                  <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="bio" className={styles.label}>Bio</label>
                  <textarea
                    id="bio"
                    ref={bioTextareaRef}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className={styles.textarea}
                    placeholder="Tell the community a little about yourself..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.sidebarColumn}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Profile Images</h2>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Avatar</label>
                  <div className={styles.imageUploader}>
                    <img src={avatarUrl || 'https://i.pravatar.cc/150'} alt="Avatar preview" className={styles.imagePreview} />
                    <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={e => handleFileChange(e, 'avatar')} />
                    <Button type="button" variant="secondary" onClick={() => avatarInputRef.current.click()}>Upload New</Button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Banner</label>
                  {bannerUrl && <img src={bannerUrl} alt="Banner preview" className={styles.bannerPreview} />}
                  <input type="file" accept="image/*" ref={bannerInputRef} style={{ display: 'none' }} onChange={e => handleFileChange(e, 'banner')} />
                  <Button type="button" variant="secondary" onClick={() => bannerInputRef.current.click()}>{bannerUrl ? 'Upload New' : 'Upload Banner'}</Button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => navigate('/profile')} disabled={isSaving}>
              Back to Profile
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? <Spinner /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfilePage;