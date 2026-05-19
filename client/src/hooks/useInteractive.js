import { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════
   useScrollReveal — Intersection Observer driven reveal
   ═══════════════════════════════════════════════════════ */
export function useScrollReveal(options = {}) {
  const [node, setNode] = useState(null);
  const ref = useCallback((n) => setNode(n), []);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!node) return;

    // Check if already in viewport immediately
    const rect = node.getBoundingClientRect();
    if (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    ) {
      // Small delay for mount animation feel
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin || '0px' }
    );
    observer.observe(node);

    // Fallback: always show after 1.5s regardless to prevent getting stuck
    const fallback = setTimeout(() => setIsVisible(true), 1500);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [node, options.threshold, options.rootMargin]);

  return { ref, isVisible };
}

/* ═══════════════════════════════════════════════════════
   useStaggerReveal — reveal children one by one
   ═══════════════════════════════════════════════════════ */
export function useStaggerReveal(count, baseDelay = 80) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0 });
  return {
    containerRef: ref,
    getItemStyle: (index) => ({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
      transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * baseDelay}ms`,
    }),
    isVisible,
  };
}

/* ═══════════════════════════════════════════════════════
   useTilt3D — 3D perspective tilt on mouse hover
   ═══════════════════════════════════════════════════════ */
export function useTilt3D(intensity = 12) {
  const [node, setNode] = useState(null);
  const ref = useCallback((n) => setNode(n), []);

  const handleMove = useCallback((e) => {
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02, 1.02, 1.02)`;
    // Dynamic shine
    const shine = node.querySelector('.tilt-shine');
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.12), transparent 60%)`;
    }
  }, [intensity, node]);

  const handleLeave = useCallback(() => {
    if (!node) return;
    node.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
    const shine = node.querySelector('.tilt-shine');
    if (shine) shine.style.background = 'transparent';
  }, [node]);

  useEffect(() => {
    if (!node) return;
    node.style.transition = 'transform 0.15s ease-out';
    node.style.transformStyle = 'preserve-3d';
    node.addEventListener('mousemove', handleMove);
    node.addEventListener('mouseleave', handleLeave);
    return () => {
      node.removeEventListener('mousemove', handleMove);
      node.removeEventListener('mouseleave', handleLeave);
    };
  }, [node, handleMove, handleLeave]);

  return ref;
}

/* ═══════════════════════════════════════════════════════
   useMagneticHover — element subtly follows cursor
   ═══════════════════════════════════════════════════════ */
export function useMagneticHover(strength = 0.3) {
  const [node, setNode] = useState(null);
  const ref = useCallback((n) => setNode(n), []);

  useEffect(() => {
    if (!node) return;

    const handleMove = (e) => {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      node.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const handleLeave = () => {
      node.style.transform = 'translate(0, 0)';
      node.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    const handleEnter = () => {
      node.style.transition = 'transform 0.1s ease-out';
    };

    node.addEventListener('mousemove', handleMove);
    node.addEventListener('mouseleave', handleLeave);
    node.addEventListener('mouseenter', handleEnter);
    return () => {
      node.removeEventListener('mousemove', handleMove);
      node.removeEventListener('mouseleave', handleLeave);
      node.removeEventListener('mouseenter', handleEnter);
    };
  }, [node, strength]);

  return ref;
}

/* ═══════════════════════════════════════════════════════
   useCountUp — animate a number counting up
   ═══════════════════════════════════════════════════════ */
export function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });

  useEffect(() => {
    if (!isVisible || !target) return;
    let start = 0;
    const end = typeof target === 'number' ? target : parseInt(target) || 0;
    if (end === 0) { setValue(target); return; }
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  return { ref, value };
}

/* ═══════════════════════════════════════════════════════
   useParallax — subtle parallax on scroll
   ═══════════════════════════════════════════════════════ */
export function useParallax(speed = 0.3) {
  const [node, setNode] = useState(null);
  const ref = useCallback((n) => setNode(n), []);

  useEffect(() => {
    if (!node) return;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = node.getBoundingClientRect();
          const offset = (rect.top - window.innerHeight / 2) * speed;
          node.style.transform = `translateY(${offset}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [node, speed]);

  return ref;
}

/* ═══════════════════════════════════════════════════════
   useRipple — material-style ripple on click
   ═══════════════════════════════════════════════════════ */
export function useRipple() {
  const [node, setNode] = useState(null);
  const ref = useCallback((n) => setNode(n), []);

  useEffect(() => {
    if (!node) return;
    node.style.position = 'relative';
    node.style.overflow = 'hidden';

    const handleClick = (e) => {
      const rect = node.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-expand 0.6s ease-out forwards;
        pointer-events: none;
        z-index: 100;
      `;
      node.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    };

    node.addEventListener('click', handleClick);
    return () => node.removeEventListener('click', handleClick);
  }, [node]);

  return ref;
}

/* ═══════════════════════════════════════════════════════
   useTypewriter — animated text reveal
   ═══════════════════════════════════════════════════════ */
export function useTypewriter(text, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  const { ref, isVisible } = useScrollReveal({ threshold: 0.5 });

  useEffect(() => {
    if (!isVisible || !text) return;
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [isVisible, text, speed]);

  return { ref, displayed };
}
