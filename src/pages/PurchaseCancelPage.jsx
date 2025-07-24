// src/pages/PurchaseCancelPage.jsx

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';

import styles from './PurchaseCancelPage.module.css'; // You'll create this CSS module

const PurchaseCancelPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product_id'); // If you want to log/display which product was cancelled

  return (
    <EmptyState
      title="Payment Cancelled"
      message="It looks like your PayPal payment was cancelled or not completed. No charges have been made."
      button={
        <Link to={productId ? `/marketplace/${productId}` : "/marketplace"}>
          <Button>Return to Product Page</Button>
        </Link>
      }
    >
      <p className={styles.info}>If you encountered an issue, please try again or contact support.</p>
    </EmptyState>
  );
};

export default PurchaseCancelPage;