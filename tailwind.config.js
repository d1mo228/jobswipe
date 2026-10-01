/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        surface2: 'var(--c-surface-2)',
        ink: 'var(--c-text)',
        hint: 'var(--c-hint)',
        line: 'var(--c-line)',
        accent: 'var(--c-accent)',
        'accent-ink': 'var(--c-accent-text)',
        'accent-soft': 'var(--c-accent-soft)',
        good: 'var(--c-good)',
        warn: 'var(--c-warn)',
        bad: 'var(--c-bad)',
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(40, 30, 120, 0.25)',
        soft: '0 2px 10px rgba(20, 20, 60, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
