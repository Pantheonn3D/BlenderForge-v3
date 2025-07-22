// src/pages/SignUpPage.jsx (Final Corrected OAuth Flow)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './AuthPage.module.css';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/UI/Button/Button';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../assets/icons/GoogleIcon';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // --- THIS IS THE FIX ---
      // We DO NOT navigate here. Supabase handles the redirect flow.
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailSignUp = (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username } },
    })
    .then(({ data, error }) => {
      // This part runs if the call SUCCEEDS or returns a standard error
      if (error) {
        // This is a "clean" error from Supabase (e.g., "User already exists")
        console.error("Supabase returned a standard error:", error);
        setError(error.message);
      } else {
        // This is a successful signup
        alert('Success! Please check your email to confirm your sign up.');
        navigate('/login');
      }
    })
    .catch(err => {
      // --- THIS IS THE MOST IMPORTANT PART ---
      // This will catch ANY crash inside the promise, including the TypeError
      console.error("A critical error was caught in the promise chain:", err);
      setError(err.message || 'A critical error occurred. Please check the console.');
    })
    .finally(() => {
      // This will run no matter what happens
      setLoading(false);
    });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <header className={styles.authHeader}><Link to="/" className={styles.logoLink}><span className={styles.logoTitle}>BlenderForge</span></Link></header>
        <h1 className={styles.title}>Create an Account</h1>
        <p className={styles.subtitle}>Join the BlenderForge community.</p>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <Button type="button" variant="secondary" fullWidth onClick={handleGoogleLogin} disabled={loading} leftIcon={<GoogleIcon style={{width: '1.2em', height: '1.2em'}} />}>Continue with Google</Button>
        <div className={styles.divider}>OR</div>
        <form onSubmit={handleEmailSignUp} className={styles.form}>
          <div className={styles.formGroup}><label htmlFor="username" className={styles.label}>Username</label><input id="username" type="text" className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} /></div>
          <div className={styles.formGroup}><label htmlFor="email" className={styles.label}>Email Address</label><input id="email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} /></div>
          <div className={styles.formGroup}><label htmlFor="password" className={styles.label}>Password</label><input id="password" type="password" className={styles.input} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} /></div>
          <Button type="submit" variant="primary" fullWidth disabled={loading} className={styles.submitButton}>{loading ? 'Creating Account...' : 'Sign Up with Email'}</Button>
        </form>
        <p className={styles.redirectLink}>Already have an account? <Link to="/login">Log In</Link></p>
      </div>
    </div>
  );
};

export default SignUpPage;