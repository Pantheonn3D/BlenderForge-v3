// src/features/articleCreator/components/ImageBlock.jsx

import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import styles from './ImageBlock.module.css';
import Button from '../../../components/UI/Button/Button';
import Spinner from '../../../components/UI/Spinner/Spinner';

const ImageBlock = ({ initialUrl = '', onUpload }) => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `content/${user.id}-${Date.now()}.${fileExt}`;
      
      // --- CHANGE: Using your existing 'thumbnails' bucket ---
      const { error: uploadError } = await supabase.storage
        .from('thumbnails') 
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails') // Also changed here
        .getPublicUrl(fileName);
      
      setImageUrl(publicUrl);
      onUpload(publicUrl); // Send the new URL back to the parent component

    } catch (err) {
      setError('Image upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation(); // Prevent placeholder click-through
    setImageUrl('');
    onUpload(''); // Notify parent that the URL is now empty
  };

  const triggerFileInput = () => {
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  }

  return (
    <div className={styles.container}>
      <input
        id={`image-upload-${Math.random()}`}
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        onChange={handleImageChange}
        disabled={isUploading}
        style={{ display: 'none' }}
      />
      
      {!imageUrl ? (
        <div className={styles.placeholder} onClick={triggerFileInput} role="button" tabIndex={0}>
          <Button variant="secondary" disabled={isUploading}>
            {isUploading ? <Spinner /> : 'Upload Image'}
          </Button>
        </div>
      ) : (
        <div className={styles.preview}>
          <img src={imageUrl} alt="Uploaded article content" />
          <Button 
            variant="danger" 
            onClick={handleRemove} 
            className={styles.removeButton}
            aria-label="Remove image"
          >
            ×
          </Button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ImageBlock;