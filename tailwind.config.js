/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#070609',
        panel: '#100c12',
        blush: '#ff5c9f',
        rose: '#ff2f86',
      },
      boxShadow: {
        neon: '0 0 28px rgba(255,47,134,.28)',
      },
      opacity: {
        7: '.07', 8: '.08', 12: '.12', 14: '.14', 15: '.15', 18: '.18', 22: '.22',
        24: '.24', 28: '.28', 32: '.32', 35: '.35', 42: '.42', 45: '.45', 48: '.48',
        52: '.52', 55: '.55', 56: '.56', 58: '.58', 60: '.60', 62: '.62', 65: '.65',
        68: '.68', 70: '.70', 72: '.72', 75: '.75', 80: '.80', 82: '.82', 85: '.85',
        90: '.90', 94: '.94',
      },
    },
  },
  plugins: [],
}
