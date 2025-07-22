import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({ icon, title, message, children }) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        {/* We now just render the icon directly. The CSS will handle the sizing. */}
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
};

export default EmptyState;