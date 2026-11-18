import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requireAgent = false }) {
  const { user, loading, isAgent } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAgent && !isAgent) {
    return <div className="error-message">Access denied. Agent role required.</div>;
  }

  return children;
}
