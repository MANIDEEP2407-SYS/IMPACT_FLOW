/* Animated entry ring — cinematic dark mode */
export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      {/* Layered rings */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer ring */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--neon-50)',
          border: '1.5px solid var(--border-neon)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Spinning dashed ring */}
          <svg
            className="animate-spin-slow"
            style={{ position: 'absolute', inset: -10, width: 100, height: 100, opacity: 0.4 }}
            viewBox="0 0 100 100" fill="none"
          >
            <circle cx="50" cy="50" r="46" stroke="var(--neon-400)" strokeWidth="1.5" strokeDasharray="8 6" />
          </svg>

          {/* Inner icon */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--neon-400), var(--cyber-300))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 260, lineHeight: 1.6 }}>{message}</p>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
