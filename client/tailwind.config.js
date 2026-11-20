/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: 'var(--nr-cream)',
        'cream-2': 'var(--nr-cream-2)',
        surface: 'var(--nr-surface)',
        ink: 'var(--nr-ink)',
        'ink-2': 'var(--nr-ink-2)',
        line: 'var(--nr-line)',
        primary: {
          DEFAULT: 'var(--nr-primary)',
          600: 'var(--nr-primary-600)',
          soft: 'var(--nr-primary-soft)'
        },
        clay: 'var(--nr-clay)',
        bark: 'var(--nr-bark)',
        'on-bark': 'var(--nr-on-bark)',
        success: {
          DEFAULT: 'var(--nr-success)',
          soft: 'var(--nr-success-soft)'
        },
        warning: {
          DEFAULT: 'var(--nr-warning)',
          soft: 'var(--nr-warning-soft)'
        },
        danger: {
          DEFAULT: 'var(--nr-danger)',
          soft: 'var(--nr-danger-soft)'
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mrDisplay: ['"Tiro Devanagari Marathi"', '"Noto Serif Devanagari"', 'serif'],
        mrBody: ['"Noto Sans Devanagari"', 'sans-serif']
      },
      borderRadius: {
        card: '24px',
        input: '16px',
        img: '20px'
      },
      boxShadow: {
        soft: '0 6px 24px rgba(42,31,24,0.08)'
      }
    },
  },
  plugins: [],
}
