// src/context/BookmarkContext.jsx

import React, { createContext, useContext } from 'react';
import { useBookmarks } from '../hooks/useBookmarks.jsx';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const bookmarks = useBookmarks();

  return (
    <BookmarkContext.Provider value={bookmarks}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarkContext = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarkContext must be used within a BookmarkProvider');
  }
  return context;
};