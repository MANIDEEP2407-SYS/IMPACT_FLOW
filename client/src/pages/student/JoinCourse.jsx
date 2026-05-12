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
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post(`/courses/${code.toUpperCase()}/join`, { joinCode: code.toUpperCase() });
      navigate(`/student/courses/${data.course._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join course');
      setLoading(false);
    }
  }

  const isReady = code.length === 6;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8faff' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm animate-slide-up">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', border: '1.5px solid #99f6e4', boxShadow: '0 4px 16px rgba(13,148,136,0.15)' }}>
                🎓
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-black mb-1" style={{ color: '#1e1b4b' }}>Join a Course</h1>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Enter the 6-character code from your faculty</p>
            </div>

            {error && <div className="alert-error mb-5">{error}</div>}

            <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1.5px solid #e0e7ff', boxShadow: '0 4px 16px rgba(79,70,229,0.08)' }}>
              {/* Top stripe */}
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #0d9488, #4f46e5)' }} />

              <form onSubmit={submit} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="label text-center block">Join Code</label>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    autoFocus
                    required
                    className="input text-center font-mono font-black uppercase"
                    style={{ fontSize: '28px', letterSpacing: '0.35em' }}
                  />

                  {/* Progress dots */}
                  <div className="flex justify-between gap-1 mt-2 px-1">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-200"
                        style={{
                          background: i < code.length
                            ? `linear-gradient(90deg, #4f46e5, #0d9488)`
                            : '#e0e7ff',
                        }} />
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading || !isReady} className="btn-teal h-11">
                  {loading ? <><Spinner size="sm" /> Joining…</> : isReady ? 'Join Course →' : 'Enter code above'}
                </button>
              </form>
            </div>

            <p className="text-center mt-4 text-xs" style={{ color: '#9ca3af' }}>
              Don't have a code? Ask your faculty member.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
