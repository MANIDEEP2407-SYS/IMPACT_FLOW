import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import NotificationBell from './NotificationBell.jsx';
import api from '../utils/api.js';

export default function Navbar() {
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await api.post('/auth/logout');
    clearUser();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">ImpactFlow</Link>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="hidden sm:block text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
