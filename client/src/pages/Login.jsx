import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useAuthStore from '../store/authStore.js';
import Spinner from '../components/Spinner.jsx';
import SEO from '../components/SEO.jsx';

/* ── Inline SVG icon set (no emojis) ── */
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}
function IconCpu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6"  height="6" />
      <line x1="9"  y1="1"  x2="9"  y2="4" />
      <line x1="15" y1="1"  x2="15" y2="4" />
      <line x1="9"  y1="20" x2="9"  y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9"  x2="23" y2="9" />
      <line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1"  y1="9"  x2="4"  y2="9" />
      <line x1="1"  y1="15" x2="4"  y2="15" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, display: 'inline' }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: IconShield,
    title: 'Zero-Trust Security',
    desc: 'HTTPOnly JWT cookies. Role-based gates. No shortcuts.',
  },
  {
    Icon: IconBarChart,
    title: 'Live Contribution Scores',
    desc: 'Every task logged. Every hour counted. Fairly.',
  },
  {
    Icon: IconCpu,
    title: 'AI Transparency Layer',
    desc: 'Automated scoring flags AI-assisted submissions instantly.',
  },
];

const METRICS = [
  { value: '360°',  label: 'Student visibility' },
  { value: 'Real',  label: 'Time dashboards' },
  { value: 'Fair',  label: 'Contribution grading' },
];

const DEMO_USERS = [
  {
    role:     'Faculty',
    name:     'Dr. Priya Sharma',
    email:    'faculty@demo.com',
    password: 'demo1234',
    tag:      'Course Manager',
    color:    { bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '#c7d2fe', dot: '#4f46e5', label: '#4338ca', sub: '#818cf8' },
  },
  {
    role:     'Student',
    name:     'Arjun Reddy',
    email:    'student@demo.com',
    password: 'demo1234',
    tag:      'Sem 5 · 22CSE001',
    color:    { bg: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', border: '#99f6e4', dot: '#0d9488', label: '#0f766e', sub: '#14b8a6' },
  },
];

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user);
      navigate(data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      <SEO
        title="Login"
        description="Sign in to ImpactFlow — the academic project management platform for faculty and students. Track contributions, log tasks, and submit milestones."
        keywords="ImpactFlow login, college project management login, faculty student login, academic project platform"
        path="/login"
      />

      {/* ════════════════════════════════════
          LEFT  — Brand Panel
      ════════════════════════════════════ */}
      <div
        className="hidden lg:flex w-[46%] shrink-0 flex-col relative overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 35%, #0f766e 100%)',
        }}
      >
        {/* ── Geometric mesh overlay ── */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }} aria-hidden>
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* ── Ambient blobs ── */}
        <div className="absolute pointer-events-none" style={{ top: '-120px', left: '-120px', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 65%)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-80px', right: '-80px', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.2) 0%, transparent 65%)' }} />

        {/* ── Diagonal accent stripe ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute', top: '30%', left: '-10%',
            width: '120%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            transform: 'rotate(-15deg)',
          }} />
          <div style={{
            position: 'absolute', top: '55%', left: '-10%',
            width: '120%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            transform: 'rotate(-15deg)',
          }} />
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-14">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                <path d="M12 2L3 7l9 5 9-5-9-5z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M3 12l9 5 9-5" stroke="rgba(165,243,252,0.8)" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M3 17l9 5 9-5" stroke="rgba(165,243,252,0.5)" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#ffffff', fontWeight: 800, fontSize: 17, lineHeight: 1.1, letterSpacing: '-0.02em' }}>ImpactFlow</p>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 1 }}>Team ImpactFlow</p>
            </div>
          </div>

          {/* Hero copy */}
          <div style={{ marginTop: 'auto', marginBottom: 32 }}>
            {/* Eyebrow label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 24, height: 1, background: 'rgba(165,180,252,0.5)' }} />
              <span style={{ color: 'rgba(165,180,252,0.7)', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Academic Project Platform
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(1.9rem, 2.8vw, 2.9rem)',
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: 20,
            }}>
              Stop Guessing.<br />
              Start Measuring<br />
              <span style={{
                background: 'linear-gradient(90deg, #a5b4fc 0%, #5eead4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                What Matters.
              </span>
            </h1>

            {/* Sub-copy */}
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.75, maxWidth: 300 }}>
              The platform where faculty design courses,
              students ship real work, and every contribution
              is scored, verified, and visible.
            </p>
          </div>

          {/* Metric strip */}
          <div style={{
            display: 'flex', gap: 0,
            marginBottom: 28,
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {METRICS.map((m, i) => (
              <div key={m.label} style={{
                flex: 1, padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                borderRight: i < METRICS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                textAlign: 'center',
              }}>
                <p style={{ color: '#ffffff', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{m.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, marginTop: 4, fontWeight: 600, letterSpacing: '0.04em' }}>{m.label}</p>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'rgba(165,180,252,0.12)',
                  border: '1px solid rgba(165,180,252,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  color: '#a5b4fc',
                }}>
                  <Icon />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 12.5, lineHeight: 1.2 }}>{title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11.5, marginTop: 3, lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div style={{
            borderRadius: 12,
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            borderLeft: '3px solid rgba(94,234,212,0.5)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontStyle: 'italic', lineHeight: 1.65, fontWeight: 500 }}>
              "From code to contribution — every task tells a story."
            </p>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginTop: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — Team ImpactFlow
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          RIGHT  — Auth Form
      ════════════════════════════════════ */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: 'linear-gradient(160deg, #f8faff 0%, #ffffff 55%, #f0fdfa 100%)' }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                <path d="M12 2L3 7l9 5 9-5-9-5z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M3 12l9 5 9-5" stroke="rgba(165,243,252,0.9)" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M3 17l9 5 9-5" stroke="rgba(165,243,252,0.5)" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #4f46e5, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ImpactFlow
              </p>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ca3af', marginTop: 1 }}>
                Team ImpactFlow
              </p>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1e1b4b', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }}>
              Welcome back.
            </h2>
            <p style={{ fontSize: 13.5, color: '#6b7280' }}>
              New here?{' '}
              <Link
                to="/register"
                style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#4338ca'}
                onMouseLeave={e => e.currentTarget.style.color = '#4f46e5'}
              >
                Create your account
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-error mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                placeholder="you@university.edu"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ height: 44, marginTop: 4, fontSize: 14 }}
            >
              {loading
                ? <><Spinner size="sm" /> Signing in…</>
                : <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>Sign in <IconArrow /></span>
              }
            </button>
          </form>

          {/* ── Demo Quick Access ── */}
          <div style={{ marginTop: 28 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#e0e7ff' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #0d9488)',
                }} />
                <span style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Try with demo account
                </span>
              </div>
              <div style={{ flex: 1, height: 1, background: '#e0e7ff' }} />
            </div>

            {/* Demo cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {DEMO_USERS.map(u => (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => setForm({ email: u.email, password: u.password })}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: u.color.bg,
                    border: `1.5px solid ${u.color.border}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 18px rgba(0,0,0,0.08)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                >
                  {/* Role badge */}
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
                    textTransform: 'uppercase', marginBottom: 8,
                    padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.7)',
                    border: `1px solid ${u.color.border}`,
                    color: u.color.label,
                  }}>
                    {u.role}
                  </span>

                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${u.color.dot}, ${u.color.sub})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>
                      {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#1e1b4b', lineHeight: 1.2 }}>{u.name}</p>
                      <p style={{ fontSize: 10, color: u.color.sub, marginTop: 1, fontWeight: 600 }}>{u.tag}</p>
                    </div>
                  </div>

                  {/* Credentials preview */}
                  <div style={{
                    width: '100%', borderRadius: 8, padding: '6px 10px',
                    background: 'rgba(255,255,255,0.6)',
                    border: `1px solid ${u.color.border}`,
                  }}>
                    <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, lineHeight: 1.6 }}>
                      <span style={{ color: u.color.label, fontWeight: 700 }}>ID  </span>{u.email}
                    </p>
                    <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>
                      <span style={{ color: u.color.label, fontWeight: 700 }}>PWD </span>demo1234
                    </p>
                  </div>

                  {/* Click hint */}
                  <p style={{ marginTop: 7, fontSize: 10, color: u.color.sub, fontWeight: 600, width: '100%', textAlign: 'right' }}>
                    Click to auto-fill →
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#d1d5db', fontWeight: 500 }}>
            © {new Date().getFullYear()} ImpactFlow · Team ImpactFlow
          </p>
        </div>
      </div>
    </div>
  );
}
