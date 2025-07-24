import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SectionHeader.module.css';
import Button from '../Button/Button';
import { ChevronRightIcon } from '../../../assets/icons';

// MODIFIED: Added a 'variant' prop
const SectionHeader = ({ title, buttonText, buttonLink, variant }) => {
  const headerClass = `${styles.header} ${variant ? styles[variant] : ''}`;
  const titleClass = `${styles.title} ${variant ? styles[`${variant}Title`] : ''}`; // Apply variant to title too

  return (
    <div className={headerClass}>
      <h2 className={titleClass}>{title}</h2>
      {buttonText && buttonLink && (
        <Button as={Link} to={buttonLink} variant="ghost" rightIcon={<ChevronRightIcon />}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;