// src/components/UI/ProductCard/ProductCard.jsx (Updated with Ratings)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { ChevronRightIcon } from '../../../assets/icons';
import UserCircleIcon from '../../../assets/icons/UserCircleIcon';
import StarRating from '../StarRating/StarRating'; // <-- Import StarRating

const ProductCard = ({ product }) => {
  if (!product) return null;

  // --- De-structure the new rating fields ---
  const { slug, thumbnail_url, name, description, price, username, avatar_url, avg_rating, rating_count } = product;
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const formatPrice = (p) => {
    if (p === null || p === undefined || p === 0) return 'Free';
    return `$${Number(p).toFixed(2)}`;
  };

  return (
    <article className={styles.card}>
      <Link to={`/marketplace/${slug}`} className={styles.cardLink}>
        {/* ... (image container is unchanged) ... */}
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
          
          {/* --- NEW RATING DISPLAY --- */}
        <div className={styles.ratingWrapper}>
            <StarRating rating={avg_rating} />
            {rating_count > 0 && (
                <span className={styles.ratingCount}>
                    ({rating_count})
                </span>
            )}
        </div>

        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>

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