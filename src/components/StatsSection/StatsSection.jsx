// src/components/StatsSection/StatsSection.jsx

import React from 'react';
import { useStats } from '../../hooks/useStats';
import { UserIcon, AcademicCapIcon, BookOpenIcon } from '../../assets/icons';
import styles from './StatsSection.module.css';

const StatsSection = () => {
  const { stats, isLoading } = useStats();

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Animation counter effect
  const AnimatedNumber = ({ value, isLoading }) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
      if (isLoading || value === 0) return;

      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          current = value;
          clearInterval(timer);
        }
        setDisplayValue(Math.floor(current));
      }, duration / steps);

      return () => clearInterval(timer);
    }, [value, isLoading]);

    if (isLoading) {
      return <span className={styles.loadingNumber}>---</span>;
    }

    return <span>{formatNumber(displayValue)}</span>;
  };

  return (
    <section className={styles.statsSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Join Our Growing Community</h2>
          <p className={styles.subtitle}>
            Blender enthusiasts from around the world sharing knowledge and creativity
          </p>
          
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <UserIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  <AnimatedNumber value={stats.users} isLoading={isLoading} />
                </div>
                <div className={styles.statLabel}>Community Members</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <BookOpenIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  <AnimatedNumber value={stats.articles} isLoading={isLoading} />
                </div>
                <div className={styles.statLabel}>Knowledge Articles</div>
              </div>
            </div>

            <div className={`${styles.statItem} ${styles.supporterStat}`}>
              <div className={styles.statIcon}>
                <AcademicCapIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  <AnimatedNumber value={stats.supporters} isLoading={isLoading} />
                </div>
                <div className={styles.statLabel}>Forge Supporters</div>
                <div className={styles.supporterNote}>Keeping BlenderForge free</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;