// src/pages/SignUpPage.jsx (Modified to remove email sign-up)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './AuthPage.module.css';
import Button from '../components/UI/Button/Button';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../assets/icons/GoogleIcon';

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Supabase handles the redirect flow, so no navigation is needed here.
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <header className={styles.authHeader}>
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logoTitle}>BlenderForge</span>
          </Link>
        </header>
        <h1 className={styles.title}>Join BlenderForge</h1>
        <p className={styles.subtitle}>Sign in or create an account with a single click.</p>
        
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <div className={styles.ssoContainer}>
          <Button 
            type="button" 
            variant="secondary" 
            fullWidth 
            onClick={handleGoogleLogin} 
            disabled={loading} 
            leftIcon={<GoogleIcon style={{width: '1.2em', height: '1.2em'}} />}
          >
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </Button>
        </div>
        
        <p className={styles.redirectLink}>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;