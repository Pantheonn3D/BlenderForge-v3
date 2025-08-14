// src/services/notificationService.js

import { supabase } from '../lib/supabaseClient';

/**
 * Fetches unread notifications for a user, along with the actor's username.
 * @param {string} userId The UUID of the user.
 * @param {number} limit The maximum number of notifications to fetch.
 * @returns {Promise<Array>} An array of notification objects.
 */
export async function getUnreadNotifications(userId, limit = 10) {
  if (!userId) return [];

  // --- THIS IS THE FIX ---
  // We now query the simple, pre-joined VIEW instead of the base table.
  const { data, error } = await supabase
    .from('notifications_with_actor')
    .select(`
      id,
      type,
      is_read,
      metadata,
      created_at,
      actor_username
    `)
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Could not fetch notifications.');
  }
  return data;
}

/**
 * Marks a list of notifications as read using an RPC call.
 * @param {number[]} notificationIds An array of notification IDs to mark as read.
 * @returns {Promise<void>}
 */
export async function markNotificationsAsRead(notificationIds) {
  if (!notificationIds || notificationIds.length === 0) return;

  const { error } = await supabase.rpc('mark_notifications_as_read', {
    notification_ids: notificationIds,
  });

  if (error) {
    console.error('Error marking notifications as read:', error);
    throw new Error('Could not update notifications.');
  }
}