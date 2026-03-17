/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        'bg-primary': '#0A0E1A',
        'bg-surface': '#131929',
        'bg-elevated': '#1C2438',
        'accent-blue': '#4F8EF7',
        'accent-gold': '#F5C842',
        'accent-teal': '#2DD4BF',
        'text-primary': '#F0F4FF',
        'text-secondary': '#8B95A8',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            filter:
              'drop-shadow(0 0 8px #4F8EF7) drop-shadow(0 0 20px rgba(79,142,247,0.4))',
          },
          '50%': {
            filter:
              'drop-shadow(0 0 16px #4F8EF7) drop-shadow(0 0 40px rgba(79,142,247,0.7))',
          },
        },
        'cta-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79,142,247,0.45)' },
          '50%': { boxShadow: '0 0 0 10px rgba(79,142,247,0)' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'logo-pop': {
          '0%':   { opacity: '0',  transform: 'translate(-50%,-50%) scale(0)',    filter: 'drop-shadow(0 0 0px #4F8EF7)' },
          '55%':  { opacity: '1',  transform: 'translate(-50%,-50%) scale(1.35)', filter: 'drop-shadow(0 0 48px #4F8EF7) drop-shadow(0 0 96px rgba(79,142,247,0.5))' },
          '75%':  {                transform: 'translate(-50%,-50%) scale(0.92)', filter: 'drop-shadow(0 0 20px #4F8EF7)' },
          '90%':  {                transform: 'translate(-50%,-50%) scale(1.04)' },
          '100%': { opacity: '1',  transform: 'translate(-50%,-50%) scale(1.0)',  filter: 'drop-shadow(0 0 14px #4F8EF7)' },
        },
        'logo-idle-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(79,142,247,0.5))' },
          '50%':      { filter: 'drop-shadow(0 0 24px rgba(79,142,247,0.9)) drop-shadow(0 0 48px rgba(79,142,247,0.4))' },
        },
        'shockwave': {
          '0%':   { transform: 'translate(-50%,-50%) scale(0)', opacity: '0.9' },
          '100%': { transform: 'translate(-50%,-50%) scale(6)', opacity: '0'   },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'cta-pulse': 'cta-pulse 2s ease-in-out infinite',
        'slide-up-fade': 'slide-up-fade 400ms ease-out forwards',
        'fade-in': 'fade-in 400ms ease-out forwards',
        'logo-pop':       'logo-pop 450ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'logo-idle-glow': 'logo-idle-glow 3s ease-in-out infinite',
        'shockwave':      'shockwave 700ms ease-out forwards',
      },
    },
  },
  plugins: [],
}
