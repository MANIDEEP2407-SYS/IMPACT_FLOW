import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import useAuthStore from '../../store/authStore.js';
import SEO from '../../components/SEO.jsx';
import { rankByContribution } from '../../utils/dsa.js';
import AnimatedStat from '../../components/AnimatedStat.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';
import { useStaggerReveal, useTypewriter } from '../../hooks/useInteractive.js';

function IconBook() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}
function IconGrid() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function IconSparkle() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7 7 1-5 5 1.5 7-6.5-4-6.5 4L7 15l-5-5 7-1z"/></svg>;
}

export default function FacultyDashboard() {
  const user = useAuthStore(s => s.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadCourses() {
      try {
        const response = await api.get('/courses/my');
        if (ignore) return;
        setCourses(Array.isArray(response.data?.courses) ? response.data.courses : []);
        setError('');
      } catch (err) {
        if (ignore) return;
        setCourses([]);
        setError(err.response?.data?.error || 'Failed to load courses');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCourses();
    return () => { ignore = true; };
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);

  /* DSA: collect all students across courses, rank by enrolledCourses count as proxy score */
  const allStudentsRaw = courses.flatMap(c =>
    (c.students || []).map(s => ({ name: s.name || s, contributionScore: 0, courseCount: 1 }))
  );
  const rankedStudents = rankByContribution(allStudentsRaw).slice(0, 5);

  /* Stagger animation for course cards */
  const { containerRef, getItemStyle, isVisible: staggerVisible } = useStaggerReveal(courses.length, 100);

  /* Typewriter for the greeting */
  const greeting = `${user?.name?.split(' ')[0] || 'Professor'}, your courses are live.`;
  const { ref: typeRef, displayed: typedGreeting } = useTypewriter(greeting, 35);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <SEO
        title="Faculty Dashboard"
        description="Manage your courses, track student contributions, and review team progress on ImpactFlow — the academic project management platform."
        keywords="faculty dashboard, course management, student contribution tracking, capstone project management, academic project platform"
        path="/faculty/dashboard"
      />
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full page-enter" style={{ position: 'relative', zIndex: 1 }}>

          {/* ═══ Hero Banner — Morphing Gradient ═══ */}
          <ScrollReveal direction="up" delay={0}>
            <div
              ref={typeRef}
              className="hero-morphing relative rounded-2xl p-8 mb-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(13,28,45,0.92) 0%, rgba(18,33,49,0.92) 45%, rgba(19,30,140,0.32) 100%)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.45), 0 0 28px rgba(129,140,248,0.15)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Animated decorative orbs */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(129,140,248,0.35), transparent 70%)',
                  animation: 'pulse-glow 4s ease-in-out infinite',
                }} />
              <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(60,221,199,0.32), transparent 70%)',
                  animation: 'pulse-glow 4s ease-in-out infinite 2s',
                }} />
              <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(221,183,255,0.18), transparent 70%)',
                  animation: 'float-badge 6s ease-in-out infinite',
                }} />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Faculty Dashboard
                </p>
                <h1 className="text-3xl font-black mb-2" style={{
                  background: 'linear-gradient(135deg, var(--neon-700), var(--cyber-600))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {typedGreeting}<span className="animate-pulse" style={{ WebkitTextFillColor: 'var(--cyber-500)' }}>|</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {courses.length} course{courses.length !== 1 ? 's' : ''} · {totalStudents} students enrolled
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* ═══ Stat Cards — AnimatedStat with count-up ═══ */}
          {!loading && courses.length > 0 && (
            <ScrollReveal direction="up" delay={150}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <AnimatedStat icon={IconBook}  label="Total Courses"  value={courses.length} scheme="indigo" />
                <AnimatedStat icon={IconUsers} label="Total Students" value={totalStudents}  scheme="teal" />
                <AnimatedStat icon={IconGrid}  label="Departments"    value={new Set(courses.map(c => c.department)).size} scheme="indigo" />
              </div>
            </ScrollReveal>
          )}

          {/* ═══ Section Header ═══ */}
          <ScrollReveal direction="left" delay={200}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-shimmer">My Courses</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                  {loading ? '…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} active`}
                </p>
              </div>
              <Link to="/faculty/courses/new" className="btn-primary btn-glow text-sm flex items-center gap-2">
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Course
              </Link>
            </div>
          </ScrollReveal>

          {error && (
            <div className="alert-error mb-6">
              {error}
            </div>
          )}

          {/* ═══ Course Cards ═══ */}
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses yet"
              message="Create your first course and share the join code with students."
              action={<Link to="/faculty/courses/new" className="btn-primary btn-glow text-sm">Create Course</Link>}
            />
          ) : (
            <div ref={containerRef} className="grid gap-5 sm:grid-cols-2">
              {courses.map((c, i) => (
                <TiltCard
                  key={c._id}
                  className="card-interactive border-glow"
                  intensity={8}
                  style={{
                    ...getItemStyle(i),
                    background: 'var(--glass-bg, var(--bg-panel))',
                    border: '1px solid var(--glass-border, var(--border-glass))',
                  }}
                  onClick={() => window.location.href = `/faculty/courses/${c._id}`}
                >
                  {/* Top accent shimmer */}
                  <div className="h-[2px] rounded-full mb-5 progress-shine"
                    style={{ background: 'linear-gradient(90deg, var(--neon-500), var(--cyber-400), var(--neon-500))' }} />

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm truncate mb-1.5" style={{ color: 'var(--text-primary, #e0e7ff)' }}>
                        {c.name}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                        {c.department} · Sem {c.semester}
                      </p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <span className="code-badge block mb-1.5">{c.joinCode}</span>
                      <p className="text-xs flex items-center gap-1 justify-end" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                        <span style={{ width: 14, height: 14, display: 'inline-block' }}><IconUsers /></span>
                        {c.students?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3"
                    style={{ borderTop: '1px solid var(--border-glass)' }}>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-indigo text-[10px] float-badge">Active</span>
                      {c.students?.length >= 10 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(168,85,247,0.1)',
                            color: '#c084fc',
                            border: '1px solid rgba(168,85,247,0.2)',
                          }}>
                          <span style={{ width: 10, height: 10 }}><IconSparkle /></span>
                          Popular
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/faculty/courses/${c._id}`}
                      className="flex items-center gap-1.5 text-xs font-bold transition-all duration-300"
                      style={{ color: 'var(--neon-400, var(--neon-400))' }}
                      onClick={e => e.stopPropagation()}
                    >
                      View
                      <span style={{ width: 14, height: 14, transition: 'transform 0.3s' }} className="group-hover:translate-x-1">
                        <IconArrow />
                      </span>
                    </Link>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}

          {/* ═══ Top Students (if any ranked) ═══ */}
          {rankedStudents.length > 0 && (
            <ScrollReveal direction="up" delay={350}>
              <div className="mt-10">
                <h3 className="text-lg font-black mb-4" style={{ color: 'var(--text-primary, #e0e7ff)' }}>
                  🏆 Top Contributors
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {rankedStudents.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl p-3 transition-all duration-300"
                      style={{
                        background: 'var(--glass-bg, rgba(15,15,35,0.5))',
                        border: '1px solid var(--glass-border, var(--border-glass))',
                        backdropFilter: 'blur(12px)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                        e.currentTarget.style.boxShadow = '0 8px 30px var(--neon-50)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.borderColor = 'var(--glass-border, var(--border-glass))';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                        style={{
                          background: i === 0
                            ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                            : i === 1
                            ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)'
                            : 'linear-gradient(135deg, #c2845a, #d97706)',
                          boxShadow: i === 0 ? '0 0 12px rgba(245,158,11,0.4)' : 'none',
                        }}>
                        {i + 1}
                      </div>
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-secondary, #a5b4fc)' }}>
                        {s.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

        </main>
      </div>
    </div>
  );
}
