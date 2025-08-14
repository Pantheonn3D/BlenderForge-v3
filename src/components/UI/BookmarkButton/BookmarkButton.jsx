// src/components/UI/BookmarkButton/BookmarkButton.jsx

import React from 'react';
import { useBookmarkContext } from '../../../context/BookmarkContext'; // <-- CORRECTED PATH
import { BookmarkIcon } from '../../../assets/icons'; // <-- CORRECTED NAMED IMPORT & PATH
import styles from './BookmarkButton.module.css';
import Spinner from '../Spinner/Spinner';

const BookmarkButton = ({ contentId, contentType, className = '' }) => {
  const { isBookmarked, addBookmark, removeBookmark, isLoading } = useBookmarkContext();

  const isSaved = isBookmarked(contentId, contentType);

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card clicks
    e.preventDefault();   // Prevent link navigation

    if (isLoading) return;

    if (isSaved) {
      removeBookmark({ contentId, contentType });
    } else {
      addBookmark({ contentId, contentType });
    }
  };

  const buttonClasses = [
    styles.bookmarkButton,
    isSaved ? styles.saved : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      aria-label={isSaved ? 'Remove bookmark' : 'Add bookmark'}
      title={isSaved ? 'Remove bookmark' : 'Add bookmark'}
      disabled={isLoading}
    >
      {isLoading ? (
        <Spinner size={18} />
      ) : (
        <BookmarkIcon className={styles.icon} />
      )}
    </button>
  );
};

export default BookmarkButton;