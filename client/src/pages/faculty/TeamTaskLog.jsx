import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import AnimatedStat from '../../components/AnimatedStat.jsx';
import { useStaggerReveal } from '../../hooks/useInteractive.js';

function IconClock() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconFile() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IconLayers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
}

export default function TeamTaskLog() {
  const { teamId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [memberFilter, setMemberFilter] = useState('all');
  const [milestoneFilter, setMilestoneFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tasks/team/${teamId}`).then(r => { setTasks(r.data.tasks); setLoading(false); });
  }, [teamId]);

  const filteredTasks = tasks.filter(task => {
    const matchesMember = memberFilter === 'all' || String(task.user?._id) === String(memberFilter);
    const matchesMilestone = milestoneFilter === 'all' || String(task.milestone?._id) === String(milestoneFilter);
    return matchesMember && matchesMilestone;
  });

  const grouped = filteredTasks.reduce((acc, t) => {
    const key = t.milestone?.title || 'No milestone';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const totalHours = filteredTasks.reduce((a, t) => a + (t.hoursSpent || 0), 0);
  const totalFiles = filteredTasks.reduce((a, t) => a + (t.proofFiles?.length || 0), 0);
  const uniqueMembers = [...new Set(filteredTasks.map(t => t.user?.name).filter(Boolean))].length;
  const memberOptions = [...new Map(tasks.filter(t => t.user?._id).map(t => [t.user._id, t.user])).values()];
  const milestoneOptions = [...new Map(tasks.filter(t => t.milestone?._id).map(t => [t.milestone._id, t.milestone])).values()];

  const { containerRef, getItemStyle } = useStaggerReveal(filteredTasks.length, 80);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full page-enter" style={{ position: 'relative', zIndex: 1 }}>

          {/* ═══ Hero Banner ═══ */}
          <ScrollReveal direction="up" delay={0}>
            <div
              className="hero-morphing relative rounded-2xl p-8 mb-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 45%, #ecfeff 100%)',
                boxShadow: '0 18px 40px rgba(99,102,241,0.08), 0 10px 24px rgba(20,184,166,0.06)',
                border: '1px solid rgba(99,102,241,0.14)',
              }}
            >
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full"
                style={{ background: 'radial-gradient(circle, var(--border-neon), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full"
                style={{ background: 'radial-gradient(circle, var(--border-cyber), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite 2s' }} />
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Faculty Monitor
                </p>
                <h1 className="text-3xl font-black mb-2" style={{
                  background: 'linear-gradient(135deg, var(--neon-700), var(--cyber-600))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Team Task Log
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                   {loading ? 'Loading activity…' : `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''} shown`}
                 </p>
               </div>
             </div>
           </ScrollReveal>

          {!loading && tasks.length > 0 && (
            <ScrollReveal direction="up" delay={70}>
              <div className="rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(14px)' }}>
                <div>
                  <label className="label">Filter by member</label>
                  <select className="input" value={memberFilter} onChange={e => setMemberFilter(e.target.value)}>
                    <option value="all">All members</option>
                    {memberOptions.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Filter by milestone</label>
                  <select className="input" value={milestoneFilter} onChange={e => setMilestoneFilter(e.target.value)}>
                    <option value="all">All milestones</option>
                    {milestoneOptions.map(milestone => (
                      <option key={milestone._id} value={milestone._id}>{milestone.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* ═══ Stat Cards ═══ */}
          {!loading && tasks.length > 0 && (
            <ScrollReveal direction="up" delay={100}>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <AnimatedStat icon={IconLayers} label="Total Tasks" value={filteredTasks.length} scheme="indigo" />
                <AnimatedStat icon={IconClock} label="Hours Worked" value={`${totalHours}h`} scheme="teal" />
                <AnimatedStat icon={IconFile} label="Proof Files" value={totalFiles} scheme="indigo" />
                <AnimatedStat icon={IconUsers} label="Contributors" value={uniqueMembers} scheme="teal" />
              </div>
            </ScrollReveal>
          )}

          {/* ═══ Task List ═══ */}
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState title="No tasks match filters" message="Try selecting a different member or milestone." />
          ) : (
            <div ref={containerRef}>
              {Object.entries(grouped).map(([milestone, mTasks], gi) => (
                <ScrollReveal key={milestone} direction="up" delay={150 + gi * 80}>
                  <div className="mb-8">
                    {/* Milestone group header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--border-neon))' }} />
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-300))' }} />
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{milestone}</span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--success-bg)', border: `1px solid var(--success-border)`, color: 'var(--success-text)' }}>
                          {mTasks.length} task{mTasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, var(--border-teal), transparent)' }} />
                    </div>

                    {/* Task cards */}
                    <div className="flex flex-col gap-3">
                      {mTasks.map((t, i) => (
                        <TiltCard
                          key={t._id}
                          className="card-interactive"
                          intensity={5}
                          style={{
                            ...getItemStyle(gi * 5 + i),
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            backdropFilter: 'blur(var(--glass-blur))',
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Task title */}
                              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                              {t.description && (
                                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                              )}
                              {/* Meta row */}
                              <div className="flex items-center flex-wrap gap-3 mt-2.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                                    style={{ background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-300))', boxShadow: '0 0 8px rgba(99,102,241,0.2)' }}>
                                    {t.user?.name?.[0] || '?'}
                                  </div>
                                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.user?.name || 'Unknown'}</span>
                                </div>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {new Date(t.date).toLocaleDateString()}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: 'var(--cyber-50)', border: '1px solid var(--border-cyber)', color: 'var(--cyber-300)' }}>
                                  ⏱ {t.hoursSpent}h
                                </span>
                              </div>
                            </div>

                            {/* Proof files */}
                            {t.proofFiles?.length > 0 && (
                              <div className="flex flex-col gap-1.5 items-end shrink-0">
                                {t.proofFiles.map(f => (
                                  <a key={f.publicId} href={f.url} target="_blank" rel="noreferrer"
                                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200"
                                    style={{
                                      background: 'var(--neon-50)',
                                      border: '1px solid var(--border-neon)',
                                      color: 'var(--neon-700)',
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.background = 'var(--neon-50)';
                                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                                      e.currentTarget.style.boxShadow = '0 0 12px var(--border-neon)';
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.background = 'var(--neon-50)';
                                      e.currentTarget.style.borderColor = 'var(--border-neon)';
                                      e.currentTarget.style.boxShadow = 'none';
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
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
