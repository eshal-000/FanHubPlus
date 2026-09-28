
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(35 0 24 / <alpha-value>)',
        nav: 'rgb(24 0 18 / <alpha-value>)',
        surface: 'rgb(57 11 43 / <alpha-value>)',
        'surface-light': 'rgb(80 16 57 / <alpha-value>)',
        primary: 'rgb(255 0 107 / <alpha-value>)',
        raspberry: 'rgb(153 0 77 / <alpha-value>)',
        cream: 'rgb(255 243 222 / <alpha-value>)',
        yellow: 'rgb(255 227 71 / <alpha-value>)',
        muted: 'rgb(214 185 202 / <alpha-value>)',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        special: ['Protest Riot', 'sans-serif'],
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