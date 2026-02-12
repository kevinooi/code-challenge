/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5d5cde',
          hover: '#4e4dbf',
        },
        'card-bg': 'rgba(23, 27, 34, 0.8)',
        'input-bg': '#1e2329',
        border: '#2b3139',
        error: '#f6465d',
        success: '#0ecb81',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
