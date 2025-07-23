// src/components/features/marketplace/EditReview/EditReview.jsx

import React, { useState } from 'react';
import styles from './EditReview.module.css';
import StarIcon from '../../../../assets/icons/StarIcon';
import Button from '../../../UI/Button/Button';
import Spinner from '../../../UI/Spinner/Spinner';

const EditReview = ({ review, onUpdate, onDelete, isSubmitting }) => {
  const [rating, setRating] = useState(review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(review.comment || '');

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate({ rating, comment });
  };

  return (
    <form className={styles.form} onSubmit={handleUpdate}>
      <h3 className={styles.title}>Your Review</h3>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Your Rating*</label>
        <div className={styles.starInput}>
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <label key={starValue}>
                <input type="radio" name="rating" value={starValue} checked={rating === starValue} onChange={() => setRating(starValue)} className={styles.radioInput} />
                <StarIcon onClick={() => setRating(starValue)} className={`${styles.star} ${starValue <= (hoverRating || rating) ? styles.filled : styles.empty}`} onMouseEnter={() => setHoverRating(starValue)} onMouseLeave={() => setHoverRating(0)} />
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="review-comment">Your Review</label>
        <textarea id="review-comment" className={styles.commentInput} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts..." rows={4} />
      </div>
      
      <div className={styles.actions}>
        <Button type="button" variant="danger" onClick={onDelete} disabled={isSubmitting}>
          Delete
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? <Spinner size="sm" /> : 'Update Review'}
        </Button>
      </div>
    </form>
  );
};

export default EditReview;