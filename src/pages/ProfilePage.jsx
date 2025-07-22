import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/UI/Spinner/Spinner';
import EmptyState from '../components/UI/EmptyState/EmptyState';
import ArticleCard from '../components/UI/ArticleCard/ArticleCard';
import Button from '../components/UI/Button/Button';
import styles from './ProfilePage.module.css';
import { ChevronRightIcon } from '../assets/icons'; // Changed to ChevronRight

const ProfilePage = () => {
  const { userId } = useParams();
  const { profile, articles, isLoading, error } = useUserProfile(userId);
  const { user: authUser, signOut } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = authUser && authUser.id === userId;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return <div className={styles.stateContainer}><Spinner /></div>;
  }

  if (error || !profile) {
    return <EmptyState title="User Not Found" message="The user you are looking for does not exist." />;
  }

  // Default banner if none is set
  const defaultBanner = 'https://placehold.co/1280x300/1e1e1e/a0a0a0?text=No+Banner';

  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <img 
          src={profile.banner_url || defaultBanner} 
          alt={`${profile.username}'s banner`} 
          className={styles.bannerImage} 
        />
        <div className={styles.headerContent}>
          <img 
            src={profile.avatar_url || 'https://i.pravatar.cc/150'} 
            alt={profile.username} 
            className={styles.profileAvatar} 
          />
          <div className={styles.profileInfo}>
            <h1 className={styles.username}>{profile.username}</h1>
            <p className={styles.joinDate}>
              Joined on {new Date(profile.created_at).toLocaleDateString('en-US', {
                month: 'long', year: 'numeric'
              })}
            </p>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          </div>
          
          {isOwnProfile && (
            <div className={styles.profileActions}>
              <Button variant="secondary" as={Link} to="/profile/edit">
                Edit Profile
              </Button>
              <Button variant="danger" onClick={handleLogout} rightIcon={<ChevronRightIcon />}>
                Log Out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className={styles.articlesSection}>
        <h2 className={styles.sectionTitle}>Articles by {profile.username}</h2>
        {articles.length > 0 ? (
          <div className={styles.articlesGrid}>
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className={styles.noArticles}>This user hasn't published any articles yet.</p>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;