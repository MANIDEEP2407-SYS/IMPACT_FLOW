import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import useAuthStore from '../../store/authStore.js';

function IconBook() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function IconGrid() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}

function StatCard({ icon: IconComp, label, value, scheme }) {
  const s = scheme === 'indigo'
    ? { bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '#c7d2fe', color: '#4338ca', sub: '#818cf8', icon: '#4f46e5' }
    : { bg: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', border: '#99f6e4', color: '#0f766e', sub: '#14b8a6', icon: '#0d9488' };
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: s.bg, border: `1.5px solid ${s.border}`, boxShadow: '0 2px 8px rgba(79,70,229,0.06)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid ${s.border}`, color: s.icon }}>
        <div style={{ width: 18, height: 18 }}><IconComp /></div>
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: s.color }}>{value}</p>
        <p className="text-xs font-medium" style={{ color: s.sub }}>{label}</p>
      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  const user = useAuthStore(s => s.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/my').then(r => { setCourses(r.data.courses); setLoading(false); });
  }, []);

  const totalStudents = courses.reduce((a, c) => a + (c.students?.length || 0), 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full animate-fade-in">

          {/* Hero banner */}
          <div
            className="relative rounded-2xl p-6 mb-6 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 55%, #0f766e 100%)',
              boxShadow: '0 8px 24px rgba(79,70,229,0.25)',
            }}
          >
            {/* decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #2dd4bf, transparent)' }} />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest mb-1.5 text-white/60">Faculty Dashboard</p>
              <h1 className="text-2xl font-black text-white mb-1">
                {user?.name?.split(' ')[0]}, your courses are live.
              </h1>
              <p className="text-sm text-white/60">
                {courses.length} course{courses.length !== 1 ? 's' : ''} · {totalStudents} students enrolled
              </p>
            </div>
          </div>

          {/* Stat cards */}
          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard icon={IconBook}  label="Total Courses"  value={courses.length} scheme="indigo" />
              <StatCard icon={IconUsers} label="Total Students" value={totalStudents}  scheme="teal" />
              <StatCard icon={IconGrid}  label="Departments"    value={new Set(courses.map(c => c.department)).size} scheme="indigo" />
            </div>
          )}

          {/* Courses */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black" style={{ color: '#1e1b4b' }}>My Courses</h2>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                {loading ? '…' : `${courses.length} course${courses.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Link to="/faculty/courses/new" className="btn-primary text-sm">+ New Course</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses yet"
              message="Create your first course and share the join code with students."
              action={<Link to="/faculty/courses/new" className="btn-primary text-sm">Create Course</Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((c, i) => (
                <Link
                  key={c._id}
                  to={`/faculty/courses/${c._id}`}
                  className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e0e7ff',
                    boxShadow: '0 2px 8px rgba(79,70,229,0.06)',
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#a5b4fc';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e0e7ff';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.06)';
                  }}
                >
                  {/* Top accent line */}
                  <div className="h-1 rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, #4f46e5, #0d9488)' }} />

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm truncate mb-1" style={{ color: '#1e1b4b' }}>{c.name}</h3>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{c.department} · Sem {c.semester}</p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <span className="code-badge block mb-1">{c.joinCode}</span>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{c.students?.length || 0} students</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3"
                    style={{ borderTop: '1px solid #f1f5ff' }}>
                    <span className="badge badge-indigo text-[10px]">Active</span>
                    <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#4f46e5' }}>
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
