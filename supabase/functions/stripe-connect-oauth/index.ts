// supabase/functions/stripe-connect-oauth/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the currently authenticated user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Generate a random string for the state parameter to prevent CSRF attacks.
    // We'll use the user's ID for simplicity, but a random hash is better for production.
    const state = user.id

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: Deno.env.get('STRIPE_CONNECT_CLIENT_ID')!,
      scope: 'read_write',
      redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/stripe-oauth-callback`, // Your callback function URL
      state: state,
    }).toString()

    const stripeUrl = `https://connect.stripe.com/oauth/authorize?${params}`

    return new Response(JSON.stringify({ url: stripeUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})