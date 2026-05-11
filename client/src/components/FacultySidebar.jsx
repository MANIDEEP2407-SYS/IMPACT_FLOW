import { NavLink } from 'react-router-dom';

const links = [
  { to: '/faculty/dashboard', label: 'Dashboard' },
  { to: '/faculty/courses', label: 'My Courses' },
  { to: '/faculty/courses/new', label: '+ New Course' },
];

export default function FacultySidebar() {
  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col border-r border-gray-200 bg-white pt-6 px-3 gap-1">
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}
