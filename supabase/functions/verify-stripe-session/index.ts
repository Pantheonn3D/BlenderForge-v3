import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
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

    const { sessionId } = await req.json()
    if (!sessionId) throw new Error('Session ID is required')

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      throw new Error('Payment was not successful.')
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
    const productId = paymentIntent.metadata.productId;

    if (!productId) {
      throw new Error('Product ID not found in payment metadata.')
    }
    
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('user_id, price')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Product not found in database.')
    }

    // --- START OF FIX ---
    // Check if a purchase record already exists to prevent duplicates
    const { data: existingPurchases, error: checkError } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      // We removed .single() and will check the array length instead

    if (checkError) {
      throw checkError
    }
    
    if (existingPurchases && existingPurchases.length > 0) {
      console.log('Purchase already recorded:', sessionId)
      return new Response(JSON.stringify({ success: true, message: 'Purchase already recorded.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    // --- END OF FIX ---

    const { error: insertError } = await supabaseAdmin.from('purchases').insert({
      buyer_user_id: user.id,
      seller_user_id: product.user_id,
      product_id: productId,
      amount: product.price,
      status: 'completed',
      stripe_session_id: sessionId,
    })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})