// src/components/UI/StarRating/StarRating.jsx

import React from 'react';
import StarIcon from '../../../assets/icons/StarIcon';
import styles from './StarRating.module.css';

const StarRating = ({ rating = 0, totalStars = 5 }) => {
  return (
    <div className={styles.starRating}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={starValue}
            className={`${styles.star} ${rating >= starValue ? styles.filled : styles.empty}`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;