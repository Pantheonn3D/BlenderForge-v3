// src/components/DonationTiers/DonationTiers.jsx

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
  isAlreadySupporter = false
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
              // --- FIX IS HERE: Pass only tier.id ---
                onClick={() => onDonate(tier.id)}
              isLoading={isLoading}
              disabled={isRecurring && isAlreadySupporter}
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