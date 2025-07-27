// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
// --- FIX: REMOVED the incompatible Buffer import ---

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

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  
  // --- FIX: Read the body directly into an ArrayBuffer ---
  const body = await req.arrayBuffer();

  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body, // Pass the raw ArrayBuffer directly
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(err.message, { status: 400 })
  }

  console.log(`🔔 Received Stripe event: ${receivedEvent.type}`);
  
  // --- FIX: We must parse the body as JSON *after* verification ---
  const eventData = JSON.parse(new TextDecoder().decode(body));
  const session = eventData.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;

  if (!userId) {
    console.error('Webhook received without a userId in metadata.');
    return new Response('User ID not found in metadata', { status: 400 });
  }

  try {
    if (receivedEvent.type === 'checkout.session.completed') {
      const session = receivedEvent.data.object as Stripe.Checkout.Session;
      const userId = session?.metadata?.userId;
      const productId = session?.metadata?.productId; // Assuming you add this to checkout metadata

      if (!userId || !productId) {
        console.error('Webhook missing userId or productId in metadata.');
        return new Response('Missing metadata', { status: 400 });
      }

      // --- NEW LOGIC ---
      // Check if the purchased product is a support tier
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('name, is_listed')
        .eq('id', productId)
        .single();
      
      if (productError) throw productError;

      // If the product is NOT listed, it's a support tier
      if (product && product.is_listed === false) {
        let tier = 'supporter';
        if (product.name.toLowerCase().includes('advocate')) {
          tier = 'advocate';
        }

        const { error: supporterError } = await supabaseAdmin
          .from('supporters')
          .upsert({ user_id: userId, status: 'active', tier: tier }, { onConflict: 'user_id' });
        
        if (supporterError) throw supporterError;
        console.log(`Processed supporter payment for user ${userId}, tier ${tier}`);
      }
    }

  } catch (error) {
    console.error('Database error handling webhook event:', error);
    return new Response('Database error while handling webhook.', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})