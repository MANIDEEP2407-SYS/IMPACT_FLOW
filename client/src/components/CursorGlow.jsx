import { useEffect, useRef } from 'react';

/**
 * CursorGlow — renders a glowing orb that follows the cursor.
 * Renders into a fixed canvas overlay, zero layout impact.
 */
export default function CursorGlow() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let mouse = { x: -200, y: -200 };
    let trail = { x: -200, y: -200 };
    let raf;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const draw = () => {
      trail.x += (mouse.x - trail.x) * 0.12;
      trail.y += (mouse.y - trail.y) * 0.12;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Outer glow
      const g1 = ctx.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, 180);
      g1.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
      g1.addColorStop(0.4, 'rgba(45, 212, 191, 0.03)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Inner core
      const g2 = ctx.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, 40);
      g2.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, 40, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMove);
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.8,
      }}
      aria-hidden="true"
    />
  );
}
