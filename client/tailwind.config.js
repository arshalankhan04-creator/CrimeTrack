/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D1E', // Deep Command Base
          900: '#0B132B', // Main Dark Navy
          850: '#111C38',
          800: '#1C2541', // Dark Surface Navy
          700: '#2C3A5A',
          600: '#3A506B',
        },
        slate: {
          50: '#F8FAFC',  // Main Canvas Background
          100: '#F1F5F9', // Subtle Card / Input Background
          200: '#E2E8F0', // Card / Table Border
          300: '#CBD5E1', // Stronger Border
          400: '#94A3B8', // Placeholder & Muted Icons
          500: '#64748B', // Secondary Label
          600: '#475569', // Primary Muted Text
          700: '#334155', // Subheadings
          800: '#1E293B', // Headers
          900: '#0F172A', // Main High Contrast Text
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          blue: '#1D4ED8',      // Authoritative Primary Blue
          hoverBlue: '#1E40AF', // Hover Darker Blue
          lightBlue: '#EFF6FF',
          accent: '#2563EB',
        },
        semantic: {
          success: '#15803D',
          successBg: '#F0FDF4',
          successBorder: '#BBF7D0',
          warning: '#B45309',
          warningBg: '#FFFBEB',
          warningBorder: '#FDE68A',
          danger: '#B91C1C',
          dangerBg: '#FEF2F2',
          dangerBorder: '#FECACA',
          info: '#1D4ED8',
          infoBg: '#EFF6FF',
          infoBorder: '#BFDBFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.25), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
      }
    },
  },
  plugins: [],
};
