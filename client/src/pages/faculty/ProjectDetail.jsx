import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ContributionBadge from '../../components/ContributionBadge.jsx';
import AIFlagBadge from '../../components/AIFlagBadge.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    api.get(`/projects/${id}/dashboard`).then(r => { setDashboard(r.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (!dashboard) return <div className="p-8 text-gray-500">Project not found.</div>;

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-xl font-bold">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'pending', 'active', 'rejected'].map(f => (
              <button key={f} onClick={() => setTeamFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${teamFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No teams yet" message="Students will create teams after joining this course." />
          ) : (
            <div className="flex flex-col gap-6">
              {filtered.map(({ team, members, milestoneStatus }) => (
                <div key={team.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{team.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${team.status === 'active' ? 'bg-green-100 text-green-700' : team.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {team.status}
                      </span>
                    </div>
                    {team.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => approve(team.id)} className="btn-primary text-sm py-1">Approve</button>
                        <button onClick={() => reject(team.id)} className="btn-danger text-sm py-1">Reject</button>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                          <th className="pb-2 pr-4">Member</th>
                          <th className="pb-2 pr-4">Tasks</th>
                          <th className="pb-2 pr-4">Hours</th>
                          <th className="pb-2 pr-4">Files</th>
                          <th className="pb-2">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map(m => (
                          <tr key={m.user._id} className="border-b border-gray-50">
                            <td className="py-2 pr-4 font-medium">{m.user.name} <span className="text-gray-400 font-normal text-xs">{m.user.rollNo}</span></td>
                            <td className="py-2 pr-4">{m.taskCount}</td>
                            <td className="py-2 pr-4">{m.totalHours}h</td>
                            <td className="py-2 pr-4">{m.filesUploaded}</td>
                            <td className="py-2"><ContributionBadge score={m.contributionScore} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">MILESTONES</p>
                    <div className="flex flex-col gap-1.5">
                      {milestoneStatus.map(ms => (
                        <div key={ms.milestoneId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${ms.submitted ? 'bg-green-500' : new Date() > new Date(ms.dueDate) ? 'bg-red-400' : 'bg-gray-300'}`} />
                            <span>{ms.title}</span>
                            <span className="text-xs text-gray-400">Due {new Date(ms.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {ms.submitted && <span className="text-xs text-green-600">{new Date(ms.submittedAt).toLocaleDateString()}</span>}
                            {ms.submitted && <AIFlagBadge score={ms.aiFlagScore} />}
                            {!ms.submitted && new Date() > new Date(ms.dueDate) && <span className="text-xs text-red-500">Overdue</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link to={`/faculty/teams/${team.id}/tasks`} className="text-sm text-indigo-600 hover:underline">
                      View full task log →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 card bg-gray-50 border-dashed">
            <h3 className="font-semibold text-gray-500 text-sm">Peer Review</h3>
            <p className="text-xs text-gray-400 mt-1">Coming in Phase 2</p>
          </div>
        </main>
      </div>
    </div>
  );
}
