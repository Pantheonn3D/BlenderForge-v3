// src/App.jsx (Updated with new routes)

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts and Pages
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ArticlePage from './pages/ArticlePage'; 
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CreateArticlePage from './pages/CreateArticlePage';
import EditProfilePage from './pages/EditProfilePage';
import SupportPage from './pages/SupportPage';  // NEW
import SupportersPage from './pages/SupportersPage';  // NEW
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Standalone auth routes without the main layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Routes that use the main header and footer */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="knowledge-base/:category/:slug" element={<ArticlePage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />
        <Route path="support" element={<SupportPage />} />  {/* NEW */}
        <Route path="supporters" element={<SupportersPage />} />  {/* NEW */}
        
        {/* Protected routes */}
        <Route 
          path="create" 
          element={
            <ProtectedRoute>
              <CreateArticlePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="edit/:slug" 
          element={
            <ProtectedRoute>
              <CreateArticlePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile/edit" 
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } 
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;