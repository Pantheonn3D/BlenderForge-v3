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
      .select('id, username, avatar_url, created_at, banner_url, bio, stripe_connect_id')
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

export async function createStripeConnectAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-connect-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create Stripe Connect account link.');
  }

  const result = await response.json();
  return result;
}