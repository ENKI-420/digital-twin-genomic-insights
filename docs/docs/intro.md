---
sidebar_position: 1
---

# Welcome to GenomicTwin Platform

A unified SMART-on-FHIR application for genomic insights and clinical decision support.

## Quick Start

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start development servers**

   ```bash
   pnpm dev                    # Patient + Provider dashboards + Auth service
   pnpm --filter fhir-gateway dev  # FHIR gateway (separate terminal)
   ```

3. **Access applications**
   - Patient Dashboard: <http://localhost:3000>
   - Provider Dashboard: <http://localhost:3001>
   - Auth Service: <http://localhost:4000>
   - FHIR Gateway: <http://localhost:5000>
   - Documentation: <http://localhost:3002>

## Architecture

- **Patient Dashboard**: Next.js app for patient-facing genomic insights
- **Provider Dashboard**: Next.js app for healthcare provider tools
- **Auth Service**: Express.js OAuth2/SMART-on-FHIR authentication
- **FHIR Gateway**: Redis-cached FHIR proxy with Prometheus metrics
- **Design System**: Shared UI components with Storybook

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:4000
NEXT_PUBLIC_FHIR_GATEWAY_URL=http://localhost:5000
NEXT_PUBLIC_EPIC_CLIENT_ID=YOUR_EPIC_CLIENT_ID
EPIC_AUTH_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
EPIC_TOKEN_URL=https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token
EPIC_FHIR_BASE=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```
