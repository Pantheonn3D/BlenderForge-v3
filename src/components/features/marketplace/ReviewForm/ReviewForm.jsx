// src/components/features/marketplace/ReviewForm/ReviewForm.jsx (Updated with proper labels)

import React, { useState } from 'react';
import styles from './ReviewForm.module.css';
import StarIcon from '../../../../assets/icons/StarIcon';
import Button from '../../../UI/Button/Button';
import Spinner from '../../../UI/Spinner/Spinner';

const ReviewForm = ({ onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>Leave a Review</h3>
      
      {/* --- CHANGE 1: Added form groups and labels for clarity --- */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Your Rating*</label>
        <div className={styles.starInput}>
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <label key={starValue}>
                <input
                  type="radio"
                  name="rating"
                  value={starValue}
                  checked={rating === starValue}
                  onChange={() => setRating(starValue)}
                  className={styles.radioInput}
                />
                <StarIcon
                  onClick={() => setRating(starValue)}
                  className={`${styles.star} ${starValue <= (hoverRating || rating) ? styles.filled : styles.empty}`}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="review-comment">Your Review</label>
        <textarea
          id="review-comment"
          className={styles.commentInput}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product... (optional)"
          rows={4}
        />
      </div>
      
      <div className={styles.actions}>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? <Spinner size="sm" /> : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;