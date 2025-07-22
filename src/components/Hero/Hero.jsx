import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import Button from '../UI/Button/Button';
import { CreateIcon, SearchIcon } from '../../assets/icons'; // Make sure SearchIcon is in your icons folder/index

const Hero = () => {
  const user = true; // Mock user, replace with real auth context later

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground}></div>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroAccent}>The Ultimate</span>
          <br />
          Blender Hub
        </h1>
        <p className={styles.heroDescription}>
          Welcome to BlenderForge, your centralized place for assets, art, and tutorials.
          Find what you need to create stunning 3D content.
        </p>
        <div className={styles.heroActions}>
          <Button as={Link} to="/knowledge-base" variant="primary" size="lg" rightIcon={<SearchIcon />}>
            Explore Tutorials
          </Button>
          <Button as={Link} to={user ? '/create' : '/login'} variant="secondary" size="lg" leftIcon={<CreateIcon />}>
            Create Article
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;