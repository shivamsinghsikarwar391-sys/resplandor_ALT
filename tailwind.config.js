/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#FDF9F8',
          100: '#FAF3F0',
          200: '#F5E6E0',
          300: '#EDD1C6',
          400: '#E1B3A3',
          500: '#D29280',
          600: '#BD6F5B',
        },
        cream: {
          50: '#FDFBF8',
          100: '#FAF7F2',
          200: '#F4EEE5',
          300: '#EAE1D3',
          400: '#D9CBB9',
        },
        burgundy: {
          700: '#4D1D27',
          800: '#38141C',
          900: '#260B12',
          950: '#1A070C',
        },
        rosegold: {
          300: '#E8C7BC',
          400: '#DCAB9D',
          500: '#C78877',
          600: '#AF6C5A',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.2em',
        'wide-luxury': '0.28em',
      },
    },
  },
  plugins: [],
}
