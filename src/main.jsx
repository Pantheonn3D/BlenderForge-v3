// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { NotificationProvider } from './context/NotificationContext'; // <-- 1. IMPORT
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import ScrollToTop from './utils/ScrollToTop';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <BookmarkProvider>
            {/* --- 2. WRAP APP WITH THE NOTIFICATION PROVIDER --- */}
            <NotificationProvider>
              <ScrollToTop />
              <App />
            </NotificationProvider>
          </BookmarkProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);