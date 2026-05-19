import { useTilt3D } from '../hooks/useInteractive.js';

/**
 * TiltCard — a glassmorphic card with real-time 3D perspective tilt,
 * dynamic light shine, and border glow on hover.
 */
export default function TiltCard({
  children,
  className = '',
  style = {},
  intensity = 10,
  glowColor = 'rgba(99,102,241,0.15)',
  onClick,
}) {
  const tiltRef = useTilt3D(intensity);

  return (
    <div
      ref={tiltRef}
      className={`tilt-card ${className}`}
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Dynamic shine overlay */}
      <div
        className="tilt-shine"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'background 0.15s ease-out',
        }}
      />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
