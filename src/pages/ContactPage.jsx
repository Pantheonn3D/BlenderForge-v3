// src/pages/ContactPage.jsx (Updated)

import React from 'react';
import styles from './ContactPage.module.css';
import { UserIcon, EyeIcon } from '../assets/icons';

const ContactPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Get in Touch</h1>
        <p className={styles.subtitle}>
          We're here to help. Whether you have a question, a suggestion, or a support request, here’s how you can reach us.
        </p>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>
            <EyeIcon />
          </div>
          <h3>General & Support Inquiries</h3>
          <p>
            For questions about the website, account support, or other inquiries, please email us directly. We'll do our best to get back to you as soon as possible.
          </p>
          <a href="mailto:blenderforge.contact@gmail.com" className={styles.emailLink}>
            blenderforge.contact@gmail.com
          </a>
        </div>
        
        <div className={styles.contactCard}>
          <div className={styles.cardIcon}>
            <UserIcon />
          </div>
          <h3>Join the Community</h3>
          <p>
            For general discussion, to share your work, or to ask the community for help with Blender, we recommend joining our social channels.
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