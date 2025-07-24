// src/pages/ArticlePage.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useArticleBySlug } from '../hooks/useArticleBySlug';
import { deleteArticle, updateArticleVote } from '../services/articleService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';
import { ClockIcon, SignalIcon, CalendarIcon, EyeIcon, ThumbUpIcon, ThumbDownIcon } from '../assets/icons';
import styles from './ArticlePage.module.css';

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

  const { view_count, likes, dislikes } = article || {};

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
    if (article) document.title = `${article.title} - BlenderForge`;
    return () => { document.title = 'BlenderForge'; };
  }, [article]);

  const articleContentHtml = useMemo(() => {
    if (!article?.content) return '<p>No content available.</p>';

    let contentToParse = article.content;

    if (typeof article.content === 'string') {
      try {
        contentToParse = JSON.parse(article.content);
      } catch (e) {
        console.error("Error parsing article content JSON:", e);
        return `<p>${article.content}</p>`;
      }
    }

    if (typeof contentToParse === 'object' && contentToParse !== null && contentToParse.type === 'doc' && Array.isArray(contentToParse.content)) {
      return generateHTML(contentToParse, [StarterKit, Image]);
    }

    return `<p>Content format not recognized or invalid.</p>`;
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

  const handleVote = async (voteType) => {
    if (!authUser) {
      alert("Please log in to vote.");
      return;
    }
    if (!article) return;

    if (userVote) {
      alert("You have already voted on this article in this session.");
      return;
    }

    try {
      await updateArticleVote(article.id, voteType);
      if (voteType === 'like') {
        setLocalLikes(prev => prev + 1);
      } else if (voteType === 'dislike') {
        setLocalDislikes(prev => prev + 1);
      }
      setUserVote(voteType);
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert(error.message || 'Failed to submit vote. Please try again.');
    }
  };


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
            <span>{view_count || 0} Views</span>
          </div>
          <div className={styles.voteControls}>
            <Button
              // Removed variant="icon"
              onClick={() => handleVote('like')}
              disabled={userVote === 'like'}
              className={`${styles.voteButton} ${userVote === 'like' ? styles.voted : ''}`}
              leftIcon={<ThumbUpIcon className={styles.interactionIcon} />} // Pass icon via prop
            >
              {localLikes} {/* Number as children */}
            </Button>
            <Button
              // Removed variant="icon"
              onClick={() => handleVote('dislike')}
              disabled={userVote === 'dislike'}
              className={`${styles.voteButton} ${userVote === 'dislike' ? styles.voted : ''}`}
              leftIcon={<ThumbDownIcon className={styles.interactionIcon} />} // Pass icon via prop
            >
              {localDislikes} {/* Number as children */}
            </Button>
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
                <span className={styles.benefitIcon}></span>
                <span>Keep BlenderForge free for everyone</span>
              </div>
              <div className={styles.benefit}>
                <span className={styles.benefitIcon}></span>
                <span>Help us create more content</span>
              </div>
              <div className={styles.benefit}>
                <span className={styles.benefitIcon}></span>
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
                  Don't have an account yet?
                  <Link to="/signup" className={styles.authLink}>Sign up</Link>
                  or
                  <Link to="/login" className={styles.authLink}>sign in</Link>
                  to get started.
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