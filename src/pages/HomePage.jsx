// src/pages/HomePage.jsx

import React from 'react';
import Hero from '../components/Hero/Hero';
import StatsSection from '../components/StatsSection/StatsSection';
import ArticlesSection from '../components/ArticlesSection/ArticlesSection';
import ProductSection from '../components/ProductSection/ProductSection';
import SellOnBlenderForgeBanner from '../components/SellOnBlenderForgeBanner/SellOnBlenderForgeBanner';

const HomePage = () => {
  return (
    <>
      {/* 1. Hero Section (No change) */}
      <Hero />

      {/* 2. Featured Products Section (Moved up) */}
      <ProductSection
        title="Featured Products"
        description="Discover the top-rated and newest tools for Blender."
        filters={{ orderBy: 'created_at', ascending: false, limit: 3 }} 
        linkTo="/marketplace?sort=newest"
        headerVariant="featured"
      />

      {/* 3. Sell Banner (Placed immediately after products) */}
      <SellOnBlenderForgeBanner />
      
      {/* 4. Combined & Retitled Articles Section */}
      <ArticlesSection
        title="From the Knowledge Base"
        description="Explore popular guides, tutorials, and articles from the community."
        filters={{ orderBy: 'view_count', ascending: false, limit: 3, is_published: true }}
        linkTo="/knowledge-base"
      />

      {/* 5. Stats Section (Moved to the end for social proof) */}
      <StatsSection />
    </>
  );
};

export default HomePage;