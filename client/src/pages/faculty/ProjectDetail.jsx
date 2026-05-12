import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ContributionBadge from '../../components/ContributionBadge.jsx';
import AIFlagBadge from '../../components/AIFlagBadge.jsx';

const STATUS = {
  active:   { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', dot: '#22c55e' },
  pending:  { bg: '#fffbeb', border: '#fde68a', color: '#b45309', dot: '#f59e0b' },
  rejected: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', dot: '#ef4444' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    api.get(`/projects/${id}/dashboard`).then(r => { setDashboard(r.data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: '#f8faff' }}>
      <div className="flex flex-col items-center gap-3"><Spinner size="lg" />
        <p className="text-sm" style={{ color: '#9ca3af' }}>Loading dashboard…</p>
      </div>
    </div>
  );
  if (!dashboard) return <div className="p-8" style={{ color: '#9ca3af' }}>Project not found.</div>;

  const { project, milestones, teams } = dashboard;

  async function approve(teamId) {
    await api.put(`/teams/${teamId}/approve`);
    setDashboard(d => ({ ...d, teams: d.teams.map(t => t.team.id === teamId ? { ...t, team: { ...t.team, status: 'active' } } : t) }));
  }
  async function reject(teamId) {
    await api.put(`/teams/${teamId}/reject`);
    setDashboard(d => ({ ...d, teams: d.teams.map(t => t.team.id === teamId ? { ...t, team: { ...t.team, status: 'rejected' } } : t) }));
  }

  const filtered = teamFilter === 'all' ? teams : teams.filter(t => t.team.status === teamFilter);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full animate-fade-in">

          {/* Project header */}
          <div className="relative rounded-2xl p-6 mb-6 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 60%, #0f766e 100%)', boxShadow: '0 8px 24px rgba(79,70,229,0.2)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1.5">Project</p>
              <h1 className="text-2xl font-black text-white mb-1">{project.title}</h1>
              <p className="text-sm text-white/60">{project.description}</p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {['all', 'pending', 'active', 'rejected'].map(f => (
              <button key={f} onClick={() => setTeamFilter(f)} className={`filter-btn ${teamFilter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 opacity-60">
                  {f === 'all' ? teams.length : teams.filter(t => t.team.status === f).length}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No teams" message="Students will create teams after joining this course." />
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map(({ team, members, milestoneStatus }, idx) => {
                const st = STATUS[team.status] || STATUS.pending;
                return (
                  <div key={team.id}
                    className="rounded-2xl overflow-hidden animate-slide-up"
                    style={{ background: '#ffffff', border: '1.5px solid #e0e7ff', boxShadow: '0 2px 8px rgba(79,70,229,0.06)', animationDelay: `${idx * 70}ms` }}>

                    {/* Card top accent */}
                    <div className="h-1" style={{ background: 'linear-gradient(90deg, #4f46e5, #0d9488)' }} />

                    <div className="p-5">
                      {/* Team header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                            style={{ background: `linear-gradient(135deg, ${st.bg}, white)`, border: `1.5px solid ${st.border}`, color: st.color }}>
                            {team.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-black text-sm" style={{ color: '#1e1b4b' }}>{team.name}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                              {team.status}
                            </span>
                          </div>
                        </div>
                        {team.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => approve(team.id)} className="btn-success text-xs py-1.5 px-3">✓ Approve</button>
                            <button onClick={() => reject(team.id)} className="btn-danger text-xs py-1.5 px-3">✕ Reject</button>
                          </div>
                        )}
                      </div>

                      {/* Members table */}
                      <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1.5px solid #e0e7ff' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Member</th><th>Tasks</th><th>Hours</th><th>Files</th><th>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map(m => (
                              <tr key={m.user._id}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                                      style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)' }}>
                                      {m.user.name?.[0]}
                                    </div>
                                    <span className="font-semibold" style={{ color: '#1e1b4b' }}>{m.user.name}</span>
                                    {m.user.rollNo && <span className="font-mono text-[10px]" style={{ color: '#9ca3af' }}>{m.user.rollNo}</span>}
                                  </div>
                                </td>
                                <td style={{ color: '#374151' }}>{m.taskCount}</td>
                                <td style={{ color: '#374151' }}>{m.totalHours}h</td>
                                <td style={{ color: '#374151' }}>{m.filesUploaded}</td>
                                <td><ContributionBadge score={m.contributionScore} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Milestones */}
                      <p className="section-label mb-2.5">Milestones</p>
                      <div className="flex flex-col gap-1.5">
                        {milestoneStatus.map(ms => {
                          const isOverdue = !ms.submitted && new Date() > new Date(ms.dueDate);
                          const dotColor = ms.submitted ? '#22c55e' : isOverdue ? '#ef4444' : '#d1d5db';
                          return (
                            <div key={ms.milestoneId}
                              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                              style={{ background: '#f8faff', border: '1px solid #e0e7ff' }}>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                                <span style={{ color: '#374151' }}>{ms.title}</span>
                                <span className="text-xs" style={{ color: '#9ca3af' }}>Due {new Date(ms.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {ms.submitted && <span className="text-xs font-semibold" style={{ color: '#15803d' }}>✓ {new Date(ms.submittedAt).toLocaleDateString()}</span>}
                                {ms.submitted && <AIFlagBadge score={ms.aiFlagScore} />}
                                {isOverdue && <span className="text-xs font-bold" style={{ color: '#dc2626' }}>Overdue</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 flex items-center gap-4" style={{ borderTop: '1px solid #eef2ff' }}>
                        <Link to={`/faculty/teams/${team.id}/tasks`}
                          className="text-sm font-semibold transition-colors"
                          style={{ color: '#4f46e5' }}>
                          View task log →
                        </Link>
                        <Link to={`/team/${team.id}/workspace`}
                          className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background:'linear-gradient(135deg,#4f46e5,#0d9488)', color:'#fff' }}>
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
          <div className="mt-6 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #f0fdfa)', border: '1.5px dashed #c7d2fe' }}>
            <span className="text-xl">🔮</span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#4338ca' }}>Peer Review — Phase 2</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Students will rate teammates after each milestone submission</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
