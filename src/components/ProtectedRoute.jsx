import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

function ProtectedRoute({ allowedRole, children }) {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="auth-loading">Checking your account...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (role !== allowedRole) {
    if (role === 'student') return <Navigate to="/student" replace />;
    if (role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;