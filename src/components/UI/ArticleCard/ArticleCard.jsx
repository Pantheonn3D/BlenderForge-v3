// src/components/UI/ArticleCard/ArticleCard.jsx (Updated)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ArticleCard.module.css';
import { ClockIcon, SignalIcon, CalendarIcon, ChevronRightIcon } from '../../../assets/icons'; // Assuming correct path

const ArticleCard = ({ article }) => {
  if (!article) return null;

  // IMPORTANT: This assumes you have cleaned your slug data in Supabase.
  // If your slug is still `/guides/some-slug`, you would need to clean it here first:
  // const cleanSlug = article.slug.startsWith('/guides/') ? article.slug.substring(8) : article.slug;
  const { slug, image_url, title, description, read_time, difficulty, created_at, category } = article;

  // Create a URL-friendly version of the category, e.g., "Blender Basics" -> "blender-basics"
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
      {/* --- THIS IS THE KEY CHANGE --- */}
      {/* We are now building the new, structured URL */}
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