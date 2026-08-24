import type { Config } from 'tailwindcss';

// Design tokens for MyGlowBack.AI
// Direction: clean medical/spa aesthetic (per brief) — sage green, warm beige,
// soft ivory whites. Avoids the generic "warm cream + terracotta" AI-default
// accent by pairing sage with a muted honey/gold instead of clay/terracotta.
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFCFA',
          100: '#FAF7F2',
          200: '#F3EEE4',
          300: '#E8E1D2',
        },
        sage: {
          50: '#F1F5F1',
          100: '#DFE9E0',
          200: '#BCD0BE',
          300: '#96B599',
          400: '#719A76',
          500: '#587D5D',
          600: '#456348',
          700: '#374F39',
          800: '#2B3E2C',
          900: '#1C291D',
        },
        honey: {
          100: '#F6E9D2',
          300: '#E8C687',
          500: '#D4A24E',
          700: '#A97A2E',
        },
        clinical: {
          text: '#2C2A24',
          muted: '#6B6659',
          border: '#E4DDCC',
        },
        danger: '#B4483B',
        warn: '#C68A2E',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 30px -10px rgba(43, 62, 44, 0.15)',
        card: 'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 10px 34px -14px rgba(43, 62, 44, 0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
