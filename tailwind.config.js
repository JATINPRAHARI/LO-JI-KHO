/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFF8F0',
          primary: '#F97316',
          secondary: '#5A3A22',
          text: '#1F2937',
          accent: '#EAB308',
        },
      },
      boxShadow: {
        'soft': '0 2px 12px 0 rgba(90,58,34,0.08)',
        'soft-hover': '0 8px 30px 0 rgba(90,58,34,0.15)',
        'card': '0 4px 20px 0 rgba(90,58,34,0.06)',
        'card-hover': '0 8px 32px 0 rgba(90,58,34,0.12)',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
