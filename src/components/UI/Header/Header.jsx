// src/components/UI/Header/Header.jsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

import { useAuth } from '../../../context/AuthContext';
import { useNotificationContext } from '../../../context/NotificationContext';
import Button from '../Button/Button';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel';
import { CreateIcon, UserIcon, MenuIcon, CloseIcon, BellIcon } from '../../../assets/icons';

const MODERATOR_UID = '2c3ecfda-2f41-4ee6-ba11-57e567eeb618';

const NAVIGATION_ITEMS = [
{ to: '/knowledge-base', label: 'Knowledge Base' },
{ to: '/marketplace', label: 'Marketplace' }
];

const Header = () => {
const { user } = useAuth();
const { unreadCount } = useNotificationContext();

const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isCreateOpen, setIsCreateOpen] = useState(false);
const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
const location = useLocation();
const notificationRef = useRef(null);

const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
const toggleCreateMenu = useCallback(() => setIsCreateOpen(prev => !prev), []);
const closeCreateMenu = useCallback(() => setIsCreateOpen(false), []);
const toggleNotifications = useCallback(() => setIsNotificationsOpen(prev => !prev), []);
const closeNotifications = useCallback(() => setIsNotificationsOpen(false), []);

useEffect(() => {
// Close the create dropdown whenever the route changes
setIsCreateOpen(false);
closeNotifications(); // Also close notifications on route change
}, [location.pathname, closeNotifications]);

useEffect(() => {
const onKeyDown = (e) => {
if (e.key === 'Escape') {
setIsCreateOpen(false);
closeNotifications();
}
};
if (isCreateOpen || isNotificationsOpen) {
document.addEventListener('keydown', onKeyDown);
}
return () => document.removeEventListener('keydown', onKeyDown);
}, [isCreateOpen, isNotificationsOpen, closeNotifications]);

useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        closeNotifications();
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen, closeNotifications]);


const handleLogoClick = () => {
if (location.pathname === '/') {
window.scrollTo({ top: 0, behavior: 'smooth' });
}
};

const isModerator = user?.id === MODERATOR_UID;

return (
<header className={styles.siteHeader}>
<div className={styles.headerContainer}>
<Link 
       to="/" 
       className={styles.logoLink} 
       aria-label="BlenderForge - Homepage"
       onClick={handleLogoClick}
     >
<span className={styles.title}>BlenderForge</span>
</Link>

    {/* Desktop Navigation */}
    <nav className={styles.desktopNav}>
      {NAVIGATION_ITEMS.map(({ to, label }) => (
        <NavLink key={to} to={to} className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          {label}
        </NavLink>
      ))}
      {isModerator && (
         <NavLink to="/moderation/articles" className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
           Moderate Articles
         </NavLink>
      )}
    </nav>

    {/* Desktop Actions */}
    <div className={styles.desktopActions}>
      {user ? (
        <>
          <div className={styles.createDropdown}>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<CreateIcon />}
              onClick={toggleCreateMenu}
              aria-haspopup="menu"
              aria-expanded={isCreateOpen}
              aria-controls="create-menu"
            >
              Create
            </Button>
            <DropdownMenu
              isOpen={isCreateOpen}
              onClose={closeCreateMenu}
              position="bottom-right"
            >
              <Link to="/create" role="menuitem" onClick={closeCreateMenu}>
                Create Article
              </Link>
              <Link to="/marketplace/upload" role="menuitem" onClick={closeCreateMenu}>
                Upload Product
              </Link>
            </DropdownMenu>
          </div>

          <div className={styles.notificationWrapper} ref={notificationRef}>
            {/* --- THIS IS THE FIX --- */}
            <Button
              variant="ghost"
              size="md"
              onClick={toggleNotifications}
              aria-haspopup="true"
              aria-expanded={isNotificationsOpen}
              aria-controls="notifications-panel"
              className={styles.notificationButton}
              leftIcon={<BellIcon />} // <-- The BellIcon is now passed as the leftIcon prop
            >
              {/* No text child is needed here */}
              {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
            </Button>
            <NotificationsPanel isOpen={isNotificationsOpen} onClose={closeNotifications} />
          </div>

          <Button as={Link} to={`/profile/${user.id}`} variant="ghost" size="md" leftIcon={<UserIcon />}>
            Profile
          </Button>
        </>
      ) : (
        <Button as={Link} to="/login" state={{ from: location }} variant="primary" size="md" leftIcon={<UserIcon />}>
          Sign In
        </Button>
      )}
    </div>

    {/* Mobile Menu Toggle */}
    <div className={styles.mobileToggle}>
      <Button 
        variant="ghost" 
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
        leftIcon={isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      />
    </div>
  </div>

  {/* Mobile Menu Overlay */}
  <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
    <nav className={styles.mobileNav}>
      {NAVIGATION_ITEMS.map(({ to, label }) => (
        <NavLink key={to} to={to} className={({isActive}) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`} onClick={closeMobileMenu}>
          {label}
        </NavLink>
      ))}
      {isModerator && (
         <NavLink to="/moderation/articles" className={({isActive}) => `${styles.mobileNavLink} ${isActive ? styles.active : ''}`} onClick={closeMobileMenu}>
           Moderate Articles
         </NavLink>
      )}
      <div className={styles.mobileActions}>
        {user ? (
          <>
            <Button as={Link} to="/create" variant="secondary" fullWidth onClick={closeMobileMenu} leftIcon={<CreateIcon />}>
              Create Article
            </Button>
            <Button as={Link} to="/marketplace/upload" variant="secondary" fullWidth onClick={closeMobileMenu} leftIcon={<CreateIcon />}>
              Upload Product
            </Button>
            <Button as={Link} to={`/profile/${user.id}`} variant="secondary" fullWidth onClick={closeMobileMenu} leftIcon={<UserIcon />}>
              Profile
            </Button>
          </>
        ) : (
          <Button as={Link} to="/login" state={{ from: location }} variant="primary" fullWidth onClick={closeMobileMenu} leftIcon={<UserIcon />}>
            Sign In
          </Button>
        )}
      </div>
    </nav>
  </div>
</header>
);
};

export default Header;