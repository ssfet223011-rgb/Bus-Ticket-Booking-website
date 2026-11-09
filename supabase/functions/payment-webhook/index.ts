// Supabase Edge Function: Payment Webhook Handler (bKash, Nagad, SSLCommerz)
// Deploy with: supabase functions deploy payment-webhook

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    const { provider, transactionId, bookingReference, amount, status } = payload;

    // Verify webhook signature (e.g. HMAC-SHA256 from payment gateway)
    const signature = req.headers.get('x-gateway-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing gateway signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (status === 'COMPLETED' || status === 'SUCCESS') {
      // Find booking and confirm transaction
      const { data: booking, error: fetchErr } = await supabase
        .from('bookings')
        .select('id, trip_id')
        .eq('booking_reference', bookingReference)
        .single();

      if (fetchErr || !booking) {
        return new Response(JSON.stringify({ error: 'Booking reference not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update payment record
      await supabase
        .from('payments')
        .update({
          status: 'successful',
          provider_transaction_id: transactionId,
          raw_response: payload,
        })
        .eq('booking_id', booking.id);

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'successful',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      return new Response(
        JSON.stringify({ success: true, message: 'Payment verified and booking confirmed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(JSON.stringify({ message: 'Unhandled payment status' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
