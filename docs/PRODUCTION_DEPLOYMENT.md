# Production Deployment Guide

This guide covers the complete process for deploying AGILE Advanced Genomic Insights to production environments.

## 🔒 Security Prerequisites

### 1. SSL/TLS Certificates

```bash
# Generate SSL certificates
certbot certonly --webroot -w /var/www/html -d your-domain.com
```

### 2. Environment Variables Security

Never commit sensitive environment variables. Use secure secret management:

```bash
# Example for AWS Systems Manager
aws ssm put-parameter \
  --name "/agile/production/epic-client-secret" \
  --value "your-secret" \
  --type "SecureString"
```

### 3. Network Security

- Configure VPC with private subnets
- Set up Web Application Firewall (WAF)
- Enable DDoS protection
- Implement IP allowlisting for Epic integration

## 🏗️ Infrastructure Setup

### Recommended Architecture

```
Internet → CloudFlare/CDN → Load Balancer → Next.js App → Database
                                        → Redis Cache
                                        → Epic FHIR APIs
```

### Resource Requirements

- **CPU**: Minimum 4 vCPUs for production
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 100GB SSD for application, separate database storage
- **Network**: 10Gbps bandwidth for FHIR integration

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Quick Start)

```bash
# Install Vercel CLI
npm i -g vercel

# Configure project
vercel --prod

# Set environment variables
vercel env add EPIC_CLIENT_SECRET
vercel env add DATABASE_URL
vercel env add REDIS_URL
```

**Vercel Configuration**:

```json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

### Option 2: AWS ECS/Fargate

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

**ECS Task Definition**:

```json
{
  "family": "agile-genomics",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "agile-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/agile-genomics:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:region:account:parameter/agile/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/agile-genomics",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Option 3: Kubernetes

```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agile-genomics
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agile-genomics
  template:
    metadata:
      labels:
        app: agile-genomics
    spec:
      containers:
      - name: app
        image: agile-genomics:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: agile-secrets
              key: database-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: agile-genomics-service
spec:
  selector:
    app: agile-genomics
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 📊 Database Configuration

### Production Database Setup

```sql
-- Create production database
CREATE DATABASE agile_genomics_prod;

-- Create application user
CREATE USER agile_app WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT CONNECT ON DATABASE agile_genomics_prod TO agile_app;
GRANT USAGE ON SCHEMA public TO agile_app;
GRANT CREATE ON SCHEMA public TO agile_app;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Supabase Production Configuration

```typescript
// supabase-config.prod.ts
export const supabaseConfig = {
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'agile-genomics-production'
      }
    }
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - run: npm ci
    - run: npm run type-check
    - run: npm run lint
    - run: npm test
    - run: npm run test:e2e

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Build and push Docker image
      run: |
        docker build -t agile-genomics:$GITHUB_SHA .
        aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
        docker tag agile-genomics:$GITHUB_SHA $ECR_REGISTRY/agile-genomics:$GITHUB_SHA
        docker push $ECR_REGISTRY/agile-genomics:$GITHUB_SHA

    - name: Deploy to ECS
      run: |
        aws ecs update-service \
          --cluster agile-cluster \
          --service agile-genomics \
          --force-new-deployment
```

## 📈 Monitoring and Logging

### Application Performance Monitoring

```typescript
// lib/monitoring/apm.ts
import { createProxyMiddleware } from 'http-proxy-middleware'

export const apmConfig = {
  serviceName: 'agile-genomics-production',
  environment: 'production',
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  captureBody: 'errors',
  errorOnAbortedRequests: true,
  captureErrorLogStackTraces: 'always'
}
```

### Structured Logging

```typescript
// lib/logging/winston.config.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'agile-genomics' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkEpicFHIR(),
    checkFileSystem()
  ])

  const results = checks.map((check, index) => ({
    service: ['database', 'redis', 'epic-fhir', 'filesystem'][index],
    status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    ...(check.status === 'rejected' && { error: check.reason.message })
  }))

  const overall = results.every(r => r.status === 'healthy')
    ? 'healthy'
    : 'unhealthy'

  return Response.json({
    status: overall,
    timestamp: new Date().toISOString(),
    checks: results
  }, {
    status: overall === 'healthy' ? 200 : 503
  })
}
```

## 🔧 Performance Optimization

### Next.js Production Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['assets.vercel.com'],
    formats: ['image/avif', 'image/webp']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### CDN Configuration

```typescript
// lib/cdn/cloudflare.ts
export const cloudflareConfig = {
  zone: process.env.CLOUDFLARE_ZONE_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  cacheSettings: {
    'app/api/fhir/*': {
      cacheLevel: 'bypass'  // Never cache FHIR data
    },
    '/_next/static/*': {
      cacheLevel: 'cache_everything',
      edgeCacheTtl: 31536000  // 1 year
    },
    '/images/*': {
      cacheLevel: 'cache_everything',
      edgeCacheTtl: 86400  // 1 day
    }
  }
}
```

## 🔐 Security Hardening

### Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // CSP Header
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()
  )

  return response
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true
})

export const epicRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true
})
```

## 📋 Production Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Monitoring setup complete
- [ ] Backup procedures tested
- [ ] Epic integration tested
- [ ] Load testing completed
- [ ] Security scan passed

### Post-Deployment

- [ ] Health checks passing
- [ ] Logs flowing correctly
- [ ] Metrics being collected
- [ ] Alerts configured
- [ ] Backup verification
- [ ] Epic connectivity verified
- [ ] User acceptance testing
- [ ] Performance baseline established
- [ ] Documentation updated
- [ ] Team training completed

### Ongoing Maintenance

- [ ] Regular security updates
- [ ] Database optimization
- [ ] Log rotation configured
- [ ] Backup testing schedule
- [ ] Performance monitoring
- [ ] Epic certification renewal
- [ ] Incident response procedures
- [ ] Disaster recovery testing

## 🚨 Incident Response

### Monitoring Alerts

```yaml
# alerts.yml
groups:
- name: agile-genomics
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    annotations:
      summary: High error rate detected

  - alert: EpicIntegrationDown
    expr: up{job="epic-fhir"} == 0
    for: 2m
    annotations:
      summary: Epic FHIR integration unavailable

  - alert: DatabaseConnectionFailed
    expr: up{job="database"} == 0
    for: 1m
    annotations:
      summary: Database connection failed
```

### Rollback Procedures

```bash
#!/bin/bash
# rollback.sh

echo "Starting rollback procedure..."

# Get previous deployment
PREVIOUS_IMAGE=$(aws ecs describe-services \
  --cluster agile-cluster \
  --services agile-genomics \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

# Update service to previous version
aws ecs update-service \
  --cluster agile-cluster \
  --service agile-genomics \
  --task-definition $PREVIOUS_IMAGE

echo "Rollback initiated. Monitoring deployment..."

# Wait for deployment to complete
aws ecs wait services-stable \
  --cluster agile-cluster \
  --services agile-genomics

echo "Rollback completed successfully"
```

## 📞 Support Contacts

### Emergency Contacts

- **Primary On-Call**: [your-oncall@organization.com]
- **Epic Support**: [epic-support-number]
- **Infrastructure Team**: [infra-team@organization.com]
- **Security Team**: [security@organization.com]

### Escalation Procedures

1. **Level 1**: Application errors, performance issues
2. **Level 2**: Epic integration failures, security incidents
3. **Level 3**: Data breaches, system-wide outages

### Support Resources

- **Internal Documentation**: [confluence/agile-genomics]
- **Epic Developer Portal**: [open.epic.com]
- **AWS Support**: [aws-support-case-url]
- **Monitoring Dashboard**: [datadog/grafana-url]

---

This deployment guide ensures a secure, scalable, and maintainable production deployment of the AGILE Advanced Genomic Insights platform.
