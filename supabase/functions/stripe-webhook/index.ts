// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// Initialize Stripe with API key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Define your support product IDs and their corresponding tiers
// These IDs must match the 'id' column in your 'products' table for the support tiers.
const SUPPORT_PRODUCT_TIERS = {
  '16': 'supporter', // ID for 'Forge Supporter' product
  '17': 'advocate',  // ID for 'Forge Advocate' product
};

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  
  const body = await req.arrayBuffer();

  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(err.message, { status: 400 })
  }

  console.log(`🔔 Received Stripe event: ${receivedEvent.type}`);
  
  // Note: Event object `receivedEvent.data.object` is already parsed by constructEventAsync
  const session = receivedEvent.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.buyerId; // Use buyerId from metadata as defined in create-stripe-checkout
  const productId = session?.metadata?.productId; // Use productId from metadata

  if (!userId) {
    console.warn(`Webhook received without a buyerId in metadata for session ${session.id}. Skipping processing.`);
    return new Response('Buyer ID not found in metadata', { status: 400 });
  }
  if (!productId) {
    console.warn(`Webhook received without a productId in metadata for session ${session.id}. Skipping processing.`);
    return new Response('Product ID not found in metadata', { status: 400 });
  }

  try {
    if (receivedEvent.type === 'checkout.session.completed') {
      console.log(`Processing checkout.session.completed for user ${userId}, product ${productId}`);

      // Check if the purchased product is one of the defined support tiers
      const tier = SUPPORT_PRODUCT_TIERS[productId as keyof typeof SUPPORT_PRODUCT_TIERS];

      if (tier) {
        console.log(`Recognized support product ID ${productId}, mapping to tier: ${tier}`);
        
        // Upsert the supporter record in the 'supporters' table
        // This will insert a new record if user_id doesn't exist,
        // or update the existing one if it does (e.g., for tier upgrades).
        const { error: supporterError } = await supabaseAdmin
          .from('supporters')
          .upsert(
            { 
              user_id: userId, 
              status: 'active', 
              tier: tier,
              // created_at: new Date().toISOString() // Optional: uncomment if you want created_at to always update on upsert
            }, 
            { onConflict: 'user_id', ignoreDuplicates: false } // Conflict on user_id, update existing row
          );
        
        if (supporterError) {
          console.error('Error upserting supporter record:', supporterError);
          throw supporterError;
        }
        console.log(`Successfully upserted supporter record for user ${userId}, tier ${tier}`);
      } else {
        console.log(`Product ID ${productId} is not a recognized support product. No supporter record updated.`);
      }
    } else if (receivedEvent.type === 'invoice.payment_succeeded') {
      // This event is more common for subscriptions.
      // If you implement recurring subscriptions with Stripe Billing for your support tiers,
      // you would likely handle status updates (e.g., ensuring 'active' status) here.
      // For one-time payments, checkout.session.completed is usually sufficient.
      console.log(`Handling invoice.payment_succeeded for user ${userId}`);
      // Future: Add logic to update supporter status if this is a recurring payment confirmation
    }
    // Add other event types as needed, e.g., 'customer.subscription.deleted', 'invoice.payment_failed'
    // to manage 'status' in the 'supporters' table (e.g., to 'inactive')

  } catch (error) {
    console.error('Error handling webhook event:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})