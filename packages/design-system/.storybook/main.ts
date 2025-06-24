import { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // make tailwind work
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@genomictwin/design-system': path.resolve(__dirname, '../src'),
    };
    return config;
  },
};

export default config;