import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import useAuthStore from '../../store/authStore.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

function MilestoneStepper({ milestones, teamId }) {
  const [submissions, setSubmissions] = useState({});
  useEffect(() => {
    milestones.forEach(m => {
      api.get(`/milestones/${m._id}/submission`).then(r => {
        if (r.data.submission) setSubmissions(s => ({ ...s, [m._id]: r.data.submission }));
      });
    });
  }, [milestones]);

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-sm mb-3">Milestone Progress</h3>
      <div className="flex flex-col gap-3">
        {milestones.map((m, i) => {
          const sub = submissions[m._id];
          const isOverdue = !sub && new Date() > new Date(m.dueDate);
          return (
            <div key={m._id} className="flex items-start gap-3">
              <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0
                ${sub ? 'bg-green-500' : isOverdue ? 'bg-red-400' : 'bg-gray-300'}`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{m.title}</span>
                  <span className="text-xs text-gray-400">Due {new Date(m.dueDate).toLocaleDateString()}</span>
                </div>
                {sub ? (
                  <p className="text-xs text-green-600 mt-0.5">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                ) : isOverdue ? (
                  <p className="text-xs text-red-500 mt-0.5">Overdue</p>
                ) : teamId ? (
                  <Link to={`/student/milestones/${m._id}/submit`} className="text-xs text-indigo-600 hover:underline mt-0.5 block">
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
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/milestones`),
      api.get(`/projects/${id}/teams`),
    ]).then(([pr, mr, tr]) => {
      setProject(pr.data.project);
      setMilestones(mr.data.milestones);
      const allTeams = tr.data.teams;
      setTeams(allTeams);
      const mine = allTeams.find(t => t.members.some(m => m.user?._id === user._id));
      setMyTeam(mine || null);
      setLoading(false);
    });
  }, [id]);

  async function createTeam(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/projects/${id}/teams`, { name: teamName });
      setMyTeam(data.team);
      setTeams(t => [...t, data.team]);
      setCreatingTeam(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    }
  }

  async function requestJoin(teamId) {
    try {
      await api.post(`/teams/${teamId}/join-request`);
      const { data } = await api.get(`/projects/${id}/teams`);
      const mine = data.teams.find(t => t.members.some(m => m.user?._id === user._id));
      setTeams(data.teams);
      setMyTeam(mine || null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join');
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <h1 className="text-xl font-bold">{project?.title}</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">{project?.description}</p>

          {myTeam ? (
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">My Team: {myTeam.name}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${myTeam.status === 'active' ? 'bg-green-100 text-green-700' : myTeam.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {myTeam.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {myTeam.members?.map(m => (
                  <span key={m.user?._id || m.user} className="mr-2">{m.user?.name || 'Member'}</span>
                ))}
              </div>
              <MilestoneStepper milestones={milestones} teamId={myTeam._id} />
            </div>
          ) : (
            <div className="card mb-6 border-dashed">
              {creatingTeam ? (
                <form onSubmit={createTeam} className="flex gap-3 items-center">
                  <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team name" className="input flex-1" required />
                  <button type="submit" className="btn-primary text-sm">Create</button>
                  <button type="button" onClick={() => setCreatingTeam(false)} className="btn-secondary text-sm">Cancel</button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">You're not in a team yet.</p>
                  <button onClick={() => setCreatingTeam(true)} className="btn-primary text-sm">Create a team</button>
                </div>
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}

          {!myTeam && teams.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Available teams</h2>
              <div className="flex flex-col gap-3">
                {teams.filter(t => t.status !== 'rejected').map(t => (
                  <div key={t._id} className="card flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.members.length} members · Lead: {t.teamLead?.name}</p>
                    </div>
                    <button onClick={() => requestJoin(t._id)} className="btn-secondary text-sm">Request to join</button>
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
