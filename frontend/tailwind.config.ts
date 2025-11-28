import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Premium editorial palette
        canvas: {
          50: '#FEFDFB',
          100: '#FAF9F7',
          200: '#F5F4F0',
          300: '#E8E6E1',
          400: '#D4D2CC',
        },
        ink: {
          50: '#737069',
          100: '#5A5752',
          200: '#403E3B',
          300: '#2A2926',
          400: '#1A1918',
          500: '#0D0D0C',
        },
        coral: {
          50: '#FFF5F3',
          100: '#FFE4DF',
          200: '#FFCCC3',
          300: '#FFA799',
          400: '#FF7A66',
          500: '#E94560',
          600: '#D63B54',
          700: '#B82D44',
        },
        teal: {
          50: '#E8F4F6',
          100: '#C5E4E9',
          200: '#8FCBD5',
          300: '#4EAAB9',
          400: '#1E8A9D',
          500: '#0F4C5C',
          600: '#0C3D4A',
          700: '#082E38',
        },
        forest: {
          50: '#E9F5F0',
          100: '#C8E6D9',
          200: '#96D4B9',
          300: '#5EBD93',
          400: '#3DA574',
          500: '#2D6A4F',
          600: '#245541',
          700: '#1B4032',
        },
        honey: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D97706',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#E11D48',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(13, 13, 12, 0.05), 0 4px 16px -4px rgba(13, 13, 12, 0.08)',
        'soft-lg': '0 4px 12px -4px rgba(13, 13, 12, 0.06), 0 8px 32px -8px rgba(13, 13, 12, 0.12)',
        'soft-xl': '0 8px 24px -8px rgba(13, 13, 12, 0.08), 0 16px 48px -16px rgba(13, 13, 12, 0.16)',
        'inner-soft': 'inset 0 2px 4px -1px rgba(13, 13, 12, 0.06)',
        'glow-coral': '0 0 32px -8px rgba(233, 69, 96, 0.3)',
        'glow-teal': '0 0 32px -8px rgba(15, 76, 92, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;
