import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(145deg, #eef2ff 0%, #ffffff 50%, #f0fdfa 100%)' }}>
      <div className="text-center animate-slide-up">
        {/* Ring decoration */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'linear-gradient(135deg, #eef2ff, #f0fdfa)',
            border: '1.5px solid #c7d2fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 38, fontWeight: 900, letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #4f46e5, #0d9488)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>404</span>
          </div>
          {/* Spinning dashed ring */}
          <svg className="animate-spin-slow" style={{ position: 'absolute', inset: -16, width: 152, height: 152, opacity: 0.5 }} viewBox="0 0 152 152" fill="none">
            <circle cx="76" cy="76" r="72" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="10 7" />
          </svg>
        </div>

        {/* Eyebrow */}
        <div style={{
          display: 'inline-block', marginBottom: 16,
          padding: '4px 14px', borderRadius: 999,
          background: '#eef2ff', border: '1.5px solid #c7d2fe',
          fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4f46e5',
        }}>
          Page not found
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1e1b4b', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Nothing here but silence.
        </h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginBottom: 32, lineHeight: 1.6 }}>
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
