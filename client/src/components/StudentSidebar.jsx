import { NavLink } from 'react-router-dom';

function IconHome()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconGrid()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconCheck()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>; }
function IconPlus()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IconUser()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }

const links = [
  { to: '/student/dashboard', label: 'Dashboard',  Icon: IconHome },
  { to: '/student/courses',   label: 'My Courses', Icon: IconGrid },
  { to: '/student/tasks',     label: 'My Tasks',   Icon: IconCheck },
  { to: '/student/tasks/new', label: 'Log Task',   Icon: IconPlus },
  { to: '/student/profile',   label: 'Profile',    Icon: IconUser },
];

export default function StudentSidebar() {
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
      <p className="px-3 mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--cyber-500)' }}>Student</p>

      {links.map((l) => (
        <NavLink key={l.to} to={l.to}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            fontSize: 13.5, fontWeight: 600, transition: 'all 0.2s',
            background: isActive ? 'rgba(60,221,199,0.2)' : 'transparent',
            border: isActive ? '1px solid var(--border-cyber)' : '1px solid transparent',
            color: isActive ? '#f3fffd' : 'var(--text-secondary)',
            boxShadow: isActive ? '0 0 15px rgba(60,221,199,0.14)' : 'none',
            position: 'relative',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div style={{
                  position: 'absolute', left: -3, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: '60%', borderRadius: 2,
                  background: 'linear-gradient(180deg, var(--cyber-400), var(--neon-400))',
                  boxShadow: '0 0 8px rgba(20,184,166,0.3)',
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
            background: 'rgba(60,221,199,0.16)',
            border: '1px solid var(--border-cyber)',
            backdropFilter: 'blur(8px)',
          }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyber-400), var(--neon-400))', boxShadow: '0 0 6px rgba(20,184,166,0.3)' }} />
            <span className="font-bold" style={{ color: 'var(--cyber-700)' }}>Student Portal</span>
          </div>
           <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Log tasks, join teams &amp; submit milestones</p>
        </div>
      </div>
    </aside>
  );
}
