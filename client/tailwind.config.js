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
          900: '#0F172A', // Primary Deep Navy
          800: '#1E293B', // Secondary Slate
          700: '#334155',
        },
        slate: {
          50: '#F8FAFC',  // Slate White background
          100: '#F1F5F9', // Light Gray background
          200: '#E2E8F0', // Border Slate
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Secondary Text Slate Gray
          600: '#475569',
          900: '#0F172A', // Main Text Dark Slate
        },
        brand: {
          blue: '#2563EB',      // Primary Accent Blue
          lightBlue: '#EFF6FF', // Light Accent Blue
          hoverBlue: '#1D4ED8',
        },
        semantic: {
          success: '#16A34A',
          successBg: '#F0FDF4',
          warning: '#D97706',
          warningBg: '#FFFBEB',
          danger: '#DC2626',
          dangerBg: '#FEF2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
