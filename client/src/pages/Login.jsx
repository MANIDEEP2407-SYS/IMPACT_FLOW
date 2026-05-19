import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useAuthStore from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';
import HistoryControls from '../components/HistoryControls.jsx';
import SEO from '../components/SEO.jsx';

function IconShield() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function IconChart() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
}
function IconCpu() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>;
}
function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}
function DemoGlyph({ kind }) {
  const map = {
    shield: IconShield,
    chart: IconChart,
    cpu: IconCpu,
  };
  const Glyph = map[kind] || IconShield;
  return <Glyph />;
}

const FEATURES = [
  { Icon: IconShield, title: 'Zero-Trust Security', desc: 'HTTPOnly JWT cookies. Role-based gates. No shortcuts.' },
  { Icon: IconChart, title: 'Live Contribution Scores', desc: 'Every task logged. Every hour counted. Fairly.' },
  { Icon: IconCpu, title: 'AI Transparency Layer', desc: 'Automated scoring flags AI-assisted submissions instantly.' },
];

const METRICS = [
  { value: '360°', label: 'Student visibility' },
  { value: 'Real', label: 'Time dashboards' },
  { value: 'Fair', label: 'Contribution grading' },
];

const DEMO_USERS = [
  { label: 'Faculty Node', title: 'Dr. Priya Sharma', email: 'faculty@demo.com', password: 'demo1234', kind: 'shield' },
  { label: 'Program Hub', title: 'Dr. Ananya Menon', email: 'faculty2@demo.com', password: 'demo1234', kind: 'cpu' },
  { label: 'Scholar', title: 'Arjun Reddy', email: 'student@demo.com', password: 'demo1234', kind: 'chart' },
  { label: 'Auditor', title: 'Meera Nair', email: 'student2@demo.com', password: 'demo1234', kind: 'shield' },
];

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(payload) {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      setUser(data.user);
      navigate(data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    await login(form);
  }

  function fillDemo(demo) {
    setForm({ email: demo.email, password: demo.password });
  }

  return (
    <div className="min-h-screen overflow-hidden text-[#d4e4fa] relative" style={{ background: '#051424', fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute left-4 top-4 z-20">
        <HistoryControls variant="dark" />
      </div>
      <SEO
        title="Login"
        description="Sign in to ImpactFlow — the academic project management platform for faculty and students."
        keywords="ImpactFlow login, college project management login, faculty student login, academic project platform"
        path="/login"
      />

      <main className="min-h-screen flex">
        <section className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 xl:p-14 overflow-hidden" style={{ background: 'linear-gradient(155deg, #051424 0%, #0a1a2b 55%, #003731 100%)' }}>
          <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#818cf8]/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#3cddc7]/15 blur-[120px]" />
          <div className="absolute top-1/4 right-10 opacity-40 animate-pulse">
            <div className="w-32 h-32 rounded-full border border-[#62fae3]/30 rotate-12" />
          </div>
          <div className="absolute bottom-1/4 left-10 opacity-30">
            <div className="w-48 h-48 rounded-full border border-[#c0c1ff]/20" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1c2b3c] border border-[#c0c1ff]/20 shadow-[0_0_20px_rgba(192,193,255,0.2)]">
                <span className="text-[#c0c1ff] text-xl">◆</span>
              </div>
              <h1 className="text-[24px] font-bold tracking-tight text-[#d4e4fa]">ImpactFlow</h1>
            </div>
          </div>

          <div className="relative z-10 max-w-xl space-y-8">
            <h2 className="text-[32px] md:text-[48px] leading-[1.1] tracking-tighter font-black">
              Stop Guessing. <br />
              <span style={{ background: 'linear-gradient(to right, #818cf8, #2dd4bf, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Start Measuring</span><br />
              What Matters.
            </h2>

            <div className="flex flex-col gap-4">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="p-5 rounded-xl flex items-center gap-4 transition-all duration-500" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-12 h-12 rounded-lg bg-[#122131] border border-white/10 flex items-center justify-center">
                    <span className="w-5 h-5"><Icon /></span>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#e4e1ed]">{title}</h3>
                    <p className="text-sm text-[#c7c4d7]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="relative z-10 w-full">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {METRICS.map((m, i) => (
                <div key={m.label} className="px-6 py-3 rounded-full flex items-center gap-2 whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: i === 1 ? '#c0c1ff' : '#44e2cd', boxShadow: '0 0 8px currentColor' }} />
                  <span className="text-[12px] tracking-widest uppercase font-semibold text-[#e4e1ed]">{m.value} {m.label}</span>
                </div>
              ))}
            </div>
          </footer>
        </section>

        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative" style={{ background: '#051424' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,193,255,0.05),transparent_55%)] pointer-events-none" />
          <div className="w-full max-w-md space-y-10 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#e4e1ed]">Welcome back.</h3>
              <p className="text-[#c7c4d7]">Access your academic command center.</p>
            </div>

            <div className="rounded-3xl p-6 md:p-8" style={{ background: 'rgba(13,28,45,0.68)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 50px rgba(0,0,0,0.35)' }}>
              <form onSubmit={submit} className="space-y-6">
                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 font-medium" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Academic Email</label>
                    <div className="relative">
                      <input
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        type="email"
                        placeholder="name@university.edu"
                        className="w-full rounded-xl px-5 py-4 outline-none transition-all duration-300"
                        style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#908fa0]">✉</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Terminal Password</label>
                    <div className="relative">
                      <input
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-xl px-5 py-4 outline-none transition-all duration-300"
                        style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#908fa0]">🔒</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-white/10 bg-[#0a0a1a] text-[#6366f1] focus:ring-[#6366f1] focus:ring-offset-[#051424]" />
                    <span className="text-sm text-[#c7c4d7]">Keep Session Active</span>
                  </label>
                  <a className="text-sm text-[#c0c1ff] hover:text-[#44e2cd] transition-colors" href="#">Forgot Access?</a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-lg active:scale-95 transition-transform shadow-[0_4px_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#ffffff' }}
                >
                  {loading ? <Spinner size="sm" /> : null}
                  Sign In
                </button>
              </form>

              <div className="space-y-4 mt-8">
                <p className="text-[12px] uppercase tracking-[0.18em] text-center text-[#908fa0] font-semibold">Rapid Access Demos</p>
                <div className="grid grid-cols-2 gap-3">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => { fillDemo(demo); login({ email: demo.email, password: demo.password }); }}
                      disabled={loading}
                      className="p-3 rounded-xl flex items-center gap-3 transition-all duration-300 text-left disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(192,193,255,0.12)' }}>
                        <span className="w-4 h-4 text-[#c0c1ff]"><DemoGlyph kind={demo.kind} /></span>
                      </div>
                      <span className="text-sm text-[#e4e1ed] font-medium">{demo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-[#c7c4d7]">
                  New to ImpactFlow?{' '}
                  <Link className="text-[#44e2cd] font-bold hover:underline underline-offset-4 decoration-2" to="/register">
                    Create your account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center px-6">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#908fa0] opacity-50">
              © 2024 ImpactFlow Academic Systems. Terminal Access Secured.
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
