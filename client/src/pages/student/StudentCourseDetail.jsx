import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import { useStaggerReveal } from '../../hooks/useInteractive.js';

function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}

const FEATURES = [
  'Project list',
  'Team size',
  'Direct open',
  'Course stats',
];

export default function StudentCourseDetail() {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}/projects`).then(r => { setProjects(r.data.projects); setLoading(false); });
  }, [id]);

  const { containerRef, getItemStyle } = useStaggerReveal(projects.length, 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full page-enter">

          <ScrollReveal direction="up" delay={0}>
            <div className="hero-morphing relative rounded-2xl p-8 mb-8 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(13,28,45,0.92) 0%, rgba(18,33,49,0.92) 55%, rgba(3,55,49,0.3) 100%)', boxShadow: '0 24px 50px rgba(0,0,0,0.45), 0 0 28px rgba(60,221,199,0.12)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full" style={{ background: 'radial-gradient(circle,rgba(60,221,199,0.3),transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-faint)' }}>Course Projects</p>
                <h1 className="text-3xl font-black mb-1" style={{ background: 'linear-gradient(135deg,var(--cyber-700),var(--neon-700))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Projects</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {FEATURES.map(feature => (
                    <span
                      key={feature}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : projects.length === 0 ? (
            <EmptyState title="No projects yet" message="Your faculty hasn't created any projects for this course yet." />
          ) : (
            <div ref={containerRef} className="grid gap-5 sm:grid-cols-2">
              {projects.map((p, i) => (
                <TiltCard key={p._id} className="card-interactive border-glow" intensity={8}
                  style={{ ...getItemStyle(i), background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  onClick={() => window.location.href = `/student/projects/${p._id}`}>
                  <div className="h-[2px] rounded-full mb-5 progress-shine" style={{ background: 'linear-gradient(90deg,var(--cyber-400),var(--neon-500),var(--cyber-400))' }} />
                  <h3 className="font-black text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--neon-50)', border: '1px solid var(--border-neon)', color: 'var(--neon-700)' }}>{p.type}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--cyber-50)', border: '1px solid var(--border-cyber)', color: 'var(--cyber-300)' }}>{p.teamSize?.min}–{p.teamSize?.max} members</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)' }}>Project hub</span>
                  </div>
                  <div className="flex items-center justify-end pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                    <Link to={`/student/projects/${p._id}`} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--cyber-400)' }} onClick={e => e.stopPropagation()}>
                      View Project <span style={{ width: 14, height: 14 }}><IconArrow /></span>
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
