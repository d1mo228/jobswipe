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
        card: '0 1px 0 rgba(255,255,255,.6) inset, 0 18px 40px -18px rgba(40, 30, 120, 0.28), 0 2px 6px rgba(20,20,40,.04)',
        soft: '0 1px 2px rgba(20, 20, 40, 0.04), 0 8px 24px -14px rgba(20, 20, 60, 0.14)',
        glow: '0 10px 26px -8px color-mix(in srgb, var(--c-accent) 55%, transparent)',
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
