// src/components/UI/DropdownMenu/DropdownMenu.jsx

import React, { useRef, useEffect } from 'react';
import styles from './DropdownMenu.module.css'; // Will create this next

const DropdownMenu = ({ children, isOpen, onClose, position = 'bottom-right' }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef} 
      className={`${styles.dropdownMenu} ${styles[position]}`}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
};

export default DropdownMenu;