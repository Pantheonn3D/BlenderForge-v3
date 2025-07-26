// src/components/StatsSection/StatsSection.jsx

import React from 'react';
import { useStats } from '../../hooks/useStats';
import { UserIcon, AcademicCapIcon, EyeIcon } from '../../assets/icons';
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
      // Don't animate if loading or if the target value is 0.
      if (isLoading || value === 0) {
        setDisplayValue(value || 0); // Ensure it's not NaN if value is null/undefined
        return;
      }

      let start = 0;
      const end = value;
      const duration = 1500; // Animation duration in ms
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Ease-out function for a smoother stop
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const currentValue = Math.floor(easedProgress * (end - start) + start);
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end); // Ensure it ends exactly on the target value
        }
      };

      const animationFrameId = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrameId);
    }, [value, isLoading]); // Rerun only when value or isLoading changes

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
                <EyeIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  <AnimatedNumber value={stats.readers} isLoading={isLoading} />
                </div>
                <div className={styles.statLabel}>Total Readers</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <UserIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  <AnimatedNumber value={stats.customers} isLoading={isLoading} />
                </div>
                {/* --- FIX IS HERE --- */}
                <div className={styles.statLabel}>
                  {stats.customers > 0 ? 'Happy Customers' : 'Customers'}
                </div>
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