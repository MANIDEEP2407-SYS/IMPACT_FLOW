import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';

export default function SubmitMilestone() {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState(null);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/milestones/${milestoneId}`),
      api.get(`/milestones/${milestoneId}/submission`),
    ])
      .then(([milestoneRes, submissionRes]) => {
        setMilestone(milestoneRes.data.milestone);
        setExisting(submissionRes.data.submission);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load milestone');
      });
  }, [milestoneId]);

  const isPastDue = milestone && new Date() > new Date(milestone.dueDate);

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('notes', notes);
      files.forEach(f => fd.append('files', f));
      await api.post(`/milestones/${milestoneId}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
      setLoading(false);
    }
  }

  if (existing) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
        <Navbar />
        <div className="flex flex-1">
          <StudentSidebar />
          <main className="flex-1 p-6 max-w-lg mx-auto w-full flex items-center justify-center">
            <ScrollReveal direction="up" delay={0}>
              <div className="rounded-2xl text-center py-8 px-6"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--success-border)', backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(74,222,128,0.1)' }}>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'var(--success-bg)', border: '1.5px solid var(--success-border)' }}>✅</div>
                <h2 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>Already submitted</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Submitted on {new Date(existing.submittedAt).toLocaleString()}
                </p>
                {existing.files?.length > 0 && (
                  <div className="mt-4 flex flex-col gap-1.5">
                    {existing.files.map(f => (
                      <a key={f.publicId} href={f.url} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 inline-block"
                        style={{ background: 'var(--neon-50)', border: '1px solid var(--border-neon)', color: 'var(--neon-700)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--neon-50)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--neon-50)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                        📎 {f.url.split('/').pop()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-lg mx-auto w-full page-enter">

          <ScrollReveal direction="up" delay={0}>
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--cyber-300)' }}>Submission</p>
              <h1 className="text-2xl font-black" style={{
                background: 'linear-gradient(135deg, #ccfbf1, var(--cyber-400), #a5b4fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Submit Milestone</h1>
            </div>
          </ScrollReveal>

          {isPastDue && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}>
              ⚠ This milestone is past its due date. Submission is disabled.
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}>
              {error}
            </div>
          )}

          <ScrollReveal direction="up" delay={100}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg, var(--cyber-400), var(--neon-400))' }} />
              <form onSubmit={submit} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="label">Notes / Summary</label>
                  <textarea rows={5} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Describe what your team completed..."
                    className="input resize-none" style={{ lineHeight: '1.6' }} />
                </div>
                <div>
                  <label className="label">Upload files</label>
                  <div
                    className="rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-300"
                    style={{
                      borderColor: dragOver ? 'var(--neon-400)' : 'var(--border-neon)',
                      background: dragOver ? 'var(--neon-50)' : 'var(--neon-50)',
                      boxShadow: dragOver ? '0 0 20px var(--neon-50)' : 'none',
                    }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); setFiles(Array.from(e.dataTransfer.files)); }}
                    onClick={() => document.getElementById('ms-fi').click()}
                  >
                    <input id="ms-fi" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.zip,.js,.py,.java,.cpp,.txt" className="hidden" onChange={e => setFiles(Array.from(e.target.files))} />
                    <div className="text-2xl mb-1">{files.length > 0 ? '📎' : '⬆️'}</div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Drop files here or click to browse'}
                    </p>
                  </div>
                  {files.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {files.map(f => (
                        <li key={f.name} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                          style={{ background: 'var(--neon-50)', border: '1px solid var(--border-neon)' }}>
                          <span>📄</span>
                          <span className="font-mono font-semibold" style={{ color: 'var(--neon-700)' }}>{f.name}</span>
                          <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>{(f.size / 1024).toFixed(0)} KB</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="submit" disabled={loading || isPastDue} className="btn-primary btn-glow h-11 flex items-center justify-center gap-2">
                  {loading && <Spinner size="sm" />} Submit milestone
                </button>
              </form>
            </div>
          </ScrollReveal>
        </main>
      </div>
    </div>
  );
}
