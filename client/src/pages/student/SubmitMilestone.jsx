import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function SubmitMilestone() {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState(null);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    api.get(`/milestones/${milestoneId}/submission`).then(r => {
      setExisting(r.data.submission);
    });
  }, [milestoneId]);

  const isPastDue = milestone && new Date() > new Date(milestone.dueDate);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <StudentSidebar />
          <main className="flex-1 p-6 max-w-lg mx-auto w-full">
            <div className="card text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <h2 className="font-bold text-lg">Already submitted</h2>
              <p className="text-sm text-gray-500 mt-1">Submitted on {new Date(existing.submittedAt).toLocaleString()}</p>
              {existing.files?.length > 0 && (
                <div className="mt-4 flex flex-col gap-1">
                  {existing.files.map(f => (
                    <a key={f.publicId} href={f.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">{f.url.split('/').pop()}</a>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">Submit Milestone</h1>
          {isPastDue && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">
              This milestone is past its due date. Submission is disabled.
            </div>
          )}
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">{error}</div>}
          <form onSubmit={submit} className="card flex flex-col gap-4">
            <div>
              <label className="label">Notes / Summary</label>
              <textarea rows={5} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe what your team completed..." className="input resize-none" />
            </div>
            <div>
              <label className="label">Upload files</label>
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.zip,.js,.py,.java,.cpp,.txt" onChange={e => setFiles(Array.from(e.target.files))} className="input pt-1.5" />
              {files.length > 0 && (
                <ul className="mt-2 text-xs text-gray-500 flex flex-col gap-0.5">
                  {files.map(f => <li key={f.name}>• {f.name}</li>)}
                </ul>
              )}
            </div>
            <button type="submit" disabled={loading || isPastDue} className="btn-primary flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />} Submit milestone
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
