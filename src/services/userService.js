// src/services/userService.js

import { supabase } from '../lib/supabaseClient';

// Helper to check if a string looks like a valid UUID.
const isValidUUID = (id) => {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Fetches a single user's public profile data
export async function getUserProfile(userId) {
  // Enhanced guard with better error handling
  if (!userId) {
    const errorMsg = `User ID is required but was: ${userId}`;
    console.error(errorMsg);
    throw new Error('User ID is required');
  }

  if (!isValidUUID(userId)) {
    const errorMsg = `Invalid user ID format provided to getUserProfile: ${userId}`;
    console.error(errorMsg);
    throw new Error('Invalid user ID format');
  }

  try {
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
  } catch (err) {
    console.error('getUserProfile error:', err);
    throw err;
  }
}

// Fetches all articles created by a specific user
export async function getArticlesByUserId(userId) {
  // Enhanced guard with better error handling
  if (!userId) {
    const errorMsg = `User ID is required but was: ${userId}`;
    console.error(errorMsg);
    throw new Error('User ID is required');
  }

  if (!isValidUUID(userId)) {
    const errorMsg = `Invalid user ID format provided to getArticlesByUserId: ${userId}`;
    console.error(errorMsg);
    throw new Error('Invalid user ID format');
  }

  try {
    const { data, error } = await supabase
      .from('articles')
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
  } catch (err) {
    console.error('getArticlesByUserId error:', err);
    throw err;
  }
}

// NEW: Fetches all products uploaded by a specific user - MODIFIED
export async function getUserProducts(userId) {
  if (!userId || !isValidUUID(userId)) {
    throw new Error('Valid user ID is required to fetch products.');
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        thumbnail_url,
        created_at,
        avg_rating,
        rating_count,
        user_id,
        profiles (
          username,
          avatar_url
        )
      `) // Added user_id and joined profiles for author info
      .eq('user_id', userId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user products:', error);
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error('getUserProducts error:', err);
    throw err;
  }
}

// NEW: Fetches all reviews left by a specific user, including product details
export async function getUserReviews(userId) {
  if (!userId || !isValidUUID(userId)) {
    throw new Error('Valid user ID is required to fetch reviews.');
  }
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products (
          name,
          slug,
          thumbnail_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error('getUserReviews error:', err);
    throw err;
  }
}


// --- The rest of the file remains the same ---

export async function updateUserProfile(userId, updates, { avatarFile, bannerFile }) {
  let avatar_url = updates.avatar_url;
  let banner_url = updates.banner_url;

  if (avatarFile) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-avatar-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
    if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    avatar_url = publicUrl;
  }

  if (bannerFile) {
    const fileExt = bannerFile.name.split('.').pop();
    const fileName = `${userId}-banner-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, bannerFile, { upsert: true });
    if (uploadError) throw new Error(`Banner upload failed: ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    banner_url = publicUrl;
  }

  const profileUpdate = {
    ...updates,
    avatar_url,
    banner_url,
    updated_at: new Date().toISOString(),
  };

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