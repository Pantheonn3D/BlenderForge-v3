// src/services/statsService.js

import { supabase } from '../lib/supabaseClient';

export const getStats = async () => {
  try {
    // MODIFIED: This block is changed. Instead of calling an RPC for unique customers,
    // we now fetch all products and sum their download counts on the client side.
    const { data: productsData, error: customerError } = await supabase
      .from('products')
      .select('download_count');
    
    const totalDownloads = productsData.reduce((sum, product) => sum + (product.download_count || 0), 0);
    // END OF MODIFICATION

    const [
      // We no longer need the customerData RPC call here.
      { count: supporterCount, error: supporterError },
      { data: readerData, error: readerError }
    ] = await Promise.all([
      supabase.from('supporters').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.rpc('total_article_views')
    ]);

    if (customerError) throw customerError;
    if (supporterError) throw supporterError;
    if (readerError) throw readerError;

    return {
      customers: totalDownloads || 0, // MODIFIED: The 'customers' key now holds the total download count.
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