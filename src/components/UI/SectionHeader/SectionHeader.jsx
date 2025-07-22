import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SectionHeader.module.css';
import Button from '../Button/Button';
import { ChevronRightIcon } from '../../../assets/icons'; // We'll need to create this icon

const SectionHeader = ({ title, buttonText, buttonLink }) => {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {buttonText && buttonLink && (
        <Button as={Link} to={buttonLink} variant="ghost" rightIcon={<ChevronRightIcon />}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;