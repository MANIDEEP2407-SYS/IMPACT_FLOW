import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';

const STATUS = {
  active:   { bg: 'var(--success-bg)', border: 'var(--success-border)', color: 'var(--success-text)' },
  pending:  { bg: 'var(--warning-bg)', border: 'var(--warning-border)', color: 'var(--warning-text)' },
  rejected: { bg: 'var(--danger-bg)',  border: 'var(--danger-border)',  color: 'var(--danger-text)' },
};

function MilestoneStepper({ milestones, teamId, canSubmit }) {
  const [submissions, setSubmissions] = useState({});
  useEffect(() => {
    milestones.forEach(m => {
      api.get(`/milestones/${m._id}/submission`).then(r => {
        if (r.data.submission) setSubmissions(s => ({ ...s, [m._id]: r.data.submission }));
      });
    });
  }, [milestones]);

  const done = Object.keys(submissions).length;
  const pct = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0;

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Milestone Progress</p>
        <span className="text-xs font-bold" style={{ color: 'var(--cyber-300)' }}>{done}/{milestones.length}</span>
      </div>
      <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--neon-50)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--cyber-400),var(--neon-400))' }} />
      </div>
      <div className="flex flex-col gap-2.5">
        {milestones.map((m, i) => {
          const sub = submissions[m._id];
          const isOverdue = !sub && new Date() > new Date(m.dueDate);
          return (
            <div key={m._id} className="flex items-start gap-3 rounded-xl p-3 transition-all duration-200"
              style={{
                background: sub ? 'var(--success-bg)' : isOverdue ? 'var(--danger-bg)' : 'var(--neon-50)',
                border: `1.5px solid ${sub ? 'var(--success-border)' : isOverdue ? 'var(--danger-border)' : 'var(--border-neon)'}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                style={{
                  background: sub ? 'linear-gradient(135deg,#22c55e,#15803d)' : isOverdue ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,var(--neon-600),var(--neon-400))',
                  color: 'var(--text-primary)',
                  boxShadow: sub ? '0 0 10px rgba(74,222,128,0.3)' : isOverdue ? '0 0 10px rgba(248,113,113,0.3)' : '0 0 10px rgba(99,102,241,0.2)',
                }}>
                {sub ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{m.title}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Due {new Date(m.dueDate).toLocaleDateString()}</span>
                </div>
                {sub ? (
                  <p className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--success-text)' }}>✓ Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                ) : isOverdue ? (
                  <p className="text-xs mt-0.5 font-bold" style={{ color: 'var(--danger-text)' }}>⚠ Overdue</p>
                ) : teamId && canSubmit ? (
                  <Link to={`/student/milestones/${m._id}/submit`} className="text-xs mt-0.5 font-semibold block" style={{ color: 'var(--cyber-300)' }}>Submit milestone →</Link>
                ) : teamId ? (
                  <p className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--warning-text)' }}>Awaiting team approval</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function findPendingTeamId(allTeams, userId) {
  const pendingTeam = allTeams.find(team =>
    (team.joinRequests || []).some(request =>
      String(request.student?._id || request.student) === String(userId) && request.status === 'pending'
    )
  );
  return pendingTeam?._id || null;
}

export default function StudentProjectDetail() {
  const { id } = useParams();
  const user = useAuthStore(s => s.user);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [pendingTeamId, setPendingTeamId] = useState(null);
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
        setMyTeam(all.find(t => t.members.some(m => String(m.user?._id || m.user) === String(user._id))) || null);
        setPendingTeamId(findPendingTeamId(all, user._id));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load project details');
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
      setMyTeam(data.teams.find(t => t.members.some(m => String(m.user?._id || m.user) === String(user._id))) || null);
      setPendingTeamId(findPendingTeamId(data.teams, user._id));
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--void)' }}>
      <div className="flex flex-col items-center gap-3"><Spinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading project…</p>
      </div>
    </div>
  );

  const mySt = STATUS[myTeam?.status] || STATUS.pending;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full page-enter">

          {/* Hero */}
          <ScrollReveal direction="up" delay={0}>
            <div className="hero-morphing relative rounded-2xl p-6 mb-6 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--cyber-50), var(--neon-50))', boxShadow: '0 8px 40px rgba(13,148,136,0.2)', border: '1px solid var(--border-cyber)' }}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle,var(--border-cyber),transparent)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--cyber-700)' }}>Project</p>
                <h1 className="text-2xl font-black mb-1" style={{ background: 'linear-gradient(135deg,#ccfbf1,var(--cyber-400),#a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{project?.title}</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{project?.description}</p>
                <div className="mt-3">
                  <Link
                    to={`/student/projects/${id}/overview`}
                    className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.35)', color: '#c7d2fe' }}
                  >
                    Open Project Overview
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* My team card */}
          <ScrollReveal direction="up" delay={100}>
            {myTeam ? (
              <div className="rounded-2xl overflow-hidden mb-5" style={{ background: 'var(--glass-bg)', border: `1.5px solid ${mySt.border}`, backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-md)' }}>
                <div className="h-1" style={{ background: 'linear-gradient(90deg,var(--cyber-400),var(--neon-400))' }} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>My Team</span>
                      <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{myTeam.name}</h2>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: mySt.bg, border: `1.5px solid ${mySt.border}`, color: mySt.color }}>{myTeam.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {myTeam.members?.map(m => (
                      <span key={m.user?._id || m.user} className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--cyber-50)', border: '1px solid var(--border-cyber)', color: 'var(--cyber-300)' }}>
                        {m.user?.name || 'Member'}
                      </span>
                    ))}
                  </div>
                  <MilestoneStepper milestones={milestones} teamId={myTeam._id} canSubmit={myTeam.status === 'active'} />
                  {myTeam.status === 'active' && (
                    <div className="mt-4 pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border-glass)' }}>
                      <Link to={`/team/${myTeam._id}/workspace`} className="btn-teal btn-glow text-sm">Open Team Workspace →</Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl mb-5 p-5" style={{ background: 'var(--glass-bg)', border: '1.5px dashed var(--border-neon)', backdropFilter: 'blur(20px)' }}>
                {creatingTeam ? (
                  <form onSubmit={createTeam}>
                    <label className="label">Team name</label>
                    <div className="flex gap-2 mt-1">
                      <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Team Alpha" className="input flex-1" required autoFocus />
                      <button type="submit" className="btn-primary text-sm">Create</button>
                      <button type="button" onClick={() => setCreatingTeam(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                    {error && <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--danger-text)' }}>{error}</p>}
                  </form>
                ) : (
                  <div className="text-center py-3">
                    <div className="text-3xl mb-2">👥</div>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>You're not in a team yet.</p>
                    <button onClick={() => setCreatingTeam(true)} className="btn-primary text-sm">+ Create a team</button>
                  </div>
                )}
              </div>
            )}
          </ScrollReveal>

          {!myTeam && pendingTeamId && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', color: 'var(--warning-text)' }}>
              ⏳ Your join request is pending faculty approval.
            </div>
          )}

          {/* Available teams */}
          {!myTeam && teams.length > 0 && (
            <ScrollReveal direction="up" delay={200}>
              <div>
                <h2 className="font-black text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Available Teams</h2>
                <div className="flex flex-col gap-3">
                  {teams.filter(t => t.status !== 'rejected').map(t => (
                    <div key={t._id} className="flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200"
                      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20,184,166,0.2)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--cyber-50)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.members.length} members · Lead: {t.teamLead?.name}</p>
                      </div>
                      <button
                        onClick={() => requestJoin(t._id)}
                        disabled={!!pendingTeamId}
                        className="btn-teal text-xs px-3 py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {pendingTeamId === t._id ? 'Request sent' : pendingTeamId ? 'Request pending' : 'Request to join'}
                      </button>
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
