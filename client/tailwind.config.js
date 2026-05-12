export default {
  darkMode: false,
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        indigo: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
        teal: {
          50:  '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6',
          600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(79,70,229,0.08), 0 1px 2px rgba(79,70,229,0.04)',
        'card-md': '0 4px 12px rgba(79,70,229,0.10), 0 2px 4px rgba(79,70,229,0.06)',
        'card-lg': '0 8px 24px rgba(79,70,229,0.12), 0 4px 8px rgba(79,70,229,0.06)',
        'inner':   'inset 0 2px 4px rgba(79,70,229,0.06)',
      },
      backgroundImage: {
        'gradient-duo':  'linear-gradient(135deg, #4f46e5, #0d9488)',
        'gradient-hero': 'linear-gradient(145deg, #eef2ff 0%, #ffffff 50%, #f0fdfa 100%)',
        'gradient-card': 'linear-gradient(135deg, #f8faff 0%, #f0fdfa 100%)',
      },
    },
  },
  plugins: [],
};
