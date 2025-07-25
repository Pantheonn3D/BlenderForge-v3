// src/components/UI/Header/Header.jsx

import React, { useState, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

import { useAuth } from '../../../context/AuthContext';
import Button from '../Button/Button';
import { CreateIcon, UserIcon, MenuIcon, CloseIcon } from '../../../assets/icons';

const NAVIGATION_ITEMS = [
  { to: '/knowledge-base', label: 'Knowledge Base' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/showcase', label: 'Showcase' }
];

const Header = () => {
  const { user } = useAuth(); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

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
        </nav>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          {user ? (
            <>
              <Button as={Link} to="/create" variant="secondary" size="md" leftIcon={<CreateIcon />}>
                Create
              </Button>
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
            // NEW: Pass the icon as leftIcon prop instead of children
            leftIcon={isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          >
            {/* REMOVED: No children here, as the icon is passed as leftIcon */}
          </Button>
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
          <div className={styles.mobileActions}>
            {user ? (
              <>
                <Button as={Link} to="/create" variant="secondary" fullWidth onClick={closeMobileMenu} leftIcon={<CreateIcon />}>Create</Button>
                <Button as={Link} to={`/profile/${user.id}`} variant="secondary" fullWidth onClick={closeMobileMenu} leftIcon={<UserIcon />}>Profile</Button>
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