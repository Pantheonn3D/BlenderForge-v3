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

import ArticleModerationPage from './pages/ArticleModerationPage'; // NEW: Import moderation page

import PurchaseSuccessPage from './pages/PurchaseSuccessPage';
import PurchaseCancelPage from './pages/PurchaseCancelPage';

function App() {
  return (
    <Routes>
      {/* Routes without the main layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Routes that use the main layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="knowledge-base/:category/:slug" element={<ArticlePage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="supporters" element={<SupportersPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="marketplace/:slug" element={<ProductPage />} />

        <Route path="purchase-success" element={<PurchaseSuccessPage />} />
        <Route path="purchase-cancel" element={<PurchaseCancelPage />} />

        <Route
          path="profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route path="profile/:userId" element={<ProfilePage />} />

        {/* Protected routes */}
        <Route path="create" element={<ProtectedRoute><CreateArticlePage /></ProtectedRoute>} />
        <Route path="edit/:slug" element={<ProtectedRoute><CreateArticlePage /></ProtectedRoute>} />
        <Route path="profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="marketplace/upload" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />
        <Route path="marketplace/edit/:slug" element={<ProtectedRoute><CreateProductPage /></ProtectedRoute>} />

        {/* NEW: Moderation route, protected by both the router and the component itself */}
        <Route path="moderation/articles" element={<ProtectedRoute><ArticleModerationPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;