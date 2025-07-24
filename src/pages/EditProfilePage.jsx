// src/pages/EditProfilePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, createStripeConnectAccount } from '../services/userService';
import styles from './EditProfilePage.module.css';
import Spinner from '../components/UI/Spinner/Spinner';
import Button from '../components/UI/Button/Button';
import SuccessPopup from '../components/UI/SuccessPopup/SuccessPopup';

const MonetizationSection = ({ profile }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSetupPayments = async () => {
    setIsBusy(true);
    setError('');
    try {
      const { url } = await createStripeConnectAccount();
      window.location.href = url;
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setIsBusy(false);
    }
  };

  const hasConnectedAccount = !!profile.stripe_connect_id;

  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>Monetization</h2>
      {hasConnectedAccount ? (
        <>
          <p className={styles.label}>Your account is set up to receive payments.</p>
          {/* *** THIS IS THE FIX: The button is now enabled and calls the correct handler *** */}
          <Button onClick={handleSetupPayments} isLoading={isBusy} disabled={isBusy}>
            Go to Seller Dashboard
          </Button>
        </>
      ) : (
        <>
          <p className={styles.label}>Enable payments to sell your products on the marketplace.</p>
          <Button onClick={handleSetupPayments} isLoading={isBusy} disabled={isBusy}>
            Set Up Payments
          </Button>
        </>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};


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
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false);

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
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get('onboarding_complete') === 'true') {
        setShowOnboardingSuccess(true);
        navigate('/profile/edit', { replace: true });
      }
      fetchProfile(user.id);
    }
  }, [user, loading, location.search, navigate]);

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

  return (
    <>
      <SuccessPopup 
        message="Profile updated successfully!" 
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <SuccessPopup 
        message="Stripe onboarding complete! Your account is ready for payments." 
        isOpen={showOnboardingSuccess}
        onClose={() => setShowOnboardingSuccess(false)}
      />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Edit Your Profile</h1>
        </header>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
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
          
          <MonetizationSection profile={profile} />
          
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => navigate('/marketplace')} disabled={isSaving}>
              Back to Marketplace
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