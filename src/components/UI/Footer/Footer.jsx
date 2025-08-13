// src/components/UI/Footer/Footer.jsx (Updated)

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const NAVIGATION_ITEMS = [
  { to: '/knowledge-base', label: 'Knowledge Base' },
  { to: '/marketplace', label: 'Marketplace' }
];

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.mainContent}>
        <div className={styles.column}>
          <Link to="/" className={styles.brand}>BlenderForge</Link>
          <p className={styles.tagline}>Your centralized hub for community-driven Blender assets, art, and tutorials.</p>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnHeader}>Navigate</h4>
          <ul className={styles.navList}>
            {NAVIGATION_ITEMS.map(item => (
              <li key={item.to}>
                <Link to={item.to} className={styles.navLink}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnHeader}>For Creators</h4>
          <ul className={styles.navList}>
            <li><Link to="/create" className={styles.navLink}>Create an Article</Link></li>
            <li><Link to="/marketplace/upload" className={styles.navLink}>Upload a Product</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnHeader}>Community</h4>
          <ul className={styles.navList}>
            <li><a href="https://discord.gg/n22nvushxK" className={styles.navLink} target="_blank" rel="noopener noreferrer">Discord</a></li>
            <li><a href="https://www.instagram.com/blenderforge.marketplace/" className={styles.navLink} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://www.reddit.com/user/BlenderForge/" className={styles.navLink} target="_blank" rel="noopener noreferrer">Reddit</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnHeader}>Legal & Info</h4>
          <ul className={styles.navList}>
            <li><Link to="/about" className={styles.navLink}>About Us</Link></li>
            <li><Link to="/contact" className={styles.navLink}>Contact Us</Link></li>
            <li><Link to="/terms-of-service" className={styles.navLink}>Terms of Service</Link></li>
            <li><Link to="/privacy-policy" className={styles.navLink}>Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.copyright}>© 2025 BlenderForge. All Rights Reserved.</p>
        <p className={styles.contact}>Contact: <a href="mailto:pantheon3d.contact@gmail.com">pantheon3d.contact@gmail.com</a></p>
      </div>
    </footer>
  );
};

export default Footer;