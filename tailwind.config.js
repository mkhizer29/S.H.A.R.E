/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F7FA', // very light lilac / lavender tint
        surface: '#FFFFFF', // warm white
        'surface-tinted': '#FDFBF7', // slightly tinted white
        'surface-warm': '#FCFBFA', // Blueprint warm surface
        
        primary: {
          DEFAULT: '#8B78E6', // rich soft violet
          hover: '#6855B8', // deep violet
          light: '#E5E0EF', // ultra-light lavender for backgrounds
          foreground: '#FFFFFF',
        },
        
        accent: {
          DEFAULT: '#95BCA6', // soft sage / teal for trust/verified
          hover: '#6DA398',
          foreground: '#FFFFFF',
          light: '#E6EFEA', // extremely soft sage background
        },
        
        neutral: {
          900: '#2D2A32', // deep charcoal text
          500: '#6D6875', // muted violet-grey text
          200: '#E5E0EF', // borders
        },
        
        alert: {
          DEFAULT: '#E5989B', // soft warm red/coral
          light: '#F8E9E9',
        },

        // Blueprint explicit tokens
        text: {
          main: '#2D2A32',
          muted: '#6D6875',
        },
        lilac: {
          50: '#F8F7FA',
          100: '#E5E0EF',
          200: '#D4CBE5',
        },
        sage: {
          200: '#E6EFEA',
          400: '#A9CBB8',
          500: '#95BCA6',
        },
        plum: {
          500: '#B87295',
        },
      },
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', 'sans-serif'], // Replacing DM Sans/Serif with a modern, elegant sans
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(139, 120, 230, 0.06)',
        'float': '0 12px 32px rgba(139, 120, 230, 0.08)',
        'inner-soft': 'inset 0 2px 4px rgba(139, 120, 230, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 3s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
