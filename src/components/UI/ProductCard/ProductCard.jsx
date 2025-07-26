// src/components/UI/ProductCard/ProductCard.jsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { ChevronRightIcon, ClipboardIcon, CheckmarkIcon, EyeIcon, UploadIcon } from '../../../assets/icons';
import UserCircleIcon from '../../../assets/icons/UserCircleIcon';
import StarRating from '../StarRating/StarRating';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const { slug, thumbnail_url, name, description, price, username, avatar_url, avg_rating, rating_count, view_count, download_count } = product;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getPlainTextDescription = useMemo(() => {
    if (!description) return ''; // <-- Add a guard for missing description
    if (typeof description === 'string') {
      return description;
    }
    if (typeof description === 'object' && description.type === 'doc' && description.content) {
      let plainText = '';
      description.content.forEach(node => {
        if (node.type === 'paragraph' && node.content) {
          node.content.forEach(textNode => {
            if (textNode.type === 'text' && textNode.text) {
              plainText += textNode.text + ' ';
            }
          });
        }
      });
      return plainText.trim();
    }
    return '';
  }, [description]);

  const truncatedDescription = useMemo(() => {
    const text = getPlainTextDescription;
    if (text.length > 120) {
      return text.substring(0, 117) + '...';
    }
    return text;
  }, [getPlainTextDescription]);

  const formatPrice = (p) => {
    if (p === null || p === undefined || p === 0) return 'Free';
    return `$${Number(p).toFixed(2)}`;
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const productUrl = `${window.location.origin}/marketplace/${slug}`;
    navigator.clipboard.writeText(productUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <article className={styles.card}>
      <Link to={`/marketplace/${slug}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <img
            src={imageError ? 'https://placehold.co/600x400/1e1e1e/a0a0a0?text=Image+Not+Found' : thumbnail_url}
            alt={name}
            className={`${styles.image} ${imageLoaded ? styles.loaded : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
            loading="lazy"
          />
          {!imageLoaded && <div className={styles.imagePlaceholder}><div className={styles.imageLoader}></div></div>}
          <div className={styles.imageOverlay}>
            <div className={styles.overlayContent}>
              <span>View Details</span>
              <ChevronRightIcon className={styles.viewDetailsIcon} />
            </div>
          </div>
          <div className={`${styles.priceBadge} ${price === 0 ? styles.free : ''}`}>{formatPrice(price)}</div>
        </div>

        <div className={styles.content}>
          <div className={styles.ratingWrapper}>
            <StarRating rating={avg_rating} />
            {rating_count > 0 && (
                <span className={styles.ratingCount}>
                    ({rating_count})
                </span>
            )}
          </div>

          <h3 className={styles.name}>{name}</h3>
          
          {/* --- FIX IS HERE: Only render the paragraph if a description exists --- */}
          {truncatedDescription && (
            <p className={styles.description}>{truncatedDescription}</p>
          )}

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <EyeIcon />
              <span>{view_count || 0}</span>
            </div>
            <div className={styles.statItem}>
              <UploadIcon />
              <span>{download_count || 0}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className={styles.footer}>
        <div className={styles.authorInfo}>
          {avatar_url && !avatarError ? (
            <img src={avatar_url} alt={username} className={styles.authorAvatar} onError={() => setAvatarError(true)} />
          ) : (
            <UserCircleIcon className={styles.authorAvatarFallback} />
          )}
          <span className={styles.authorName}>{username || 'Unknown Author'}</span>
        </div>
        <div className={styles.footerActions}>
          <button onClick={handleCopyLink} className={styles.copyButton} title="Copy product link">
            {isCopied ? <CheckmarkIcon style={{ color: 'var(--color-success)' }} /> : <ClipboardIcon />}
          </button>
          <Link to={`/marketplace/${slug}`} className={styles.viewButton}>VIEW</Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;