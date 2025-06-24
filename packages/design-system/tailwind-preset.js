/**** Tailwind preset for GenomicTwin design system ****/
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [], // apps supply their own paths
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066ff',
          dark: '#0050cc',
        },
        secondary: {
          DEFAULT: '#11b981',
          dark: '#0e9466',
        },
      },
    },
  },
  plugins: [
    // Example component plugin
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          '&.btn-primary': {
            backgroundColor: theme('colors.primary.DEFAULT'),
            color: theme('colors.white'),
            '&:hover': {
              backgroundColor: theme('colors.primary.dark'),
            },
          },
        },
      });
    }),
  ],
};