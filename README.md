# GenomicTwin1 Platform

## Overview

This project is now branded for **Baptist Health Medical Group Hematology & Oncology**.

- **Production Deployment:** [https://genomictwin1-m76mfw4oo-devindavis-1484s-projects.vercel.app](https://genomictwin1-m76mfw4oo-devindavis-1484s-projects.vercel.app)
- **Institution:** Baptist Health Medical Group Hematology & Oncology at Baptist Health Louisville
- **Address:** 4003 Kresge Way, Suite 500, Louisville, Kentucky 40207
- **Phone:** 502.897.1166

## Key Features

- AI-powered trial matching
- CPIC-aligned pharmacogenomic recommendations
- Real-time genomic twin analysis
- Epic EHR integration

## Environment Variables

The following environment variables are required for full functionality:

- `KV_REST_API_URL` — Upstash Redis REST API URL
- `KV_REST_API_TOKEN` — Upstash Redis REST API Token

Set these in your Vercel dashboard or `.env.local` file.

## Recent Changes

- All Norton Healthcare references removed
- All branding, addresses, and contacts updated to Baptist Health
- Proposal generator and dashboard updated
- Old Norton-related files and components removed/renamed

## Development

Install dependencies:

```sh
npm install
```

Run locally:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Deploy to Vercel:

```sh
npx vercel --prod --yes
```

---

For more details, see the codebase or contact the project maintainer.
