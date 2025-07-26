// src/services/purchaseService.js

import { supabase } from '../lib/supabaseClient';
// We no longer need the specific import of FunctionsHttpError

export async function verifyStripePurchase(sessionId) {
  if (!sessionId) {
    throw new Error('Stripe session ID is required for verification.');
  }

  const { data, error } = await supabase.functions.invoke('verify-stripe-session', {
    body: { sessionId },
  });

  if (error) {
    console.error('Error invoking verify-stripe-session function:', error);
    // This check is more robust and avoids the ReferenceError in production builds.
    if (error.context && typeof error.context.json === 'function') {
      const errorMessage = await error.context.json();
      console.error('Function returned an error:', errorMessage);
      throw new Error(errorMessage.error || 'Could not verify Stripe purchase.');
    }
    throw new Error(error.message || 'Could not verify Stripe purchase.');
  }

  return data;
}

export async function getPurchaseDetailsBySessionId(sessionId) {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      product_id,
      products (
        name,
        download_url,
        slug
      )
    `)
    .eq('stripe_session_id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching purchase details by session ID:', error);
    throw new Error('Could not load purchase details.');
  }
  return data;
}