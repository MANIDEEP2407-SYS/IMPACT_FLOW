import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useNavigationStore from '../store/navigationStore.js';

const THEMES = {
  glass: {
    baseBg: 'transparent',
    baseBorder: 'transparent',
    hoverBg: 'rgba(192,193,255,0.18)',
    hoverBorder: 'var(--border-neon)',
    icon: 'var(--text-secondary)',
    iconActive: 'var(--neon-300)',
    disabledIcon: 'var(--text-muted)',
  },
  dark: {
    baseBg: 'rgba(255,255,255,0.06)',
    baseBorder: 'rgba(255,255,255,0.12)',
    hoverBg: 'rgba(255,255,255,0.12)',
    hoverBorder: 'rgba(255,255,255,0.3)',
    icon: '#c7c4d7',
    iconActive: '#e4e1ed',
    disabledIcon: '#7c7c8a',
  },
};

export default function HistoryControls({ className = '', variant = 'glass' }) {
  const navigate = useNavigate();
  const canGoBack = useNavigationStore(s => s.canGoBack());
  const canGoForward = useNavigationStore(s => s.canGoForward());
  const goBack = useNavigationStore(s => s.goBack);
  const goForward = useNavigationStore(s => s.goForward);
  const getBackPath = useNavigationStore(s => s.getBackPath);
  const getForwardPath = useNavigationStore(s => s.getForwardPath);

  const theme = useMemo(() => THEMES[variant] ?? THEMES.glass, [variant]);

  function handleBack() {
    goBack();
    const path = getBackPath();
    if (path) navigate(path);
  }

  function handleForward() {
    goForward();
    const path = getForwardPath();
    if (path) navigate(path);
  }

  function handleHover(e, hover) {
    e.currentTarget.style.background = hover ? theme.hoverBg : theme.baseBg;
    e.currentTarget.style.borderColor = hover ? theme.hoverBorder : theme.baseBorder;
  }

  function NavButton({ disabled, label, onClick, children }) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={onClick}
        className="p-2 rounded-xl transition-all duration-200"
        style={{
          background: theme.baseBg,
          border: `1.5px solid ${theme.baseBorder}`,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={disabled ? undefined : (e) => handleHover(e, true)}
        onMouseLeave={disabled ? undefined : (e) => handleHover(e, false)}
      >
        <span
          className="block w-4 h-4"
          style={{ color: disabled ? theme.disabledIcon : theme.iconActive }}
        >
          {children}
        </span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <NavButton
        disabled={!canGoBack}
        label="Go back"
        onClick={handleBack}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </NavButton>
      <NavButton
        disabled={!canGoForward}
        label="Go forward"
        onClick={handleForward}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </NavButton>
    </div>
  );
}
