// src/components/SellOnBlenderForgeBanner/SellOnBlenderForgeBanner.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SellOnBlenderForgeBanner.module.css';

import Button from '../UI/Button/Button';
import { ChevronRightIcon } from '../../assets/icons';

const SellOnBlenderForgeBanner = () => {
  return (
    <section className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.poweredBy}>
            <span>Payments secured by</span>
            <img 
              src="/stripe-wordmark-large.png" 
              alt="Stripe" 
              className={styles.stripeLogo}
            />
          </div>
        </div>
        
        <h2 className={styles.title}>Start selling your creations on BlenderForge</h2>
        <p className={styles.description}>
          Join our secure marketplace with industry-standard payment processing. 
          Your transactions are protected and payouts are reliable.
        </p>
        
        <div className={styles.actions}>
          <Button as={Link} to="/profile/edit" variant="stripe" size="lg" rightIcon={<ChevronRightIcon />}>
            Connect with Stripe
          </Button>
        </div>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <span>Bank-level security</span>
          </div>
          <div className={styles.feature}>
            <span>Fast payouts</span>
          </div>
          <div className={styles.feature}>
            <span>Transaction protection</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellOnBlenderForgeBanner;