import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuthStore();

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
