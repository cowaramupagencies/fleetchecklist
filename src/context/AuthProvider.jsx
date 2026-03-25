import { useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase.js';
import { ensureUserDoc } from '../services/users.js';
import { AuthContext } from './auth-context.js';

export function AuthProvider({ children }) {
  const firebaseReady = isFirebaseConfigured() && !!auth;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => firebaseReady);

  const configError = !firebaseReady
    ? 'Firebase is not configured. Add .env.local with your project keys.'
    : null;

  useEffect(() => {
    if (!firebaseReady) {
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensureUserDoc(u.uid, u.email);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [firebaseReady]);

  const value = useMemo(
    () => ({
      user,
      loading,
      configError,
      firebaseReady,
      signInEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signUpEmail: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      signInAnonymous: () => signInAnonymously(auth),
      signOut: () => signOut(auth),
    }),
    [user, loading, configError, firebaseReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
