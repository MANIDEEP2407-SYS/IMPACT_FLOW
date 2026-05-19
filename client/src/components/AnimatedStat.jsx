import { useCountUp, useScrollReveal } from '../hooks/useInteractive.js';

/**
 * AnimatedStat — a stat card with animated count-up number and
 * gradient icon container with glow.
 */
export default function AnimatedStat({
  icon: IconComp,
  label,
  value,
  scheme = 'indigo',
  suffix = '',
}) {
  const { ref, value: animatedVal } = useCountUp(
    typeof value === 'number' ? value : parseInt(value) || 0,
    1000
  );

  const isIndigo = scheme === 'indigo';
  const colors = isIndigo
    ? {
        bg: 'rgba(192,193,255,0.16)',
        border: 'var(--border-neon)',
        iconBg: 'linear-gradient(135deg, rgba(129,140,248,0.98), rgba(168,175,255,0.98))',
        glow: '0 8px 26px rgba(99,102,241,0.28)',
        text: '#f7f8ff',
        sub: 'var(--text-primary)',
      }
    : {
        bg: 'rgba(60,221,199,0.16)',
        border: 'var(--border-cyber)',
        iconBg: 'linear-gradient(135deg, rgba(45,212,191,0.98), rgba(98,250,227,0.98))',
        glow: '0 8px 26px rgba(45,212,191,0.26)',
        text: '#f6fffd',
        sub: 'var(--text-primary)',
      };

  const displayVal = typeof value === 'number' ? animatedVal : value;

  return (
    <div
      ref={ref}
      className="group"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = colors.glow;
        e.currentTarget.style.borderColor = isIndigo ? 'var(--neon-400)' : 'var(--cyber-400)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: colors.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: colors.glow,
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <div style={{ width: 22, height: 22 }}>{IconComp && <IconComp />}</div>
      </div>

      {/* Content */}
      <div>
        <p
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: colors.text,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}
        >
          {displayVal}{suffix}
        </p>
        <p style={{ fontSize: 12, color: colors.sub, marginTop: 4, fontWeight: 700 }}>
          {label}
        </p>
      </div>
    </div>
  );
}
