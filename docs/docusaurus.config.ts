import { Config } from '@docusaurus/types';

const config: Config = {
  title: 'GenomicTwin Platform',
  tagline: 'Unified SMART-on-FHIR Genomic Application',
  url: 'https://docs.genomictwin.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'genomictwin',
  projectName: 'platform',
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'api',
        entryPoints: [
          '../packages/design-system/src/index.ts',
          '../apps/auth-service/src/server.ts',
          '../services/fhir-gateway/src/server.ts',
        ],
        tsconfig: '../tsconfig.json',
        out: 'api',
        sidebar: {
          categoryLabel: 'API',
          position: 0,
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
};

export default config;