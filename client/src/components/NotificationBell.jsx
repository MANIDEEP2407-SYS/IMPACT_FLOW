import { useEffect, useRef, useState } from 'react';
import useNotificationStore from '../store/notificationStore.js';

export default function NotificationBell() {
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl transition-all duration-200"
        aria-label="Notifications"
        style={{
          background: open ? 'rgba(192,193,255,0.2)' : 'transparent',
          border: `1.5px solid ${open ? 'var(--border-neon)' : 'transparent'}`,
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'rgba(192,193,255,0.18)'; e.currentTarget.style.borderColor = 'var(--border-neon)'; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          style={{ color: open ? 'var(--neon-300)' : 'var(--text-secondary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
            style={{ background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-300))', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl z-50 animate-slide-up overflow-hidden"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 18px 40px rgba(15,23,42,0.12), 0 0 20px rgba(99,102,241,0.08)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border-glass)', background: 'var(--surface-muted)' }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-indigo text-[10px]">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold transition-colors"
                style={{ color: 'var(--cyber-300)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cyber-700)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--cyber-300)'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto glass-scroll">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <svg className="w-8 h-8 mb-2" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className="px-4 py-3 text-sm cursor-pointer transition-colors duration-150"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: !n.read ? 'rgba(192,193,255,0.16)' : 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,193,255,0.16)'}
                  onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(192,193,255,0.16)' : 'transparent'}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-slow"
                        style={{ background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-300))' }} />
                    )}
                    <div className={!n.read ? '' : 'pl-3.5'}>
                      <p style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
