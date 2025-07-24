// supabase/functions/paypal-create-order/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// This function creates a PayPal order with a platform fee and seller payout.
// It assumes the seller has already onboarded and their PayPal Merchant ID is stored in the 'profiles' table.

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('--- PayPal Create Order Function Called ---');

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  let productId;
  try {
    const body = await req.json();
    productId = body.productId;
  } catch (parseError) {
    console.error('Failed to parse request body:', parseError);
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!productId) {
    return new Response(JSON.stringify({ error: 'Product ID is required.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    // Fetch product details including seller's user_id and price
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, user_id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('Error fetching product:', productError?.message || 'Product not found');
      return new Response(JSON.stringify({ error: 'Product not found or database error.' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // If product is free, just return a success message for a "free download" flow
    if (product.price === 0) {
      return new Response(JSON.stringify({ message: 'Free product, no payment needed.' }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Fetch seller's PayPal Merchant ID from the profiles table
    const { data: sellerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('paypal_merchant_id')
      .eq('id', product.user_id)
      .single();

    if (profileError || !sellerProfile?.paypal_merchant_id) {
      console.error('Error fetching seller profile or PayPal Merchant ID:', profileError?.message || 'Seller PayPal Merchant ID not found');
      return new Response(JSON.stringify({ error: 'Seller PayPal account not linked. Cannot process payment.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalPartnerId = Deno.env.get('PAYPAL_PARTNER_ID');

    // This console.error and return matches your previous error output.
    if (!paypalClientId || !paypalClientSecret || !paypalPartnerId) {
      console.error('Missing PayPal API credentials. PAYPAL_CLIENT_ID:', !!paypalClientId, 'PAYPAL_CLIENT_SECRET:', !!paypalClientSecret, 'PAYPAL_PARTNER_ID:', !!paypalPartnerId);
      return new Response(JSON.stringify({ error: 'Server is not configured for PayPal payments.' }), {
        status: 500,
        headers: corsHeaders,
      });
    }
    console.log('PayPal Client ID presence:', !!paypalClientId);
    console.log('PayPal Client Secret presence:', !!paypalClientSecret);
    console.log('PayPal Partner ID:', paypalPartnerId);


    // 1. Get PayPal Access Token
    const authString = btoa(`${paypalClientId}:${paypalClientSecret}`);
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', { // CORRECTED Sandbox URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Failed to get PayPal access token:', errorData);
      throw new Error(`PayPal token error: ${errorData.error_description || tokenResponse.statusText}`);
    }
    const { access_token } = await tokenResponse.json();
    console.log('PayPal Access Token Obtained.');


    // Calculate split amounts
    const productPrice = parseFloat(product.price);
    const platformFee = productPrice * 0.10; // 10% platform fee
    // const sellerPayout = productPrice * 0.90; // Not directly used in the payload, but useful for understanding

    // Construct the order payload
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `product_${product.id}_${Date.now()}`, // Unique ID for this purchase unit
          amount: {
            currency_code: 'USD',
            value: productPrice.toFixed(2), // Total amount for the product
          },
          payee: {
            merchant_id: sellerProfile.paypal_merchant_id, // Seller's PayPal Merchant ID
          },
          // payment_instruction is for platform fees on behalf of payee
          payment_instruction: {
            platform_fees: [
              {
                amount: {
                  currency_code: 'USD',
                  value: platformFee.toFixed(2), // Your platform's fee
                },
                payee: {
                  merchant_id: paypalPartnerId, // Your platform's PayPal Merchant ID
                },
              },
            ],
            // This is optional, but often useful for specific use cases
            // disburse_funds_to: 'IMMEDIATE_PAYEE', // or 'PRIMARY_PARTNER'
          },
        },
      ],
      application_context: {
          // CORRECTED: Remove {CHECKOUT_ORDER_ID} placeholder
          return_url: `${Deno.env.get('FRONTEND_URL')}/purchase-success?product_id=${product.id}`,
          cancel_url: `${Deno.env.get('FRONTEND_URL')}/purchase-cancel?product_id=${product.id}`,
          brand_name: 'BlenderForge',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING', // Digital product
          user_action: 'PAY_NOW',
      }
    };

    // LOGGING THE PAYLOAD BEFORE SENDING
    console.log('PayPal Order Payload to be sent:', JSON.stringify(orderPayload, null, 2));
    console.log('Seller PayPal Merchant ID (from DB):', sellerProfile.paypal_merchant_id);
    console.log('Platform PayPal Partner ID (from ENV):', paypalPartnerId);


    // 2. Create PayPal Order with Multi-seller Payments and Platform Fees
    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', { // CORRECTED Sandbox URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Partner-Attribution-Id': 'YOUR_PARTNER_ATTRIBUTION_ID', // Replace with your actual BN code if available
      },
      body: JSON.stringify(orderPayload), // Use the structured payload
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Failed to create PayPal order:', errorData);
      throw new Error(`PayPal order creation error: ${errorData.debug_id || JSON.stringify(errorData)}`); // Include full errorData for more context
    }

    const orderData = await orderResponse.json();
    const approveLink = orderData.links.find((link: any) => link.rel === 'approve');

    if (!approveLink) {
      throw new Error('No approval link found in PayPal order response.');
    }

    console.log('PayPal Order created successfully. Order ID:', orderData.id);

    return new Response(JSON.stringify({ orderId: orderData.id, approveUrl: approveLink.href }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error: any) {
    console.error('PayPal create order function error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});