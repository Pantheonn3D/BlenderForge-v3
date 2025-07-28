// src/components/features/articleComments/ArticleCommentsList/ArticleCommentsList.jsx

import React from 'react';
import styles from './ArticleCommentsList.module.css';
import CommentItem from '../CommentItem/CommentItem.jsx';

const ArticleCommentsList = ({ comments, onEdit, onDelete, onReply, authUserId, isSubmitting, allComments, isSidebarView = false, onShowRepliesClick, setCommentRefs }) => { //
  if (!comments || comments.length === 0) { //
    return null; //
  }

  return (
    <div className={styles.commentsList}>
      {comments.map(comment => (
        <CommentItem
          key={comment.id} //
          comment={comment} //
          authUserId={authUserId} //
          onEdit={onEdit} //
          onDelete={onDelete} //
          onReply={onReply} //
          isSubmitting={isSubmitting} //
          allComments={allComments} //
          isSidebarView={isSidebarView} //
          depth={0} // Initial depth for top-level comments
          // Only pass onShowRepliesClick if it's the sidebar view
          onShowRepliesClick={isSidebarView ? onShowRepliesClick : null} //
          // setCommentRef is a function that receives the element and sets it in the parent's ref object
          setCommentRef={isSidebarView ? null : (el => { //
            if (setCommentRefs) { // Add a check to ensure setCommentRefs exists
              setCommentRefs.current[comment.id] = el; //
            }
          })} // Assign ref only for main comments
        />
      ))}
    </div>
  );
};

export default ArticleCommentsList;