import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ContributionBadge from '../../components/ContributionBadge.jsx';
import AIFlagBadge from '../../components/AIFlagBadge.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';
import { useStaggerReveal } from '../../hooks/useInteractive.js';

const STATUS = {
  active:   { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#86efac', dot: '#22c55e' },
  pending:  { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', dot: '#f59e0b' },
  rejected: { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', dot: '#ef4444' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('all');
  const [showAutoTeamsModal, setShowAutoTeamsModal] = useState(false);
  const [teamSize, setTeamSize] = useState(4);
  const [autoTeamsLoading, setAutoTeamsLoading] = useState(false);
  const [autoApproveLoading, setAutoApproveLoading] = useState(false);
  const [autoTeamsPreview, setAutoTeamsPreview] = useState([]);
  const [autoTeamsGenerated, setAutoTeamsGenerated] = useState(false);
  const [autoTeamsMessage, setAutoTeamsMessage] = useState('');
  const [autoTeamsError, setAutoTeamsError] = useState('');

  const teams = dashboard?.teams || [];
  const filtered = teamFilter === 'all' ? teams : teams.filter(t => t.team.status === teamFilter);
  const { containerRef, getItemStyle } = useStaggerReveal(filtered.length, 120);

  async function loadDashboard() {
    const { data } = await api.get(`/projects/${id}/dashboard`);
    setDashboard(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard().catch(() => setLoading(false));
  }, [id]);

  function openAutoFormModal() {
    setShowAutoTeamsModal(true);
    setAutoTeamsError('');
    setAutoTeamsMessage('');
    setAutoTeamsPreview([]);
    setAutoTeamsGenerated(false);
  }

  async function generateAutoTeams(regenerate = false) {
    setAutoTeamsLoading(true);
    setAutoTeamsError('');
    setAutoTeamsMessage('');
    try {
      const { data } = await api.post(`/projects/${id}/auto-form-teams`, { teamSize, regenerate });
      setAutoTeamsPreview(data.teamsPreview || []);
      setAutoTeamsGenerated(true);
      setAutoTeamsMessage(`${data.teamsCreated} teams created from ${data.eligibleStudents} unassigned students.`);
      await loadDashboard();
    } catch (err) {
      setAutoTeamsError(err.response?.data?.error || 'Failed to auto-form teams');
    } finally {
      setAutoTeamsLoading(false);
    }
  }

  async function approveAllAutoTeams() {
    setAutoApproveLoading(true);
    setAutoTeamsError('');
    try {
      await api.put(`/projects/${id}/auto-form-teams/approve-all`);
      setShowAutoTeamsModal(false);
      await loadDashboard();
    } catch (err) {
      setAutoTeamsError(err.response?.data?.error || 'Failed to approve auto-formed teams');
    } finally {
      setAutoApproveLoading(false);
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-muted, #6b6b8a)' }}>Loading dashboard…</p>
      </div>
    </div>
  );
  if (!dashboard) return <div className="p-8" style={{ color: 'var(--text-muted)' }}>Project not found.</div>;

  const { project, milestones } = dashboard;

  async function approve(teamId) {
    await api.put(`/teams/${teamId}/approve`);
    setDashboard(d => ({ ...d, teams: d.teams.map(t => t.team.id === teamId ? { ...t, team: { ...t.team, status: 'active' } } : t) }));
  }
  async function reject(teamId) {
    await api.put(`/teams/${teamId}/reject`);
    setDashboard(d => ({ ...d, teams: d.teams.map(t => t.team.id === teamId ? { ...t, team: { ...t.team, status: 'rejected' } } : t) }));
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full page-enter" style={{ position: 'relative', zIndex: 1 }}>

          {/* ═══ Project Header ═══ */}
          <ScrollReveal direction="up" delay={0}>
            <div className="hero-morphing relative rounded-2xl p-8 mb-8 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 45%, #ecfeff 100%)',
                boxShadow: '0 18px 40px rgba(99,102,241,0.08), 0 10px 24px rgba(20,184,166,0.06)',
                border: '1px solid rgba(99,102,241,0.14)',
              }}>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full"
                style={{ background: 'radial-gradient(circle, var(--neon-50), transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>Project</p>
                <h1 className="text-2xl font-black mb-2" style={{
                  background: 'linear-gradient(135deg, var(--neon-700), var(--cyber-600))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{project.title}</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* ═══ Filter Bar ═══ */}
          <ScrollReveal direction="left" delay={100}>
            <div className="flex gap-2 mb-6 flex-wrap items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'active', 'rejected'].map(f => (
                  <button key={f} onClick={() => setTeamFilter(f)}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300"
                    style={{
                      background: teamFilter === f ? 'var(--neon-50)' : 'var(--border-subtle)',
                      border: `1px solid ${teamFilter === f ? 'var(--border-neon)' : 'var(--border-glass)'}`,
                      color: teamFilter === f ? 'var(--neon-300, #a5b4fc)' : 'var(--text-muted, #6b6b8a)',
                      boxShadow: teamFilter === f ? '0 0 15px var(--neon-50)' : 'none',
                    }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <span className="ml-1.5 opacity-60">
                      {f === 'all' ? teams.length : teams.filter(t => t.team.status === f).length}
                    </span>
                  </button>
                ))}
              </div>
              <button onClick={openAutoFormModal}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#86efac',
                }}>
                ⚡ Auto Form Teams
              </button>
            </div>
          </ScrollReveal>

          {/* ═══ Auto-Teams Modal ═══ */}
          {showAutoTeamsModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
              onClick={() => setShowAutoTeamsModal(false)}>
              <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-glass)' }}>
                <h2 className="text-xl font-black mb-4" style={{ color: 'var(--text-primary, #e0e7ff)' }}>
                  Auto Form Teams
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                  Generate teams from unassigned enrolled students. Approved teams are never overwritten.
                </p>
                {!!autoTeamsError && (
                  <div className="mb-4 p-2 rounded text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>
                    {autoTeamsError}
                  </div>
                )}
                {!!autoTeamsMessage && (
                  <div className="mb-4 p-2 rounded text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac' }}>
                    {autoTeamsMessage}
                  </div>
                )}
                <div className="mb-6">
                  <label className="text-sm font-bold block mb-2" style={{ color: 'var(--text-primary, #e0e7ff)' }}>
                    Team Size
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.max(2, Math.min(10, parseInt(e.target.value) || 4)))}
                    className="w-full p-3 rounded-lg"
                    style={{
                      background: 'var(--bg-input, #1e2a3f)',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary, #e0e7ff)',
                    }}
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted, #6b6b8a)' }}>
                    Students per team (2-10)
                  </p>
                </div>

                {autoTeamsPreview.length > 0 && (
                  <div className="mb-6 max-h-56 overflow-auto rounded-lg p-2" style={{ border: '1px solid var(--border-glass)' }}>
                    <p className="text-xs font-black mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Preview</p>
                    <div className="space-y-2">
                      {autoTeamsPreview.map((team, index) => (
                        <div key={`${team.name}-${index}`} className="rounded p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{team.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--cyber-300)' }}>Lead: {team.teamLead?.name || '-'}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {team.members?.map(m => m.name).join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => generateAutoTeams(autoTeamsGenerated)} disabled={autoTeamsLoading}
                    className="flex-1 py-2 rounded-lg font-bold transition-all"
                    style={{
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#86efac',
                      opacity: autoTeamsLoading ? 0.5 : 1,
                    }}>
                    {autoTeamsLoading ? 'Generating...' : autoTeamsGenerated ? 'Regenerate' : 'Generate Teams'}
                  </button>
                  <button onClick={approveAllAutoTeams} disabled={!autoTeamsGenerated || autoApproveLoading}
                    className="flex-1 py-2 rounded-lg font-bold transition-all"
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.35)',
                      color: '#c7d2fe',
                      opacity: (!autoTeamsGenerated || autoApproveLoading) ? 0.5 : 1,
                    }}>
                    {autoApproveLoading ? 'Approving...' : 'Approve All'}
                  </button>
                  <button onClick={() => setShowAutoTeamsModal(false)}
                    className="flex-1 py-2 rounded-lg font-bold transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#f87171',
                    }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Teams ═══ */}
          {filtered.length === 0 ? (
            <EmptyState title="No teams" message="Students will create teams after joining this course." />
          ) : (
            <div ref={containerRef} className="flex flex-col gap-6">
              {filtered.map(({ team, members, milestoneStatus }, idx) => {
                const st = STATUS[team.status] || STATUS.pending;
                return (
                  <div key={team.id}
                    className="rounded-2xl overflow-hidden transition-all duration-500"
                    style={{
                      ...getItemStyle(idx),
                      background: 'var(--glass-bg, var(--bg-panel))',
                      border: '1px solid var(--glass-border, var(--border-glass))',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
                    }}>

                    {/* Card top accent */}
                    <div className="h-[2px] progress-shine"
                      style={{ background: 'linear-gradient(90deg, var(--neon-500), var(--cyber-400), var(--neon-500))' }} />

                    <div className="p-6">
                      {/* Team header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                            style={{
                              background: `linear-gradient(135deg, ${st.bg}, var(--bg-panel))`,
                              border: `1.5px solid ${st.border}`,
                              color: st.color,
                              boxShadow: `0 0 15px ${st.bg}`,
                            }}>
                            {team.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-black text-sm" style={{ color: 'var(--text-primary, #e0e7ff)' }}>{team.name}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                              {team.status}
                            </span>
                          </div>
                        </div>
                        {team.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => approve(team.id)}
                              className="text-xs py-1.5 px-4 rounded-lg font-bold transition-all duration-300"
                              style={{
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                color: '#86efac',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(34,197,94,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                              ✓ Approve
                            </button>
                            <button onClick={() => reject(team.id)}
                              className="text-xs py-1.5 px-4 rounded-lg font-bold transition-all duration-300"
                              style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                color: '#f87171',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(239,68,68,0.2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Members table */}
                      <div className="rounded-xl overflow-hidden mb-5"
                        style={{ border: '1px solid var(--border-glass)' }}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: 'var(--neon-50)' }}>
                              <th className="text-left px-4 py-2.5 text-xs font-bold" style={{ color: 'var(--neon-300, #a5b4fc)' }}>Member</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold" style={{ color: 'var(--neon-300, #a5b4fc)' }}>Tasks</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold" style={{ color: 'var(--neon-300, #a5b4fc)' }}>Hours</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold" style={{ color: 'var(--neon-300, #a5b4fc)' }}>Files</th>
                              <th className="text-left px-4 py-2.5 text-xs font-bold" style={{ color: 'var(--neon-300, #a5b4fc)' }}>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map(m => (
                              <tr key={m.user._id} className="transition-colors duration-200"
                                style={{ borderTop: '1px solid var(--border-subtle)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                                      style={{ background: 'linear-gradient(135deg, var(--neon-500), var(--cyber-600))', boxShadow: '0 0 8px rgba(99,102,241,0.2)' }}>
                                      {m.user.name?.[0]}
                                    </div>
                                    <span className="font-semibold" style={{ color: 'var(--text-primary, #e0e7ff)' }}>{m.user.name}</span>
                                    {m.user.rollNo && <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted, #6b6b8a)' }}>{m.user.rollNo}</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #a5b4fc)' }}>{m.taskCount}</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #a5b4fc)' }}>{m.totalHours}h</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary, #a5b4fc)' }}>{m.filesUploaded}</td>
                                <td className="px-4 py-3"><ContributionBadge score={m.contributionScore} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Milestones */}
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--neon-400, var(--neon-400))' }}>Milestones</p>
                      <div className="flex flex-col gap-2">
                        {milestoneStatus.map(ms => {
                          const isOverdue = !ms.submitted && new Date() > new Date(ms.dueDate);
                          const dotColor = ms.submitted ? '#22c55e' : isOverdue ? '#ef4444' : 'var(--text-muted, #6b6b8a)';
                          return (
                            <div key={ms.milestoneId}
                              className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all duration-200"
                              style={{
                                background: 'var(--border-subtle)',
                                border: '1px solid var(--border-glass)',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--neon-50)'; e.currentTarget.style.borderColor = 'var(--neon-50)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'var(--border-subtle)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                                <span style={{ color: 'var(--text-primary, #e0e7ff)' }}>{ms.title}</span>
                                <span className="text-xs" style={{ color: 'var(--text-muted, #6b6b8a)' }}>Due {new Date(ms.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {ms.submitted && <span className="text-xs font-semibold" style={{ color: '#86efac' }}>✓ {new Date(ms.submittedAt).toLocaleDateString()}</span>}
                                {ms.submitted && <AIFlagBadge score={ms.aiFlagScore} />}
                                {isOverdue && <span className="text-xs font-bold" style={{ color: '#f87171' }}>Overdue</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 pt-4 flex items-center gap-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
                        <Link to={`/faculty/teams/${team.id}/tasks`}
                          className="text-sm font-bold transition-all duration-300"
                          style={{ color: 'var(--neon-400, var(--neon-400))' }}>
                          View task log →
                        </Link>
                        <Link to={`/team/${team.id}/workspace`}
                          className="text-sm font-bold px-4 py-2 rounded-xl transition-all duration-300 btn-glow"
                          style={{
                            background: 'linear-gradient(135deg, var(--neon-500), var(--cyber-600))',
                            color: 'var(--text-primary)',
                            boxShadow: '0 4px 15px rgba(99,102,241,0.2)',
                          }}>
                          Open Workspace
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phase 2 card */}
          <ScrollReveal direction="up" delay={300}>
            <div className="mt-8 rounded-2xl p-5 flex items-center gap-4"
              style={{
                background: 'var(--neon-50)',
                border: '1px dashed var(--border-neon)',
                backdropFilter: 'blur(12px)',
              }}>
              <span className="text-2xl">🔮</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--neon-300, #a5b4fc)' }}>Peer Review — Phase 2</p>
                <p className="text-xs" style={{ color: 'var(--text-muted, #6b6b8a)' }}>Students will rate teammates after each milestone submission</p>
              </div>
            </div>
          </ScrollReveal>
        </main>
      </div>
    </div>
  );
}
