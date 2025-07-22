// src/pages/LoginPage.jsx (Final Corrected OAuth Flow)

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './AuthPage.module.css';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/UI/Button/Button';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../assets/icons/GoogleIcon';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // --- THIS IS THE FIX ---
      // We DO NOT navigate here. Supabase will handle the redirect to Google.
      // After successful Google login, Supabase redirects back to our site,
      // and the onAuthStateChange listener in AuthContext will handle the session.
    } catch (err) {
      setError(err.message);
      setLoading(false); // Only set loading to false if there's an error starting the process.
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate(from, { replace: true }); 
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <header className={styles.authHeader}><Link to="/" className={styles.logoLink}><span className={styles.logoTitle}>BlenderForge</span></Link></header>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Welcome back to BlenderForge.</p>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <Button type="button" variant="secondary" fullWidth onClick={handleGoogleLogin} disabled={loading} leftIcon={<GoogleIcon style={{width: '1.2em', height: '1.2em'}} />}>Continue with Google</Button>
        <div className={styles.divider}>OR</div>
        <form onSubmit={handleEmailLogin} className={styles.form}>
          <div className={styles.formGroup}><label htmlFor="email" className={styles.label}>Email</label><input id="email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} /></div>
          <div className={styles.formGroup}><label htmlFor="password" className={styles.label}>Password</label><input id="password" type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} /></div>
          <Button type="submit" variant="primary" fullWidth disabled={loading} className={styles.submitButton}>{loading ? 'Signing In...' : 'Sign In with Email'}</Button>
        </form>
        <p className={styles.redirectLink}>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;