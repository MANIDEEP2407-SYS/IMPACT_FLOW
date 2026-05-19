import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';

function statusColor(status) {
  if (status === 'completed') return { bg: 'rgba(34,197,94,0.12)', color: '#86efac', border: 'rgba(34,197,94,0.35)' };
  if (status === 'overdue') return { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.35)' };
  return { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.35)' };
}

export default function StudentProjectOverview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityQuery, setActivityQuery] = useState('');

  useEffect(() => {
    api.get(`/projects/${id}/overview`)
      .then(response => setData(response.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load project overview'))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredActivity = useMemo(() => {
    const feed = data?.activityFeed || [];
    if (!activityQuery.trim()) return feed;
    const q = activityQuery.toLowerCase();
    return feed.filter(item => item.message.toLowerCase().includes(q));
  }, [data, activityQuery]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading overview…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="rounded-xl p-5 text-center" style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
            <p className="font-semibold" style={{ color: '#fca5a5' }}>{error || 'Overview unavailable'}</p>
            <Link className="inline-block mt-3 text-sm font-bold" style={{ color: '#c7d2fe' }} to={`/student/projects/${id}`}>Back to project</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full page-enter">
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(45,212,191,0.1))', border: '1px solid var(--border-glass)' }}>
            <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Project Overview</p>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{data.projectInfo.title}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{data.projectInfo.description || 'No description'}</p>
            <p className="text-xs mt-2" style={{ color: '#93c5fd' }}>
              {data.projectInfo.course?.name} ({data.projectInfo.course?.code}) · Faculty: {data.projectInfo.faculty?.name || '-'} · Deadline: {data.projectInfo.deadline ? new Date(data.projectInfo.deadline).toLocaleDateString() : '-'}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <p className="text-xs font-black uppercase" style={{ color: 'var(--text-muted)' }}>Tasks</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{data.analytics.totalTasks}</p>
            </div>
            <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <p className="text-xs font-black uppercase" style={{ color: 'var(--text-muted)' }}>Teams</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{data.analytics.totalTeams}</p>
            </div>
            <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <p className="text-xs font-black uppercase" style={{ color: 'var(--text-muted)' }}>Submissions</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{data.analytics.totalSubmissions}</p>
            </div>
            <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <p className="text-xs font-black uppercase" style={{ color: 'var(--text-muted)' }}>AI Flags</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{data.analytics.aiFlags}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Team Overview</h2>
              {!data.teamOverview.team ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No team assigned yet.</p>
              ) : (
                <>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.teamOverview.team.name} · {data.teamOverview.team.status}</p>
                  <p className="text-xs mb-3" style={{ color: '#93c5fd' }}>Lead: {data.teamOverview.lead?.name || '-'}</p>
                  <div className="space-y-2">
                    {data.teamOverview.ranking.map((member, index) => (
                      <div key={member.user?._id || index} className="rounded p-2 text-sm flex items-center justify-between"
                        style={{ border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{index + 1}. {member.user?.name || '-'}</span>
                        <span style={{ color: '#93c5fd', fontWeight: 700 }}>{member.score}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Milestone Tracker</h2>
              <div className="space-y-2">
                {data.milestoneTracker.map(ms => {
                  const color = statusColor(ms.status);
                  return (
                    <div key={ms.milestoneId} className="rounded p-2 text-sm" style={{ background: color.bg, border: `1px solid ${color.border}` }}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{ms.title}</span>
                        <span style={{ color: color.color, fontWeight: 700 }}>{ms.status}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Due {new Date(ms.dueDate).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <h2 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Workspace Snapshot</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{data.workspaceSnapshot.readmePreview || 'README not available yet.'}</p>
              <div className="mb-3">
                <p className="text-xs font-black uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Recent Uploads</p>
                {(data.workspaceSnapshot.recentUploads || []).map(file => (
                  <p key={file.id} className="text-xs" style={{ color: '#93c5fd' }}>{file.name} · {file.uploadedBy}</p>
                ))}
              </div>
              <div>
                <p className="text-xs font-black uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Recent Tasks</p>
                {(data.workspaceSnapshot.recentTasks || []).map(task => (
                  <p key={task.id} className="text-xs" style={{ color: '#93c5fd' }}>{task.title} · {task.member}</p>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Activity Feed</h2>
                <input
                  value={activityQuery}
                  onChange={e => setActivityQuery(e.target.value)}
                  placeholder="Search activity"
                  className="text-xs px-2 py-1 rounded"
                  style={{ border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-auto">
                {!filteredActivity.length ? (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity found.</p>
                ) : filteredActivity.map((item, idx) => (
                  <div key={`${item.createdAt}-${idx}`} className="rounded p-2" style={{ border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.message}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', color: '#c7d2fe' }} to={`/student/projects/${id}`}>
              Back to Project
            </Link>
            {data.teamOverview.team && (
              <Link className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac' }} to={`/team/${data.teamOverview.team.id}/workspace`}>
                Open Workspace
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
