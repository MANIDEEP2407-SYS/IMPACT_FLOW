import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import StudentSidebar from '../../components/StudentSidebar.jsx';
import Spinner from '../../components/Spinner.jsx';
import ScrollReveal from '../../components/ScrollReveal.jsx';

const FEATURES = [
  '6-char join code',
  'Instant enrollment',
  'Project access',
];

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <Navbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <ScrollReveal direction="up" delay={0}>
            <div className="w-full max-w-sm">

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(60,221,199,0.16), rgba(189,194,255,0.16))',
                    border: '1.5px solid var(--border-cyber)',
                    boxShadow: '0 4px 20px rgba(60,221,199,0.18), 0 0 40px rgba(60,221,199,0.12)',
                  }}>
                  🎓
                </div>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-black mb-1" style={{
                  background: 'linear-gradient(135deg, var(--cyber-700), var(--cyber-400), var(--neon-700))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Join a Course</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter the 6-character code from your faculty and unlock the course dashboard.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {FEATURES.map(feature => (
                    <span
                      key={feature}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {error && <div className="alert-error mb-5">{error}</div>}

              <div className="rounded-2xl overflow-hidden" style={{
                background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)',
                backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-lg)',
              }}>
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, var(--cyber-400), var(--neon-400))' }} />
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
                    <div className="flex justify-between gap-1 mt-2 px-1">
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            background: i < code.length
                              ? 'linear-gradient(90deg, var(--neon-400), var(--cyber-400))'
                              : 'var(--neon-50)',
                            boxShadow: i < code.length ? '0 0 8px rgba(99,102,241,0.2)' : 'none',
                          }} />
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading || !isReady} className="btn-teal btn-glow h-11">
                    {loading ? <><Spinner size="sm" /> Joining…</> : isReady ? 'Join Course →' : 'Enter code above'}
                  </button>
                </form>
              </div>

              <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                Secure access. One code. Direct course entry.
              </p>
            </div>
          </ScrollReveal>
        </main>
      </div>
    </div>
  );
}
