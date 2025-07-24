import { supabase } from '../lib/supabaseClient';

// Get purchases for the current user (as buyer)
export async function getUserPurchases() {
  const { data, error } = await supabase
    .from('purchases_with_details')
    .select('*')
    .eq('buyer_user_id', (await supabase.auth.getUser()).data.user?.id)
    .order('purchased_at', { ascending: false });

  if (error) {
    console.error('Error fetching user purchases:', error);
    throw new Error('Could not load purchase history.');
  }
  return data;
}

// Get sales for the current user (as seller)
export async function getUserSales() {
  const { data, error } = await supabase
    .from('purchases_with_details')
    .select('*')
    .eq('seller_user_id', (await supabase.auth.getUser()).data.user?.id)
    .order('purchased_at', { ascending: false });

  if (error) {
    console.error('Error fetching user sales:', error);
    throw new Error('Could not load sales history.');
  }
  return data;
}

// Check if user has purchased a specific product
export async function hasUserPurchasedProduct(productId) {
  const { data, error } = await supabase
    .rpc('user_has_purchased_product', {
      user_id: (await supabase.auth.getUser()).data.user?.id,
      product_id: productId
    });

  if (error) {
    console.error('Error checking purchase status:', error);
    return false;
  }
  return data || false;
}

// Removed: getPurchaseBySessionId function
/*
export async function getPurchaseBySessionId(sessionId) {
  const { data, error } = await supabase
    .from('purchases_with_details')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching purchase by session ID:', error);
    throw new Error('Could not load purchase details.');
  }
  return data;
}
*/