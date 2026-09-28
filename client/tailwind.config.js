/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-alt': 'var(--bg-alt)',
        nav: 'var(--nav)',
        raspberry: 'var(--raspberry)',
        primary: 'var(--primary)',
        cream: 'var(--cream)',
        yellow: 'var(--yellow)',
        card: 'var(--card)',
        surface: 'var(--surface)',
        'surface-light': 'var(--surface-light)',
        muted: 'var(--muted)',
        border: 'var(--border)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        protest: ['"Protest Riot"', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 28px var(--pink-glow)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}
