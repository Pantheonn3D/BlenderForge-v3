// supabase/functions/paypal-webhook-listener/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Helper function to verify PayPal webhook signature
// This is a simplified version; production-grade verification should use a robust library
// or PayPal's official SDKs if available for Deno.
// For now, we'll implement a basic check for demonstration.
// **WARNING**: This simple verification is NOT sufficient for production.
// You MUST implement a full webhook signature verification.
// Refer to PayPal's documentation: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
async function verifyPaypalWebhook(
  headers: Headers,
  rawBody: string,
  webhookId: string // You will get this from your PayPal Developer Dashboard
): Promise<boolean> {
  // In a real scenario, you'd fetch the webhook ID from Supabase secrets
  // or a configuration table and use it here.
  // For now, let's use a placeholder.
  const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID'); // NEW ENV VAR NEEDED!

  if (!PAYPAL_WEBHOOK_ID || PAYPAL_WEBHOOK_ID !== webhookId) {
      console.error('Webhook ID mismatch or not configured.');
      return false;
  }

  // **CRITICAL PRODUCTION STEP**: Implement full signature verification here.
  // This typically involves:
  // 1. Fetching the signing certificate from headers.get('paypal-cert-url')
  // 2. Reconstructing the signed message (transmission ID + timestamp + webhook ID + event_body)
  // 3. Verifying the signature using the certificate and PayPal's provided algorithm.
  // This requires a cryptographic library, which can be complex in Deno Edge Functions.

  // For this example, we're returning true for now, but this is a HUGE security hole
  // for a production application.
  console.warn('⚠️ Webhook signature verification is bypassed for demonstration. Implement fully for production!');
  return true; // DANGER: Replace with actual verification
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('--- PayPal Webhook Listener Called ---');

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

  let rawBody;
  let event;
  try {
    rawBody = await req.text();
    event = JSON.parse(rawBody);
  } catch (parseError) {
    console.error('Failed to parse webhook body:', parseError);
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const webhookId = event.resource?.webhook_id || 'N/A'; // PayPal webhook ID sent in the payload, or N/A
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const transmissionTime = req.headers.get('paypal-transmission-time');
  const authAlgo = req.headers.get('paypal-auth-algo');
  const certUrl = req.headers.get('paypal-cert-url');

  console.log('Webhook Headers:', {
    transmissionId,
    transmissionSig,
    transmissionTime,
    authAlgo,
    certUrl,
    webhookIdFromPayload: webhookId,
    eventType: event.event_type,
    resourceId: event.resource?.id,
  });

  // // IMPORTANT: Implement robust webhook verification for production!
  // const isVerified = await verifyPaypalWebhook(req.headers, rawBody, PAYPAL_WEBHOOK_ID);
  // if (!isVerified) {
  //   console.error('Webhook verification failed!');
  //   return new Response(JSON.stringify({ error: 'Webhook verification failed.' }), {
  //     status: 403, // Forbidden
  //     headers: corsHeaders,
  //   });
  // }

  try {
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.COMPLETED':
        console.log('Processing CHECKOUT.ORDER.COMPLETED event...');
        const order = event.resource;
        const paypalOrderId = order.id;
        const purchaseUnit = order.purchase_units[0];
        const grossAmount = parseFloat(purchaseUnit.amount.value);
        const paypalCaptureId = purchaseUnit.payments.captures[0]?.id; // Get the capture ID

        const sellerIdInPayPal = purchaseUnit.payee.merchant_id;
        const platformFeeDetail = purchaseUnit.payments.captures[0]?.seller_receivable_breakdown?.platform_fees?.[0];

        // Ensure we retrieve the product_id from the reference_id generated during order creation
        // The reference_id was set as `product_${product.id}_${Date.now()}`
        const referenceIdParts = purchaseUnit.reference_id.split('_');
        const productId = referenceIdParts[1];

        if (!productId) {
          console.error(`Missing productId in reference_id for order ${paypalOrderId}`);
          throw new Error('Could not identify product from PayPal order.');
        }

        // Fetch product and buyer details
        const { data: product, error: productFetchError } = await supabaseAdmin
          .from('products')
          .select('id, user_id, name, price, download_url')
          .eq('id', productId)
          .single();

        if (productFetchError || !product) {
          console.error(`Product not found for ID: ${productId}, Error: ${productFetchError?.message}`);
          throw new Error(`Product not found for ID: ${productId}`);
        }

        const { data: buyerUser, error: buyerUserError } = await supabaseAdmin
          .from('profiles')
          .select('id') // We need the auth.users ID for the buyer
          .eq('email', order.payer.email_address) // Assuming email is unique for profiles/users
          .single();

        if (buyerUserError || !buyerUser) {
          console.error(`Buyer user not found for email: ${order.payer.email_address}, Error: ${buyerUserError?.message}`);
          throw new Error(`Buyer not found for email: ${order.payer.email_address}`);
        }

        const buyerId = buyerUser.id;
        const sellerId = product.user_id; // Product uploader's user_id

        const platformFee = platformFeeDetail ? parseFloat(platformFeeDetail.amount.value) : 0;
        const sellerRevenue = grossAmount - platformFee;

        // 1. Insert/Update into 'transactions' table
        const { data: transaction, error: transactionError } = await supabaseAdmin
          .from('transactions')
          .upsert({
            paypal_order_id: paypalOrderId, // Use order ID as unique key for upsert
            product_id: productId,
            buyer_id: buyerId,
            seller_id: sellerId,
            amount_total: grossAmount,
            platform_fee: platformFee,
            seller_revenue: sellerRevenue,
            paypal_capture_id: paypalCaptureId,
            status: 'completed',
          }, { onConflict: 'paypal_order_id' }) // Upsert based on paypal_order_id
          .select()
          .single();

        if (transactionError) {
          console.error('Error upserting transaction:', transactionError);
          throw new Error(`Failed to record transaction: ${transactionError.message}`);
        }
        console.log('Transaction recorded:', transaction);

        // 2. Insert/Update into 'user_downloads' table
        const { error: downloadError } = await supabaseAdmin
          .from('user_downloads')
          .upsert({
            user_id: buyerId,
            product_id: productId,
            transaction_id: transaction.id, // Link to the transaction
            download_count: 0, // Reset or initialize
            acquired_at: new Date().toISOString(),
          }, { onConflict: 'user_id,product_id' }); // Conflict if user already 'owns' this product

        if (downloadError) {
          console.error('Error upserting user download:', downloadError);
          throw new Error(`Failed to grant download access: ${downloadError.message}`);
        }
        console.log(`Download access granted for user ${buyerId} to product ${productId}.`);

        // (Optional) Here you might trigger an email to the buyer with download link,
        // or other post-purchase actions.

        break;
      // Add cases for other event types as needed, e.g.:
      // case 'REFUND.CREATED':
      //   // Handle refund
      //   break;
      // case 'MERCHANT.ONBOARDING.COMPLETED':
      //   // Handle seller onboarding completion
      //   break;
      default:
        console.log(`Unhandled event type: ${event.event_type}`);
        // For unhandled events, still return 200 OK so PayPal doesn't retry
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error processing webhook event:', error.message);
    // Return 500 so PayPal can retry the webhook if there was a temporary error on our side
    return new Response(JSON.stringify({ error: error.message || 'Failed to process event.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});