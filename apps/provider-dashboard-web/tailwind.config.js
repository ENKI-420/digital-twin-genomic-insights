const preset = require('../../packages/design-system/tailwind-preset');

module.exports = {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    '../../packages/design-system/**/*.{ts,tsx}',
  ],
};