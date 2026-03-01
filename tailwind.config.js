/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom color palette
        background: {
          DEFAULT: '#ffffff',
          dark: '#0a0a0a',
        },
        surface: {
          DEFAULT: '#f5f5f5',
          elevated: '#ffffff',
          dark: {
            DEFAULT: '#1a1a1a',
            elevated: '#262626',
          }
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // accent
          600: '#2563eb',  // accent-hover
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          400: '#22c55e',  // dark mode
          600: '#16a34a',  // light mode
        },
        warning: {
          400: '#fbbf24',  // dark mode
          500: '#f59e0b',  // light mode
        },
        danger: {
          400: '#ef4444',  // dark mode
          600: '#dc2626',  // light mode
        },
        strength: {
          weak: '#dc2626',
          fair: '#f59e0b',
          good: '#eab308',
          strong: '#16a34a',
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ],
        mono: [
          'Menlo',
          'Monaco',
          'Courier New',
          'monospace'
        ]
      },
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
      },
      spacing: {
        '18': '4.5rem',       // 72px
        '88': '22rem',        // 352px
        '128': '32rem',       // 512px
      },
      maxWidth: {
        '8xl': '1200px',      // Container max-width
      },
      minHeight: {
        'touch': '44px',      // Minimum touch target
      },
      minWidth: {
        'touch': '44px',      // Minimum touch target
      },
      borderRadius: {
        'DEFAULT': '0.5rem',  // 8px
        'lg': '0.75rem',      // 12px
        'xl': '1rem',         // 16px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease-in-out',
        'slide-up': 'slideUp 250ms ease-out',
        'slide-down': 'slideDown 250ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
