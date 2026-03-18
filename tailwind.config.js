/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e5fe',
          300: '#7cd1fd',
          400: '#36b9fa',
          500: '#0c9eeb',
          600: '#007ec9',
          700: '#0165a3',
          800: '#065586',
          900: '#0b476f',
          950: '#072d4a',
        },
        reef: {
          50: '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d4',
          300: '#86efb2',
          400: '#4ade87',
          500: '#22c563',
          600: '#16a34e',
          700: '#15803f',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        coral: {
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
        sand: {
          50: '#fefdf8',
          100: '#fdf9ec',
          200: '#faf0c8',
          300: '#f6e39d',
          400: '#f0cf64',
          500: '#e8b931',
          600: '#d19a1f',
          700: '#ae7519',
          800: '#8e5d1b',
          900: '#754c1a',
          950: '#43290b',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray.700'),
            '--tw-prose-headings': theme('colors.ocean.900'),
            '--tw-prose-links': theme('colors.ocean.600'),
            '--tw-prose-bold': theme('colors.gray.900'),
            maxWidth: '72ch',
            h2: {
              marginTop: '2em',
              marginBottom: '0.8em',
            },
            h3: {
              marginTop: '1.6em',
              marginBottom: '0.6em',
            },
            img: {
              borderRadius: theme('borderRadius.lg'),
            },
            table: {
              fontSize: theme('fontSize.sm'),
            },
          },
        },
      }),
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'wave': 'wave 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-20px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
