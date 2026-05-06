/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/components/**/*.tsx', './src/pages/**/*.tsx'],
  safelist: [
    // Dynamic color classes used in ProductFilters for color swatches
    { pattern: /bg-(red|blue|green|yellow|pink|purple|orange|teal|cyan|gray)-500/ },
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-background': "url('/images/hero.jpg')",
      },
      colors: {
        primary: {
          DEFAULT: '#3B6B8A',
          light: '#5A8BA8',
          dark: '#254D6B',
        },
        accent: '#4A8F8F',
        surface: {
          DEFAULT: '#FAF9F7',
          alt: '#F3F1ED',
        },
        border: '#E5E2DC',
        text: {
          DEFAULT: '#2C2C2C',
          muted: '#6B6862',
          light: '#9C9890',
        },
        success: '#2D8A5E',
        warning: '#C4882A',
        error: '#B83B2A',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(44, 44, 44, 0.05)',
        md: '0 4px 6px -1px rgba(44, 44, 44, 0.08), 0 2px 4px -2px rgba(44, 44, 44, 0.05)',
        lg: '0 10px 15px -3px rgba(44, 44, 44, 0.08), 0 4px 6px -4px rgba(44, 44, 44, 0.05)',
      },
    },
  },
  plugins: [],
};
