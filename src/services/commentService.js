// src/services/commentService.js

import { supabase } from '../lib/supabaseClient';

export async function getCommentsByArticleId(articleId) {
  const { data, error } = await supabase
    .from('article_comments_with_author')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false }); // Fetch all comments, we'll handle nesting in frontend

  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Could not load comments.');
  }
  return data;
}

// MODIFIED: Added parent_comment_id for replies
export async function submitComment({ articleId, comment, parent_comment_id = null }) {
  if (!comment || comment.trim() === '') {
    throw new Error('Comment cannot be empty.');
  }
  
  const { data, error } = await supabase.rpc('submit_article_comment', { 
    article_id_arg: articleId, 
    comment_arg: comment,
    parent_comment_id_arg: parent_comment_id // NEW: Pass parent_comment_id
  });

  if (error) {
    console.error('Error submitting comment via RPC:', error);
    throw new Error(error.message || 'Failed to submit comment.');
  }
  return data[0]; 
}

export async function updateComment(commentId, newComment) {
  if (!newComment || newComment.trim() === '') {
    throw new Error('Comment cannot be empty.');
  }

  const { data, error } = await supabase.rpc('update_article_comment', { 
    comment_id_arg: commentId, 
    new_comment_arg: newComment 
  });

  if (error) {
    console.error('Error updating comment via RPC:', error);
    throw new Error(error.message || 'Failed to update comment.');
  }
  return data[0]; 
}

export async function deleteComment(commentId) {
  const { data, error } = await supabase.rpc('delete_article_comment', { 
    comment_id_arg: commentId 
  });

  if (error) {
    console.error('Error deleting comment via RPC:', error);
    throw new Error(error.message || 'Failed to delete comment.');
  }
  return data; 
}

// NEW: Function to handle fetching user's vote on a specific comment
export async function fetchUserCommentVote(commentId, userId) {
    if (!userId) return null; // If no user, no vote to fetch
    const { data, error } = await supabase.rpc('fetch_user_comment_vote', {
        comment_id_arg: commentId,
        user_id_arg: userId
    });
    if (error) {
        console.error('Error fetching user comment vote:', error);
        return null;
    }
    return data; // 'like', 'dislike', or null
}

// NEW: Function to update comment likes/dislikes
export async function updateCommentVote(commentId, voteType, userId) {
    if (!userId) throw new Error('User not authenticated.');
    const { data, error } = await supabase.rpc('update_article_comment_vote', {
        comment_id_arg: commentId,
        vote_type_arg: voteType,
        user_id_arg: userId
    });
    if (error) {
        console.error('Error updating comment vote:', error);
        throw new Error(error.message || 'Failed to update comment vote.');
    }
    return data[0]; // Returns { likes, dislikes, user_vote }
}