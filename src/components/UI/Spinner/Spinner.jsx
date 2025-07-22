import React from 'react';
import styles from './Spinner.module.css';

/**
 * A simple loading spinner component.
 * @param {object} props
 * @param {number} [props.size=20] - The width and height of the spinner in pixels.
 */
const Spinner = ({ size = 20 }) => (
  <div
    className={styles.spinner}
    style={{ width: size, height: size }}
    role="status"
    aria-live="polite"
  >
    <span className={styles.visuallyHidden}>Loading...</span>
  </div>
);

export default Spinner;