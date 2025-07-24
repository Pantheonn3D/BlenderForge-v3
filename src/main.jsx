// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import ScrollToTop from './utils/ScrollToTop';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* --- THIS IS THE FIX --- */}
      {/* The Router must be the top-level provider */}
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);