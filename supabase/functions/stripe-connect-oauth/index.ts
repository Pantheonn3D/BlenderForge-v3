// supabase/functions/stripe-connect-oauth/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Buffer } from 'https://deno.land/std@0.177.0/node/buffer.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { returnPath } = await req.json();
    if (!returnPath) {
      return new Response(JSON.stringify({ error: 'returnPath is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- UPDATED STATE LOGIC ---
    // We'll create a JSON object with the user's ID and the return path, then Base64 encode it.
    const stateObject = {
      userId: user.id,
      returnPath: returnPath,
    };
    const state = Buffer.from(JSON.stringify(stateObject)).toString('base64');
    // --- END OF UPDATE ---

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: Deno.env.get('STRIPE_CONNECT_CLIENT_ID')!,
      scope: 'read_write',
      redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/stripe-oauth-callback`,
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