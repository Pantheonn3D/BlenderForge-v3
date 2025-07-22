// src/layouts/MainLayout.jsx (Complete & Updated)

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import the auth hook
import styles from './MainLayout.module.css'; // <-- 2. Import the new CSS module

import AnnouncementBanner from '../components/UI/AnnouncementBanner/AnnouncementBanner';
import Header from '../components/UI/Header/Header';
import Footer from '../components/UI/Footer/Footer';
import Spinner from '../components/UI/Spinner/Spinner'; // <-- 3. Import the Spinner

const MainLayout = () => {
  // --- 4. Get the loading state from the auth context ---
  const { loading } = useAuth();

  // --- 5. Implement the "Loading Gate" ---
  // If the initial auth check is running, show a full-page spinner.
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={48} />
      </div>
    );
  }

  // Once loading is false, render the full application layout.
  return (
    <div className={styles.layout}>
      <AnnouncementBanner />
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;