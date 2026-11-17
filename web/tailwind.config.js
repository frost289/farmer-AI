import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  // 'class' lets the sun/moon button switch themes. index.html applies the phone/computer setting first.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: colors.emerald, // every brand-* class is emerald
        gray: colors.stone, // every gray-* class is a warm stone gray
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        sway: { '0%,100%': { transform: 'rotate(-4deg)' }, '50%': { transform: 'rotate(4deg)' } },
        'grow-x': { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
        'pulse-soft': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.55' } },
        'cube-spin': {
          '0%': { transform: 'rotateX(-24deg) rotateY(0deg)' },
          '100%': { transform: 'rotateX(-24deg) rotateY(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s ease-out both',
        float: 'float 5s ease-in-out infinite',
        sway: 'sway 4s ease-in-out infinite',
        'grow-x': 'grow-x 0.9s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'cube-spin': 'cube-spin 14s linear infinite',
      },
    },
  },
  plugins: [],
};
