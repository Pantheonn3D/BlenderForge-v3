// src/features/articleCreator/components/TiptapImageNode.jsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { uploadImageToContentStorage } from '../../../services/imageUploadService';
import { useAuth } from '../../../context/AuthContext';
import styles from './TiptapImageNode.module.css'; // New CSS module
import Button from '../../../components/UI/Button/Button';
import Spinner from '../../../components/UI/Spinner/Spinner';
import UploadIcon from '../../../assets/icons/UploadIcon';
import XMarkIcon from '../../../assets/icons/XMarkIcon'; // For remove button

// Constants for image upload
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']; // ADDED 'image/svg+xml'

const TiptapImageNode = ({ node, getPos, editor, updateAttributes }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(node.attrs.src || '');

  // Effect to clean up object URLs if they were created for local previews
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setError('');
    
    // Client-side validation
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Only ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')} allowed.`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError(`File size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit.`);
      return;
    }

    setIsUploading(true);
    setPreviewUrl(URL.createObjectURL(file)); // Show local preview immediately

    try {
      const publicUrl = await uploadImageToContentStorage(file, user.id);
      updateAttributes({ src: publicUrl }); // Update the TipTap node's src attribute
      setPreviewUrl(publicUrl); // Update local preview to public URL
    } catch (err) {
      setError(err.message || 'Image upload failed.');
      console.error('Image upload failed in TiptapImageNode:', err);
      updateAttributes({ src: '' }); // Clear src if upload fails
      setPreviewUrl(''); // Clear local preview
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    }
  }, [user, updateAttributes]);

  const handleRemoveImage = useCallback(() => {
    if (getPos) {
      editor.chain().focus().deleteRange({ from: getPos(), to: getPos() + node.nodeSize }).run();
    }
  }, [editor, getPos, node.nodeSize]);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const showPlaceholder = !previewUrl || isUploading;

  return (
    <NodeViewWrapper className={styles.imageNodeWrapper}>
      <input
        type="file"
        ref={fileInputRef}
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        onChange={handleFileChange}
        disabled={isUploading}
        style={{ display: 'none' }}
      />
      
      {showPlaceholder ? (
        <div className={styles.placeholder} onClick={triggerFileInput}>
          {isUploading ? (
            <Spinner />
          ) : (
            <>
              <UploadIcon className={styles.uploadIcon} />
              <p>{error || 'Click or drag to upload image'}</p>
              <small>Max {MAX_IMAGE_SIZE / (1024 * 1024)}MB, {ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}</small>
              {error && <p className={styles.errorText}>{error}</p>}
            </>
          )}
        </div>
      ) : (
        <div className={styles.previewContainer}>
          <img
            src={previewUrl}
            alt={node.attrs.alt || 'Uploaded content image'}
            className={styles.uploadedImage}
          />
          <Button
            variant="danger"
            onClick={handleRemoveImage}
            className={styles.removeButton}
            aria-label="Remove image"
          >
            <XMarkIcon />
          </Button>
        </div>
      )}
      {/* NodeViewContent is needed for draggable images, though empty for image nodes */}
      <NodeViewContent className={styles.content} />
    </NodeViewWrapper>
  );
};

export default TiptapImageNode;