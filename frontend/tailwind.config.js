/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#e6e6ef',
          100: '#c2c2d6',
          200: '#9a9abc',
          300: '#7272a3',
          400: '#535391',
          500: '#353580',
          600: '#2d2d70',
          700: '#23235b',
          800: '#1a1a2e',
          900: '#12121a',
          950: '#0a0a0f',
        },
        accent: {
          50: '#f0e7ff',
          100: '#d4bfff',
          200: '#b794ff',
          300: '#9b6aff',
          400: '#8347ff',
          500: '#6d28d9',
          600: '#5b21b6',
          700: '#4c1d95',
          800: '#3b1578',
          900: '#2e1065',
        },
        surface: {
          DEFAULT: '#16161e',
          light: '#1e1e2a',
          lighter: '#262636',
          border: '#2a2a3d',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(109, 40, 217, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(109, 40, 217, 0.4)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
