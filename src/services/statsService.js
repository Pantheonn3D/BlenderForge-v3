// src/services/statsService.js

import { supabase } from '../lib/supabaseClient';

export const getStats = async () => {
  try {
    // We will call all our stats functions in parallel for speed
    const [
      { data: customerData, error: customerError },
      // --- FIX IS HERE: Correctly destructure the 'count' property ---
      { count: supporterCount, error: supporterError },
      { data: readerData, error: readerError }
    ] = await Promise.all([
      supabase.rpc('total_unique_customers'),
      supabase.from('supporters').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.rpc('total_article_views')
    ]);

    if (customerError) throw customerError;
    if (supporterError) throw supporterError;
    if (readerError) throw readerError;

    return {
      customers: customerData || 0,
      // --- FIX IS HERE: Use the correctly destructured variable ---
      supporters: supporterCount || 0,
      readers: readerData || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      customers: 0,
      supporters: 0,
      readers: 0,
    };
  }
};