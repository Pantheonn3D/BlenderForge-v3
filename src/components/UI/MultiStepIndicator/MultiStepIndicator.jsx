// src/components/UI/MultiStepIndicator/MultiStepIndicator.jsx

import React from 'react';
import styles from './MultiStepIndicator.module.css';
import { CheckmarkIcon } from '../../../assets/icons';

/**
 * Renders a multi-step progress indicator.
 * @param {object} props
 * @param {string[]} props.steps - An array of step labels.
 * @param {number} props.currentStep - The index of the currently active step.
 * @param {function(number): void} props.onStepClick - Callback for when a completed step is clicked.
 */
const MultiStepIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <nav aria-label="Form progress" className={styles.indicatorContainer}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        let statusClass = '';
        if (isActive) statusClass = styles.active;
        if (isCompleted) statusClass = styles.completed;

        // Completed steps are buttons to allow navigation, others are divs.
        const StepWrapper = isCompleted ? 'button' : 'div';
        
        return (
          <React.Fragment key={step}>
            <StepWrapper
              className={`${styles.stepItem} ${statusClass}`}
              onClick={isCompleted ? () => onStepClick(index) : undefined}
              disabled={!isCompleted}
              aria-current={isActive ? 'step' : 'false'}
            >
              <div className={styles.dot}>
                {isCompleted ? <CheckmarkIcon /> : <span>{index + 1}</span>}
              </div>
              <span className={styles.label}>{step}</span>
            </StepWrapper>
            {index < steps.length - 1 && <div className={styles.line} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default MultiStepIndicator;