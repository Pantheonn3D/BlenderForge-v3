// src/services/supportersService.js

import { supabase } from '../lib/supabaseClient';
import { FunctionsHttpError } from '@supabase/supabase-js';

export async function checkUserSupporterStatus(userId) {
  const { data, error } = await supabase
    .from('supporters')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error("Error checking supporter status", error);
    return { isSupporter: false, supporterData: null };
  }
  return { isSupporter: !!data, supporterData: data };
}

export async function createSupportSession(priceId, isRecurring) {
  const { data, error } = await supabase.functions.invoke('create-stripe-support-session', {
    body: { priceId, isRecurring },
  });

  if (error) {
    console.error('Error invoking create-stripe-support-session function:', error);
    if (error instanceof FunctionsHttpError) {
      const errorMessage = await error.context.json();
      throw new Error(errorMessage.error || 'Could not create Stripe session.');
    }
    throw new Error(error.message || 'Could not create Stripe session.');
  }
  return data;
}

// --- Corrected: Restored profiles join for username and avatar ---
export async function getSupporters() {
  const { data, error } = await supabase
    .from('supporters')
    .select(`
      id,
      created_at,
      social_media_link,
      tier,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching supporters:', error);
    throw new Error('Could not load supporters.');
  }
  return data;
}