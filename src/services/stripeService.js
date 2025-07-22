// src/services/stripeService.js (Complete file with all exports)

import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabaseClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => stripePromise;

export const createCheckoutSession = async (priceData, userId, isRecurring = false) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to make a donation');
    }

    // Get the current base URL dynamically
    const baseUrl = window.location.origin; // This will be http://localhost:5173 in development

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
        // Use dynamic base URL
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