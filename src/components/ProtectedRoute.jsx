// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './UI/Spinner/Spinner'; // Optional: for a better loading experience

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a spinner while the auth state is being determined
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size={48} />
      </div>
    );
  }

  // If loading is finished and there's no user, redirect to login
  if (!user) {
    // Save the location the user was trying to go to.
    // We can redirect them back here after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If loading is finished and there IS a user, render the child component
  return children;
};

export default ProtectedRoute;