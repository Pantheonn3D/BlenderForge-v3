// src/services/stripeService.js

import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabaseClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => stripePromise;

// --- MODIFIED FUNCTION FOR DEBUGGING ---
export const createProductCheckoutSession = async (args) => {
  // 1. Log the entire arguments object as soon as the function is called.
  console.log('Arguments received by createProductCheckoutSession:', args);

  const { product, sellerStripeConnectId } = args;

  // 2. Log the product object after destructuring.
  console.log('Destructured product object:', product);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('You must be logged in to purchase a product.');

    const baseUrl = window.location.origin;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        purchaseType: 'product',
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productThumbnailUrl: product.thumbnail_url,
        sellerStripeConnectId,
        successUrl: `${baseUrl}/product/${product.slug}?purchase=success`,
        cancelUrl: `${baseUrl}/product/${product.slug}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session.');
    }

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) throw new Error(error.message);

  } catch (error) {
    console.error('Error creating product checkout session:', error);
    throw error;
  }
};


// --- The original donation function (can be left as is) ---
export const createCheckoutSession = async (priceData, userId, isRecurring = false) => {
  // ... this function is not used in the marketplace flow and remains unchanged.
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to make a donation');
    }

    const baseUrl = window.location.origin;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        priceData: {
          name: priceData.name,
          description: priceData.description,
          amount: priceData.amount,
          tierType: priceData.tierType,
        },
        userId,
        isRecurring,
        successUrl: `${baseUrl}/supporters?success=true`,
        cancelUrl: `${baseUrl}/support?canceled=true`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Network response was not ok');
    }

    const { sessionId } = await response.json();
    
    const stripe = await getStripe();
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};