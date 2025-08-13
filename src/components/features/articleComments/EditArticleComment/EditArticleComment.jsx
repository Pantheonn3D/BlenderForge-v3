// src/components/features/articleComments/EditArticleComment/EditArticleComment.jsx

import React, { useState } from 'react';
import ArticleCommentForm from '../ArticleCommentForm/ArticleCommentForm';
import Button from '../../../UI/Button/Button';
import styles from './EditArticleComment.module.css';

const EditArticleComment = ({ comment, onUpdate, onDelete, isSubmitting }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = ({ comment: newCommentText }) => {
    onUpdate(comment.id, newCommentText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(comment.id);
  };

  if (isEditing) {
    return (
      <div className={styles.editFormContainer}>
        <ArticleCommentForm 
          onSubmit={handleUpdate} 
          isSubmitting={isSubmitting} 
          existingComment={comment}
        />
        <div className={styles.editActions}>
          <Button 
            variant="secondary" 
            onClick={() => setIsEditing(false)} 
            disabled={isSubmitting}
          >
            Cancel 
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            disabled={isSubmitting}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.yourCommentSummary}>
      <h3>Your Comment</h3>
      <p className={styles.commentText}>{comment.comment}</p>
      <div className={styles.summaryActions}>
        <Button 
          variant="secondary" 
          onClick={() => setIsEditing(true)} 
          disabled={isSubmitting}
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete} 
          disabled={isSubmitting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default EditArticleComment;