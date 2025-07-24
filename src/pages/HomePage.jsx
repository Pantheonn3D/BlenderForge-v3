// src/pages/HomePage.jsx

import React from 'react';
import Hero from '../components/Hero/Hero';
import StatsSection from '../components/StatsSection/StatsSection';
import ArticlesSection from '../components/ArticlesSection/ArticlesSection';
import ProductSection from '../components/ProductSection/ProductSection';

const HomePage = () => {
  return (
    <>
      <Hero />
      <StatsSection />
      {/* NEW: Featured Products Section with enhanced header and distinct styling */}
      <ProductSection
        title="Featured Products"
        description="Discover the top-rated and newest tools for Blender."
        filters={{ orderBy: 'created_at', ascending: false, limit: 3 }} // Fetch 3 newest products
        linkTo="/marketplace?sort=newest" // Link to Marketplace sorted by newest
        headerVariant="featured" // NEW: Pass the 'featured' variant to SectionHeader
      />
      {/* Existing Most Viewed Articles Section */}
      <ArticlesSection
        title="Most Viewed Articles"
        description="Discover the articles that the community loves most."
        filters={{ orderBy: 'view_count', ascending: false, limit: 3 }}
        linkTo="/knowledge-base?sort=views"
      />
      {/* Existing Recent Articles Section */}
      <ArticlesSection
        title="Recent Articles"
        description="Stay up-to-date with our latest knowledge base entries."
        filters={{ orderBy: 'created_at', ascending: false, limit: 3 }}
        linkTo="/knowledge-base?sort=newest"
      />
    </>
  );
};

export default HomePage;