// src/components/UI/ArticleCard/ArticleCard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ArticleCard.module.css';
import {
  ClockIcon,
  SignalIcon,
  CalendarIcon,
  ChevronRightIcon,
  EyeIcon,        // Imported new EyeIcon
  ThumbUpIcon,    // Imported new ThumbUpIcon
  ThumbDownIcon   // Imported new ThumbDownIcon
} from '../../../assets/icons';

const ArticleCard = ({ article }) => {
  if (!article) return null;

  const {
    slug,
    image_url,
    title,
    description,
    read_time,
    difficulty,
    created_at,
    category,
    view_count, // Destructure new fields
    likes,      // Destructure new fields
    dislikes    // Destructure new fields
  } = article;

  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return 'var(--color-text-secondary)';
    }
  };

  const difficultyColor = getDifficultyColor(difficulty);

  return (
    <article className={styles.card}>
      <Link to={`/knowledge-base/${categorySlug}/${slug}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <img
            src={imageError ? 'https://placehold.co/600x400/1e1e1e/a0a0a0?text=Image+Not+Found' : image_url}
            alt={title}
            className={`${styles.image} ${imageLoaded ? styles.loaded : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
            loading="lazy"
          />
          {!imageLoaded && (
            <div className={styles.imagePlaceholder}><div className={styles.imageLoader}></div></div>
          )}
          <div className={styles.imageOverlay}>
            <div className={styles.overlayContent}>
              <span>Read Article</span>
              <ChevronRightIcon className={styles.readMoreIcon} />
            </div>
          </div>
          {category && <div className={styles.categoryBadge}>{category}</div>}
        </div>

        <div className={styles.content}>
          <div className={styles.meta}>
            <div className={styles.metaItem}><ClockIcon /><span>{read_time}</span></div>
            <div className={styles.metaItem} style={{ color: difficultyColor }}>
              <SignalIcon style={{ filter: `drop-shadow(0 0 4px ${difficultyColor})` }}/>
              <span>{difficulty}</span>
            </div>
            <div className={styles.metaItem}>
              <CalendarIcon />
              <span>{new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* NEW: Views, Likes, Dislikes Display with specific icons */}
            <div className={styles.metaItem}>
              <EyeIcon className={styles.iconSmall} /> {/* Using new EyeIcon */}
              <span>{view_count || 0}</span>
            </div>
            <div className={styles.metaItem}>
              <ThumbUpIcon className={styles.iconSmall} /> {/* Using new ThumbUpIcon */}
              <span>{likes || 0}</span>
            </div>
            <div className={styles.metaItem}>
              <ThumbDownIcon className={styles.iconSmall} /> {/* Using new ThumbDownIcon */}
              <span>{dislikes || 0}</span>
            </div>
          </div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          <div className={styles.footer}>
            <span className={styles.footerLinkText}>
              Read More
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ArticleCard;