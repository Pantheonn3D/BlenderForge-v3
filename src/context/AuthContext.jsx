// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ConfirmationModal from '../components/UI/ConfirmationModal/ConfirmationModal';
// Tooltip and icon imports are no longer needed here

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // --- NEW: Add state for modal content ---
  const [modalContent, setModalContent] = useState({});

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  // --- MODIFIED: openLoginPrompt now accepts content ---
  const openLoginPrompt = (content = {}) => {
    setModalContent({
      title: content.title || "Login Required",
      message: content.message || "Please log in or create a free account to use this feature.",
      tooltip: content.tooltip || null,
    });
    setIsLoginPromptOpen(true);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut: () => supabase.auth.signOut(),
    openLoginPrompt, // Expose the updated function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* --- MODIFIED: The modal now uses dynamic content from state --- */}
      <ConfirmationModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onConfirm={() => {
          setIsLoginPromptOpen(false);
          navigate('/login');
        }}
        title={modalContent.title}
        message={modalContent.message}
        tooltipContent={modalContent.tooltip} // Pass tooltip content as a prop
        confirmText="Log In / Sign Up"
        cancelText="Maybe Later"
        variant="info"
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};