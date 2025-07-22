// src/pages/EditProfilePage.jsx (Upgraded with Auto-growing Textarea)

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';
import styles from './EditProfilePage.module.css';
import Spinner from '../components/UI/Spinner/Spinner';
import Button from '../components/UI/Button/Button';
import SuccessPopup from '../components/UI/SuccessPopup/SuccessPopup';

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const bioTextareaRef = useRef(null); // <-- 1. Create a ref for the textarea

  // Form state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // --- 2. ADD A useEffect TO RESIZE THE TEXTAREA ---
  // This effect runs whenever the 'bio' state changes.
  useEffect(() => {
    const textarea = bioTextareaRef.current;
    if (textarea) {
      // Reset height to shrink if text is deleted
      textarea.style.height = 'auto';
      // Set height to the full scroll height of the content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [bio]); // Dependency: only run when bio changes

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const profile = await getUserProfile(user.id);
          setUsername(profile.username || '');
          setBio(profile.bio || '');
          setAvatarUrl(profile.avatar_url || '');
          setBannerUrl(profile.banner_url || '');
        } catch (err) {
          setError('Failed to load profile data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

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
      setTimeout(() => {
        navigate(`/profile/${user.id}`);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className={styles.container}><Spinner size={48} /></div>;

  return (
    <>
      <SuccessPopup 
        message="Profile updated successfully!" 
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
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
              {/* --- 3. APPLY THE REF and REMOVE rows ATTRIBUTE --- */}
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
          
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => navigate(`/profile/${user.id}`)} disabled={isSaving}>Cancel</Button>
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