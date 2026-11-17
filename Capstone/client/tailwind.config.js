/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        team: {
          blue: '#1D4ED8',      // Classic royal blue
          blueSoft: '#EFF6FF',  // Soft tint
          red: '#DC2626',       // Warm crimson
          redSoft: '#FEF2F2',   // Soft tint
        },
        accent: {
          sage: '#059669',      // Calming green for safe/winning states
          sageSoft: '#ECFDF5',
          amber: '#D97706',     // Warm amber for turning points
          amberSoft: '#FFFBEB',
          rose: '#E11D48',      // Soft alert coral
          roseSoft: '#FFF1F2'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.05)',
        'card': '0 4px 20px -4px rgba(15, 23, 42, 0.07), 0 2px 6px -2px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
