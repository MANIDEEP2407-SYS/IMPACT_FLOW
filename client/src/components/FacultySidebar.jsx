import { NavLink } from 'react-router-dom';

function IconHome()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconBookOpen(){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>; }
function IconPlus()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }

const links = [
  { to: '/faculty/dashboard',   label: 'Dashboard',  Icon: IconHome },
  { to: '/faculty/courses',     label: 'My Courses', Icon: IconBookOpen },
  { to: '/faculty/courses/new', label: 'New Course', Icon: IconPlus },
];

export default function FacultySidebar() {
  return (
    <aside
      className="w-56 shrink-0 hidden md:flex flex-col pt-6 px-3 gap-1"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-glass)',
        boxShadow: '2px 0 20px rgba(15,23,42,0.05)',
      }}
    >
      <p className="px-3 mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--neon-500)' }}>Faculty</p>

      {links.map((l) => (
        <NavLink key={l.to} to={l.to}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            fontSize: 13.5, fontWeight: 600, transition: 'all 0.2s',
            background: isActive ? 'rgba(192,193,255,0.2)' : 'transparent',
            border: isActive ? '1px solid var(--border-neon)' : '1px solid transparent',
            color: isActive ? '#f7f8ff' : 'var(--text-secondary)',
            boxShadow: isActive ? '0 0 15px rgba(192,193,255,0.16)' : 'none',
            position: 'relative',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div style={{
                  position: 'absolute', left: -3, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: '60%', borderRadius: 2,
                  background: 'linear-gradient(180deg, var(--neon-400), var(--cyber-400))',
                  boxShadow: '0 0 8px rgba(99,102,241,0.2)',
                }} />
              )}
              <div style={{ width: 16, height: 16, flexShrink: 0 }}><l.Icon /></div>
              {l.label}
            </>
          )}
        </NavLink>
      ))}

      <div className="mt-auto mb-4 px-1">
        <div className="rounded-xl p-3 text-xs"
          style={{
            background: 'rgba(192,193,255,0.16)',
            border: '1px solid var(--border-neon)',
            backdropFilter: 'blur(8px)',
          }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-400))', boxShadow: '0 0 6px rgba(99,102,241,0.2)' }} />
            <span className="font-bold" style={{ color: 'var(--neon-700)' }}>Faculty Portal</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Manage courses &amp; review student progress</p>
        </div>
      </div>
    </aside>
  );
}
