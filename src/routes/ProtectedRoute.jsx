import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function ProtectedRoute({ children }) {
  const { user, loading, configError, firebaseReady } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#5c5c5c' }}>Loading…</div>
    );
  }

  if (!firebaseReady || configError) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
