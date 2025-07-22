// supabase/functions/stripe-webhook/index.ts (Production version)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 Production webhook received!');
  
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
  });

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );

    console.log('✅ Event verified:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session, supabaseClient);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription, supabaseClient);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleRecurringPayment(invoice, supabaseClient);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, supabaseClient);
        break;
      }
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleSuccessfulPayment(session: Stripe.Checkout.Session, supabaseClient: any) {
  console.log('💰 Processing checkout.session.completed');
  
  const { userId, tierType, isRecurring } = session.metadata || {};
  
  if (!userId) {
    console.error('❌ No userId in session metadata');
    return;
  }

  try {
    const supporterData = {
      user_id: userId,
      paypal_subscription_id: session.subscription?.toString() || session.id,
      status: 'active',
      social_media_link: null,
    };

    // Check if supporter already exists
    const { data: existing } = await supabaseClient
      .from('supporters')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing supporter
      const { error } = await supabaseClient
        .from('supporters')
        .update({ 
          status: 'active',
          paypal_subscription_id: supporterData.paypal_subscription_id 
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating supporter:', error);
      } else {
        console.log('✅ Updated existing supporter');
      }
    } else {
      // Create new supporter
      const { data, error } = await supabaseClient
        .from('supporters')
        .insert(supporterData)
        .select();

      if (error) {
        console.error('❌ Error creating supporter:', error);
      } else {
        console.log('✅ Created new supporter:', data);
      }
    }
  } catch (error) {
    console.error('❌ Error in handleSuccessfulPayment:', error);
  }
}

async function handleRecurringPayment(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log('🔄 Processing recurring payment');
  
  if (invoice.subscription) {
    // Ensure supporter is still active for recurring payments
    const { error } = await supabaseClient
      .from('supporters')
      .update({ status: 'active' })
      .eq('paypal_subscription_id', invoice.subscription.toString());

    if (error) {
      console.error('❌ Error updating recurring supporter:', error);
    } else {
      console.log('✅ Updated recurring supporter status');
    }
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription, supabaseClient: any) {
  console.log('🚫 Processing subscription cancellation');
  
  try {
    const { error } = await supabaseClient
      .from('supporters')
      .update({ status: 'inactive' })
      .eq('paypal_subscription_id', subscription.id);

    if (error) {
      console.error('❌ Error updating supporter status:', error);
    } else {
      console.log('✅ Successfully canceled subscription');
    }
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCanceled:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabaseClient: any) {
  console.log('💳 Processing payment failure');
  
  // You might want to notify the user or temporarily suspend benefits
  if (invoice.subscription) {
    const { error } = await supabaseClient
      .from('supporters')
      .update({ status: 'payment_failed' })
      .eq('paypal_subscription_id', invoice.subscription.toString());

    if (error) {
      console.error('❌ Error updating failed payment status:', error);
    }
  }
}