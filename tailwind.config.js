/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        dark: {
          900: '#0f0f14',
          800: '#15151c',
          700: '#1c1c25',
          600: '#23232d',
          500: '#2a2a36',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.12)',
          heavy: 'rgba(255, 255, 255, 0.18)',
          border: 'rgba(255, 255, 255, 0.15)',
          dark: {
            light: 'rgba(15, 15, 20, 0.4)',
            medium: 'rgba(15, 15, 20, 0.6)',
            heavy: 'rgba(15, 15, 20, 0.8)',
          }
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1, #ec4899)',
        'gradient-primary-reverse': 'linear-gradient(135deg, #ec4899, #6366f1)',
        'gradient-accent': 'linear-gradient(135deg, #f97316, #ec4899)',
        'gradient-warm': 'linear-gradient(135deg, #6366f1, #f97316, #ec4899)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'danmaku': 'danmaku 8s linear forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shine': 'shine 2s ease-in-out infinite',
        'card-hover': 'cardHover 0.3s ease-out',
      },
      keyframes: {
        danmaku: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-8px) scale(1.02)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.3)',
        'neon-primary': '0 0 20px rgba(99, 102, 241, 0.4)',
        'neon-secondary': '0 0 20px rgba(236, 72, 153, 0.4)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
