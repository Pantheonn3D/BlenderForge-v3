// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts and Pages
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ArticlePage from './pages/ArticlePage'; 
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CreateArticlePage from './pages/CreateArticlePage';
import CreateProductPage from './pages/CreateProductPage';
import EditProfilePage from './pages/EditProfilePage';
import SupportPage from './pages/SupportPage';
import SupportersPage from './pages/SupportersPage';
import MarketplacePage from './pages/MarketplacePage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

// Note: The simple ConnectReturn and ConnectRefresh components can be removed
// as we are handling the redirects and UI feedback directly on the EditProfilePage.

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="knowledge-base/:category/:slug" element={<ArticlePage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="supporters" element={<SupportersPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="marketplace/:slug" element={<ProductPage />} />
        
        {/* --- THIS IS THE FIX --- */}
        {/* Add a specific, protected route for the logged-in user's own profile */}
        <Route 
          path="profile" 
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
        />
        {/* This route remains for viewing other users' profiles */}
        <Route path="profile/:userId" element={<ProfilePage />} />
        
        {/* Protected routes */}
        <Route path="create" element={<ProtectedRoute><CreateArticlePage /></ProtectedRoute>} />
        <Route path="edit/:slug" element={<ProtectedRoute><CreateArticlePage /></ProtectedRoute>} />
        <Route path="profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="marketplace/upload" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />
        <Route path="marketplace/edit/:slug" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;