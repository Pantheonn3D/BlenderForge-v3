// src/pages/ContactPage.jsx

import React from 'react';
import styles from './ContactPage.module.css';
import { UserIcon, EyeIcon, CogIcon } from '../assets/icons'; // Import CogIcon

const ContactPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Get in Touch</h1>
        <p className={styles.subtitle}>
          We're here to help. Whether you have a question, a suggestion, or a support request, here’s how to reach us.
        </p>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}><EyeIcon /></div>
          <h3>General & Account Support</h3>
          <p>
            For questions about the website, account issues, or other general inquiries, please email us directly. We aim to respond within 48 hours.
          </p>
          <a href="mailto:blenderforge.contact@gmail.com" className={styles.emailLink}>
            blenderforge.contact@gmail.com
          </a>
        </div>
        
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}><CogIcon /></div>
          <h3>Marketplace & Seller Support</h3>
          <p>
            If you have questions about a product, payments, or need help with your seller account and Stripe Connect, this is the best way to get in touch.
          </p>
          <a href="mailto:blenderforge.contact@gmail.com" className={styles.emailLink}>
            blenderforge.contact@gmail.com
          </a>
        </div>
        
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}><UserIcon /></div>
          <h3>Join the Community</h3>
          <p>
            For general discussion, sharing your work, or asking the community for help with Blender, our social channels are the place to be.
          </p>
          <div className={styles.socialLinks}>
            <a href="https://discord.gg/n22nvushxK" target="_blank" rel="noopener noreferrer">Discord</a>
            <a href="https://www.instagram.com/blenderforge.marketplace/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.reddit.com/user/BlenderForge/" target="_blank" rel="noopener noreferrer">Reddit</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;