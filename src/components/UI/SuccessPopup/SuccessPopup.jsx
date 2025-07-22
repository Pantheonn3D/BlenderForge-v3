// src/components/UI/SuccessPopup/SuccessPopup.jsx (Updated with Icon)

import React, { useEffect } from 'react';
import styles from './SuccessPopup.module.css';
import SuccessIcon from '../../../assets/icons/SuccessIcon'; // <-- 1. Import the new icon

const SuccessPopup = ({ message, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // Auto-close after 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <div className={`${styles.popupContainer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.popupContent}>
        {/* --- 2. Use the SuccessIcon component --- */}
        <SuccessIcon className={styles.icon} />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default SuccessPopup;