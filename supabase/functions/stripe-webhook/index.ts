// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message)
    return new Response(err.message, { status: 400 })
  }

  console.log(`🔔 Received Stripe event: ${receivedEvent.type}`);

  const session = receivedEvent.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;

  if (!userId) {
    console.error('Webhook received without a userId in metadata.');
    return new Response('User ID not found in metadata', { status: 400 });
  }

  try {
    if (receivedEvent.type === 'checkout.session.completed') {
      const amountTotal = session.amount_total; // Amount is in cents
      let tier = 'supporter'; // Default tier

      // Determine tier based on amount. 1499 cents = $14.99
      if (amountTotal && amountTotal >= 1499) {
        tier = 'advocate';
      }

      const { error } = await supabaseAdmin
        .from('supporters')
        .upsert({
          user_id: userId,
          status: 'active',
          tier: tier, // Save the determined tier
        }, { onConflict: 'user_id' });

      if (error) throw error;
      console.log(`Successfully added/updated supporter for user: ${userId} to tier: ${tier}`);
    }
    
    if (receivedEvent.type === 'customer.subscription.deleted') {
      const { error } = await supabaseAdmin
        .from('supporters')
        .update({ status: 'cancelled' })
        .eq('user_id', userId);

      if (error) throw error;
      console.log(`Successfully cancelled supporter status for user: ${userId}`);
    }

  } catch (error) {
    console.error('Error handling webhook event:', error);
    return new Response('Database error while handling webhook.', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})