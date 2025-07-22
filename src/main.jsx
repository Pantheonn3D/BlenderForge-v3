// src/main.jsx (Complete & Updated)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- 1. IMPORT THE AUTH PROVIDER ---
import { AuthProvider } from './context/AuthContext';

import App from './App';
import ScrollToTop from './utils/ScrollToTop';
import './styles/globals.css'; // Note: your path is styles/globals.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* --- 2. WRAP YOUR APP COMPONENTS WITH THE AUTHPROVIDER --- */}
      {/* It should be inside BrowserRouter so all components can use routing and auth */}
      <AuthProvider>
        <ScrollToTop />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);