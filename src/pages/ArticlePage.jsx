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
import { EyeIcon, ThumbUpIcon, ThumbDownIcon } from '../assets/icons';
import styles from './ArticlePage.module.css';

const getPlainTextFromTiptapJson = (tiptapJson, maxLength = 160) => {
  if (typeof tiptapJson === 'string') {
    try {
        tiptapJson = JSON.parse(tiptapJson);
    } catch (e) {
        return tiptapJson.substring(0, maxLength) + (tiptapJson.length > maxLength ? '...' : '');
    }
  }

  if (!tiptapJson || typeof tiptapJson !== 'object' || tiptapJson.type !== 'doc' || !Array.isArray(tiptapJson.content)) {
    return '';
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
        text += node.attrs.alt + ' ';
    }
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

  useEffect(() => {
    let metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (!metaDescriptionTag) {
      metaDescriptionTag = document.createElement('meta');
      metaDescriptionTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionTag);
    }

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
      const descriptionText = article.description ?
          (article.description.substring(0, 160) + (article.description.length > 160 ? '...' : '')) :
          getPlainTextFromTiptapJson(article.content, 160);
      
      metaDescriptionTag.setAttribute('content', descriptionText);
      ogDescriptionTag.setAttribute('content', descriptionText);
      twitterDescriptionTag.setAttribute('content', descriptionText);
    } else {
      document.title = 'Article Not Found - BlenderForge';
      metaDescriptionTag.setAttribute('content', 'Explore insightful articles and tutorials on BlenderForge.');
      ogDescriptionTag.setAttribute('content', 'Explore insightful articles and tutorials on BlenderForge.');
      twitterDescriptionTag.setAttribute('content', 'Explore insightful articles and tutorials on BlenderForge.');
    }

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
      document.title = 'BlenderForge';
    };
  }, [article]);

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
    if (typeof contentToProcess === 'object' && contentToProcess !== null && contentToProcess.type === 'doc' && Array.isArray(contentToProcess.content)) {
      finalTipTapDoc = contentToProcess;
    }
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
                normalizedContent.push({ type: 'heading', attrs: { level: level }, content: nodeContent });
              } else if (child.tagName === 'P') {
                normalizedContent.push({ type: 'paragraph', content: nodeContent });
              } else if (child.tagName === 'STRONG' || child.tagName === 'B') {
                normalizedContent.push({ type: 'paragraph', content: [{ type: 'text', text: plainText, marks: [{ type: 'bold' }] }] });
              } else if (child.tagName === 'EM' || child.tagName === 'I') {
                normalizedContent.push({ type: 'paragraph', content: [{ type: 'text', text: plainText, marks: [{ type: 'italic' }] }] });
              } else if (child.tagName === 'UL') {
                const listItems = Array.from(child.children).map(li => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: li.textContent || '' }] }] }));
                normalizedContent.push({ type: 'bulletList', content: listItems });
              } else if (child.tagName === 'OL') {
                const listItems = Array.from(child.children).map(li => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: li.textContent || '' }] }] }));
                normalizedContent.push({ type: 'orderedList', content: listItems });
              } else {
                normalizedContent.push({ type: 'paragraph', content: nodeContent });
              }
            }
          });
        } else if (block.type === 'image' && typeof block.content === 'string') {
          normalizedContent.push({ type: 'image', attrs: { src: block.content } });
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
            normalizedContent.push({ type: block.type, attrs: block.attrs, content: cleanedSubContent });
          }
        } else {
          console.warn("Skipping unhandled or malformed block during normalization:", block);
        }
      });
      finalTipTapDoc = { type: 'doc', content: normalizedContent.length > 0 ? normalizedContent : [{ type: 'paragraph', content: [{ type: 'text', text: 'Content could not be structured.' }] }] };
    } else {
      console.warn("Top-level content structure not recognized for parsing:", article.content);
      return '<p>Content format not recognized or invalid (top-level).</p>';
    }
    if (finalTipTapDoc && finalTipTapDoc.type === 'doc' && Array.isArray(finalTipTapDoc.content)) {
      if (finalTipTapDoc.content.length === 0) {
        finalTipTapDoc.content = [{ type: 'paragraph', content: [{ type: 'text', text: 'No structured content available.' }] }];
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
      navigate('/knowledge-base', { state: { message: 'Article deleted successfully!', type: 'success' } });
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
        onConfirm={() => { setIsLoginModalOpen(false); navigate('/login'); }}
        cancelText="Cancel"
        variant="primary"
      />

      <div className={styles.pageContainer}>
        <Link to="/knowledge-base" className={styles.backLink}>← Back to all articles</Link>

        <div className={styles.layoutGrid}>
          <main className={styles.mainContent}>
            <header className={styles.heroSection}>
              {article.image_url && <img src={article.image_url} alt={article.title} className={styles.heroImage} />}
            </header>

            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.description}>{article.description}</p>
            
            <div className={styles.articleContent}>
              <div dangerouslySetInnerHTML={{ __html: articleContentHtml }} />
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarContent}>
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
                  <Button variant="secondary" as={Link} to={`/edit/${article.slug}`} disabled={isDeleting}>Edit</Button>
                  <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} disabled={isDeleting} isLoading={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              )}

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Views</span>
                  <span className={styles.statValue}><EyeIcon /> {article.view_count || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Likes</span>
                  <span className={styles.statValue}><ThumbUpIcon /> {localLikes}</span>
                </div>
              </div>

              <div className={styles.voteControls}>
                <Button onClick={() => handleVote('like')} disabled={isVoting} className={`${styles.voteButton} ${userVote === 'like' ? styles.voted : ''}`} leftIcon={<ThumbUpIcon className={styles.interactionIcon} />}>
                  Like
                </Button>
                <Button onClick={() => handleVote('dislike')} disabled={isVoting} className={`${styles.voteButton} ${userVote === 'dislike' ? styles.voted : ''}`} leftIcon={<ThumbDownIcon className={styles.interactionIcon} />}>
                  Dislike
                </Button>
              </div>

              {/* --- FIX IS HERE: Conditionally render the support CTA --- */}
              {!isAuthor && (
                <div className={styles.supportCta}>
                  <h3>Enjoyed This Article?</h3>
                  <p>Help keep BlenderForge free by becoming a supporter.</p>
                  <Button as={Link} to="/support" variant="primary">Become a Supporter</Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default ArticlePage;