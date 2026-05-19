import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import AnimatedStat from '../../components/AnimatedStat.jsx';
import { useStaggerReveal } from '../../hooks/useInteractive.js';

function IconClip() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>;
}
function IconClock() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconList() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/my').then(r => { setTasks(r.data.tasks); setLoading(false); });
  }, []);

  const grouped = tasks.reduce((acc, t) => {
    const key = t.milestone?.title || 'Other';
    if (!acc[key]) acc[key] = { tasks: [], hours: 0 };
    acc[key].tasks.push(t);
    acc[key].hours += t.hoursSpent;
    return acc;
  }, {});

  const totalHours = tasks.reduce((a, t) => a + t.hoursSpent, 0);
  const totalFiles = tasks.reduce((a, t) => a + (t.proofFiles?.length || 0), 0);

  const { containerRef, getItemStyle } = useStaggerReveal(tasks.length, 60);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full page-enter">

          {/* Header */}
          <ScrollReveal direction="up" delay={0}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--cyber-300)' }}>Activity</p>
                <h1 className="text-2xl font-black" style={{
                  background: 'linear-gradient(135deg, #ccfbf1, var(--cyber-400), #a5b4fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>My Tasks</h1>
              </div>
              <Link to="/student/tasks/new" className="btn-teal btn-glow text-sm">+ Log Task</Link>
            </div>
          </ScrollReveal>

          {/* Stats */}
          {!loading && tasks.length > 0 && (
            <ScrollReveal direction="up" delay={80}>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <AnimatedStat icon={IconList} label="Tasks logged" value={tasks.length} scheme="indigo" />
                <AnimatedStat icon={IconClock} label="Hours worked" value={`${totalHours}h`} scheme="teal" />
                <AnimatedStat icon={IconClip} label="Files uploaded" value={totalFiles} scheme="indigo" />
              </div>
            </ScrollReveal>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : tasks.length === 0 ? (
            <EmptyState title="No tasks yet" message="Log your daily work to track contribution."
              action={<Link to="/student/tasks/new" className="btn-teal btn-glow text-sm">Log first task</Link>} />
          ) : (
            <div ref={containerRef}>
              {Object.entries(grouped).map(([milestone, { tasks: mTasks, hours }], gi) => (
                <ScrollReveal key={milestone} direction="up" delay={120 + gi * 60}>
                  <div className="mb-7">
                    {/* Group header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--border-neon))' }} />
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-300))' }} />
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{milestone}</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--cyber-50)', border: '1px solid var(--border-cyber)', color: 'var(--cyber-300)' }}>
                          {hours}h
                        </span>
                      </div>
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, var(--border-teal), transparent)' }} />
                    </div>

                    <div className="flex flex-col gap-3">
                      {mTasks.map((t, i) => (
                        <TiltCard key={t._id} className="card-interactive" intensity={5}
                          style={{
                            ...getItemStyle(gi * 5 + i),
                            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            backdropFilter: 'blur(20px)',
                          }}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                              {t.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{t.description}</p>}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📅 {new Date(t.date).toLocaleDateString()}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: 'var(--cyber-50)', border: '1px solid var(--border-cyber)', color: 'var(--cyber-300)' }}>
                                  ⏱ {t.hoursSpent}h
                                </span>
                              </div>
                            </div>
                            {t.proofFiles?.length > 0 && (
                              <div className="flex flex-col gap-1 items-end shrink-0">
                                {t.proofFiles.map(f => (
                                  <a key={f.publicId} href={f.url} target="_blank" rel="noreferrer"
                                    className="text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all duration-200"
                                    style={{ background: 'var(--neon-50)', color: 'var(--neon-700)', border: '1px solid var(--border-neon)' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--neon-50)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--neon-50)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                    📎 {f.filename}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </TiltCard>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
