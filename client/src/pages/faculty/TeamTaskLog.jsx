import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function TeamTaskLog() {
  const { teamId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tasks/team/${teamId}`).then(r => { setTasks(r.data.tasks); setLoading(false); });
  }, [teamId]);

  const grouped = tasks.reduce((acc, t) => {
    const key = t.milestone?.title || 'No milestone';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">Team Task Log</h1>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : tasks.length === 0 ? (
            <EmptyState title="No tasks logged yet" message="Team members haven't logged any tasks." />
          ) : (
            Object.entries(grouped).map(([milestone, mTasks]) => (
              <div key={milestone} className="mb-6">
                <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">{milestone}</h2>
                <div className="flex flex-col gap-3">
                  {mTasks.map(t => (
                    <div key={t._id} className="card">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{t.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            By <strong>{t.user?.name}</strong> · {new Date(t.date).toLocaleDateString()} · {t.hoursSpent}h
                          </p>
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
