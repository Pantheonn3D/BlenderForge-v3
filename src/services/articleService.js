// src/services/articleService.js

import { supabase } from '../lib/supabaseClient';

export async function getArticles({
  limit = null,
  searchQuery = '',
  category = 'all',
  difficulty = 'all',
}) {
  let query = supabase
    .from('articles')
    .select(
      `id, title, description, image_url, category, difficulty, read_time, slug, created_at, view_count, likes, dislikes, profiles ( username )`
    )
    .order('created_at', { ascending: false });

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

export async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('articles')
    .select('*, profiles(id, username, avatar_url)') // MODIFIED: Added 'id' to profiles select
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST204') return null;
    console.error('Error fetching single article:', error);
    throw new Error(`Database error: ${error.message}`);
  }
  return data;
}

// MODIFIED: Function to increment article view count - Calls new RPC name
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

// MODIFIED: Function to update article likes/dislikes - Calls new RPC name
export async function updateArticleVote(articleId, voteType) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) {
    throw new Error('Authentication required to vote.');
  }

  try {
    const { error } = await supabase.rpc('update_article_vote_int', {
      article_id_param: articleId,
      vote_type: voteType,
      user_id_param: userId
    });

    if (error) {
      console.error(`Error updating ${voteType} count via RPC:`, error);
      throw new Error(`Failed to update ${voteType}.`);
    }
  } catch (err) {
    console.error('Unexpected error in updateArticleVote:', err);
    throw err;
  }
}


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
  };
  delete articleToInsert.readTime;

  const { data, error: insertError } = await supabase.from('articles').insert(articleToInsert).select().single();
  if (insertError) throw new Error(`Article creation failed: ${insertError.message}`);

  return data;
}

export async function updateArticle(slug, articleData, thumbnailFile) {
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

  const { data, error: updateError } = await supabase
    .from('articles')
    .update(articleToUpdate)
    .eq('slug', slug)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Article update failed: ${updateError.message}`);
  }

  return data;
}

export const deleteArticle = async (slug, userId) => {
  try {
    // First, get the article to verify ownership
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

    // Delete the article
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('slug', slug)
      .eq('user_id', userId); // Double check ownership

    if (deleteError) {
      throw new Error(deleteError.message || 'Failed to delete article');
    }

    // Optionally, you could also delete the associated image from storage here
    // if you're using Supabase storage for images

    return true;
  } catch (error) {
    console.error('Delete article error:', error);
    throw error;
  }
};