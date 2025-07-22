// src/services/userService.js (Corrected & Final Version)

import { supabase } from '../lib/supabaseClient';


// Fetches a single user's public profile data
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, created_at, banner_url, bio')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(error.message);
  }

  return data;
}

// Fetches all articles created by a specific user
export async function getArticlesByUserId(userId) {
  const { data, error } = await supabase
    .from('articles')
    // --- FIX: Add the missing columns to the select statement ---
    .select(
      'id, title, slug, category, description, created_at, image_url, difficulty, read_time'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user articles:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserProfile(userId, updates, { avatarFile, bannerFile }) {
  let avatar_url = updates.avatar_url;
  let banner_url = updates.banner_url;

  // 1. If a new avatar file is provided, upload it
  if (avatarFile) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-avatar-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars') // Your 'avatars' bucket
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    avatar_url = publicUrl;
  }

  // 2. If a new banner file is provided, upload it
  if (bannerFile) {
    const fileExt = bannerFile.name.split('.').pop();
    const fileName = `${userId}-banner-${Date.now()}.${fileExt}`;
    
    // We can reuse the 'avatars' bucket or you can create a 'banners' bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars') 
      .upload(fileName, bannerFile, { upsert: true });

    if (uploadError) throw new Error(`Banner upload failed: ${uploadError.message}`);
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    banner_url = publicUrl;
  }

  // 3. Prepare the final data for the 'profiles' table
  const profileUpdate = {
    ...updates,
    avatar_url,
    banner_url,
    updated_at: new Date().toISOString(),
  };

  // 4. Update the profile
  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Profile update failed: ${error.message}`);
  }

  return data;
}