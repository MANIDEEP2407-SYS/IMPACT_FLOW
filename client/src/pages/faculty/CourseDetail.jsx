import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';
import AnimatedStat from '../../components/AnimatedStat.jsx';
import { useStaggerReveal } from '../../hooks/useInteractive.js';

function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function IconFolder() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>;
}
function IconCopy() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
}
function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}

const FEATURES = [
  'Join code',
  'Student roster',
  'Project dashboard',
  'Copy access',
];

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadCourseDetail() {
      try {
        const [coursesRes, projectsRes] = await Promise.all([
          api.get('/courses/my'),
          api.get(`/courses/${id}/projects`),
        ]);
        if (ignore) return;

        const allCourses = Array.isArray(coursesRes.data?.courses) ? coursesRes.data.courses : [];
        setCourse(allCourses.find(c => String(c._id) === String(id)) || null);
        setProjects(Array.isArray(projectsRes.data?.projects) ? projectsRes.data.projects : []);
        setError('');
      } catch (err) {
        if (ignore) return;
        setCourse(null);
        setProjects([]);
        setError(err.response?.data?.error || 'Failed to load course dashboard');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCourseDetail();
    return () => { ignore = true; };
  }, [id]);

  function copyCode() {
    navigator.clipboard.writeText(course.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const { containerRef, getItemStyle } = useStaggerReveal(projects.length, 100);

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-app)' }}>
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading course…</p>
      </div>
    </div>
  );
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
        <Navbar />
        <div className="flex flex-1">
          <FacultySidebar />
          <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
            <div className="alert-error mb-4">{error || 'Course not found.'}</div>
            <Link to="/faculty/courses" className="btn-secondary text-sm">← Back to My Courses</Link>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full page-enter" style={{ position: 'relative', zIndex: 1 }}>

          {/* ═══ Course Hero — Morphing gradient ═══ */}
          <ScrollReveal direction="up" delay={0}>
            <div className="hero-morphing relative rounded-2xl overflow-hidden mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(13,28,45,0.92) 0%, rgba(18,33,49,0.92) 50%, rgba(19,30,140,0.28) 100%)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.45), 0 0 28px rgba(129,140,248,0.12)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.35), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
              <div className="absolute bottom-0 left-1/4 w-36 h-36 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(60,221,199,0.3), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite 2s' }} />

              <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-faint)' }}>Course Command Center</p>
                  <h1 className="text-2xl font-black mb-2" style={{
                    background: 'linear-gradient(135deg, var(--neon-700), var(--cyber-400))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{course.name}</h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{course.code} · Sem {course.semester} · {course.department}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{course.students.length} students enrolled</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {FEATURES.map(feature => (
                      <span
                        key={feature}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Join code box */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="rounded-xl px-5 py-3 text-center"
                    style={{
                      background: 'rgba(189,194,255,0.12)',
                      border: '1px solid rgba(189,194,255,0.24)',
                      backdropFilter: 'blur(12px)',
                    }}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>Join Code</p>
                    <span className="font-mono font-black text-2xl tracking-[0.25em] text-shimmer" style={{ color: 'var(--text-primary)' }}>{course.joinCode}</span>
                  </div>
                  <button onClick={copyCode}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
                    style={{
                      background: copied ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${copied ? 'rgba(34,197,94,0.34)' : 'rgba(255,255,255,0.12)'}`,
                      color: copied ? '#86efac' : 'var(--neon-300)',
                      boxShadow: copied ? '0 0 20px rgba(34,197,94,0.15)' : 'none',
                    }}>
                    <span style={{ width: 16, height: 16 }}>{copied ? '✓' : <IconCopy />}</span>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ═══ Stats ═══ */}
          <ScrollReveal direction="up" delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <AnimatedStat icon={IconUsers}  label="Students"  value={course.students.length} scheme="indigo" />
              <AnimatedStat icon={IconFolder} label="Projects"  value={projects.length} scheme="teal" />
              <AnimatedStat icon={IconFolder} label="Department" value={course.department} scheme="indigo" />
            </div>
          </ScrollReveal>

          {/* ═══ Projects Section ═══ */}
          <ScrollReveal direction="left" delay={200}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-shimmer">Projects</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>All workspaces, milestones, and submissions for this course.</p>
              </div>
              <Link to={`/faculty/courses/${id}/projects/new`} className="btn-primary btn-glow text-sm flex items-center gap-2">
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Project
              </Link>
            </div>
          </ScrollReveal>

          {projects.length === 0 ? (
            <EmptyState title="No projects yet" message="Create the first project for this course."
              action={<Link to={`/faculty/courses/${id}/projects/new`} className="btn-primary btn-glow text-sm">Create Project</Link>} />
          ) : (
            <div ref={containerRef} className="grid gap-5 sm:grid-cols-2">
              {projects.map((p, i) => (
                <TiltCard
                  key={p._id}
                  className="card-interactive border-glow"
                  intensity={8}
                  style={{
                    ...getItemStyle(i),
                    background: 'var(--glass-bg, var(--bg-panel))',
                    border: '1px solid var(--glass-border, var(--border-glass))',
                  }}
                  onClick={() => window.location.href = `/faculty/projects/${p._id}`}
                >
                  <div className="h-[2px] rounded-full mb-5 progress-shine"
                    style={{ background: 'linear-gradient(90deg, var(--neon-500), var(--cyber-400), var(--neon-500))' }} />

                  <h3 className="font-black text-sm mb-1.5" style={{ color: 'var(--text-primary, #e0e7ff)' }}>{p.title}</h3>
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-muted, #6b6b8a)' }}>{p.description}</p>

                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="badge badge-indigo">{p.type}</span>
                    <span className="badge badge-gray">Milestones</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--cyber-50)', color: 'var(--cyber-400)', border: '1px solid var(--border-cyber)' }}>
                      {p.teamSize?.min}–{p.teamSize?.max} members
                    </span>
                    <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                    <span className="badge badge-indigo float-badge text-[10px]">🎯 {p.type}</span>
                    <Link to={`/faculty/projects/${p._id}`}
                      className="flex items-center gap-1.5 text-xs font-bold transition-all duration-300"
                      style={{ color: 'var(--neon-400, var(--neon-400))' }}
                      onClick={e => e.stopPropagation()}>
                      View dashboard <span style={{ width: 14, height: 14 }}><IconArrow /></span>
                    </Link>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
