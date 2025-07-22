// src/components/DonationTiers/DonationTiers.jsx (Updated)

import React from 'react';
import styles from './DonationTiers.module.css';
import Button from '../UI/Button/Button';

const DonationTiers = ({ 
  tiers, 
  selectedTier, 
  onTierSelect, 
  isRecurring, 
  onDonate, 
  isLoading,
  isAlreadySupporter = false // New prop
}) => {
  return (
    <div className={styles.tiersContainer}>
      {tiers.map((tier) => (
        <div 
          key={tier.id}
          className={`${styles.tierCard} ${tier.featured ? styles.featured : ''} ${isAlreadySupporter ? styles.dimmed : ''}`}
        >
          {tier.featured && !isAlreadySupporter && (
            <div className={styles.featuredBadge}>Most Popular</div>
          )}
          
          {isAlreadySupporter && (
            <div className={styles.alreadySupporterBadge}>Already Supporting</div>
          )}
          
          <div className={styles.tierHeader}>
            <h3 className={styles.tierName}>{tier.name}</h3>
            <div className={styles.tierPrice}>
              <span className={styles.currency}>$</span>
              <span className={styles.amount}>{tier.price}</span>
              {isRecurring && <span className={styles.period}>/month</span>}
            </div>
            <p className={styles.tierDescription}>{tier.description}</p>
          </div>

          <div className={styles.tierPerks}>
            <ul>
              {tier.perks.map((perk, index) => (
                <li key={index} className={styles.perk}>
                  <span className={styles.checkmark}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.tierAction}>
            <Button
              variant={isAlreadySupporter ? "secondary" : (tier.featured ? 'primary' : 'secondary')}
              size="lg"
              fullWidth
              onClick={() => onDonate(tier.price, tier.id)}
              isLoading={isLoading}
              disabled={isRecurring && isAlreadySupporter} // Disable recurring for existing supporters
            >
              {isRecurring && isAlreadySupporter 
                ? 'Already Supporting' 
                : isRecurring 
                  ? `Subscribe $${tier.price}/mo` 
                  : `${isAlreadySupporter ? 'Donate Extra' : 'Donate'} $${tier.price}`
              }
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonationTiers;