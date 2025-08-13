import React, { useState, useCallback, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

import { useAuth } from '../../../context/AuthContext';
import Button from '../Button/Button';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import { CreateIcon, UserIcon, MenuIcon, CloseIcon } from '../../../assets/icons';

const MODERATOR_UID = '2c3ecfda-2f41-4ee6-ba11-57e567eeb618';

const NAVIGATION_ITEMS = [
{ to: '/knowledge-base', label: 'Knowledge Base' },
{ to: '/marketplace', label: 'Marketplace' }
// { to: '/showcase', label: 'Showcase' }
];

const Header = () => {
const { user } = useAuth();

const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isCreateOpen, setIsCreateOpen] = useState(false);
const location = useLocation();

const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
const toggleCreateMenu = useCallback(() => setIsCreateOpen(prev => !prev), []);
const closeCreateMenu = useCallback(() => setIsCreateOpen(false), []);

useEffect(() => {
// Close the create dropdown whenever the route changes
setIsCreateOpen(false);
}, [location.pathname]);

useEffect(() => {
const onKeyDown = (e) => {
if (e.key === 'Escape') {
setIsCreateOpen(false);
}
};
if (isCreateOpen) {
document.addEventListener('keydown', onKeyDown);
}
return () => document.removeEventListener('keydown', onKeyDown);
}, [isCreateOpen]);

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
          {/* Create dropdown anchor */}
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
            {/* Two explicit actions on mobile for easier tapping */}
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