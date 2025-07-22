// src/components/DonationToggle/DonationToggle.jsx
import React from 'react';
import styles from './DonationToggle.module.css';

const DonationToggle = ({ isRecurring, onToggle }) => {
  return (
    <div className={styles.container}>
      <div className={styles.toggleWrapper}>
        <button
          className={`${styles.toggleButton} ${!isRecurring ? styles.active : ''}`}
          onClick={() => onToggle(false)}
        >
          One-time
        </button>
        <button
          className={`${styles.toggleButton} ${isRecurring ? styles.active : ''}`}
          onClick={() => onToggle(true)}
        >
          Monthly
        </button>
      </div>
      <p className={styles.description}>
        {isRecurring 
          ? 'Support BlenderForge with a recurring monthly contribution'
          : 'Make a one-time contribution to support BlenderForge'
        }
      </p>
    </div>
  );
};

export default DonationToggle;