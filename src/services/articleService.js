// src/services/articleService.js

import { supabase } from '../lib/supabaseClient';

const MODERATOR_UID = '2c3ecfda-2f41-4ee6-ba11-57e567eeb618'; // Your hardcoded UID

// --- MODIFIED: Expose generateUniqueSlug for use in frontend ---
export async function generateUniqueSlug(baseSlug) {
  let finalSlug = baseSlug;
  let counter = 1;
  while (true) {
    const { data: existing } = await supabase.from('articles').select('id').eq('slug', finalSlug).single();
    if (!existing) break;
    finalSlug = `${baseSlug}-${counter++}`;
  }
  return finalSlug;
};

// --- CORRECTED: getArticles now correctly handles is_published filter ---
export async function getArticles({
  limit = null,
  searchQuery = '',
  category = 'all',
  difficulty = 'all',
  orderBy = 'created_at',
  ascending = false,
  includePending = false, // New optional flag
  is_published = undefined // NEW: Accept is_published filter
}) {
  let query = supabase
    .from('articles')
    .select(
      `id, title, description, image_url, category, difficulty, read_time, slug, created_at, view_count, likes, dislikes, moderation_status, profiles ( username )`
    )
    .order(orderBy, { ascending: ascending });

  // NEW: Check for the is_published filter explicitly
  if (is_published !== undefined) {
    query = query.eq('is_published', is_published);
  } else if (!includePending) {
    // Retain original logic as a fallback if is_published is not provided
    query = query.eq('is_published', true);
  }

  if (category && category !== 'all') query = query.eq('category', category);
  if (difficulty && difficulty !== 'all') query = query.eq('difficulty', difficulty);
  if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching articles:', error);
    throw new Error('Failed to fetch articles.');
  }
  return data;
}

// --- MODIFIED: Allow moderator to see un-published articles ---
export async function getArticleBySlug(slug) {
    const { data: { user } } = await supabase.auth.getUser();
    const isModerator = user?.id === MODERATOR_UID;

    let query = supabase
        .from('articles')
        .select('*, profiles(id, username, avatar_url)')
        .eq('slug', slug)

    if (!isModerator) {
      query = query.eq('is_published', true);
    }
    
    const { data, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST204') return null;
        console.error('Error fetching single article:', error);
        throw new Error(`Database error: ${error.message}`);
    }
    return data;
}

export async function fetchUserArticleVote(articleId, userId) {
  try {
    const { data, error } = await supabase.rpc('fetch_user_article_vote_int', {
      article_id_param: articleId,
      user_id_param: userId
    });

    if (error) {
      console.error('Error fetching user article vote via RPC:', error);
      throw new Error(`Failed to fetch user vote: ${error.message}`);
    }
    return data === null ? null : data;
  } catch (err) {
    console.error('Unexpected error in fetchUserArticleVote:', err);
    throw err;
  }
}

export async function incrementArticleViewCount(articleId) {
  try {
    const { error } = await supabase.rpc('increment_article_views_int', { article_id_param: articleId });

    if (error) {
      console.error('Error incrementing view count via RPC:', error);
    }
  } catch (err) {
    console.error('Unexpected error in incrementArticleViewCount:', err);
  }
}

export async function updateArticleVote(articleId, newVoteType, currentVoteType) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) {
    throw new Error('Authentication required to vote.');
  }

  try {
    const { error } = await supabase.rpc('update_article_vote_int', {
      article_id_param: articleId,
      new_vote_type: newVoteType,
      user_id_param: userId,
      current_vote_type: currentVoteType
    });

    if (error) {
      console.error(`Error updating vote via RPC:`, error);
      throw new Error(error.message || `Failed to update vote.`);
    }
  } catch (err) {
    console.error('Unexpected error in updateArticleVote:', err);
    throw err;
  }
}

// --- MODIFIED: createArticle now sets is_published to false and status to 'pending' ---
export async function createArticle(articleData, thumbnailFile, userId) {
  const fileExt = thumbnailFile.name.split('.').pop();
  const fileName = `public/${userId}-thumb-${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('thumbnails').upload(fileName, thumbnailFile);
  if (uploadError) throw new Error(`Thumbnail upload failed: ${uploadError.message}`);

  const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
  const imageUrl = urlData.publicUrl;

  const baseSlug = articleData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let finalSlug = baseSlug;
  let counter = 1;
  while (true) {
    const { data: existing } = await supabase.from('articles').select('id').eq('slug', finalSlug).single();
    if (!existing) break;
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const articleToInsert = {
    ...articleData,
    image_url: imageUrl,
    slug: finalSlug,
    user_id: userId,
    read_time: `${articleData.readTime} min read`,
    is_published: false, // Article is now hidden by default
    moderation_status: 'pending', // Set initial status
  };
  delete articleToInsert.readTime;

  const { data, error: insertError } = await supabase.from('articles').insert(articleToInsert).select().single();
  if (insertError) throw new Error(`Article creation failed: ${insertError.message}`);

  return data;
}

// --- CORRECTED: updateArticle now does not use `.single()` for resilience ---
export async function updateArticle(currentSlug, articleData, thumbnailFile, newSlug = null) {
  let imageUrl = articleData.image_url;

  if (thumbnailFile) {
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `public/${articleData.user_id}-thumb-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, thumbnailFile, { upsert: true });

    if (uploadError) throw new Error(`Thumbnail update failed: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }

  const articleToUpdate = {
    title: articleData.title,
    description: articleData.description,
    category: articleData.category,
    difficulty: articleData.difficulty,
    content: articleData.content,
    image_url: imageUrl,
    read_time: `${articleData.readTime} min read`,
    updated_at: new Date().toISOString(),
  };

  if (newSlug && newSlug !== currentSlug) {
    articleToUpdate.slug = newSlug;
  }

  // If a non-moderator user edits a published article, it goes back to pending review
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id !== MODERATOR_UID) {
    articleToUpdate.is_published = false;
    articleToUpdate.moderation_status = 'pending';
  }

  const { data, error: updateError } = await supabase
    .from('articles')
    .update(articleToUpdate)
    .eq('slug', currentSlug)
    .select()
    // CORRECTED: Removed .single() to avoid the "multiple (or no) rows returned" error
    // .single();

  if (updateError) {
    throw new Error(`Article update failed: ${updateError.message}`);
  }

  return data;
}

export const deleteArticle = async (slug, userId) => {
  try {
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, user_id, image_url')
      .eq('slug', slug)
      .single();

    if (fetchError) {
      throw new Error('Article not found');
    }

    if (article.user_id !== userId) {
      throw new Error('You are not authorized to delete this article');
    }

    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('slug', slug)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(deleteError.message || 'Failed to delete article');
    }

    return true;
  } catch (error) {
    console.error('Delete article error:', error);
    throw error;
  }
};

// --- NEW: Update an article's moderation status and published flag ---
export async function updateArticleModerationStatus(articleId, newStatus) {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id !== MODERATOR_UID) {
    throw new Error('You are not authorized to moderate articles.');
  }

  let is_published = newStatus === 'approved';

  const { data, error } = await supabase
    .from('articles')
    .update({ moderation_status: newStatus, is_published })
    .eq('id', articleId)
    .select()

  if (error) {
    console.error('Error updating article moderation status:', error);
    throw new Error(error.message || 'Failed to update article status.');
  }

  return data;
}

/**
 * Fetches multiple articles based on an array of IDs.
 * @param {string[]} ids - An array of article UUIDs.
 * @returns {Promise<Array>} An array of article objects.
 */
export async function getArticlesByIds(ids) {
  if (!ids || ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('articles')
    .select(
      `id, title, description, image_url, category, difficulty, read_time, slug, created_at, view_count, likes, dislikes, profiles ( username )`
    )
    .in('id', ids);

  if (error) {
    console.error('Error fetching articles by IDs:', error);
    throw new Error('Failed to fetch bookmarked articles.');
  }
  return data;
}