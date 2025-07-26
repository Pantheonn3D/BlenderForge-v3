// src/services/stripeService.js

import { supabase } from '../lib/supabaseClient';

export async function getStripeConnectOAuthUrl() {
  const { data, error } = await supabase.functions.invoke('stripe-connect-oauth');

  if (error) {
    console.error('Error invoking stripe-connect-oauth function:', error);
    throw new Error(error.message || 'Could not get Stripe connection URL.');
  }

  if (!data || !data.url) {
    throw new Error('No URL returned from Stripe connect function.');
  }

  return data.url;
}

export async function createStripeCheckoutSession(productId) {
  const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
    body: { productId },
  });

  if (error) {
    console.error('Error invoking create-stripe-checkout function:', error);
    // This check is more robust and avoids the ReferenceError in production builds.
    if (error.context && typeof error.context.json === 'function') {
      const errorMessage = await error.context.json();
      console.error('Function returned an error:', errorMessage);
      throw new Error(errorMessage.error || 'Could not create Stripe checkout session.');
    }
    throw new Error(error.message || 'Could not create Stripe checkout session.');
  }

  if (!data || !data.url) {
    throw new Error('No checkout URL returned from function.');
  }

  return data;
}