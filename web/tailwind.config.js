/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22a55a', 600: '#16844a', 700: '#126a3d', 900: '#0b3d24' },
        soil: { 100: '#f5ede4', 500: '#8b6b4a' },
      },
    },
  },
  plugins: [],
};
