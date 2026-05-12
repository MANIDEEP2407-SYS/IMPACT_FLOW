import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full animate-fade-in">

          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="section-label mb-1">Activity</p>
              <h1 className="text-2xl font-black" style={{ color: '#1e1b4b' }}>My Tasks</h1>
            </div>
            <Link to="/student/tasks/new" className="btn-teal text-sm">+ Log Task</Link>
          </div>

          {/* Stats */}
          {!loading && tasks.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: '📋', label: 'Tasks logged', value: tasks.length, scheme: 'indigo' },
                { icon: '⏱️', label: 'Hours worked', value: `${totalHours}h`, scheme: 'teal' },
                { icon: '📎', label: 'Files uploaded', value: totalFiles, scheme: 'indigo' },
              ].map(s => (
                <div key={s.label}
                  className="rounded-xl p-3 flex items-center gap-2.5 transition-all hover:-translate-y-0.5"
                  style={{
                    background: s.scheme === 'indigo' ? 'linear-gradient(135deg, #eef2ff, #e0e7ff)' : 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                    border: `1.5px solid ${s.scheme === 'indigo' ? '#c7d2fe' : '#99f6e4'}`,
                    boxShadow: '0 2px 6px rgba(79,70,229,0.06)',
                  }}>
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-lg font-black" style={{ color: s.scheme === 'indigo' ? '#4338ca' : '#0f766e' }}>{s.value}</p>
                    <p className="text-[10px] font-semibold" style={{ color: '#9ca3af' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : tasks.length === 0 ? (
            <EmptyState title="No tasks yet" message="Log your daily work to track contribution."
              action={<Link to="/student/tasks/new" className="btn-teal text-sm">Log first task</Link>} />
          ) : (
            Object.entries(grouped).map(([milestone, { tasks: mTasks, hours }], gi) => (
              <div key={milestone} className="mb-7">
                {/* Group header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #c7d2fe)' }} />
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)' }} />
                    <span className="section-label">{milestone}</span>
                    <span className="badge badge-teal text-[10px]">{hours}h</span>
                  </div>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #99f6e4, transparent)' }} />
                </div>

                <div className="flex flex-col gap-3">
                  {mTasks.map((t, i) => (
                    <div key={t._id}
                      className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 animate-slide-up"
                      style={{ background: '#ffffff', border: '1.5px solid #e0e7ff', boxShadow: '0 2px 8px rgba(79,70,229,0.04)', animationDelay: `${i * 40}ms` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ color: '#1e1b4b' }}>{t.title}</p>
                          {t.description && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#9ca3af' }}>{t.description}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs" style={{ color: '#9ca3af' }}>📅 {new Date(t.date).toLocaleDateString()}</span>
                            <span className="badge badge-teal text-[10px]">⏱ {t.hoursSpent}h</span>
                          </div>
                        </div>
                        {t.proofFiles?.length > 0 && (
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            {t.proofFiles.map(f => (
                              <a key={f.publicId} href={f.url} target="_blank" rel="noreferrer"
                                className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all hover:scale-105"
                                style={{ background: '#eef2ff', color: '#4338ca', border: '1.5px solid #c7d2fe' }}>
                                📎 {f.filename}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
