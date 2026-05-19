import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import NotificationBell from './NotificationBell.jsx';
import HistoryControls from './HistoryControls.jsx';
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
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-glass)',
        boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      }}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        <div className="flex items-center gap-3">
          <HistoryControls />
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #2dd4bf)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.18)',
              }}
            >
              IF
            </div>
            <span
              className="text-base font-black tracking-tight transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc, #5eead4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ImpactFlow
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #2dd4bf)',
                  boxShadow: '0 0 12px rgba(99,102,241,0.18)',
                }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: user.role === 'faculty' ? 'var(--neon-50)' : 'var(--cyber-50)',
                  color: user.role === 'faculty' ? 'var(--neon-600)' : 'var(--cyber-600)',
                  border: `1px solid ${user.role === 'faculty' ? 'var(--border-neon)' : 'var(--border-teal)'}`,
                }}
              >
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.boxShadow = 'none'; }}
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
