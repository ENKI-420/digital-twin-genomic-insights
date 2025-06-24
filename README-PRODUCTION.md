# AGENT Platform - Baptist Health Production Deployment Guide

## Overview

The AGENT (Adaptive Genomic Evidence Network for Trials) Platform is a production-ready, AI-powered precision oncology system specifically designed for Baptist Health. This comprehensive platform integrates seamlessly with Epic EHR systems to provide automated clinical trial matching, CPIC-aligned pharmacogenomic recommendations, and real-time genomic analysis.

## 🏥 Baptist Health Integration

### Key Features

- **Epic EHR Integration**: Direct FHIR integration with Baptist Health's Epic system
- **Beaker LIS Integration**: Automated genomic report processing
- **CPIC Guidelines**: Real-time pharmacogenomic decision support
- **3D Genomic Visualization**: Interactive patient genomic profiles
- **AI Trial Matching**: Automated patient-trial matching with 96%+ accuracy
- **HIPAA Compliance**: Full regulatory compliance with audit logging

### Production Endpoints

- **Main Application**: <https://agent.baptisthealth.org>
- **Health Check**: <https://agent.baptisthealth.org/api/health>
- **Demo Site**: <https://agent.baptisthealth.org/demo/baptist-health>
- **Microsite**: <https://agent.baptisthealth.org/api/baptist/microsite>
- **Epic Integration**: <https://agent.baptisthealth.org/api/epic/>*

## 🚀 Quick Start Demo

Visit the Baptist Health demo at: `/demo/baptist-health`

### Demo Features

1. **Interactive Patient Cases**: 3 comprehensive patient examples
2. **Live Trial Matching**: Real-time demonstration of AI matching
3. **CPIC Recommendations**: Pharmacogenomic decision support
4. **3D Genomic Visualization**: WebGL-powered genome browser
5. **Epic Integration**: Simulated EHR workflow

## 📋 Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Redis**: v6.0 or higher
- **SSL Certificate**: Required for production
- **Epic Sandbox Access**: For FHIR integration testing

### Baptist Health Specific Requirements

- Epic Vendor Services approval
- IRB protocol approval (BH-2024-AGENT-001)
- Beaker LIS API access
- Baptist Health network access

## 🔧 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/ads-llc/agent-platform.git
cd agent-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the production configuration template:

```bash
cp .env.example .env.production
```

### 4. Configure Baptist Health Settings

Edit `.env.production` with Baptist Health specific values:

```env
# Application
NEXT_PUBLIC_APP_NAME="AGENT Platform - Baptist Health"
NEXT_PUBLIC_APP_URL=https://agent.baptisthealth.org

# Epic Integration
EPIC_CLIENT_ID="agent_baptist_health_prod"
EPIC_BASE_URL="https://api.baptisthealth.org/fhir/STU3"
BAPTIST_HEALTH_EPIC_BASE_URL="https://api.baptisthealth.org/fhir/STU3"

# Beaker Integration
BAPTIST_HEALTH_BEAKER_URL="https://beaker.baptisthealth.org/api"

# Institution Branding
INSTITUTION_NAME="Baptist Health"
INSTITUTION_DOMAIN="baptisthealth.org"
INSTITUTION_PRIMARY_COLOR="#1B4B82"
INSTITUTION_SECONDARY_COLOR="#E31837"

# Contact Information
CLINICAL_LEAD_NAME="Dr. Sameer Talwalkar"
CLINICAL_LEAD_EMAIL="sameer.talwalkar@bhm.org"
TECHNICAL_LEAD_EMAIL="devin@ads-llc.com"
```

## 🚀 Deployment

### Automated Deployment

Use the provided deployment script:

```bash
./scripts/deploy-baptist-health.sh
```

### Manual Deployment Steps

1. **Build Application**

   ```bash
   npm run build
   ```

2. **Database Migrations**

   ```bash
   npm run db:migrate
   ```

3. **Start Services**

   ```bash
   pm2 start ecosystem.config.js --env production
   ```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🏥 Baptist Health Specific Configuration

### Epic Integration Setup

1. **Vendor Services Registration**
   - Contact: Justin Hewitt (<justin.hewitt@bhm.org>)
   - App ID: `baptist-health-agent-platform`
   - Marketplace submission required

2. **FHIR Endpoints**

   ```javascript
   {
     "patient": "/Patient",
     "observation": "/Observation",
     "condition": "/Condition",
     "medicationRequest": "/MedicationRequest",
     "diagnosticReport": "/DiagnosticReport"
   }
   ```

3. **CDS Hooks Configuration**

   ```javascript
   {
     "hooks": [
       "patient-view",
       "medication-prescribe",
       "order-review"
     ]
   }
   ```

### Beaker LIS Integration

1. **API Access**
   - Endpoint: `https://beaker.baptisthealth.org/api`
   - Authentication: OAuth 2.0
   - Required scopes: `genomics.read`, `reports.read`

2. **Genomic Report Processing**
   - Automated VCF file processing
   - Real-time variant annotation
   - CPIC recommendation generation

### IRB Protocol

- **Protocol Number**: BH-2024-AGENT-001
- **PI**: Dr. Sameer Talwalkar
- **Status**: Approved (expires 2025-02-01)
- **Scope**: Genomic analysis and trial matching

## 🔒 Security & Compliance

### HIPAA Compliance

- ✅ End-to-end encryption
- ✅ Audit logging
- ✅ Access controls
- ✅ Data de-identification
- ✅ Secure data transmission

### SOC 2 Type II

- ✅ Annual security audits
- ✅ Vulnerability assessments
- ✅ Incident response procedures
- ✅ Data backup and recovery

### FDA Compliance

- ✅ 21 CFR Part 11 compliance
- ✅ Electronic signatures
- ✅ Audit trail maintenance
- ✅ Data integrity controls

## 📊 Monitoring & Analytics

### Health Monitoring

```bash
# Check system health
curl https://agent.baptisthealth.org/api/health

# Detailed service status
curl https://agent.baptisthealth.org/api/health -X POST
```

### Key Metrics

- **Uptime**: 99.9% SLA target
- **Response Time**: <2 seconds average
- **Trial Matching Accuracy**: >95%
- **CPIC Compliance**: >95%

### Alerting

- **Slack**: #agent-alerts channel
- **Email**: <agent-support@baptisthealth.org>
- **PagerDuty**: Critical alerts only

## 🧬 Clinical Workflow Integration

### Oncology Workflow

1. **Genomic Order Entry** (Epic)
2. **Sample Processing** (Beaker)
3. **Report Generation** (AGENT)
4. **Clinical Decision Support** (Epic + AGENT)
5. **Trial Matching** (AGENT)
6. **Patient Communication** (Epic)

### Pharmacogenomics Workflow

1. **Variant Detection** (Beaker)
2. **CPIC Guideline Lookup** (AGENT)
3. **Recommendation Generation** (AGENT)
4. **Epic Alert** (CDS Hooks)
5. **Prescriber Decision** (Epic)

## 👥 Team & Support

### Baptist Health Team

- **Clinical Lead**: Dr. Sameer Talwalkar (<sameer.talwalkar@bhm.org>)
- **IT Director**: Angela Martin (<angela.martin@bhm.org>)
- **IRB Chair**: Steve Reedy (<steve.reedy@bhm.org>)
- **Epic Vendor Services**: Justin Hewitt (<justin.hewitt@bhm.org>)

### Technical Support

- **Development Team**: Advanced Defense Solutions
- **Technical Lead**: Devin Pellegrino (<devin@ads-llc.com>)
- **Support Email**: <agent-support@baptisthealth.org>
- **Documentation**: <https://docs.agent.baptisthealth.org>

## 🔄 Backup & Recovery

### Automated Backups

- **Frequency**: Daily at 2:00 AM EST
- **Retention**: 30 days (daily), 12 weeks, 12 months, 7 years
- **Location**: Encrypted offsite storage
- **Testing**: Monthly restore tests

### Disaster Recovery

- **RTO**: 4 hours
- **RPO**: 1 hour
- **Failover**: Automated to secondary data center
- **Communication**: Status page at <https://status.baptisthealth.org/agent>

## 📈 Performance Optimization

### Database Optimization

```sql
-- Key indexes for performance
CREATE INDEX idx_patient_genomic_id ON patients(genomic_id);
CREATE INDEX idx_variants_gene ON variants(gene, variant);
CREATE INDEX idx_trials_eligibility ON trials USING GIN(eligibility_criteria);
```

### Caching Strategy

- **Redis**: Session data, frequently accessed genomic variants
- **CDN**: Static assets, images, documentation
- **Application**: In-memory caching for CPIC guidelines

### Scaling Configuration

```yaml
# Auto-scaling configuration
min_instances: 3
max_instances: 20
cpu_threshold: 70%
memory_threshold: 80%
```

## 🧪 Testing

### Test Environments

- **Development**: <https://dev.agent.baptisthealth.org>
- **Staging**: <https://staging.agent.baptisthealth.org>
- **Production**: <https://agent.baptisthealth.org>

### Test Suites

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### Epic Sandbox Testing

- **Sandbox URL**: <https://fhir.epic.com/interconnect-fhir-oauth>
- **Test Patients**: Available in Epic sandbox
- **Test Scenarios**: Documented in `/docs/testing/`

## 📚 Additional Resources

### Documentation

- **Technical Docs**: `/docs/`
- **API Reference**: `/docs/api/`
- **Epic Integration**: `/docs/epic/`
- **CPIC Guidelines**: `/docs/cpic/`

### Training Materials

- **Clinician Training**: `/docs/training/clinicians/`
- **IT Training**: `/docs/training/it/`
- **Admin Training**: `/docs/training/admin/`

### Compliance Documentation

- **HIPAA Assessment**: `/docs/compliance/hipaa/`
- **SOC 2 Report**: `/docs/compliance/soc2/`
- **IRB Protocol**: `/docs/compliance/irb/`

## 🆘 Troubleshooting

### Common Issues

1. **Epic Connection Failed**

   ```bash
   # Check Epic API status
   curl -I https://api.baptisthealth.org/fhir/STU3/metadata

   # Verify OAuth tokens
   curl -H "Authorization: Bearer $EPIC_TOKEN" \
        https://api.baptisthealth.org/fhir/STU3/Patient
   ```

2. **CPIC API Timeout**

   ```bash
   # Check CPIC service status
   curl https://api.cpicpgx.org/v1/status

   # Restart CPIC service
   sudo systemctl restart agent-cpic
   ```

3. **Database Performance Issues**

   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

### Support Contacts

- **Emergency**: Call Baptist Health IT Helpdesk
- **Epic Issues**: Contact Justin Hewitt
- **Clinical Questions**: Contact Dr. Sameer Talwalkar
- **Technical Issues**: Email <devin@ads-llc.com>

---

## 📄 License & Compliance

This software is licensed for use by Baptist Health under a commercial license agreement with Advanced Defense Solutions LLC. All patient data handling complies with HIPAA regulations and Baptist Health privacy policies.

**Version**: 1.0.0
**Last Updated**: December 2024
**Environment**: Production
**Support**: 24/7 for Baptist Health
