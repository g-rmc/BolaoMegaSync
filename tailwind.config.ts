import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        reveillon: {
          black: '#050507',
          obsidian: '#0B0C10',
          charcoal: '#13151C',
          surface: '#1A1D26',
          border: '#272B36',
          silver: {
            light: '#E2E8F0',
            DEFAULT: '#A1A9B8',
            muted: '#64748B',
            dark: '#334155',
          },
          gold: {
            light: '#FCE38A',
            DEFAULT: '#D4AF37',
            bright: '#F5C542',
            dark: '#9A7B1C',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 24px -4px rgba(212, 175, 55, 0.35)',
        'gold-ball': '0 0 14px rgba(245, 197, 66, 0.5)',
        'silver-card': '0 8px 30px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'reveillon-radial':
          'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.12) 0%, rgba(11, 12, 16, 0) 60%)',
        'gold-shimmer':
          'linear-gradient(135deg, #FCE38A 0%, #D4AF37 50%, #9A7B1C 100%)',
        'silver-metallic':
          'linear-gradient(135deg, #F1F5F9 0%, #A1A9B8 50%, #64748B 100%)',
      },
    },
  },
  plugins: [],
};

export default config;

