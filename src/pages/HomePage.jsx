// src/pages/HomePage.jsx - Temporary test

import React from 'react';
import Hero from '../components/Hero/Hero';
// import StatsSection from '../components/StatsSection/StatsSection'; // Comment out
import ArticlesSection from '../components/ArticlesSection/ArticlesSection';

const HomePage = () => {
  return (
    <>
      <Hero />
      {/* <StatsSection /> */} {/* Comment out temporarily */}
      <ArticlesSection />
    </>
  );
};

export default HomePage;