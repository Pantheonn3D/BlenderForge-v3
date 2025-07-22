// src/pages/ArticlePage.jsx (Updated with working delete functionality)

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArticleBySlug } from '../hooks/useArticleBySlug';
import { useAuth } from '../context/AuthContext';
import { deleteArticle } from '../services/articleService'; // Add this import
import { checkUserSupporterStatus } from '../services/supportersService';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import Button from '../components/UI/Button/Button';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';
import styles from './ArticlePage.module.css';

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { article, isLoading, error } = useArticleBySlug(slug);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Add this state
  const [supporterStatus, setSupporterStatus] = useState({ isSupporter: false, supporterData: null });
  const [isCheckingSupporterStatus, setIsCheckingSupporterStatus] = useState(false);

  const isAuthor = useMemo(() => {
    if (!authUser || !article) return false;
    return authUser.id === article.user_id;
  }, [authUser, article]);

  useEffect(() => {
    if (article) document.title = `${article.title} - BlenderForge`;
    return () => { document.title = 'BlenderForge'; };
  }, [article]);

  // Check supporter status when user is available
  useEffect(() => {
    const checkStatus = async () => {
      if (authUser) {
        setIsCheckingSupporterStatus(true);
        try {
          const status = await checkUserSupporterStatus(authUser.id);
          setSupporterStatus(status);
        } catch (error) {
          console.error('Failed to check supporter status:', error);
        } finally {
          setIsCheckingSupporterStatus(false);
        }
      }
    };

    checkStatus();
  }, [authUser]);

  const contentBlocks = useMemo(() => {
    if (!article?.content) return [];
    try {
      const blocks = JSON.parse(article.content);
      return Array.isArray(blocks) ? blocks : [];
    } catch (e) {
      return [{ id: 'legacy', type: 'text', content: article.content }];
    }
  }, [article?.content]);
  
  const renderBlock = (block) => {
    switch (block.type) {
      case 'text':
        return <div dangerouslySetInnerHTML={{ __html: block.content }} />;
      case 'image':
        return (
          <div className={styles.imageBlock}>
            <img src={block.content} alt="" className={styles.blockImage} loading="lazy" />
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Updated delete handler with proper implementation
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
      
      <article className={styles.articleContainer}>
        <Link to="/knowledge-base" className={styles.backLink}>← Back to all articles</Link>
        
        <div className={styles.heroSection}>
          {article.image_url && <img src={article.image_url} alt={article.title} className={styles.heroImage} />}
          <div className={styles.heroTextContent}>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.description}>{article.description}</p>
          </div>
        </div>
        
        <div className={styles.metaBar}>
          {article.profiles && (
            <div className={styles.authorInfo}>
              <img 
                src={article.profiles.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.profiles.username || 'A')}`} 
                alt={article.profiles.username} 
                className={styles.authorAvatar} 
              />
              <div className={styles.authorDetails}>
                <Link to={`/profile/${article.user_id}`} className={styles.authorName}>
                  By {article.profiles.username || 'Anonymous'}
                </Link>
                <time className={styles.publishDate} dateTime={article.created_at}>
                  Published on {formatDate(article.created_at)}
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
        
        <div className={styles.content}>
          {contentBlocks.map(block => (
            <div key={block.id}>{renderBlock(block)}</div>
          ))}
        </div>

        {/* Support Module - Updated for better UX */}
        <div className={styles.supportModule}>
          <div className={styles.supportHeader}>
            <div className={styles.supportIcon}></div>
            <h3 className={styles.supportTitle}>
              {supporterStatus.isSupporter ? "Thank You for Your Support!" : "Enjoying This Content?"}
            </h3>
          </div>

          {supporterStatus.isSupporter ? (
            // Thank you message for supporters
            <div className={styles.supporterMessage}>
              <p>
                You're helping make quality Blender content like this possible for everyone in our community. 
                Your support means the world to us!
              </p>
              <div className={styles.supportActions}>
                <Button 
                  as={Link} 
                  to="/supporters" 
                  variant="primary"
                  size="md"
                >
                  View All Supporters
                </Button>
              </div>
            </div>
          ) : (
            // Call to action for non-supporters
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

              {/* Auth CTA for logged out users */}
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
          )}
        </div>
      </article>
    </>
  );
};

export default ArticlePage;