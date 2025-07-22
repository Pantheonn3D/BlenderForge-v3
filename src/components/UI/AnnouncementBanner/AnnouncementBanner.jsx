import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AnnouncementBanner.module.css'; // We will use our CSS module

const AnnouncementBanner = () => {
  // We've removed all the state and effect logic to make it non-dismissable.
  // The component now renders the banner every time.
  return (
    // The class names are now linked to our 'styles' object
    <div className={styles.wrapper}>
      <Link to="/support" className={styles.banner} aria-label="Learn more about supporting BlenderForge">
        <div className={styles.content}>
          <p className={styles.text}>
            <span className={styles.textNormal}>
              BlenderForge is a community-driven platform.
            </span>
            <span className={styles.textLink}>
              Become a Forge Supporter to help us grow!
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
};

export default AnnouncementBanner;