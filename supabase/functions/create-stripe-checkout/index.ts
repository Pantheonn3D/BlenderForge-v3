// supabase/functions/create-stripe-checkout/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { productId } = await req.json()
    if (!productId) throw new Error('Product ID is required')

    const { data: product, error: productError } = await supabase
      .from('products_with_author')
      .select('id, name, price, user_id, stripe_user_id, slug')
      .eq('id', productId)
      .single()

    if (productError) throw productError
    if (!product) throw new Error('Product not found')
    if (!product.stripe_user_id) throw new Error('Product owner has not connected a Stripe account.')
    if (product.price <= 0) throw new Error('This product is free and cannot be purchased via Stripe.')

    const priceInCents = Math.round(product.price * 100)
    const applicationFeeAmount = Math.round(priceInCents * 0.10)

    const siteUrl = (Deno.env.get('SITE_URL') || 'http://localhost:5173').replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      // --- THIS IS THE CORRECTED LINE ---
      cancel_url: `${siteUrl}/marketplace/${product.slug}`,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: product.stripe_user_id,
        },
        metadata: {
          productId: product.id,
          buyerId: user.id
        }
      },
    })

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})