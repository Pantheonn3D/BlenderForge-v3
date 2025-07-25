// src/pages/ArticlePage.jsx

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

import { useArticleBySlug } from '../hooks/useArticleBySlug';
import { deleteArticle, updateArticleVote, fetchUserArticleVote } from '../services/articleService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';
import { EyeIcon, ThumbUpIcon, ThumbDownIcon, CheckmarkIcon } from '../assets/icons';
import styles from './ArticlePage.module.css';

// NEW HELPER: Function to extract plain text from TipTap JSON (copied from ProductPage, adapted for article content format)
const getPlainTextFromTiptapJson = (tiptapJson, maxLength = 160) => {
  if (typeof tiptapJson === 'string') {
    try {
        tiptapJson = JSON.parse(tiptapJson); // Try to parse if it's a JSON string
    } catch (e) {
        // If it's a string but not JSON, treat it as plain text
        return tiptapJson.substring(0, maxLength) + (tiptapJson.length > maxLength ? '...' : '');
    }
  }

  if (!tiptapJson || typeof tiptapJson !== 'object' || tiptapJson.type !== 'doc' || !Array.isArray(tiptapJson.content)) {
    return ''; // Not a valid TipTap doc
  }
  let text = '';
  tiptapJson.content.forEach(node => {
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      node.content.forEach(textNode => {
        if (textNode.type === 'text' && textNode.text) {
          text += textNode.text + ' ';
        }
      });
    } else if (node.type === 'heading' && Array.isArray(node.content)) {
        node.content.forEach(textNode => {
            if (textNode.type === 'text' && textNode.text) {
                text += textNode.text + ' ';
            }
        });
    } else if (node.type === 'image' && node.attrs && node.attrs.alt) {
        text += node.attrs.alt + ' '; // Include alt text for images
    }
    // Add more node types here as needed
  });
  return text.trim().substring(0, maxLength) + (text.trim().length > maxLength ? '...' : '');
};


const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { article, isLoading, error } = useArticleBySlug(slug);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [localLikes, setLocalLikes] = useState(0);
  const [localDislikes, setLocalDislikes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isAuthor = useMemo(() => {
    return authUser?.id === article?.profiles?.id;
  }, [authUser, article]);

  useEffect(() => {
    if (article) {
      setLocalLikes(article.likes || 0);
      setLocalDislikes(article.dislikes || 0);
    }
  }, [article]);

  useEffect(() => {
    const getInitialUserVote = async () => {
      if (article?.id && authUser?.id) {
        try {
          const vote = await fetchUserArticleVote(article.id, authUser.id);
          setUserVote(vote);
        } catch (err) {
          console.error("Error fetching user's initial vote:", err);
        }
      } else if (!authUser) {
        setUserVote(null);
      }
    };
    getInitialUserVote();
  }, [article?.id, authUser?.id]);

  // UPDATED EFFECT: Manages document title and meta description
  useEffect(() => {
    let metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (!metaDescriptionTag) {
      metaDescriptionTag = document.createElement('meta');
      metaDescriptionTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionTag);
    }

    // Optional: Open Graph and Twitter Card descriptions for social media
    let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    if (!ogDescriptionTag) {
      ogDescriptionTag = document.createElement('meta');
      ogDescriptionTag.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescriptionTag);
    }

    let twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescriptionTag) {
      twitterDescriptionTag = document.createElement('meta');
      twitterDescriptionTag.setAttribute('name', 'twitter:description');
      document.head.appendChild(twitterDescriptionTag);
    }

    if (article) {
      document.title = `${article.title} - BlenderForge`;
      // Use article.description (plain string) for meta desc. If article.content (TipTap JSON) is better, use getPlainTextFromTiptapJson(article.content)
      const descriptionText = article.description ?
          (article.description.substring(0, 160) + (article.description.length > 160 ? '...' : '')) :
          getPlainTextFromTiptapJson(article.content, 160); // Fallback to content if description is empty or too short
      
      metaDescriptionTag.setAttribute('content', descriptionText);
      ogDescriptionTag.setAttribute('content', descriptionText);
      twitterDescriptionTag.setAttribute('content', descriptionText);
    } else {
      // Clear or set default if article is not found/loaded
      document.title = 'Article Not Found - BlenderForge';
      metaDescriptionTag.setAttribute('content', 'Explore insightful articles and tutorials on BlenderForge.');
      ogDescriptionTag.setAttribute('content', 'Explore insightful articles and tutorials on BlenderForge.');
      twitterDescriptionTag.setAttribute('content', 'Explore insightful articles and tutorials on BlenderForge.');
    }

    // Cleanup: remove meta tags when component unmounts to prevent them from lingering on other pages
    return () => {
      if (metaDescriptionTag && metaDescriptionTag.parentNode) {
        metaDescriptionTag.parentNode.removeChild(metaDescriptionTag);
      }
      if (ogDescriptionTag && ogDescriptionTag.parentNode) {
        ogDescriptionTag.parentNode.removeChild(ogDescriptionTag);
      }
      if (twitterDescriptionTag && twitterDescriptionTag.parentNode) {
        twitterDescriptionTag.parentNode.removeChild(twitterDescriptionTag);
      }
      document.title = 'BlenderForge'; // Reset general site title
    };
  }, [article]);


  // Restored comprehensive content parsing logic
  const articleContentHtml = useMemo(() => {
    if (!article?.content) return '<p>No content available.</p>';

    let contentToProcess = article.content;

    if (typeof contentToProcess === 'string') {
      try {
        contentToProcess = JSON.parse(contentToProcess);
      } catch (e) {
        console.error("Error parsing article content JSON string. Treating as plain text:", e);
        return `<p>${article.content}</p>`;
      }
    }

    let finalTipTapDoc = null;

    // Handle proper TipTap document format
    if (typeof contentToProcess === 'object' && 
        contentToProcess !== null && 
        contentToProcess.type === 'doc' && 
        Array.isArray(contentToProcess.content)) {
      finalTipTapDoc = contentToProcess;
    }
    // Handle array format (legacy) with proper formatting preservation
    else if (Array.isArray(contentToProcess)) {
      console.warn("Content is an array of blocks. Attempting to normalize with formatting preservation.");

      const normalizedContent = [];
      contentToProcess.forEach(block => {
        if (block.type === 'text' && typeof block.content === 'string') {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = block.content;

          Array.from(tempDiv.children).forEach(child => {
            const plainText = child.textContent || '';
            if (plainText.trim().length > 0) {
              const nodeContent = [{ type: 'text', text: plainText }];
              
              if (child.tagName.startsWith('H') && child.tagName.length === 2) {
                const level = parseInt(child.tagName[1]);
                normalizedContent.push({
                  type: 'heading',
                  attrs: { level: level },
                  content: nodeContent
                });
              } else if (child.tagName === 'P') {
                normalizedContent.push({
                  type: 'paragraph',
                  content: nodeContent
                });
              } else if (child.tagName === 'STRONG' || child.tagName === 'B') {
                normalizedContent.push({
                  type: 'paragraph',
                  content: [{ type: 'text', text: plainText, marks: [{ type: 'bold' }] }]
                });
              } else if (child.tagName === 'EM' || child.tagName === 'I') {
                normalizedContent.push({
                  type: 'paragraph',
                  content: [{ type: 'text', text: plainText, marks: [{ type: 'italic' }] }]
                });
              } else if (child.tagName === 'UL') {
                const listItems = Array.from(child.children).map(li => ({
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: li.textContent || '' }] }]
                }));
                normalizedContent.push({
                  type: 'bulletList',
                  content: listItems
                });
              } else if (child.tagName === 'OL') {
                const listItems = Array.from(child.children).map(li => ({
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: li.textContent || '' }] }]
                }));
                normalizedContent.push({
                  type: 'orderedList',
                  content: listItems
                });
              } else {
                normalizedContent.push({
                  type: 'paragraph',
                  content: nodeContent
                });
              }
            }
          });

        } else if (block.type === 'image' && typeof block.content === 'string') {
          normalizedContent.push({
            type: 'image',
            attrs: { src: block.content }
          });
        } else if (typeof block.type === 'string' && Array.isArray(block.content)) {
          const cleanedSubContent = block.content.map(subNode => {
            if (subNode.type === 'text' && typeof subNode.text === 'string') {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = subNode.text;
              const cleanedText = tempDiv.textContent || '';
              return cleanedText.length > 0 ? { ...subNode, text: cleanedText } : null;
            }
            return subNode;
          }).filter(Boolean);

          if (cleanedSubContent.length > 0) {
            normalizedContent.push({
              type: block.type,
              attrs: block.attrs,
              content: cleanedSubContent
            });
          }
        } else {
          console.warn("Skipping unhandled or malformed block during normalization:", block);
        }
      });

      finalTipTapDoc = {
        type: 'doc',
        content: normalizedContent.length > 0 ? normalizedContent : [
          { type: 'paragraph', content: [{ type: 'text', text: 'Content could not be structured.' }] }
        ]
      };
    } else {
      console.warn("Top-level content structure not recognized for parsing:", article.content);
      return '<p>Content format not recognized or invalid (top-level).</p>';
    }

    if (finalTipTapDoc && finalTipTapDoc.type === 'doc' && Array.isArray(finalTipTapDoc.content)) {
      if (finalTipTapDoc.content.length === 0) {
        finalTipTapDoc.content = [
          { type: 'paragraph', content: [{ type: 'text', text: 'No structured content available.' }] }
        ];
      }

      try {
        return generateHTML(finalTipTapDoc, [StarterKit, Image]);
      } catch (e) {
        console.error("Error generating HTML from final processed doc:", e, finalTipTapDoc);
        return '<p>An error occurred during content rendering. (HTML generation failed from final doc)</p>';
      }
    }

    return '<p>Content processing failed unexpectedly.</p>';
  }, [article?.content]);

  const handleDelete = async () => {
    if (!article || !authUser || !isAuthor) {
      alert('You are not authorized to delete this article.');
      return;
    }

    setIsDeleteModalOpen(false);
    setIsDeleting(true);

    try {
      await deleteArticle(article.slug, authUser.id);
      navigate('/knowledge-base', {
        state: { message: 'Article deleted successfully!', type: 'success' }
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      alert(error.message || 'Failed to delete article. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVote = useCallback(async (voteType) => {
    if (!authUser) {
      setIsLoginModalOpen(true);
      return;
    }
    
    if (!article || isVoting) return;

    setIsVoting(true);

    const previousLikes = localLikes;
    const previousDislikes = localDislikes;
    const previousUserVote = userVote;

    let newLocalLikes = localLikes;
    let newLocalDislikes = localDislikes;
    let newUserVote = null;

    if (userVote === voteType) {
      if (voteType === 'like') {
        newLocalLikes = Math.max(0, localLikes - 1);
      } else {
        newLocalDislikes = Math.max(0, localDislikes - 1);
      }
      newUserVote = null;
    } else if (userVote !== null && userVote !== voteType) {
      if (voteType === 'like') {
        newLocalLikes = localLikes + 1;
        newLocalDislikes = Math.max(0, localDislikes - 1);
      } else {
        newLocalDislikes = localDislikes + 1;
        newLocalLikes = Math.max(0, localLikes - 1);
      }
      newUserVote = voteType;
    } else {
      if (voteType === 'like') {
        newLocalLikes = localLikes + 1;
      } else {
        newLocalDislikes = localDislikes + 1;
      }
      newUserVote = voteType;
    }

    setLocalLikes(newLocalLikes);
    setLocalDislikes(newLocalDislikes);
    setUserVote(newUserVote);

    try {
      await updateArticleVote(article.id, voteType, userVote);
    } catch (error) {
      console.error('Error submitting vote:', error);
      // Rollback on error
      setLocalLikes(previousLikes);
      setLocalDislikes(previousDislikes);
      setUserVote(previousUserVote);
      alert(error.message || 'Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  }, [authUser, article, userVote, localLikes, localDislikes, isVoting]);

  if (isLoading) return <div className={styles.stateContainer}><Spinner size={48} /></div>;
  if (error) return <EmptyState title="An Error Occurred" message={error.message} />;
  if (!article) return <EmptyState title="Article Not Found" message="The article you are looking for does not exist." />;

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Article"
        message="Are you sure you want to permanently delete this article? This action cannot be undone."
        confirmText="Yes, Delete It"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Login Required"
        message="Please log in to rate content. You can sign in or create an account."
        confirmText="Go to Login"
        onConfirm={() => {
          setIsLoginModalOpen(false);
          navigate('/login');
        }}
        cancelText="Cancel"
        variant="primary"
      />

      <article className={styles.pageContainer}>
        <Link to="/knowledge-base" className={styles.backLink}>← Back to all articles</Link>

        <header className={styles.heroSection}>
          {article.image_url && <img src={article.image_url} alt={article.title} className={styles.heroImage} />}
          <div className={styles.heroTextContent}>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.description}>{article.description}</p>
          </div>
        </header>

        <div className={styles.metaBar}>
          {article.profiles && (
            <div className={styles.authorInfo}>
              <img
                src={article.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.profiles.username || 'A')}`}
                alt={article.profiles.username}
                className={styles.authorAvatar}
              />
              <div className={styles.authorDetails}>
                <Link to={`/profile/${article.profiles.id}`} className={styles.authorName}>
                  By {article.profiles.username || 'Anonymous'}
                </Link>
                <time className={styles.publishDate} dateTime={article.created_at}>
                  Published on {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
            </div>
          )}

          {isAuthor && (
            <div className={styles.authorActions}>
              <Button
                variant="secondary"
                as={Link}
                to={`/edit/${article.slug}`}
                disabled={isDeleting}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        <div className={styles.interactions}>
          <div className={styles.viewCount}>
            <EyeIcon className={styles.interactionIcon} />
            <span>{article.view_count || 0} Views</span>
          </div>
          <div className={styles.voteControls}>
            <button
              onClick={() => handleVote('like')}
              disabled={isVoting}
              className={`${styles.voteButton} ${userVote === 'like' ? styles.voted : ''} ${isVoting ? styles.voting : ''}`}
            >
              <ThumbUpIcon className={styles.interactionIcon} />
              <span>{localLikes}</span>
            </button>
            <button
              onClick={() => handleVote('dislike')}
              disabled={isVoting}
              className={`${styles.voteButton} ${userVote === 'dislike' ? styles.voted : ''} ${isVoting ? styles.voting : ''}`}
            >
              <ThumbDownIcon className={styles.interactionIcon} />
              <span>{localDislikes}</span>
            </button>
          </div>
        </div>

        <div className={styles.articleContent}>
          <div dangerouslySetInnerHTML={{ __html: articleContentHtml }} />
        </div>

        {/* Support Module */}
        <div className={styles.supportModule}>
          <div className={styles.supportHeader}>
            <h3 className={styles.supportTitle}>
              Enjoying This Content?
            </h3>
          </div>

          <div className={styles.supportMessage}>
            <p>
              BlenderForge is a free, community-driven platform. Help us create more quality tutorials,
              guides, and resources like this one by becoming a supporter.
            </p>

            <div className={styles.supportBenefits}>
              <div className={styles.benefit}>
                <CheckmarkIcon className={styles.benefitIcon} />
                <span>Keep BlenderForge free for everyone</span>
              </div>
              <div className={styles.benefit}>
                <CheckmarkIcon className={styles.benefitIcon} />
                <span>Help us create more content</span>
              </div>
              <div className={styles.benefit}>
                <CheckmarkIcon className={styles.benefitIcon} />
                <span>Get recognized as a supporter</span>
              </div>
            </div>

            <div className={styles.supportActions}>
              <Button
                as={Link}
                to="/support"
                variant="primary"
                size="lg"
                className={styles.primaryAction}
              >
                Become a Supporter
              </Button>
              <Button
                as={Link}
                to="/supporters"
                variant="secondary"
                size="md"
              >
                View Current Supporters
              </Button>
            </div>

            {!authUser && (
              <div className={styles.authPrompt}>
                <p>
                  Don't have an account yet?{' '}
                  <Link to="/signup" className={styles.authLink}>Sign up</Link>
                  {' '}or{' '}
                  <Link to="/login" className={styles.authLink}>sign in</Link>
                  {' '}to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
};

export default ArticlePage;