import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/courses/my'), api.get(`/courses/${id}/projects`)]).then(([cr, pr]) => {
      setCourse(cr.data.courses.find(c => c._id === id));
      setProjects(pr.data.projects);
      setLoading(false);
    });
  }, [id]);

  function copyCode() {
    navigator.clipboard.writeText(course.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: '#f8faff' }}>
      <Spinner size="lg" />
    </div>
  );
  if (!course) return <div className="p-8" style={{ color: '#9ca3af' }}>Course not found.</div>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full animate-fade-in">

          {/* Course hero */}
          <div className="relative rounded-2xl overflow-hidden mb-6"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 60%, #0f766e 100%)', boxShadow: '0 8px 24px rgba(79,70,229,0.2)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />

            <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1.5">Course</p>
                <h1 className="text-2xl font-black text-white mb-1">{course.name}</h1>
                <p className="text-sm text-white/60">{course.code} · Sem {course.semester} · {course.department}</p>
                <p className="text-xs text-white/40 mt-1">{course.students.length} students enrolled</p>
              </div>

              {/* Join code box */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="rounded-xl px-5 py-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Join Code</p>
                  <span className="font-mono font-black text-2xl tracking-[0.25em] text-white">{course.joinCode}</span>
                </div>
                <button onClick={copyCode}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.2)'}`,
                    color: copied ? '#86efac' : 'rgba(255,255,255,0.7)',
                  }}>
                  {copied ? '✓' : '⧉'}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black" style={{ color: '#1e1b4b' }}>Projects</h2>
            <Link to={`/faculty/courses/${id}/projects/new`} className="btn-primary text-sm">+ New Project</Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState title="No projects yet" message="Create the first project for this course."
              action={<Link to={`/faculty/courses/${id}/projects/new`} className="btn-primary text-sm">Create project</Link>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((p, i) => (
                <Link key={p._id} to={`/faculty/projects/${p._id}`}
                  className="group block rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                  style={{ background: '#ffffff', border: '1.5px solid #e0e7ff', boxShadow: '0 2px 8px rgba(79,70,229,0.06)', animationDelay: `${i * 60}ms` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5b4fc'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e7ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.06)'; }}
                >
                  <div className="h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(90deg, #4f46e5, #0d9488)' }} />
                  <div className="p-5">
                    <h3 className="font-black text-sm mb-1" style={{ color: '#1e1b4b' }}>{p.title}</h3>
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: '#9ca3af' }}>{p.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="badge badge-indigo">{p.type}</span>
                      <span className="badge">{p.teamSize?.min}–{p.teamSize?.max} members</span>
                      <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                    </div>
                    <div className="mt-3 pt-3 flex justify-end" style={{ borderTop: '1px solid #f1f5ff' }}>
                      <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#4f46e5' }}>
                        View dashboard →
                      </span>
                    </div>
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
