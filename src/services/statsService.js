// src/services/statsService.js

import { supabase } from '../lib/supabaseClient';

export const getStats = async () => {
  try {
    // Get total unique customers (buyers)
    const { count: customerCount, error: customerError } = await supabase
      .from('purchases')
      .select('buyer_user_id', { count: 'exact', head: true });

    if (customerError) throw customerError;

    // Get active supporter count
    const { count: supporterCount, error: supporterError } = await supabase
      .from('supporters')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (supporterError) throw supporterError;
    
    // Get total article views using the RPC
    const { data: totalViews, error: viewsError } = await supabase
      .rpc('total_article_views');

    if (viewsError) throw viewsError;

    return {
      customers: customerCount || 0,
      supporters: supporterCount || 0,
      readers: totalViews || 0, // Changed from articles to readers
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return a default object matching the new structure
    return {
      customers: 0,
      supporters: 0,
      readers: 0,
    };
  }
};