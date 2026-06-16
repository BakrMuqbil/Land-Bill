/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          yellow: '#fbbf24',
          green: '#10b981',
          dark: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
