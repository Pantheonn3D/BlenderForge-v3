// src/pages/PurchaseSuccessPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';
import { supabase } from '../lib/supabaseClient'; // Ensure supabase client is available
import { useAuth } from '../context/AuthContext'; // To get the current user's ID

import styles from './PurchaseSuccessPage.module.css'; // You'll create this CSS module

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [productName, setProductName] = useState(null);

  const orderId = searchParams.get('order_id');
  const productId = searchParams.get('product_id'); // Passed from your return_url

  const handleSuccessfulPurchase = useCallback(async () => {
    if (!orderId || !productId || !authUser?.id) {
      setError('Missing payment information or user not logged in. Please contact support.');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Verify the transaction status (Optional but good for robustness)
      // For 'CAPTURE' intent, the webhook should be the ultimate source of truth.
      // However, you might want to fetch transaction details from your 'transactions' table
      // to confirm it's marked as 'completed' or to wait for the webhook to update it.
      // For this example, we'll assume the webhook will handle the database update.

      // Step 2: Ensure user_downloads entry exists for this product and user
      // This is where you grant access to the download.
      // The `paypal-webhook-listener` should ideally create this entry.
      // For now, we'll try to insert/update it here as a fallback or immediate grant.

      // IMPORTANT: In a production app, this step of granting download access
      // should ideally be triggered by the PayPal webhook ('CHECKOUT.ORDER.COMPLETED'),
      // not directly by the frontend return page, to prevent users from getting
      // downloads if they bypass the payment confirmation.
      // This is a simplified example.

      const { data: existingDownload, error: fetchDownloadError } = await supabase
        .from('user_downloads')
        .select('product_id, download_count')
        .eq('user_id', authUser.id)
        .eq('product_id', productId)
        .single();

      if (fetchDownloadError && fetchDownloadError.code !== 'PGRST204') {
        throw new Error(`Error checking existing download: ${fetchDownloadError.message}`);
      }

      let downloadRecord;
      if (existingDownload) {
        // If already exists, maybe increment download count or just use existing.
        // For simplicity, we just confirm its existence.
        downloadRecord = existingDownload;
      } else {
        // Create a new entry in user_downloads if it doesn't exist
        // Note: transaction_id should link to the actual transaction from webhook
        // For now, we'll leave it null or try to link to a transaction based on orderId
        const { data, error: insertError } = await supabase
          .from('user_downloads')
          .insert({
            user_id: authUser.id,
            product_id: productId,
            // You might need to fetch the transaction_id here if it's already created by webhook
            // For now, we'll proceed assuming the core link is user_id + product_id
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Error recording download access: ${insertError.message}`);
        }
        downloadRecord = data;
      }

      // Step 3: Fetch product details to get download_url and name
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('name, download_url')
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        throw new Error(`Product not found: ${productError?.message}`);
      }

      setProductName(productData.name);
      setDownloadLink(productData.download_url);

    } catch (err) {
      console.error('Purchase success processing error:', err);
      setError(err.message || 'An error occurred while confirming your purchase and preparing your download.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, productId, authUser]);

  useEffect(() => {
    handleSuccessfulPurchase();
  }, [handleSuccessfulPurchase]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner size={48} />
        <p>Confirming your purchase and preparing your download...</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Purchase Failed or Error"
        message={error}
        button={<Link to="/marketplace"><Button>Back to Marketplace</Button></Link>}
      />
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Purchase Successful!</h1>
      <p className={styles.message}>Thank you for your purchase of **{productName}**!</p>
      {downloadLink ? (
        <a href={downloadLink} download className={styles.downloadButton}>
          <Button variant="primary" size="lg">Download Your Product Now</Button>
        </a>
      ) : (
        <p className={styles.info}>Your download link should appear shortly. If not, please refresh or contact support.</p>
      )}
      <p className={styles.note}>
        You can always access your purchased items from your <Link to="/profile">profile page</Link>.
      </p>
      <Link to="/marketplace" className={styles.backLink}>← Explore More Products</Link>
    </div>
  );
};

export default PurchaseSuccessPage;