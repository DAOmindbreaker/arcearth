/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // ArcEarth brand palette — mirrors CSS custom properties
        arc: {
          bg:      '#080e1a',
          surface: 'rgba(255,255,255,0.06)',
          ink:     '#edf2fb',
          ink2:    '#c8d8f0',
          muted:   '#8fa8c8',
          subtle:  '#5c7a9b',
          accent:  '#4db8ff',
          success: '#5ce0a8',
          danger:  '#f06b7a',
          warning: '#f5c842',
        },
      },
      backgroundImage: {
        'arc-gradient': 'linear-gradient(180deg, #080e1a 0%, #0d1b2f 60%, #0f2240 100%)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%':       { opacity: '1.0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-in':    'fade-in 0.35s ease both',
      },
    },
  },
  plugins: [],
}

