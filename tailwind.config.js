/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        poker: {
          red: '#DC2626',
          black: '#171717',
          gold: '#FCD34D',
        }
      },
      fontFamily: {
        poker: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
};