// Environment Configuration
// Production-ready environment variable management

export const env = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',

  // Database - Primary (Supabase)
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Redis - Multiple sources for compatibility
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '',

  // Epic FHIR Integration
  EPIC_CLIENT_ID: process.env.EPIC_CLIENT_ID || process.env.FHIR_CLIENT_ID || 'e098fdbf-3af1-4514-a08e-13cdbf4ba63c',
  EPIC_CLIENT_SECRET: process.env.EPIC_CLIENT_SECRET || process.env.FHIR_CLIENT_SECRET || '',
  EPIC_SANDBOX_CLIENT_ID: process.env.EPIC_SANDBOX_CLIENT_ID || 'fa15fa9c-8443-4b22-ade7-15de5287ffcc',
  EPIC_FHIR_BASE_URL: process.env.EPIC_FHIR_BASE_URL || process.env.FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth',
  EPIC_SANDBOX_BASE_URL: process.env.EPIC_SANDBOX_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth',

  // AI Services
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  CLAUDE_ADMIN_API_KEY: process.env.CLAUDE_ADMIN_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  V0_API_KEY: process.env.V0_API_KEY,

  // AIDEN AI Services
  AIDEN_WS_URL: process.env.AIDEN_WS_URL,
  AIDEN_CLIENT_ID: process.env.AIDEN_CLIENT_ID,
  AIDEN_CLIENT_SECRET: process.env.AIDEN_CLIENT_SECRET,
  AIDEN_API_BASE_URL: process.env.AIDEN_API_BASE_URL,

  // Cloud Storage
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Monitoring & Analytics
  SENTRY_DSN: process.env.SENTRY_DSN,
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,

  // Stack Auth
  STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  STACK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  STACK_SECRET_KEY: process.env.STACK_SECRET_SERVER_KEY,

  // Testing
  TESTING_API_TOKEN: process.env.TESTING_API_TOKEN,

  // Feature Flags
  ENABLE_CDS_HOOKS: process.env.ENABLE_CDS_HOOKS === 'true',
  ENABLE_DYNAMIC_CLIENT_REGISTRATION: process.env.ENABLE_DYNAMIC_CLIENT_REGISTRATION === 'true',
  ENABLE_RESEARCH_FEATURES: process.env.ENABLE_RESEARCH_FEATURES === 'true',
  ENABLE_OFFLINE_MODE: process.env.ENABLE_OFFLINE_MODE === 'true',
  HIPAA_COMPLIANCE_MODE: process.env.HIPAA_COMPLIANCE_MODE === 'true',
}

// Validation helpers
export const validateEnv = () => {
  const required = {
    production: [
      'NEXTAUTH_SECRET',
      'DATABASE_URL',
      'EPIC_CLIENT_SECRET',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN'
    ],
    development: []
  }

  const mode = env.NODE_ENV as keyof typeof required
  const requiredVars = required[mode] || []

  const missing = requiredVars.filter(key => !env[key as keyof typeof env])

  if (missing.length > 0 && mode === 'production') {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
  }
}

// Export specific configurations
export const databaseConfig = {
  url: env.DATABASE_URL,
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_KEY,
  }
}

export const redisConfig = {
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
}

export const epicConfig = {
  clientId: env.NODE_ENV === 'production' ? env.EPIC_CLIENT_ID : env.EPIC_SANDBOX_CLIENT_ID,
  clientSecret: env.EPIC_CLIENT_SECRET,
  baseUrl: env.NODE_ENV === 'production' ? env.EPIC_FHIR_BASE_URL : env.EPIC_SANDBOX_BASE_URL,
  redirectUri: `${env.NEXTAUTH_URL}/auth/callback/epic`,
  scopes: [
    'patient/Patient.read',
    'patient/Observation.read',
    'patient/DiagnosticReport.read',
    'patient/MedicationRequest.read',
    'patient/AllergyIntolerance.read',
    'patient/Condition.read',
    'patient/Procedure.read',
    'patient/Immunization.read',
    'launch/patient',
    'offline_access',
    'openid',
    'fhirUser'
  ]
}

export const aiConfig = {
  claude: {
    apiKey: env.CLAUDE_API_KEY,
    adminApiKey: env.CLAUDE_ADMIN_API_KEY,
  },
  aiden: {
    wsUrl: env.AIDEN_WS_URL,
    clientId: env.AIDEN_CLIENT_ID,
    clientSecret: env.AIDEN_CLIENT_SECRET,
    apiBaseUrl: env.AIDEN_API_BASE_URL,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  v0: {
    apiKey: env.V0_API_KEY,
  }
}