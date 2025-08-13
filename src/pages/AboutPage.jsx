import React from 'react';
import styles from './AboutPage.module.css';

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
          At BlenderForge, our mission is to create a vibrant, centralized hub where Blender enthusiasts of all skill levels can thrive. We believe that learning and creating should be a collaborative journey. We provide a platform for users to not only find high-quality tutorials and assets but also to share their own creations and expertise with the world.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Meet the Creator</h2>
        <div className={styles.creatorProfile}>
          <div className={styles.creatorImage}>
            {/* You can replace this with an actual image of yourself! */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={styles.creatorBio}>
            <p>
              Hello! I'm [Your Name], the founder of BlenderForge. As a long-time Blender user and 3D artist, I often found myself jumping between dozens of sites for tutorials, forums for advice, and marketplaces for assets. I created BlenderForge to be the platform I always wished I had—a single place where the community's best resources could live and grow together.
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
          BlenderForge is more than just a website; it's a community. We invite you to dive in, explore the content, leave reviews on products, and contribute your own articles. Together, we can build the ultimate resource for Blender users everywhere.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;