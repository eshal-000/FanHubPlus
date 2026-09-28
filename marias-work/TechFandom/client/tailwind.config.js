/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        nav: 'var(--nav)',
        surface: 'var(--surface)',
        'surface-light': 'var(--surface-light)',
        primary: 'var(--primary)',
        raspberry: 'var(--raspberry)',
        cream: 'var(--cream)',
        yellow: 'var(--yellow)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        glow: 'var(--glow)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        riot: ['"Protest Riot"', 'cursive'],
      },
    },
  },
  plugins: [],
};