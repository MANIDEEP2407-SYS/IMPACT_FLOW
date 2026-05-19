import { useScrollReveal } from '../hooks/useInteractive.js';

/**
 * ScrollReveal — wraps children and fades/slides them in when scrolled into view.
 */
export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  distance = 40,
  className = '',
  style = {},
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0 });

  const transforms = {
    up:    `translateY(${distance}px)`,
    down:  `translateY(-${distance}px)`,
    left:  `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    scale: `scale(0.9)`,
    none:  'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) translateX(0) scale(1)' : transforms[direction],
        transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
