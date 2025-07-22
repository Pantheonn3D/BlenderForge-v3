// src/main.jsx - Add the ErrorBoundary

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary'; // Add this
import App from './App';
import ScrollToTop from './utils/ScrollToTop';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary> {/* Add this wrapper */}
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary> {/* Close the wrapper */}
  </React.StrictMode>
);