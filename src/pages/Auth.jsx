import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import styles from './Auth.module.css';

export function AuthPage() {
  const { user, loading, configError, firebaseReady, signInEmail, signUpEmail, signInAnonymous } =
    useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className={styles.center}>
        <p className={styles.muted}>Loading…</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || password.length < 6) {
      setError('Enter a valid email and password (min 6 characters).');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') await signInEmail(email.trim(), password);
      else await signUpEmail(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  async function onAnon() {
    setError('');
    setBusy(true);
    try {
      await signInAnonymous();
    } catch (err) {
      setError(err.message || 'Anonymous sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.logo}>Fleet Checklist</h1>
        <p className={styles.tagline}>Daily truck & forklift inspections</p>

        {configError ? <div className={styles.banner}>{configError}</div> : null}

        {firebaseReady ? (
          <>
            <div className={styles.tabs}>
              <button
                type="button"
                className={mode === 'signin' ? styles.tabOn : styles.tab}
                onClick={() => setMode('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={mode === 'signup' ? styles.tabOn : styles.tab}
                onClick={() => setMode('signup')}
              >
                Create account
              </button>
            </div>

            <form className={styles.form} onSubmit={onSubmit}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className={styles.label} htmlFor="pw">
                Password
              </label>
              <input
                id="pw"
                className={styles.input}
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error ? <p className={styles.error}>{error}</p> : null}
              <button type="submit" className={styles.primary} disabled={busy}>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div className={styles.divider}>or</div>
            <button type="button" className={styles.secondary} disabled={busy} onClick={onAnon}>
              Continue without account (dev)
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
