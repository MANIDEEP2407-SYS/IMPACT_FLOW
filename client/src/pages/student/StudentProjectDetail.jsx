import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const STATUS = {
  active:   { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  pending:  { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
  rejected: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
};

function MilestoneStepper({ milestones, teamId }) {
  const [submissions, setSubmissions] = useState({});
  useEffect(() => {
    milestones.forEach(m => {
      api.get(`/milestones/${m._id}/submission`).then(r => {
        if (r.data.submission) setSubmissions(s => ({ ...s, [m._id]: r.data.submission }));
      });
    });
  }, [milestones]);

  const done = Object.keys(submissions).length;
  const pct  = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-1.5">
        <p className="section-label">Milestone Progress</p>
        <span className="text-xs font-bold" style={{ color: '#0d9488' }}>{done}/{milestones.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: '#e0e7ff' }}>
        <div className="h-full rounded-full progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-col gap-2.5">
        {milestones.map((m, i) => {
          const sub = submissions[m._id];
          const isOverdue = !sub && new Date() > new Date(m.dueDate);
          return (
            <div key={m._id} className="flex items-start gap-3 rounded-xl p-3"
              style={{ background: sub ? '#f0fdf4' : isOverdue ? '#fef2f2' : '#f8faff', border: `1.5px solid ${sub ? '#bbf7d0' : isOverdue ? '#fecaca' : '#e0e7ff'}` }}>
              {/* Step circle */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                style={{
                  background: sub ? 'linear-gradient(135deg, #22c55e, #15803d)' : isOverdue ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                  color: sub || isOverdue ? '#ffffff' : '#4338ca',
                  border: sub ? '0' : isOverdue ? '0' : '1.5px solid #c7d2fe',
                }}>
                {sub ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-semibold text-sm" style={{ color: '#1e1b4b' }}>{m.title}</span>
                  <span className="text-xs" style={{ color: '#9ca3af' }}>Due {new Date(m.dueDate).toLocaleDateString()}</span>
                </div>
                {sub ? (
                  <p className="text-xs mt-0.5 font-semibold" style={{ color: '#15803d' }}>✓ Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                ) : isOverdue ? (
                  <p className="text-xs mt-0.5 font-bold" style={{ color: '#dc2626' }}>⚠ Overdue</p>
                ) : teamId ? (
                  <Link to={`/student/milestones/${m._id}/submit`}
                    className="text-xs mt-0.5 font-semibold block transition-colors"
                    style={{ color: '#0d9488' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0f766e'}
                    onMouseLeave={e => e.currentTarget.style.color = '#0d9488'}>
                    Submit milestone →
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StudentProjectDetail() {
  const { id } = useParams();
  const user = useAuthStore(s => s.user);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/milestones`), api.get(`/projects/${id}/teams`)])
      .then(([pr, mr, tr]) => {
        setProject(pr.data.project);
        setMilestones(mr.data.milestones);
        const all = tr.data.teams;
        setTeams(all);
        setMyTeam(all.find(t => t.members.some(m => m.user?._id === user._id)) || null);
        setLoading(false);
      });
  }, [id]);

  async function createTeam(e) {
    e.preventDefault(); setError('');
    try {
      const { data } = await api.post(`/projects/${id}/teams`, { name: teamName });
      setMyTeam(data.team); setTeams(t => [...t, data.team]); setCreatingTeam(false);
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  }

  async function requestJoin(teamId) {
    try {
      await api.post(`/teams/${teamId}/join-request`);
      const { data } = await api.get(`/projects/${id}/teams`);
      setTeams(data.teams);
      setMyTeam(data.teams.find(t => t.members.some(m => m.user?._id === user._id)) || null);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: '#f8faff' }}>
      <div className="flex flex-col items-center gap-3"><Spinner size="lg" />
        <p className="text-sm" style={{ color: '#9ca3af' }}>Loading project…</p>
      </div>
    </div>
  );

  const mySt = STATUS[myTeam?.status] || STATUS.pending;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full animate-fade-in">

          {/* Project header */}
          <div className="relative rounded-2xl p-6 mb-6 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 60%, #4338ca 100%)', boxShadow: '0 8px 24px rgba(13,148,136,0.2)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1.5">Project</p>
              <h1 className="text-2xl font-black text-white mb-1">{project?.title}</h1>
              <p className="text-sm text-white/60">{project?.description}</p>
            </div>
          </div>

          {/* My team */}
          {myTeam ? (
            <div className="rounded-2xl overflow-hidden mb-5"
              style={{ background: '#ffffff', border: `1.5px solid ${mySt.border}`, boxShadow: '0 4px 16px rgba(13,148,136,0.08)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #0d9488, #4f46e5)' }} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs section-label">My Team</span>
                    <h2 className="font-black text-sm" style={{ color: '#1e1b4b' }}>{myTeam.name}</h2>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: mySt.bg, border: `1.5px solid ${mySt.border}`, color: mySt.color }}>
                    {myTeam.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {myTeam.members?.map(m => (
                    <span key={m.user?._id || m.user} className="badge badge-teal text-xs">
                      {m.user?.name || 'Member'}
                    </span>
                  ))}
                </div>
                <MilestoneStepper milestones={milestones} teamId={myTeam._id} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl mb-5 p-5"
              style={{ background: '#ffffff', border: '1.5px dashed #c7d2fe', boxShadow: '0 2px 8px rgba(79,70,229,0.06)' }}>
              {creatingTeam ? (
                <form onSubmit={createTeam}>
                  <label className="label">Team name</label>
                  <div className="flex gap-2 mt-1">
                    <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Team Alpha" className="input flex-1" required autoFocus />
                    <button type="submit" className="btn-primary text-sm">Create</button>
                    <button type="button" onClick={() => setCreatingTeam(false)} className="btn-secondary text-sm">Cancel</button>
                  </div>
                  {error && <p className="text-xs mt-2 font-semibold" style={{ color: '#dc2626' }}>{error}</p>}
                </form>
              ) : (
                <div className="text-center py-3">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>You're not in a team yet.</p>
                  <button onClick={() => setCreatingTeam(true)} className="btn-primary text-sm">+ Create a team</button>
                </div>
              )}
            </div>
          )}

          {/* Available teams */}
          {!myTeam && teams.length > 0 && (
            <div>
              <h2 className="font-black text-sm mb-3" style={{ color: '#374151' }}>Available Teams</h2>
              <div className="flex flex-col gap-3">
                {teams.filter(t => t.status !== 'rejected').map(t => (
                  <div key={t._id} className="flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200"
                    style={{ background: '#ffffff', border: '1.5px solid #e0e7ff', boxShadow: '0 2px 6px rgba(79,70,229,0.04)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#99f6e4'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,148,136,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e7ff'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(79,70,229,0.04)'; }}>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1e1b4b' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{t.members.length} members · Lead: {t.teamLead?.name}</p>
                    </div>
                    <button onClick={() => requestJoin(t._id)} className="btn-teal text-xs px-3 py-1.5">Request to join</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
