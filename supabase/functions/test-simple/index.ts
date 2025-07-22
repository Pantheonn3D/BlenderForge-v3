// supabase/functions/test-simple/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  console.log('🧪 Simple test called!');
  
  const response = {
    message: 'Test webhook is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environmentVars: {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasStripeSecret: !!Deno.env.get('STRIPE_SECRET_KEY'),
      hasWebhookSecret: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      supabaseUrl: Deno.env.get('SUPABASE_URL') // This will help us verify the URL
    }
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
});