// src/components/features/articleComments/CommentItem/CommentItem.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './CommentItem.module.css';
import UserCircleIcon from '../../../../assets/icons/UserCircleIcon';
import Button from '../../../UI/Button/Button';
import { ThumbUpIcon, ThumbDownIcon, EllipsisVerticalIcon } from '../../../../assets/icons';
import { fetchUserCommentVote, updateCommentVote } from '../../../../services/commentService';
import DropdownMenu from '../../../../components/UI/DropdownMenu/DropdownMenu';

const MAX_THREAD_DEPTH = 12; // Maximum threading depth for main comments
const MAX_SIDEBAR_VISUAL_DEPTH = 1; // Limit visual depth for sidebar comments to prevent deep nesting

const timeAgo = (dateString) => { //
  const now = new Date(); //
  const past = new Date(dateString); //
  const seconds = Math.floor((now - past) / 1000); //

  if (seconds < 60) return `${seconds}s ago`; //
  const minutes = Math.floor(seconds / 60); //
  if (minutes < 60) return `${minutes}m ago`; //
  const hours = Math.floor(minutes / 60); //
  if (hours < 24) return `${hours}h ago`; //
  const days = Math.floor(hours / 24); //
  if (days < 30) return `${days}d ago`; //
  const months = Math.floor(days / 30); //
  if (months < 12) return `${months}mo ago`; //
  const years = Math.floor(months / 12); //
  return `${years}y ago`; //
};

const CommentItem = ({ 
  comment, 
  authUserId, 
  onEdit, 
  onDelete, 
  onReply, 
  isSubmitting, 
  allComments, 
  isSidebarView = false, 
  depth = 0, // Actual hierarchical depth
  visualDepth = 0, // Visual indentation depth
  onShowRepliesClick, // New prop for sidebar click
  setCommentRef // New prop for setting ref on main comments
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false); //
  const [replyText, setReplyText] = useState(''); //
  const [isEditing, setIsEditing] = useState(false); //
  const [editedCommentText, setEditedCommentText] = useState(comment.comment); //
  const [localLikes, setLocalLikes] = useState(comment.likes || 0); //
  const [localDislikes, setLocalDislikes] = useState(comment.dislikes || 0); //
  const [userVote, setUserVote] = useState(null); //
  const [isVoting, setIsVoting] = useState(false); //
  const [showOptionsMenu, setShowOptionsMenu] = useState(false); //

  const isCommentAuthor = useMemo(() => authUserId === comment.user_id, [authUserId, comment.user_id]); //

  const directReplies = useMemo(() => { //
    if (!allComments || !Array.isArray(allComments)) return []; //
    return allComments //
      .filter(c => c.parent_comment_id === comment.id) //
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); //
  }, [allComments, comment.id]); //

  const replyCount = directReplies.length; //

  useEffect(() => { //
    setLocalLikes(comment.likes || 0); //
    setLocalDislikes(comment.dislikes || 0); //
  }, [comment.likes, comment.dislikes]); //

  useEffect(() => { //
    const getInitialUserVote = async () => { //
      if (comment.id && authUserId) { //
        try { //
          const vote = await fetchUserCommentVote(comment.id, authUserId); //
          setUserVote(vote); //
        } catch (err) { //
          console.error("Error fetching user's initial comment vote:", err); //
        }
      } else { //
        setUserVote(null); //
      }
    }; //
    getInitialUserVote(); //
  }, [comment.id, authUserId]); //

  const handleVote = useCallback(async (voteType) => { //
    if (isSidebarView || !authUserId || isCommentAuthor || isVoting) return; //
    
    setIsVoting(true); //
    const previousLikes = localLikes; //
    const previousDislikes = localDislikes; //
    const previousUserVote = userVote; //

    let newLocalLikes = localLikes; //
    let newLocalDislikes = localDislikes; //
    let newUserVote = null; //

    if (userVote === voteType) { //
      if (voteType === 'like') { //
        newLocalLikes = Math.max(0, localLikes - 1); //
      } else { //
        newLocalDislikes = Math.max(0, localDislikes - 1); //
      }
      newUserVote = null; //
    } else if (userVote !== null && userVote !== voteType) { //
      if (voteType === 'like') { //
        newLocalLikes = localLikes + 1; //
        newLocalDislikes = Math.max(0, localDislikes - 1); //
      } else { //
        newLocalDislikes = localDislikes + 1; //
        newLocalLikes = Math.max(0, localLikes - 1); //
      }
      newUserVote = voteType; //
    } else { //
      if (voteType === 'like') { //
        newLocalLikes = localLikes + 1; //
      } else { //
        newLocalDislikes = localDislikes + 1; //
      }
      newUserVote = voteType; //
    }

    setLocalLikes(newLocalLikes); //
    setLocalDislikes(newLocalDislikes); //
    setUserVote(newUserVote); //

    try { //
      await updateCommentVote(comment.id, voteType, authUserId); //
    } catch (error) { //
      console.error('Error submitting comment vote:', error); //
      setLocalLikes(previousLikes); //
      setLocalDislikes(previousDislikes); //
      setUserVote(previousUserVote); //
      alert(error.message || 'Failed to submit vote. Please try again.'); //
    } finally { //
      setIsVoting(false); //
    }
  }, [comment.id, authUserId, localLikes, localDislikes, userVote, isCommentAuthor, isVoting, isSidebarView]); //

  const handleReplySubmit = useCallback(async () => { //
    if (replyText.trim() === '') return; //
    await onReply({ comment: replyText, parent_comment_id: comment.id }); //
    setReplyText(''); //
    setShowReplyInput(false); //
  }, [onReply, comment.id, replyText]); //

  const handleSaveEdit = useCallback(async () => { //
    if (editedCommentText.trim() === '') { //
      alert('Comment cannot be empty.'); //
      return; //
    }
    await onEdit(comment.id, editedCommentText); //
    setIsEditing(false); //
    setShowOptionsMenu(false); //
  }, [onEdit, comment.id, editedCommentText]); //

  const handleCancelEdit = useCallback(() => { //
    setIsEditing(false); //
    setEditedCommentText(comment.comment); //
    setShowOptionsMenu(false); //
  }, [comment.comment]); //

  const handleCancelReply = useCallback(() => { //
    setReplyText(''); //
    setShowReplyInput(false); //
  }, []); //

  const handleDeleteClick = useCallback(() => { //
    onDelete(comment.id); //
    setShowOptionsMenu(false); //
  }, [onDelete, comment.id]); //

  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', { //
    year: 'numeric', month: 'long', day: 'numeric' //
  }); //

  // Determine the effective max visual depth
  const effectiveMaxVisualDepth = isSidebarView ? MAX_SIDEBAR_VISUAL_DEPTH : MAX_THREAD_DEPTH; //
  const shouldIndent = visualDepth > 0 && visualDepth <= effectiveMaxVisualDepth; //
  const isAtVisualLimit = visualDepth >= effectiveMaxVisualDepth; //
  const nextVisualDepth = visualDepth + 1; //

  if (isEditing) { //
    return (
      <div className={`${styles.commentWrapper} ${shouldIndent ? styles.isReply : ''} ${isAtVisualLimit && !isSidebarView ? styles.maxDepth : ''}`}
           ref={setCommentRef}>
        <div className={styles.commentContent}>
          <div className={styles.inlineEditContainer}>
            <textarea
              className={styles.inlineEditArea}
              value={editedCommentText}
              onChange={(e) => setEditedCommentText(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
            <div className={styles.inlineEditActions}>
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                onClick={handleSaveEdit}
                disabled={isSubmitting || editedCommentText.trim() === ''}
              >
                Save
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteClick} 
                disabled={isSubmitting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        
        {/* Render replies only if not in sidebar view and not at max depth for main view */}
        {directReplies.length > 0 && !isSidebarView && !isAtVisualLimit && ( //
          <div className={styles.replies}>
            {directReplies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                authUserId={authUserId} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onReply={onReply} 
                isSubmitting={isSubmitting} 
                allComments={allComments}
                isSidebarView={isSidebarView}
                depth={depth + 1}
                visualDepth={nextVisualDepth}
                setCommentRef={setCommentRef}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.commentWrapper} ${shouldIndent ? styles.isReply : ''} ${isAtVisualLimit && !isSidebarView ? styles.maxDepth : ''}`}
         ref={setCommentRef}>
      <div className={styles.commentContent}>
        <div className={styles.commentHeader}>
          <div className={styles.authorInfo}>
            {comment.avatar_url ? (
              <img src={comment.avatar_url} alt={comment.username} className={styles.authorAvatar} />
            ) : (
              <UserCircleIcon className={styles.authorAvatar} />
            )}
            <span className={styles.authorName}>{comment.username || 'Anonymous'}</span>
            <span className={styles.commentDate}>• {timeAgo(comment.created_at)}</span>
            {comment.updated_at && comment.updated_at !== comment.created_at && (
              <span className={styles.editedIndicator} title={`Last updated: ${formattedDate}`}>(edited)</span>
            )}
          </div>
          {!isSidebarView && isCommentAuthor && (
            <div className={styles.optionsMenuContainer}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOptionsMenu(prev => !prev)}
                className={styles.optionsMenuButton}
                disabled={isSubmitting}
              >
                <EllipsisVerticalIcon className={styles.ellipsisIcon} />
              </Button>
              <DropdownMenu 
                isOpen={showOptionsMenu} 
                onClose={() => setShowOptionsMenu(false)} 
                position="bottom-right"
              >
                <button onClick={() => setIsEditing(true)} disabled={isSubmitting} role="menuitem">Edit</button>
                <button onClick={handleDeleteClick} disabled={isSubmitting} className={styles.destructive} role="menuitem">Delete</button>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <p className={styles.commentText}>{comment.comment}</p>

        {!isSidebarView && ( //
          <div className={styles.commentActions}>
            <div className={styles.voteControls}>
              <Button 
                onClick={() => handleVote('like')} 
                disabled={isVoting || !authUserId || isCommentAuthor} 
                className={`${styles.voteButton} ${userVote === 'like' ? styles.voted : ''}`} 
                leftIcon={<ThumbUpIcon className={styles.interactionIcon} />}
                size="sm"
                variant="ghost"
              >
                {localLikes}
              </Button>
              <Button 
                onClick={() => handleVote('dislike')} 
                disabled={isVoting || !authUserId || isCommentAuthor} 
                className={`${styles.voteButton} ${userVote === 'dislike' ? styles.voted : ''}`} 
                leftIcon={<ThumbDownIcon className={styles.interactionIcon} />}
                size="sm"
                variant="ghost"
              >
                {localDislikes}
              </Button>
            </div>

            {authUserId && ( //
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReplyInput(prev => !prev)}
                disabled={isSubmitting}
              >
                {showReplyInput ? 'Cancel' : 'Reply'}
              </Button>
            )}
          </div>
        )}
        
        {/* Conditional rendering for replies: */}
        {/* If in sidebar view and at or beyond MAX_SIDEBAR_VISUAL_DEPTH, show "Show X replies" button */}
        {/* This condition now checks if onShowRepliesClick is actually provided, which it only is for sidebar comments */}
        {replyCount > 0 && isSidebarView && isAtVisualLimit && typeof onShowRepliesClick === 'function' ? ( //
            <button
                className={styles.showRepliesButton}
                onClick={() => onShowRepliesClick(comment.id)}
            >
                Show {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}
            </button>
        ) : (
            // Otherwise, if there are direct replies and either not in sidebar view OR
            // in sidebar view but below MAX_SIDEBAR_VISUAL_DEPTH, render the replies recursively.
            directReplies.length > 0 && !isAtVisualLimit && ( //
                <div className={styles.replies}>
                    {directReplies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            authUserId={authUserId} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                            onReply={onReply} 
                            isSubmitting={isSubmitting} 
                            allComments={allComments}
                            isSidebarView={isSidebarView}
                            depth={depth + 1}
                            visualDepth={nextVisualDepth}
                            setCommentRef={setCommentRef}
                        />
                    ))}
                </div>
            )
        )}

        {showReplyInput && authUserId && ( //
          <div className={styles.replyInputContainer}>
            <textarea
              className={styles.replyTextarea}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              disabled={isSubmitting}
            />
            <div className={styles.replyActions}>
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleCancelReply}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                onClick={handleReplySubmit}
                disabled={isSubmitting || replyText.trim() === ''}
              >
                Submit Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;