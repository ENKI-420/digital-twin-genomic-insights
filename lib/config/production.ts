/**
 * Production Configuration for Baptist Health AGENT Platform
 * This file contains production-ready settings and configurations
 */

export const productionConfig = {
  app: {
    name: "AGENT Platform - Baptist Health",
    version: "1.0.0",
    environment: "production",
    baseUrl: "https://agent.baptisthealth.org",
    supportEmail: "agent-support@baptisthealth.org",
  },

  institution: {
    name: "Baptist Health",
    shortName: "BH",
    domain: "baptisthealth.org",
    logo: "https://cdn.baptisthealth.org/logos/bh-logo.png",
    primaryColor: "#1B4B82",
    secondaryColor: "#E31837",
    address: {
      street: "2850 Eastpoint Parkway",
      city: "Louisville",
      state: "KY",
      zipCode: "40223",
      phone: "(502) 896-4000",
    },
  },

  contacts: {
    clinicalLead: {
      name: "Dr. Sameer Talwalkar",
      title: "Medical Director, Oncology Informatics",
      email: "sameer.talwalkar@bhm.org",
      phone: "(502) 896-4000",
      department: "Oncology",
    },
    technicalLead: {
      name: "Devin Pellegrino",
      title: "Technical Lead",
      email: "devin@ads-llc.com",
      phone: "(555) 123-4567",
      company: "Advanced Defense Solutions",
    },
    itDirector: {
      name: "Angela Martin",
      title: "IT Director",
      email: "angela.martin@bhm.org",
      phone: "(502) 896-4000",
      department: "Information Technology",
    },
    irbChair: {
      name: "Steve Reedy",
      title: "IRB Chair",
      email: "steve.reedy@bhm.org",
      phone: "(502) 896-4000",
      department: "Research",
    },
  },

  epic: {
    baseUrl: "https://api.baptisthealth.org/fhir/STU3",
    clientId: "agent_baptist_health_prod",
    scope: ["patient/*.read", "launch/patient", "openid", "profile"],
    redirectUri: "/api/auth/callback/epic",
    vendorServicesManager: "Justin Hewitt",
    marketplaceAppId: "baptist-health-agent-platform",
  },

  beaker: {
    baseUrl: "https://beaker.baptisthealth.org/api",
    version: "v2",
    timeout: 30000,
    retryAttempts: 3,
  },

  cpic: {
    apiUrl: "https://api.cpicpgx.org/v1",
    version: "1.0",
    guidelines: ["CYP2D6", "DPYD", "TPMT", "UGT1A1", "SLCO1B1"],
    evidenceLevels: ["A", "B", "C", "D"],
  },

  clinicalTrials: {
    clinicalTrialsGovApi: "https://classic.clinicaltrials.gov/api",
    baptistTrialsDb: "https://trials.baptisthealth.org/api",
    refreshInterval: 86400000, // 24 hours in milliseconds
    maxResults: 100,
  },

  genomics: {
    processingUrl: "https://genomics.baptisthealth.org/api",
    storageProvider: "aws-s3",
    bucket: "baptist-health-genomic-data",
    supportedFormats: ["VCF", "FASTQ", "BAM", "CRAM"],
    analysisTypes: ["variant", "copy-number", "structural", "pharmacogenomic"],
  },

  ai: {
    openai: {
      model: "gpt-4-turbo-preview",
      maxTokens: 4096,
      temperature: 0.1,
    },
    azure: {
      endpoint: "https://baptist-health-ai.openai.azure.com",
      deployment: "gpt-4",
      apiVersion: "2024-02-15-preview",
    },
    features: {
      chatbot: true,
      trialMatching: true,
      genomicAnalysis: true,
      clinicalDecisionSupport: true,
    },
  },

  security: {
    hipaa: {
      enabled: true,
      auditLogging: true,
      encryptionAtRest: true,
      encryptionInTransit: true,
    },
    authentication: {
      sessionTimeout: 28800000, // 8 hours in milliseconds
      mfaRequired: true,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
    rateLimit: {
      requests: 100,
      window: 60000, // 1 minute in milliseconds
    },
  },

  monitoring: {
    healthCheck: {
      endpoint: "/api/health",
      interval: 30000, // 30 seconds
    },
    metrics: {
      provider: "new-relic",
      endpoint: "https://metric-api.newrelic.com/metric/v1",
    },
    logging: {
      level: "info",
      auditLevel: "verbose",
      retentionDays: 2555, // 7 years for HIPAA compliance
    },
  },

  features: {
    "3d-visualization": true,
    "ai-chat": true,
    "trial-matching": true,
    "cpic-integration": true,
    "epic-integration": true,
    "beaker-integration": true,
    "genomic-analysis": true,
    "clinical-decision-support": true,
    "patient-portal": false, // Will be enabled after Epic certification
    "mobile-app": false, // Future release
  },

  performance: {
    database: {
      connectionPool: {
        min: 10,
        max: 50,
        idleTimeout: 30000,
      },
      queryTimeout: 30000,
    },
    cache: {
      redis: {
        url: "redis://prod-redis.baptisthealth.org:6379",
        ttl: 3600, // 1 hour default TTL
      },
      genomicData: {
        ttl: 86400, // 24 hours for genomic data
      },
      trialData: {
        ttl: 3600, // 1 hour for trial data
      },
    },
    cdn: {
      provider: "cloudflare",
      staticAssets: "https://cdn.baptisthealth.org/agent",
      imageOptimization: true,
    },
  },

  compliance: {
    soc2: {
      enabled: true,
      auditFrequency: "annual",
      lastAudit: "2024-01-15",
      nextAudit: "2025-01-15",
    },
    fda: {
      part11Compliance: true,
      electronicSignatures: true,
      auditTrail: true,
    },
    irb: {
      systemUrl: "https://irb.baptisthealth.org/api",
      protocolNumber: "BH-2024-AGENT-001",
      approvalDate: "2024-02-01",
      expirationDate: "2025-02-01",
    },
  },

  backup: {
    schedule: "0 2 * * *", // Daily at 2 AM
    retention: {
      daily: 30,
      weekly: 12,
      monthly: 12,
      yearly: 7,
    },
    encryption: true,
    offsite: true,
    testRestoreFrequency: "monthly",
  },

  deployment: {
    strategy: "blue-green",
    environments: ["staging", "production"],
    rollback: {
      automatic: true,
      healthCheckFails: 3,
      errorRateThreshold: 0.05,
    },
    scaling: {
      minInstances: 3,
      maxInstances: 20,
      cpuThreshold: 70,
      memoryThreshold: 80,
    },
  },

  notifications: {
    email: {
      provider: "sendgrid",
      fromAddress: "noreply@baptisthealth.org",
      fromName: "Baptist Health AGENT Platform",
    },
    slack: {
      enabled: true,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channels: {
        alerts: "#agent-alerts",
        deployments: "#agent-deployments",
        general: "#agent-general",
      },
    },
    sms: {
      provider: "twilio",
      enabled: false, // Enable for critical alerts only
    },
  },

  integration: {
    epic: {
      endpoints: {
        patient: "/Patient",
        observation: "/Observation",
        condition: "/Condition",
        medicationRequest: "/MedicationRequest",
        diagnosticReport: "/DiagnosticReport",
      },
      webhooks: {
        enabled: true,
        url: "/api/webhooks/epic",
        events: ["patient.update", "observation.create", "diagnosticreport.create"],
      },
    },
    external: {
      pharmgkb: "https://api.pharmgkb.org/v1",
      clinvar: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
      cosmic: "https://cancer.sanger.ac.uk/cosmic/web_services",
      oncokb: "https://www.oncokb.org/api/v1",
    },
  },

  analytics: {
    platform: "amplitude",
    trackingId: "baptist-health-agent-prod",
    events: {
      userLogin: "user_login",
      patientView: "patient_view",
      trialMatch: "trial_match",
      cpicRecommendation: "cpic_recommendation",
      genomicAnalysis: "genomic_analysis",
    },
    pii: {
      enabled: false, // Never track PII
      dataRetention: 0,
    },
  },
}

export default productionConfig