// src/hooks/useBookmarks.js

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // <-- Add React for JSX
import { useAuth } from '../context/AuthContext';
import { getBookmarksByUserId, addBookmark as addBookmarkService, removeBookmark as removeBookmarkService } from '../services/bookmarkService';

// --- NEW: Create the specific tooltip content for bookmarks ---
const WhyBookmarkTooltip = () => (
    <div>
      <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--color-text-primary)', fontSize: '1rem' }}>Why Log In to Bookmark?</h4>
      <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.85rem' }}>
        Creating a free account allows you to save articles and products to your personal library. You can access your bookmarks from your profile page anytime.
      </p>
    </div>
);

export function useBookmarks() {
  const { user, openLoginPrompt } = useAuth();
  const [bookmarks, setBookmarks] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userBookmarks = await getBookmarksByUserId(user.id);
          const bookmarkSet = new Set(
            userBookmarks.map(b => `${b.content_type}-${b.content_id}`)
          );
          setBookmarks(bookmarkSet);
        } catch (error) {
          console.error("Failed to fetch bookmarks:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setBookmarks(new Set());
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const bookmarkedArticleIds = useMemo(() => {
    return Array.from(bookmarks)
      .filter(b => b.startsWith('article-'))
      .map(b => b.replace('article-', ''));
  }, [bookmarks]);

  const bookmarkedProductIds = useMemo(() => {
    return Array.from(bookmarks)
      .filter(b => b.startsWith('product-'))
      .map(b => b.replace('product-', ''));
  }, [bookmarks]);

  const isBookmarked = useCallback((contentId, contentType) => {
    return bookmarks.has(`${contentType}-${contentId}`);
  }, [bookmarks]);

  const addBookmark = useCallback(async ({ contentId, contentType }) => {
    if (!user) {
      // --- MODIFIED: Call the prompt with specific content ---
      openLoginPrompt({
          title: "Login Required to Bookmark",
          tooltip: <WhyBookmarkTooltip />
      });
      return;
    }

    const bookmarkKey = `${contentType}-${contentId}`;
    
    setBookmarks(prev => new Set(prev).add(bookmarkKey));

    try {
      await addBookmarkService({ contentId, contentType });
    } catch (error) {
      console.error("Failed to add bookmark:", error);
      setBookmarks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookmarkKey);
        return newSet;
      });
    }
  }, [user, openLoginPrompt]);

  const removeBookmark = useCallback(async ({ contentId, contentType }) => {
    if (!user) {
      openLoginPrompt({
          title: "Login Required to Bookmark",
          tooltip: <WhyBookmarkTooltip />
      });
      return;
    }

    const bookmarkKey = `${contentType}-${contentId}`;

    setBookmarks(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookmarkKey);
      return newSet;
    });

    try {
      await removeBookmarkService({ contentId, contentType });
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      setBookmarks(prev => new Set(prev).add(bookmarkKey));
    }
  }, [user, openLoginPrompt]);

  return {
    isLoading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    bookmarkedArticleIds,
    bookmarkedProductIds,
    totalBookmarks: bookmarks.size,
  };
}