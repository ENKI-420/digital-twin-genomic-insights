# IRIS SDK + ISIS MCP - Secure Intelligence Stack

A comprehensive healthcare AI platform integrating **IRIS SDK** (Intelligent Rapid Intelligence System) with **ISIS MCP** (Medical Control Plane) for secure, compliant, and role-aware AI operations in clinical environments.

## 🚀 Overview

The IRIS SDK + ISIS MCP provides:

- **🔐 Secure Authentication**: Multi-factor authentication with role-based access control
- **🛡️ AI Safety**: Real-time monitoring, content filtering, and prompt injection prevention
- **📋 HIPAA Compliance**: PHI protection, audit logging, and compliance reporting
- **🤖 Multi-Model Support**: OpenAI, Claude, local models with automatic fallback
- **⚡ High Performance**: Edge caching, rate limiting, and optimized routing
- **📊 Real-time Monitoring**: Live security dashboard with threat detection

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Security Features](#security-features)
7. [API Reference](#api-reference)
8. [Monitoring Dashboard](#monitoring-dashboard)
9. [Deployment](#deployment)
10. [Compliance](#compliance)

## 🏗️ Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    IRIS SDK Interface                       │
├─────────────────────────────────────────────────────────────┤
│                 ISIS MCP (Medical Control Plane)           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Security  │ │   Routing   │ │   Audit & Logging   │   │
│  │   Hooks     │ │   Engine    │ │                     │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│              AI Model Providers                             │
│  ┌───────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐     │
│  │OpenAI │ │ Claude  │ │ Mistral │ │ Local Models    │     │
│  └───────┘ └─────────┘ └─────────┘ └─────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers

1. **Edge Layer**: Request filtering, rate limiting, geo-blocking
2. **Authentication Layer**: JWT tokens, session management, MFA
3. **Authorization Layer**: RBAC with fine-grained permissions
4. **AI Safety Layer**: Content filtering, prompt injection detection
5. **Audit Layer**: Complete request/response logging with 7-year retention

## ⚡ Quick Start

### 1. Basic Usage

```typescript
import { iris } from '@/lib/iris-sdk/iris-sdk'

// Simple genomic analysis
const result = await iris.process({
  userId: 'clinician_001',
  userRole: 'oncologist',
  department: 'Oncology',
  task: 'analyze_mutations',
  input: 'Analyze BRCA1 c.68_69delAG mutation clinical significance',
  preferences: {
    model: 'smart',
    outputFormat: 'summary'
  }
})

console.log(result.response) // AI-generated analysis
console.log(result.confidence) // Confidence score
console.log(result.audit.audit_id) // Audit trail ID
```

### 2. Clinical Workflow

```typescript
// Execute tumor board preparation workflow
const workflowResult = await iris.executeWorkflow('tumor_board_prep', {
  userId: 'clinician_001',
  userRole: 'oncologist',
  department: 'Oncology',
  input: 'Patient with metastatic colorectal cancer...',
  attachments: {
    genomicData: [/* genomic variants */],
    fhirResources: [/* FHIR resources */]
  }
})
```

### 3. Monitoring Dashboard

```typescript
import { AISafetyDashboard } from '@/components/iris-sdk/ai-safety-dashboard'

// Real-time security and performance monitoring
<AISafetyDashboard />
```

## 🔧 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Redis (Upstash recommended)
- AI API keys (OpenAI, Anthropic)

### Setup Steps

1. **Install Dependencies**

```bash
npm install @upstash/redis next-auth @supabase/supabase-js
```

2. **Environment Variables**

```bash
# Database
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"

# Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# AI Models
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Security
NEXTAUTH_SECRET="your-secret"
```

3. **Database Setup**

```bash
# Run the enhanced RBAC schema
psql $DATABASE_URL -f scripts/enhanced-rbac-schema.sql
```

4. **Configure Middleware**

The enhanced middleware is already set up with:

- Edge logging
- Security analysis
- Rate limiting
- PHI protection headers

## ⚙️ Configuration

### Role-Based Model Access

```typescript
// Defined in MCP Core
const roleModelMatrix = {
  'clinician': ['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet'],
  'oncologist': ['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet', 'Mistral'],
  'nurse': ['Claude-Sonnet', 'Local-Model'],
  'technician': ['Local-Model'],
  'researcher': ['Claude-Opus', 'Mistral', 'Local-Model'],
  'admin': ['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet', 'Mistral', 'Local-Model']
}
```

### Security Levels

- **Standard**: Basic content filtering
- **High**: PHI detection, enhanced monitoring
- **Maximum**: Local models only, forensic audit logging

### Fallback Cascade

```typescript
const fallbackCascade = {
  'OpenAI-GPT-4o': ['Claude-Opus', 'Claude-Sonnet', 'Mistral', 'Local-Model'],
  'Claude-Opus': ['OpenAI-GPT-4o', 'Claude-Sonnet', 'Mistral', 'Local-Model'],
  // ... automatic failover chain
}
```

## 📚 Usage Examples

### Clinical Decision Support

```typescript
const result = await iris.process({
  userId: 'doc_123',
  userRole: 'clinician',
  department: 'Emergency',
  task: 'clinical_decision',
  input: 'Patient presents with chest pain, elevated troponins...',
  attachments: {
    labResults: [
      { test: 'Troponin', value: '0.5', unit: 'ng/mL' }
    ]
  },
  security: {
    redactPHI: true,
    safetyLevel: 'high'
  }
})
```

### Treatment Recommendations

```typescript
const treatment = await iris.recommendTreatment({
  userId: 'onc_456',
  userRole: 'oncologist',
  department: 'Oncology',
  input: 'EGFR L858R positive NSCLC, PD-L1 45%',
  preferences: {
    model: 'precise',
    includeCitations: true
  }
})
```

### Patient Education

```typescript
const education = await iris.generatePatientEducation({
  userId: 'nurse_789',
  userRole: 'nurse',
  department: 'Cardiology',
  input: 'Newly diagnosed atrial fibrillation management',
  preferences: {
    patientFriendly: true,
    maxLength: 'medium'
  }
})
```

### Batch Processing

```typescript
const batchRequests = [
  { task: 'risk_assessment', input: 'CVD risk assessment...' },
  { task: 'drug_interaction', input: 'Check warfarin interactions...' },
  { task: 'patient_education', input: 'Diabetes management...' }
]

const results = await iris.processBatch(batchRequests)
```

## 🛡️ Security Features

### Authentication & Authorization

- **Multi-Factor Authentication**: TOTP/WebAuthn support
- **Role-Based Access Control**: Fine-grained permissions
- **Session Management**: Secure JWT with refresh tokens
- **Epic OAuth Integration**: Seamless EHR integration

### AI Safety

- **Content Filtering**: Inappropriate content detection
- **Prompt Injection Prevention**: Pattern-based detection
- **PHI Redaction**: Automatic personally identifiable information removal
- **Output Validation**: Harmful content filtering

### Compliance

- **HIPAA**: PHI protection, audit trails, encryption
- **SOC 2**: Security controls, monitoring, incident response
- **FedRAMP**: Government security standards
- **7-Year Retention**: Automated audit log archival

### Edge Security

```typescript
// Automatic security analysis
interface SecurityAnalysis {
  blocked: boolean
  riskScore: number
  violations: string[]
}

// Real-time threat detection
const threats = ['rate_limit_exceeded', 'suspicious_user_agent',
                'sql_injection_attempt', 'path_traversal_attempt']
```

## 📊 API Reference

### Main Processing Endpoint

```typescript
POST /api/iris/process

interface IRISRequest {
  userId: string
  userRole: 'clinician' | 'oncologist' | 'nurse' | 'technician' | 'researcher' | 'admin'
  department: string
  task: string
  input: string
  attachments?: {
    fhirResources?: any[]
    genomicData?: any[]
    labResults?: any[]
    clinicalNotes?: string[]
  }
  preferences?: {
    model?: 'smart' | 'fast' | 'local' | 'precise'
    outputFormat?: 'summary' | 'detailed' | 'bullet_points' | 'structured'
    maxLength?: 'short' | 'medium' | 'long'
  }
  security?: {
    redactPHI?: boolean
    safetyLevel?: 'standard' | 'high' | 'maximum'
    auditLevel?: 'basic' | 'detailed' | 'forensic'
  }
}
```

### Workflow Execution

```typescript
PUT /api/iris/process
{
  "workflow": "tumor_board_prep",
  "userId": "clinician_001",
  "userRole": "oncologist",
  "input": "Patient case details..."
}
```

### Monitoring Data

```typescript
GET /api/iris/monitoring?timeRange=1h

interface MonitoringResponse {
  security: SecurityMetrics
  events: SecurityEvent[]
  models: ModelMetrics[]
  userActivity: UserActivity[]
  timeSeriesData: TimeSeriesData[]
  alerts: Alert[]
}
```

## 📈 Monitoring Dashboard

### Real-time Metrics

- **Request Volume**: Total AI requests with trend analysis
- **Security Violations**: Blocked requests, PHI detection
- **Model Performance**: Success rates, response times, fallback rates
- **User Activity**: Department-wise usage patterns
- **System Health**: Overall platform status

### Security Events

- **Threat Level**: Dynamic risk assessment (Low/Medium/High/Critical)
- **Event Timeline**: Real-time security incident feed
- **Investigation Tools**: Event acknowledgment and resolution tracking
- **Compliance Status**: HIPAA, SOC 2, audit readiness

### Analytics

- **Usage Patterns**: Most used tasks, model distribution
- **Performance Metrics**: Average response times, error rates
- **Cost Tracking**: Token usage and estimated costs
- **Trend Analysis**: Historical performance and security trends

## 🚀 Deployment

### Production Checklist

- [ ] SSL certificates installed and configured
- [ ] Database migrations applied (`enhanced-rbac-schema.sql`)
- [ ] Environment variables set for production
- [ ] Redis cluster configured with persistence
- [ ] Security headers verified
- [ ] Rate limiting configured
- [ ] Monitoring dashboards operational
- [ ] Backup procedures tested
- [ ] Epic integration verified (if applicable)
- [ ] HIPAA compliance validated

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
USER nonroot
CMD ["npm", "start"]
```

### Kubernetes Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iris-sdk-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: iris-sdk
  template:
    metadata:
      labels:
        app: iris-sdk
    spec:
      containers:
      - name: iris-sdk
        image: iris-sdk:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

### Security Hardening

```typescript
// Production security headers (automatically applied)
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-HIPAA-Compliant': 'true',
  'X-PHI-Protected': 'true'
}
```

## 📋 Compliance

### HIPAA Compliance

✅ **Administrative Safeguards**

- Assigned security responsibility
- Workforce training and access management
- Information access management
- Security awareness and training

✅ **Physical Safeguards**

- Facility access controls
- Workstation use restrictions
- Device and media controls

✅ **Technical Safeguards**

- Access control (unique user identification, emergency access, automatic logoff)
- Audit controls (hardware, software, procedural mechanisms)
- Integrity (PHI alteration/destruction protection)
- Person or entity authentication
- Transmission security (data in motion protection)

### SOC 2 Type II

✅ **Security**: Protection against unauthorized access
✅ **Availability**: System operation and usability
✅ **Processing Integrity**: System processing completeness and accuracy
✅ **Confidentiality**: Information designated as confidential protection
✅ **Privacy**: Personal information collection, use, retention, and disclosure

### Audit Trail Requirements

```sql
-- 7-year retention for HIPAA compliance
CREATE TABLE mcp_audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  model_name TEXT,
  task_intent TEXT,
  input_hash TEXT,
  output_hash TEXT,
  phi_detected BOOLEAN,
  safety_violations TEXT[],
  context_packet_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

## 🔧 Advanced Configuration

### Custom Workflows

```typescript
// Define custom clinical workflows
const customWorkflow: ClinicalWorkflow = {
  name: 'Genomic Counseling Prep',
  description: 'Prepare for genetic counseling session',
  steps: [
    {
      id: 'risk_assessment',
      name: 'Hereditary Risk Assessment',
      prompt_template: 'Assess hereditary cancer risk based on family history...',
      validation_rules: ['require_family_history', 'require_variant_data']
    }
  ],
  requiredRole: ['clinician', 'genetic_counselor'],
  estimatedTime: 300000
}
```

### Custom Security Hooks

```typescript
// Extend security validation
const customSecurityHook = async (packet: ContextPacket) => {
  // Custom PHI detection logic
  const customPHIPatterns = [
    /medical record number: \d+/i,
    /patient id: [a-z0-9]+/i
  ]

  return {
    approved: !customPHIPatterns.some(pattern => pattern.test(packet.inputs.prompt)),
    violations: []
  }
}
```

## 📞 Support

### Getting Help

- **Documentation**: Complete API documentation at `/docs`
- **Examples**: Working examples in `/examples/iris-sdk-usage.ts`
- **Monitoring**: Real-time dashboard at `/dashboard/ai-safety`
- **Logs**: Audit trails accessible via monitoring API

### Troubleshooting

**Common Issues:**

1. **Permission Denied**: Check user role and required permissions in database
2. **Model Unavailable**: Verify API keys and fallback configuration
3. **High Response Times**: Check Redis cache and model performance metrics
4. **Security Violations**: Review content filters and prompt injection detection

**Debug Mode:**

```typescript
// Enable detailed logging
const result = await iris.process({
  // ... request parameters
  security: {
    auditLevel: 'forensic' // Maximum detail logging
  }
})
```

## 🚦 Status & Roadmap

### Current Status: Production Ready ✅

- Core IRIS SDK functionality
- ISIS MCP security layer
- Real-time monitoring dashboard
- HIPAA compliance features
- Multi-model support with fallback

### Upcoming Features

- [ ] Advanced NLP for better PHI detection
- [ ] Machine learning-based anomaly detection
- [ ] Integration with additional EHR systems
- [ ] Mobile app support
- [ ] Advanced clinical workflows
- [ ] Multi-language support

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ for healthcare professionals**

*Secure • Compliant • Intelligent • Reliable*
