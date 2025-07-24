// src/components/UI/ProductCard/ProductCard.jsx (Updated with Ratings and description handling)

import React, { useState, useMemo } from 'react'; // Added useMemo
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { ChevronRightIcon } from '../../../assets/icons';
import UserCircleIcon from '../../../assets/icons/UserCircleIcon';
import StarRating from '../StarRating/StarRating';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const { slug, thumbnail_url, name, description, price, username, avatar_url, avg_rating, rating_count } = product;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Function to extract plain text from TipTap JSON description
  const getPlainTextDescription = useMemo(() => {
    if (typeof description === 'string') {
      return description; // Fallback for old string descriptions
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
        // Add more block types here if needed (e.g., heading, list_item)
      });
      return plainText.trim();
    }
    return ''; // Return empty string if description is not valid
  }, [description]);

  const truncatedDescription = useMemo(() => {
    const text = getPlainTextDescription;
    if (text.length > 120) { // Adjust character limit as needed
      return text.substring(0, 117) + '...';
    }
    return text;
  }, [getPlainTextDescription]);

  const formatPrice = (p) => {
    if (p === null || p === undefined || p === 0) return 'Free';
    return `$${Number(p).toFixed(2)}`;
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
          {/* Render the plain text description */}
          <p className={styles.description}>{truncatedDescription}</p>

        </div>

        <div className={styles.footer}>
          <div className={styles.authorInfo}>
            {avatar_url && !avatarError ? (
              <img src={avatar_url} alt={username} className={styles.authorAvatar} onError={() => setAvatarError(true)} />
            ) : (
              <UserCircleIcon className={styles.authorAvatarFallback} />
            )}
            <span className={styles.authorName}>{username || 'Unknown Author'}</span>
          </div>
          <span className={styles.footerLinkText}>View</span>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;