// src/services/bookmarkService.js

import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all bookmarks for a given user.
 * @param {string} userId The UUID of the user.
 * @returns {Promise<Array<{content_id: string, content_type: 'article' | 'product'}>>} An array of bookmark objects.
 */
export async function getBookmarksByUserId(userId) {
  if (!userId) {
    // Return an empty array if there's no user, preventing errors.
    return [];
  }
  
  const { data, error } = await supabase
    .from('user_bookmarks')
    .select('content_id, content_type')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user bookmarks:', error);
    throw new Error('Could not fetch bookmarks.');
  }

  return data;
}

/**
 * Adds a new bookmark for the current authenticated user.
 * @param {{contentId: string, contentType: 'article' | 'product'}} bookmarkData The bookmark data.
 * @returns {Promise<object>} The newly created bookmark record.
 */
export async function addBookmark({ contentId, contentType }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to add a bookmark.');

  const { data, error } = await supabase
    .from('user_bookmarks')
    .insert({
      user_id: user.id,
      content_id: contentId,
      content_type: contentType,
    })
    .select()
    .single();

  if (error) {
    // The unique constraint we created will throw an error if a duplicate is inserted.
    // We can handle this gracefully.
    if (error.code === '23505') { // PostgreSQL unique violation error code
      console.warn('Bookmark already exists.');
      // Return the existing data shape so the UI can update consistently.
      return { content_id: contentId, content_type: contentType };
    }
    console.error('Error adding bookmark:', error);
    throw new Error('Failed to add bookmark.');
  }

  return data;
}

/**
 * Removes a bookmark for the current authenticated user.
 * @param {{contentId: string, contentType: 'article' | 'product'}} bookmarkData The bookmark data.
 */
export async function removeBookmark({ contentId, contentType }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to remove a bookmark.');

  const { error } = await supabase
    .from('user_bookmarks')
    .delete()
    .match({
      user_id: user.id,
      content_id: contentId,
      content_type: contentType,
    });

  if (error) {
    console.error('Error removing bookmark:', error);
    throw new Error('Failed to remove bookmark.');
  }
}