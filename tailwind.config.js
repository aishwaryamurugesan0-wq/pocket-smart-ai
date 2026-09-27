/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#131A2A',
          50: '#EEF0F4',
          100: '#D8DCE6',
          200: '#B2BACC',
          300: '#8C97B2',
          400: '#5C6A8C',
          500: '#3A4666',
          600: '#232D47',
          700: '#1A2237',
          800: '#131A2A',
          900: '#0B0F1A',
        },
        paper: {
          DEFAULT: '#EFF1EC',
          soft: '#F7F8F5',
        },
        moss: {
          DEFAULT: '#1F6F5C',
          50: '#E7F2EE',
          100: '#C7E4DA',
          400: '#2C8A73',
          500: '#1F6F5C',
          600: '#175647',
          700: '#103D33',
        },
        clay: {
          DEFAULT: '#C4622D',
          50: '#FBEBE1',
          100: '#F4CDB2',
          400: '#D97B45',
          500: '#C4622D',
          600: '#A34E22',
        },
        gold: {
          DEFAULT: '#B98A2E',
          50: '#FBF3E1',
          100: '#F1DDA8',
          500: '#B98A2E',
          600: '#946E22',
        },
        berry: {
          DEFAULT: '#9B2C46',
          50: '#FBE9EE',
          100: '#F0BFCC',
          500: '#9B2C46',
          600: '#7C2138',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(19,26,42,0.06), 0 8px 24px -12px rgba(19,26,42,0.12)',
        pop: '0 12px 32px -8px rgba(19,26,42,0.28)',
      },
    },
  },
  plugins: [],
}
