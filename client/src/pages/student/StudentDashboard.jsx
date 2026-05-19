import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import useAuthStore from '../../store/authStore.js';
import SEO from '../../components/SEO.jsx';
import AnimatedStat from '../../components/AnimatedStat.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';
import { useStaggerReveal, useTypewriter } from '../../hooks/useInteractive.js';

function IconBookOpen() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>;
}
function IconTarget() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function IconTrending() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/enrolled').then(r => { setCourses(r.data.courses); setLoading(false); });
  }, []);

  /* Stagger animation for course cards */
  const { containerRef, getItemStyle } = useStaggerReveal(courses.length, 100);

  /* Typewriter greeting */
  const greeting = `${user?.name?.split(' ')[0] || 'Student'}, make today count.`;
  const { ref: typeRef, displayed: typedGreeting } = useTypewriter(greeting, 35);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <SEO
        title="Student Dashboard"
        description="Track your enrolled courses, team progress, and task contributions on ImpactFlow — the academic project platform for students."
        keywords="student dashboard, academic project tracking, college team project, task log, milestone tracker"
        path="/student/dashboard"
      />
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full page-enter" style={{ position: 'relative', zIndex: 1 }}>

          {/* ═══ Hero Banner — Teal accent for students ═══ */}
          <ScrollReveal direction="up" delay={0}>
            <div
              ref={typeRef}
              className="hero-morphing relative rounded-2xl p-8 mb-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(13,28,45,0.92) 0%, rgba(18,33,49,0.92) 45%, rgba(3,55,49,0.32) 100%)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.45), 0 0 28px rgba(60,221,199,0.15)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Animated decorative orbs */}
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(60,221,199,0.35), transparent 70%)',
                  animation: 'pulse-glow 4s ease-in-out infinite',
                }} />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(129,140,248,0.3), transparent 70%)',
                  animation: 'pulse-glow 4s ease-in-out infinite 2s',
                }} />
              <div className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(221,183,255,0.18), transparent 70%)',
                  animation: 'float-badge 5s ease-in-out infinite',
                }} />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Student Portal
                </p>
                <h1 className="text-3xl font-black mb-2" style={{
                  background: 'linear-gradient(135deg, var(--cyber-700), var(--neon-700))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {typedGreeting}<span className="animate-pulse" style={{ WebkitTextFillColor: 'var(--cyber-500)' }}>|</span>
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {courses.length > 0
                    ? `Enrolled in ${courses.length} course${courses.length > 1 ? 's' : ''}`
                    : 'Join your first course with a code from your faculty'}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* ═══ Stat Cards ═══ */}
          {!loading && courses.length > 0 && (
            <ScrollReveal direction="up" delay={150}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <AnimatedStat icon={IconBookOpen} label="Enrolled Courses" value={courses.length} scheme="teal" />
                <AnimatedStat icon={IconTarget}   label="Active Projects" value={courses.reduce((a, c) => a + (c.projects?.length || 0), 0)} scheme="indigo" />
                <AnimatedStat icon={IconTrending}  label="Teams Joined"   value={courses.length} scheme="teal" />
              </div>
            </ScrollReveal>
          )}

          {/* ═══ Section Header ═══ */}
          <ScrollReveal direction="left" delay={200}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-shimmer">My Courses</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                  {loading ? '…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} enrolled`}
                </p>
              </div>
              <Link to="/student/join" className="btn-teal btn-glow text-sm flex items-center gap-2">
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Join Course
              </Link>
            </div>
          </ScrollReveal>

          {/* ═══ Course Cards ═══ */}
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses yet"
              message="Ask your faculty for the 6-character join code to get started."
              action={<Link to="/student/join" className="btn-teal btn-glow text-sm">Join a Course</Link>}
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
                  onClick={() => window.location.href = `/student/courses/${c._id}`}
                >
                  {/* Top accent shimmer */}
                  <div className="h-[2px] rounded-full mb-5 progress-shine"
                    style={{ background: 'linear-gradient(90deg, var(--cyber-400), var(--neon-500), var(--cyber-400))' }} />

                  <h3 className="font-black text-sm mb-1.5" style={{ color: 'var(--text-primary, #e0e7ff)' }}>
                    {c.name}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                    {c.code} · Sem {c.semester}
                  </p>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                        style={{
                          background: 'linear-gradient(135deg, var(--cyber-600), var(--neon-500))',
                          boxShadow: '0 0 10px rgba(20,184,166,0.2)',
                        }}>
                        {c.faculty?.name?.[0] || 'F'}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                        {c.faculty?.name || 'Faculty'}
                      </span>
                    </div>
                    <Link
                      to={`/student/courses/${c._id}`}
                      className="flex items-center gap-1.5 text-xs font-bold transition-all duration-300"
                      style={{ color: 'var(--cyber-400, var(--cyber-500))' }}
                      onClick={e => e.stopPropagation()}
                    >
                      Open
                      <span style={{ width: 14, height: 14 }}><IconArrow /></span>
                    </Link>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}

          {/* ═══ Quick Actions ═══ */}
          <ScrollReveal direction="up" delay={350}>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/student/tasks"
                className="group rounded-xl p-4 flex items-center gap-3 transition-all duration-300"
                style={{
                  background: 'var(--neon-50)',
                  border: '1px solid var(--neon-50)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--border-neon)';
                  e.currentTarget.style.boxShadow = '0 8px 30px var(--neon-50)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = 'var(--neon-50)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--neon-500), var(--neon-400))', boxShadow: '0 4px 15px rgba(99,102,241,0.2)' }}>
                  <span style={{ width: 18, height: 18, color: 'var(--text-primary)' }}><IconTarget /></span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary, #e0e7ff)' }}>My Tasks</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted, #6b6b8a)' }}>View all your logged tasks</p>
                </div>
              </Link>

              <Link
                to="/student/tasks/new"
                className="group rounded-xl p-4 flex items-center gap-3 transition-all duration-300"
                style={{
                  background: 'var(--cyber-50)',
                  border: '1px solid var(--border-cyber)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--border-cyber)';
                  e.currentTarget.style.boxShadow = '0 8px 30px var(--border-cyber)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = 'var(--border-cyber)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--cyber-600), var(--cyber-500))', boxShadow: '0 4px 15px rgba(20,184,166,0.2)' }}>
                  <span style={{ width: 18, height: 18, color: 'var(--text-primary)' }}><IconTrending /></span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary, #e0e7ff)' }}>Log New Task</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted, #6b6b8a)' }}>Record your latest contribution</p>
                </div>
              </Link>
            </div>
          </ScrollReveal>

        </main>
      </div>
    </div>
  );
}
