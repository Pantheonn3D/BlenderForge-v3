// src/components/UI/Tooltip/Tooltip.jsx

import React, { useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [positionClass, setPositionClass] = useState(styles.positionTop);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // --- THIS IS THE FIX ---
      // Lowered threshold from 150 to 100
      if (rect.top < 250) { 
        setPositionClass(styles.positionBottom);
      } else {
        setPositionClass(styles.positionTop);
      }
    }
  }, [isVisible]);

  return (
    <div 
      ref={triggerRef}
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex="0"
    >
      {children}
      {isVisible && (
        <div className={`${styles.tooltipContent} ${positionClass}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;