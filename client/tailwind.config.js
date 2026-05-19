export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        /* ── Deep-Space base ── */
        void:     { DEFAULT: '#0a0a1a', 50: '#12122a', 100: '#1a1a35', 200: '#1e1e2f' },
        surface:  { DEFAULT: '#1e1e2f', card: '#16162a', hover: '#252540', muted: '#2a2a45' },

        /* ── Neon Indigo ── */
        neon:     { 50: '#e0e7ff', 100: '#c7d2fe', 200: '#a5b4fc', 300: '#818cf8', 400: '#6366f1', 500: '#4f46e5', 600: '#4338ca', 700: '#3730a3' },

        /* ── Cyber Teal ── */
        cyber:    { 50: '#ccfbf1', 100: '#99f6e4', 200: '#5eead4', 300: '#2dd4bf', 400: '#14b8a6', 500: '#0d9488', 600: '#0f766e', 700: '#115e59' },

        /* ── Text ── */
        txt:      { primary: '#f0f0ff', secondary: '#c0c1ff', body: '#a0a0c0', muted: '#6b6b8a', faint: '#4a4a65' },
      },
      boxShadow: {
        'glow-sm':  '0 0 15px rgba(99,102,241,0.15)',
        'glow-md':  '0 0 25px rgba(99,102,241,0.2), 0 4px 12px rgba(0,0,0,0.4)',
        'glow-lg':  '0 0 40px rgba(99,102,241,0.25), 0 8px 24px rgba(0,0,0,0.5)',
        'glow-teal':'0 0 25px rgba(45,212,191,0.2), 0 4px 12px rgba(0,0,0,0.4)',
        'glass':    '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':     '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover':'0 8px 30px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        'inner':    'inset 0 2px 6px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-duo':     'linear-gradient(135deg, #4f46e5, #0d9488)',
        'gradient-hero':    'linear-gradient(155deg, #0a0a1a 0%, #12122a 35%, #0f766e 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(30,30,47,0.8), rgba(22,22,42,0.9))',
        'gradient-glass':   'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        'gradient-neon':    'linear-gradient(135deg, #6366f1, #2dd4bf)',
        'gradient-surface': 'linear-gradient(180deg, #12122a, #0a0a1a)',
      },
      backdropBlur: {
        glass: '20px',
      },
      borderRadius: {
        'glass': '16px',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-delay':  'float 6s ease-in-out 2s infinite',
        'pulse-neon':   'pulse-neon 2s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'slide-up':     'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':      'fade-in 0.4s ease-out both',
        'glow-pulse':   'glow-pulse 3s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'gradient-x':   'gradient-x 6s ease infinite',
        'tilt':         'tilt 10s infinite linear',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(99,102,241,0.4)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'tilt': {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%':           { transform: 'rotate(0.5deg)' },
          '75%':           { transform: 'rotate(-0.5deg)' },
        },
      },
    },
  },
  plugins: [],
};
