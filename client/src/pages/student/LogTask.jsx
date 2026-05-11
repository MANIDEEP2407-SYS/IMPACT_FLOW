import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function LogTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', hoursSpent: '', milestoneId: '', date: new Date().toISOString().slice(0, 10) });
  const [files, setFiles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Find student's active team and project to get milestones
    api.get('/courses/enrolled').then(async r => {
      const courses = r.data.courses;
      const allMilestones = [];
      for (const c of courses) {
        const pr = await api.get(`/courses/${c._id}/projects`);
        for (const p of pr.data.projects) {
          const mr = await api.get(`/projects/${p._id}/milestones`);
          allMilestones.push(...mr.data.milestones.map(m => ({ ...m, projectTitle: p.title })));
        }
      }
      setMilestones(allMilestones);
    });
  }, []);

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('files', f));
      await api.post('/tasks', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/student/tasks');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log task');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">Log a task</h1>
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">{error}</div>}
          <form onSubmit={submit} className="card flex flex-col gap-4">
            <div>
              <label className="label">Task title</label>
              <input name="title" required value={form.title} onChange={change} className="input" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea name="description" rows={3} value={form.description} onChange={change} className="input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Hours spent</label>
                <input name="hoursSpent" type="number" min="0" step="0.5" required value={form.hoursSpent} onChange={change} className="input" />
              </div>
              <div>
                <label className="label">Date</label>
                <input name="date" type="date" required value={form.date} onChange={change} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Milestone</label>
              <select name="milestoneId" required value={form.milestoneId} onChange={change} className="input">
                <option value="">Select milestone</option>
                {milestones.map(m => (
                  <option key={m._id} value={m._id}>{m.projectTitle} — {m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Proof files (max 3, 10MB each)</label>
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.zip,.js,.py,.java,.cpp,.txt" onChange={e => setFiles(Array.from(e.target.files).slice(0, 3))} className="input pt-1.5" />
              {files.length > 0 && (
                <ul className="mt-2 text-xs text-gray-500 flex flex-col gap-0.5">
                  {files.map(f => <li key={f.name}>• {f.name}</li>)}
                </ul>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />} Log task
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
