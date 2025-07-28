// src/components/features/articleComments/ArticleCommentForm/ArticleCommentForm.jsx

import React, { useState } from 'react';
import styles from './ArticleCommentForm.module.css';
import Button from '../../../UI/Button/Button';
import Spinner from '../../../UI/Spinner/Spinner';

// MODIFIED: Added onCancel prop
const ArticleCommentForm = ({ onSubmit, isSubmitting, existingComment = null, onCancel = null }) => {
  const [comment, setComment] = useState(existingComment ? existingComment.comment : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() === '') {
      alert('Comment cannot be empty.');
      return;
    }
    onSubmit({ comment });
    if (!existingComment && onCancel === null) { // Only clear if it's a top-level new comment form
      setComment('');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>{existingComment ? 'Edit Your Comment' : 'Leave a Comment'}</h3>
      
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="article-comment">Your Comment</label>
        <textarea
          id="article-comment"
          className={styles.commentInput}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this article..."
          rows={4}
        />
      </div>
      
      <div className={styles.actions}>
        {onCancel && ( // Render cancel button only if onCancel prop is provided
          <Button 
            type="button" 
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting || comment.trim() === ''}
        >
          {isSubmitting ? <Spinner size="sm" /> : (existingComment ? 'Update Comment' : 'Submit Comment')}
        </Button>
      </div>
    </form>
  );
};

export default ArticleCommentForm;