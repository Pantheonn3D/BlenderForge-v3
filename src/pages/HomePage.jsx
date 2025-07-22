// src/pages/HomePage.jsx

import React from 'react';
import Hero from '../components/Hero/Hero';
import StatsSection from '../components/StatsSection/StatsSection';
import ArticlesSection from '../components/ArticlesSection/ArticlesSection';

const HomePage = () => {
  return (
    <>
      <Hero />
      <StatsSection />
      <ArticlesSection />
    </>
  );
};

export default HomePage;