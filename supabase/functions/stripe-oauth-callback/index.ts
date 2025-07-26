// supabase/functions/stripe-oauth-callback/index.ts

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
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') // The user's ID

  // --- ROBUST URL HANDLING ---
  const siteUrl = (Deno.env.get('SITE_URL') || 'http://localhost:5173').replace(/\/$/, '');

  if (!code) {
    return Response.redirect(`${siteUrl}/edit-profile?error=stripe_no_code`)
  }

  if (!state) {
    return Response.redirect(`${siteUrl}/edit-profile?error=stripe_no_state`)
  }

  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code,
    })

    const stripeUserId = response.stripe_user_id
    if (!stripeUserId) {
      throw new Error('Stripe user ID not found in response.')
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_user_id: stripeUserId })
      .eq('id', state)

    if (updateError) {
      throw updateError
    }

    return Response.redirect(`${siteUrl}/edit-profile?stripe_connected=true`)
  } catch (error) {
    console.error('Stripe OAuth callback error:', error)
    return Response.redirect(`${siteUrl}/edit-profile?error=stripe_connection_failed`)
  }
})