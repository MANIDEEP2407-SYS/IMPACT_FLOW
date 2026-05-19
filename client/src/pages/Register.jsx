import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useAuthStore from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';
import HistoryControls from '../components/HistoryControls.jsx';
import SEO from '../components/SEO.jsx';

const ROLES = [
  { value: 'student', label: 'Scholar', desc: 'Join courses, log tasks, submit milestones' },
  { value: 'faculty', label: 'Faculty Node', desc: 'Create courses, manage projects, review teams' },
];

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    college: '',
    department: '',
    semester: '',
    rollNo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isStudent = form.role === 'student';

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.semester) payload.semester = Number(payload.semester);
      if (!payload.semester || payload.role !== 'student') delete payload.semester;
      if (!payload.rollNo || payload.role !== 'student') delete payload.rollNo;
      const { data } = await api.post('/auth/register', payload);
      setUser(data.user);
      navigate(data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden text-[#d4e4fa] relative" style={{ background: '#051424', fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute left-4 top-4 z-20">
        <HistoryControls variant="dark" />
      </div>
      <SEO
        title="Register"
        description="Create your ImpactFlow account and start managing academic projects with contribution tracking."
        keywords="ImpactFlow register, student registration, faculty registration, academic project platform"
        path="/register"
      />

      <main className="min-h-screen flex">
        <section className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 xl:p-14 overflow-hidden" style={{ background: 'linear-gradient(155deg, #051424 0%, #0a1a2b 55%, #131e8c 100%)' }}>
          <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#818cf8]/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#3cddc7]/15 blur-[120px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1c2b3c] border border-[#c0c1ff]/20 shadow-[0_0_20px_rgba(192,193,255,0.2)]">
              <span className="text-[#c0c1ff] text-xl">◆</span>
            </div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#d4e4fa]">ImpactFlow</h1>
          </div>

          <div className="relative z-10 max-w-xl space-y-8">
            <h2 className="text-[32px] md:text-[48px] leading-[1.1] tracking-tighter font-black">
              Build Your<br />
              <span style={{ background: 'linear-gradient(to right, #818cf8, #2dd4bf, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Academic Command
              </span><br />
              Center.
            </h2>
            <p className="text-[#c7c4d7] text-[16px] leading-7 max-w-lg">
              Launch your workspace with secure identity, role-based access, and transparent contribution tracking from day one.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {['Zero-Trust Security', 'Live Progress Telemetry', 'Fair Contribution Analytics'].map((item) => (
                <div key={item} className="px-5 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-2 h-2 rounded-full bg-[#44e2cd]" />
                  <span className="text-[#e4e1ed] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <footer className="relative z-10">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#908fa0] opacity-70">
              Trusted by high-rigor academic programs
            </p>
          </footer>
        </section>

        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative" style={{ background: '#051424' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,193,255,0.05),transparent_55%)] pointer-events-none" />
          <div className="w-full max-w-xl space-y-8 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#e4e1ed]">Create your account.</h3>
              <p className="text-[#c7c4d7]">
                Already onboarded?{' '}
                <Link className="text-[#44e2cd] font-bold hover:underline underline-offset-4 decoration-2" to="/login">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="rounded-3xl p-6 md:p-8" style={{ background: 'rgba(13,28,45,0.68)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 50px rgba(0,0,0,0.35)' }}>
              <form onSubmit={submit} className="space-y-5">
                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 font-medium" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ffb4ab' }}>
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((role) => {
                      const active = form.role === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, role: role.value }))}
                          className="rounded-xl p-3 text-left transition-all duration-200"
                          style={{
                            background: active ? 'rgba(192,193,255,0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${active ? 'rgba(192,193,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
                          }}
                        >
                          <p className="text-sm font-bold text-[#e4e1ed]">{role.label}</p>
                          <p className="text-[11px] mt-1 text-[#c7c4d7]">{role.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Full name</label>
                  <input name="name" value={form.name} onChange={change} required placeholder="Manideep Kumar" className="w-full rounded-xl px-5 py-3.5 outline-none transition-all duration-300" style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Academic Email</label>
                    <input name="email" value={form.email} onChange={change} type="email" required placeholder="name@college.edu" className="w-full rounded-xl px-5 py-3.5 outline-none transition-all duration-300" style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Password</label>
                    <input name="password" value={form.password} onChange={change} type="password" required placeholder="Minimum 6 characters" className="w-full rounded-xl px-5 py-3.5 outline-none transition-all duration-300" style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">College</label>
                    <input name="college" value={form.college} onChange={change} required placeholder="Your college name" className="w-full rounded-xl px-5 py-3.5 outline-none transition-all duration-300" style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Department</label>
                    <input name="department" value={form.department} onChange={change} required placeholder="e.g. CSE" className="w-full rounded-xl px-5 py-3.5 outline-none transition-all duration-300" style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }} />
                  </div>
                </div>

                {isStudent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Semester</label>
                      <input name="semester" value={form.semester} onChange={change} type="number" min="1" max="8" required placeholder="1-8" className="w-full rounded-xl px-5 py-3.5 outline-none transition-all duration-300" style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }} />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] mb-2 text-[#c7c4d7]">Roll No (optional)</label>
                      <input name="rollNo" value={form.rollNo} onChange={change} placeholder="22CSE001" className="w-full rounded-xl px-5 py-3.5 outline-none transition-all duration-300" style={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e1ed' }} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-lg active:scale-95 transition-transform shadow-[0_4px_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#ffffff' }}
                >
                  {loading ? <Spinner size="sm" /> : null}
                  Create Account
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
