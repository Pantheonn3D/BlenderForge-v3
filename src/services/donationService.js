// src/services/donationService.js
import { supabase } from '../lib/supabaseClient';

export const donationService = {
  // Create payment intent with Stripe
  async createPaymentIntent({ amount, isRecurring, tier, userId }) {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          isRecurring,
          tier,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Record successful donation in database
  async recordDonation({ userId, amount, tier, isRecurring, paymentIntentId }) {
    try {
      const { data, error } = await supabase
        .from('supporters')
        .upsert({
          user_id: userId,
          tier: tier,
          amount: amount,
          is_recurring: isRecurring,
          payment_intent_id: paymentIntentId,
          status: 'active',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording donation:', error);
      throw error;
    }
  },

  // Get all supporters for the supporters page
  async getSupporters() {
    try {
      const { data, error } = await supabase
        .from('supporters')
        .select(`
          *,
          profiles (
            username,
            avatar_url,
            bio
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching supporters:', error);
      throw error;
    }
  },

  // Get user's support status
  async getUserSupportStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('supporters')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user support status:', error);
      throw error;
    }
  }
};