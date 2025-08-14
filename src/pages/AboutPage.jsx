import React from 'react';
import styles from './AboutPage.module.css';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>About BlenderForge</h1>
        <p className={styles.subtitle}>
          Forging a stronger, more connected Blender community through shared knowledge and creativity.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Our Mission</h2>
        <p>
          At BlenderForge, our mission is to create a vibrant, centralized hub where Blender enthusiasts of all skill levels can thrive. We believe that learning and creating should be a collaborative, empowering journey. Our platform is designed for users to not only find high-quality tutorials and assets but also to share their own expertise and earn from their creations.
        </p>
      </div>

      <div className={styles.section}>
        <h2>What We Offer</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>Knowledge Base</h3>
            <p>A community-driven library of articles, tutorials, and guides. Learn new workflows, discover advanced techniques, or <Link to="/create">share your own knowledge</Link> with fellow artists.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Marketplace</h3>
            <p>A secure place to buy and sell Blender addons and assets. We empower creators by providing a platform to earn from their work, powered by Stripe for secure and reliable payments.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Creator Focused</h3>
            <p>Our platform is built for the community. From a moderation system that ensures content quality to a simple upload process, we're focused on making BlenderForge the best place to be a Blender creator.</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Meet the Creator</h2>
        <div className={styles.creatorProfile}>
          <div className={styles.creatorImage}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={styles.creatorBio}>
            <p>
              Hello! I'm the founder and developer of BlenderForge. As a long-time Blender user, I often found myself jumping between dozens of sites for tutorials, forums for advice, and marketplaces for assets. I created BlenderForge to be the platform I always wished I had: a single place where the community's best resources could live and grow together.
            </p>
            <p>
              My goal is to empower creators like you. Whether you're taking your first steps in 3D or you're a seasoned professional, I hope BlenderForge helps you learn something new, find the perfect tool, and share your passion with others.
            </p>
          </div>
        </div>
      </div>

       <div className={styles.section}>
        <h2>Join Our Community</h2>
        <p>
          BlenderForge is more than just a website; it's a community. We invite you to <Link to="/knowledge-base">explore the content</Link>, leave reviews on products, and <Link to="/marketplace/upload">contribute your own work</Link>. Together, we can build the ultimate resource for Blender users everywhere.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;