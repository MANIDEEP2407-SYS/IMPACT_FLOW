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
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    api.get('/courses/enrolled').then(async r => {
      const courses = r.data.courses;
      const all = [];
      for (const c of courses) {
        const pr = await api.get(`/courses/${c._id}/projects`);
        for (const p of pr.data.projects) {
          const mr = await api.get(`/projects/${p._id}/milestones`);
          all.push(...mr.data.milestones.map(m => ({ ...m, projectTitle: p.title })));
        }
      }
      setMilestones(all);
    });
  }, []);

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }
  function handleFiles(list) { setFiles(Array.from(list).slice(0, 3)); }

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
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
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-xl mx-auto w-full animate-fade-in">

          <div className="mb-6">
            <p className="section-label mb-1">Daily Log</p>
            <h1 className="text-2xl font-black" style={{ color: '#1e1b4b' }}>Log a Task</h1>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Document your work with proof files for milestone tracking</p>
          </div>

          {error && <div className="alert-error mb-5">{error}</div>}

          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', border: '1.5px solid #e0e7ff', boxShadow: '0 4px 16px rgba(79,70,229,0.08)' }}>
            {/* Form header stripe */}
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #4f46e5, #0d9488)' }} />

            <form onSubmit={submit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="label">Task title</label>
                <input name="title" placeholder="e.g. Implemented login API" required value={form.title} onChange={change} className="input" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" rows={3} placeholder="Describe what you worked on…" value={form.description} onChange={change} className="input resize-none" style={{ lineHeight: '1.6' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Hours spent</label>
                  <input name="hoursSpent" type="number" min="0" step="0.5" placeholder="e.g. 2.5" required value={form.hoursSpent} onChange={change} className="input" />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input name="date" type="date" required value={form.date} onChange={change} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Milestone</label>
                <select name="milestoneId" required value={form.milestoneId} onChange={change} className="input">
                  <option value="">Select milestone…</option>
                  {milestones.map(m => (
                    <option key={m._id} value={m._id}>{m.projectTitle} — {m.title}</option>
                  ))}
                </select>
              </div>

              {/* Drop zone */}
              <div>
                <label className="label">Proof files <span style={{ color: '#9ca3af', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(max 3 · 10MB each)</span></label>
                <div
                  className="rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200"
                  style={{ borderColor: dragOver ? '#4f46e5' : '#c7d2fe', background: dragOver ? '#eef2ff' : '#f8faff' }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => document.getElementById('fi').click()}
                >
                  <input id="fi" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.zip,.js,.py,.java,.cpp,.txt" className="hidden" onChange={e => handleFiles(e.target.files)} />
                  <div className="text-2xl mb-1">{files.length > 0 ? '📎' : '⬆️'}</div>
                  <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>
                    {files.length > 0 ? 'Click to change files' : 'Drop files here or click to browse'}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>PDF · PNG · JPG · ZIP · JS · PY · JAVA · CPP · TXT</p>
                </div>
                {files.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {files.map(f => (
                      <li key={f.name} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                        style={{ background: '#eef2ff', border: '1.5px solid #c7d2fe' }}>
                        <span>📄</span>
                        <span className="font-mono font-semibold" style={{ color: '#4338ca' }}>{f.name}</span>
                        <span className="ml-auto" style={{ color: '#9ca3af' }}>{(f.size / 1024).toFixed(0)} KB</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary h-11">
                {loading ? <><Spinner size="sm" /> Logging task…</> : '✓ Log Task'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
