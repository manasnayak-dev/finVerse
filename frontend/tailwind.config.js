/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0f172a',
        darker: '#0b1120',
        card: 'rgba(30, 41, 59, 0.7)',
        primary: '#06b6d4',
        secondary: '#a855f7',
        accent: '#22c55e'
      }
    },
  },
  plugins: [],
}
