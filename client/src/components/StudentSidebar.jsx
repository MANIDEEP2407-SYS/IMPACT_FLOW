import { NavLink } from 'react-router-dom';

function IconHome()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconGrid()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>; }
function IconPlus()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function IconDot()   { return <svg viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="4"/></svg>; }

const links = [
  { to: '/student/dashboard', label: 'Dashboard',  Icon: IconHome },
  { to: '/student/courses',   label: 'My Courses', Icon: IconGrid },
  { to: '/student/tasks',     label: 'My Tasks',   Icon: IconCheck },
  { to: '/student/tasks/new', label: 'Log Task',   Icon: IconPlus },
];

export default function StudentSidebar() {
  return (
    <aside
      className="w-56 shrink-0 hidden md:flex flex-col pt-6 px-3 gap-1"
      style={{ background: '#ffffff', borderRight: '1.5px solid #e0e7ff', boxShadow: '2px 0 8px rgba(79,70,229,0.04)' }}
    >
      <p className="px-3 mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: '#5eead4' }}>Student</p>

      {links.map((l, i) => (
        <NavLink key={l.to} to={l.to}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            fontSize: 13.5, fontWeight: 600, transition: 'all 0.18s',
            background: isActive ? 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' : 'transparent',
            border: isActive ? '1.5px solid #99f6e4' : '1.5px solid transparent',
            color: isActive ? '#0f766e' : '#6b7280',
            boxShadow: isActive ? '0 2px 8px rgba(13,148,136,0.12)' : 'none',
          })}
        >
          <div style={{ width: 16, height: 16, flexShrink: 0 }}><l.Icon /></div>
          {l.label}
        </NavLink>
      ))}

      <div className="mt-auto mb-4 px-1">
        <div className="rounded-xl p-3 text-xs"
          style={{ background: 'linear-gradient(135deg, #f0fdfa, #eef2ff)', border: '1.5px solid #99f6e4' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div style={{ width: 8, height: 8, color: '#0d9488', flexShrink: 0 }}><IconDot /></div>
            <span className="font-bold" style={{ color: '#0f766e' }}>Student Portal</span>
          </div>
          <p style={{ color: '#6b7280', lineHeight: 1.5 }}>Log tasks, join teams &amp; submit milestones</p>
        </div>
      </div>
    </aside>
  );
}
