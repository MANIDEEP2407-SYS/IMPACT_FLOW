import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import useAuthStore from '../../store/authStore.js';
import SEO from '../../components/SEO.jsx';

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/enrolled').then(r => { setCourses(r.data.courses); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <SEO
        title="Student Dashboard"
        description="Track your enrolled courses, team progress, and task contributions on ImpactFlow — the academic project platform for students."
        keywords="student dashboard, academic project tracking, college team project, task log, milestone tracker"
        path="/student/dashboard"
      />
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full animate-fade-in">

          {/* Hero — teal accent for students */}
          <div
            className="relative rounded-2xl p-6 mb-6 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 55%, #4338ca 100%)',
              boxShadow: '0 8px 24px rgba(13,148,136,0.25)',
            }}
          >
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />
            <div className="absolute bottom-0 left-1/4 w-28 h-28 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest mb-1.5 text-white/60">Student Portal</p>
              <h1 className="text-2xl font-black text-white mb-1">{user?.name?.split(' ')[0]}, make today count.</h1>
              <p className="text-sm text-white/60">
                {courses.length > 0
                  ? `Enrolled in ${courses.length} course${courses.length > 1 ? 's' : ''}`
                  : 'Join your first course with a code from your faculty'}
              </p>
            </div>
          </div>

          {/* Courses */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black" style={{ color: '#1e1b4b' }}>My Courses</h2>
            <Link to="/student/join" className="btn-teal text-sm">+ Join Course</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses yet"
              message="Ask your faculty for the 6-character join code to get started."
              action={<Link to="/student/join" className="btn-teal text-sm">Join a Course</Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((c, i) => (
                <Link
                  key={c._id}
                  to={`/student/courses/${c._id}`}
                  className="group block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e0e7ff',
                    boxShadow: '0 2px 8px rgba(13,148,136,0.05)',
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#99f6e4';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,148,136,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e0e7ff';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,148,136,0.05)';
                  }}
                >
                  <div className="h-1 rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(90deg, #0d9488, #4f46e5)' }} />

                  <h3 className="font-black text-sm mb-1" style={{ color: '#1e1b4b' }}>{c.name}</h3>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{c.code} · Sem {c.semester}</p>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f0fdfa' }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #4f46e5)' }}>
                        {c.faculty?.name?.[0] || 'F'}
                      </div>
                      <span className="text-xs" style={{ color: '#9ca3af' }}>{c.faculty?.name || 'Faculty'}</span>
                    </div>
                    <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0d9488' }}>
                      Open →
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
