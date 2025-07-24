// src/services/paypalService.js

import { supabase } from '../lib/supabaseClient'; // NEW: Import supabase client to get anon key

/**
 * Initiates a PayPal order for a given product.
 * @param {string} productId The ID of the product to purchase.
 * @returns {Promise<{orderId: string, approveUrl: string}>} The PayPal order ID and the URL to redirect the user for approval.
 * @throws {Error} If the order creation fails.
 */
export async function createPayPalOrder(productId) {
  try {
    const PAYPAL_CREATE_ORDER_FUNCTION_URL = 'https://iazskfvymgwkzauscvkn.supabase.co/functions/v1/paypal-create-order'; // Your actual URL

    // Get the anon key from the supabase client
    const anonKey = supabase.supabaseKey; // This should be your project's anon key

    const response = await fetch(PAYPAL_CREATE_ORDER_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // NEW: Add the Authorization header with the anon key
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from PayPal create order function:', errorText);
      let errorMessage = `Failed to initiate PayPal order. Status: ${response.status}`;
      try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
      } catch (e) {
          errorMessage = `Failed to initiate PayPal order: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error in paypalService.createPayPalOrder:', error);
    throw error;
  }
}