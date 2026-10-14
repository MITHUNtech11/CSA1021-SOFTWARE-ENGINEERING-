/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Poppins', '-apple-system', 'sans-serif'],
        display: ['Poppins', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['15px', { lineHeight: '1.45' }],
        'sm': ['16px', { lineHeight: '1.5' }],
        'base': ['17px', { lineHeight: '1.6' }],
        'lg': ['19px', { lineHeight: '1.5' }],
        'xl': ['22px', { lineHeight: '1.4' }],
        '2xl': ['26px', { lineHeight: '1.35' }],
        '3xl': ['32px', { lineHeight: '1.25' }],
        '4xl': ['40px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.15' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        navy: {
          800: '#0F172A',
          850: '#0d1322',
          900: '#0B0F19',
          950: '#060911',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'glow-brand': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
      }
    },
  },
  plugins: [],
}
