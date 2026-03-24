/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // Slate 50
        surface: '#FFFFFF',
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1', // Indigo 500
          600: '#4F46E5',
          700: '#4338CA',
        },
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          700: '#15803D'
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          700: '#B91C1C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}