// src/services/statsService.js

import { supabase } from '../lib/supabaseClient';

export const getStats = async () => {
  try {
    // Get total user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // Get active supporter count
    const { count: supporterCount, error: supporterError } = await supabase
      .from('supporters')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'); // Assuming active supporters

    if (supporterError) throw supporterError;

    // Get total article count
    const { count: articleCount, error: articleError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (articleError) throw articleError;

    return {
      users: userCount || 0,
      supporters: supporterCount || 0,
      articles: articleCount || 0
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      users: 0,
      supporters: 0,
      articles: 0
    };
  }
};