import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useAuthStore from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';

const ROLES = [
  { value: 'student', label: 'Student', icon: '🎓', desc: 'Join courses, log tasks, submit milestones' },
  { value: 'faculty', label: 'Faculty', icon: '🏫', desc: 'Create courses, manage projects, review teams' },
];

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    college: '', department: '', semester: '', rollNo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.semester) payload.semester = Number(form.semester);
      else delete payload.semester;
      if (!form.rollNo) delete payload.rollNo;
      const { data } = await api.post('/auth/register', payload);
      setUser(data.user);
      navigate(data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const isStudent = form.role === 'student';
  const isFaculty = form.role === 'faculty';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(145deg, #eef2ff 0%, #ffffff 50%, #f0fdfa 100%)' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden animate-slide-up"
        style={{ background: '#ffffff', boxShadow: '0 16px 48px rgba(79,70,229,0.12), 0 4px 16px rgba(79,70,229,0.06)', border: '1.5px solid #e0e7ff' }}
      >
        {/* Gradient header strip */}
        <div
          className="px-8 pt-8 pb-6"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 60%, #0f766e 100%)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white font-black text-sm">
              IF
            </div>
            <span className="text-white font-black text-lg tracking-tight">ImpactFlow</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Create your account</h1>
          <p className="text-white/60 text-sm">
            Already have one?{' '}
            <Link to="/login" className="text-white/90 font-semibold underline underline-offset-2">Sign in</Link>
          </p>
        </div>

        {/* Form body */}
        <div className="px-8 py-7">

          {error && (
            <div className="alert-error mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Role selector */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className="rounded-xl p-3 text-left transition-all duration-200"
                    style={{
                      background: form.role === r.value
                        ? (r.value === 'faculty' ? 'linear-gradient(135deg, #eef2ff, #e0e7ff)' : 'linear-gradient(135deg, #f0fdfa, #ccfbf1)')
                        : '#f8faff',
                      border: `1.5px solid ${form.role === r.value ? (r.value === 'faculty' ? '#c7d2fe' : '#99f6e4') : '#e0e7ff'}`,
                      boxShadow: form.role === r.value ? '0 2px 8px rgba(79,70,229,0.08)' : 'none',
                    }}
                  >
                    <div className="text-xl mb-1">{r.icon}</div>
                    <div className="text-sm font-bold" style={{ color: form.role === r.value ? (r.value === 'faculty' ? '#4338ca' : '#0f766e') : '#6b7280' }}>
                      {r.label}
                    </div>
                    <div className="text-[10px] leading-tight mt-0.5" style={{ color: '#9ca3af' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Email + Password */}
            <div>
              <label className="label">Full name</label>
              <input name="name" placeholder="Manideep Kumar" required value={form.name} onChange={change} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" placeholder="you@college.edu" required value={form.email} onChange={change} className="input" />
              </div>
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" placeholder="Min 6 chars" required value={form.password} onChange={change} className="input" />
              </div>
            </div>

            {/* College details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">College</label>
                <input name="college" placeholder="Your college name" required value={form.college} onChange={change} className="input" />
              </div>
              <div>
                <label className="label">Department</label>
                <input name="department" placeholder="e.g. CSE" required value={form.department} onChange={change} className="input" />
              </div>
              {isStudent && (
                <div>
                  <label className="label">Semester</label>
                  <input name="semester" type="number" placeholder="1–8" min="1" max="8" value={form.semester} onChange={change} className="input" />
                </div>
              )}
              {isStudent && (
                <div className="col-span-2">
                  <label className="label">Roll No <span style={{ color: '#9ca3af', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span></label>
                  <input name="rollNo" placeholder="e.g. 22CSE001" value={form.rollNo} onChange={change} className="input" />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary h-11 mt-1">
              {loading ? <><Spinner size="sm" /> Creating account…</> : 'Create account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
