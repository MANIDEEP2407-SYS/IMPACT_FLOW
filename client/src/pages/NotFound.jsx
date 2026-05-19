import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-app)' }}>
      <div className="text-center animate-slide-up">
        {/* Ring decoration */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'var(--bg-panel)',
            border: '1.5px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 38, fontWeight: 900, letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-400))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>404</span>
          </div>
          {/* Spinning dashed ring */}
          <svg className="animate-spin-slow" style={{ position: 'absolute', inset: -16, width: 152, height: 152, opacity: 0.5 }} viewBox="0 0 152 152" fill="none">
            <circle cx="76" cy="76" r="72" stroke="var(--neon-700)" strokeWidth="1.5" strokeDasharray="10 7" />
          </svg>
        </div>

        {/* Eyebrow */}
        <div style={{
          display: 'inline-block', marginBottom: 16,
          padding: '4px 14px', borderRadius: 999,
          background: 'var(--neon-50)', border: '1.5px solid var(--border-neon)',
          fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--neon-300)',
        }}>
          Page not found
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Nothing here but silence.
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          The page you're looking for has moved, been removed,<br />or never existed.
        </p>

        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', fontSize: 14 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 6 }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
