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
          background: open ? '#eef2ff' : '#f8faff',
          border: `1.5px solid ${open ? '#c7d2fe' : '#e0e7ff'}`,
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = '#f8faff'; e.currentTarget.style.borderColor = '#e0e7ff'; } }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          style={{ color: open ? '#4f46e5' : '#6b7280' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl z-50 animate-slide-up overflow-hidden"
          style={{
            background: '#ffffff',
            border: '1.5px solid #e0e7ff',
            boxShadow: '0 8px 32px rgba(79,70,229,0.12), 0 2px 8px rgba(79,70,229,0.06)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1.5px solid #eef2ff', background: 'linear-gradient(135deg, #f8faff, #f0fdfa)' }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: '#1e1b4b' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-indigo text-[10px]">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold transition-colors"
                style={{ color: '#0d9488' }}
                onMouseEnter={e => e.currentTarget.style.color = '#0f766e'}
                onMouseLeave={e => e.currentTarget.style.color = '#0d9488'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <span className="text-3xl mb-2">🔔</span>
                <p className="text-sm" style={{ color: '#9ca3af' }}>All caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className="px-4 py-3 text-sm cursor-pointer transition-colors duration-150"
                  style={{
                    borderBottom: '1px solid #f1f5ff',
                    background: !n.read ? '#f8faff' : '#ffffff',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                  onMouseLeave={e => e.currentTarget.style.background = !n.read ? '#f8faff' : '#ffffff'}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-slow"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)' }} />
                    )}
                    <div className={!n.read ? '' : 'pl-3.5'}>
                      <p style={{ color: '#374151' }}>{n.message}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
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
