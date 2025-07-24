// src/services/supportersService.js

import { supabase } from '../lib/supabaseClient';

export const checkUserSupporterStatus = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('supporters')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      isSupporter: !!data,
      supporterData: data
    };
  } catch (error) {
    console.error('Error checking supporter status:', error);
    return { isSupporter: false, supporterData: null };
  }
};

export const addSupporterAfterPayment = async (userId) => { // Removed sessionId parameter
  try {
    const { data: existing, error: selectError } = await supabase
      .from('supporters')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existing) {
      console.log('User is already a supporter');
      return existing;
    }

    console.log('Creating new supporter record...');

    const { data, error } = await supabase
      .from('supporters')
      .insert({
        user_id: userId,
        status: 'active',
        social_media_link: null,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('New supporter record created:', data);
    return data;
  } catch (error) {
    console.error('Error adding supporter:', error);
    throw error;
  }
};

export const getSupporters = async () => {
  try {
    const { data, error } = await supabase
      .from('supporters')
      .select(`
        *,
        profiles (
          username,
          avatar_url
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
};