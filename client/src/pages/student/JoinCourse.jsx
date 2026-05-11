import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function JoinCourse() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/courses/${code.toUpperCase()}/join`, { joinCode: code.toUpperCase() });
      navigate(`/student/courses/${data.course._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join course');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 p-6 max-w-sm mx-auto w-full pt-16">
          <h1 className="text-xl font-bold mb-2">Join a course</h1>
          <p className="text-sm text-gray-500 mb-6">Enter the 6-character code from your faculty.</p>
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">{error}</div>}
          <form onSubmit={submit} className="card flex flex-col gap-4">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              className="input text-center text-2xl tracking-widest font-mono uppercase"
              required
            />
            <button type="submit" disabled={loading || code.length !== 6} className="btn-primary flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />} Join course
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
