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

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header
      className="sticky top-0 z-40 h-14"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid #e0e7ff',
        boxShadow: '0 1px 8px rgba(79,70,229,0.08)',
      }}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}
          >
            IF
          </div>
          <span
            className="text-base font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            ImpactFlow
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)', boxShadow: '0 2px 6px rgba(79,70,229,0.3)' }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium" style={{ color: '#374151' }}>{user.name}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: user.role === 'faculty' ? '#eef2ff' : '#f0fdfa', color: user.role === 'faculty' ? '#4338ca' : '#0f766e', border: `1px solid ${user.role === 'faculty' ? '#c7d2fe' : '#99f6e4'}` }}
              >
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
            style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
