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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">My Tasks</h1>
            <Link to="/student/tasks/new" className="btn-primary text-sm">+ Log task</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              message="Start logging daily work to track your contribution."
              action={<Link to="/student/tasks/new" className="btn-primary text-sm">Log first task</Link>}
            />
          ) : (
            Object.entries(grouped).map(([milestone, { tasks: mTasks, hours }]) => (
              <div key={milestone} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">{milestone}</h2>
                  <span className="text-xs text-indigo-600 font-medium">{hours}h total</span>
                </div>
                <div className="flex flex-col gap-3">
                  {mTasks.map(t => (
                    <div key={t._id} className="card">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{t.title}</p>
                          {t.description && <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>}
                          <p className="text-xs text-gray-400 mt-1">{new Date(t.date).toLocaleDateString()} · {t.hoursSpent}h</p>
                        </div>
                        {t.proofFiles?.length > 0 && (
                          <div className="flex flex-col gap-1 items-end">
                            {t.proofFiles.map(f => (
                              <a key={f.publicId} href={f.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">{f.filename}</a>
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
