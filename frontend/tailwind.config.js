/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        sei: {
          50: '#fef7ee',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          red: '#e11d2a',
          'deep-black': '#0a0a0a',
          'charcoal-black': '#111',
          'dark-gray': '#181818',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sei-glow': '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a',
        'nav-active': '0 0 16px 4px #e11d2a88, 0 2px 12px #fff2',
      },
      backgroundImage: {
        'sei-header': 'linear-gradient(90deg, #111 80%, #181818 100%)',
        'sei-underline': 'linear-gradient(90deg, #fff 0%, #e11d2a 100%)',
      }
    },
  },
  plugins: [],
} 