// Healthlink-Genomic-Twin AI - Baptist Health Louisville
// Main export file for all components

// Core System
export { healthlinkGenomicTwinCore, HealthlinkGenomicTwinCore } from './core';

// Specialized Agents
export { PatientCareNavigatorAgent } from './agents/patient-care-navigator-agent';
export { ClinicalEfficiencyAgent } from './agents/clinical-efficiency-agent';
export { CommunityHealthCoordinatorAgent } from './agents/community-health-coordinator-agent';

// Configuration
export * from './config/iris.yaml';

// Types (if needed)
export interface HealthlinkGenomicTwinConfig {
  organization: {
    name: string;
    location: string;
    region: string;
    type: string;
  };
  compliance: {
    hipaa: {
      enabled: boolean;
      phi_handling: string;
      deidentification: string;
      audit_trail: boolean;
      retention_policy: string;
    };
    fips: {
      enabled: boolean;
      encryption_standard: string;
      key_management: string;
    };
  };
  approved_llms: {
    internal: Array<{
      name: string;
      provider: string;
      model: string;
      use_case: string;
      data_handling: string;
    }>;
    external: Array<{
      name: string;
      provider: string;
      model: string;
      use_case: string;
      data_handling: string;
    }>;
  };
  integrations: {
    ehr: {
      primary: string;
      secondary: string;
      connection_type: string;
      authentication: string;
      data_sync: string;
    };
    pacs: {
      enabled: boolean;
      system: string;
      connection_type: string;
      ai_analysis: string;
    };
    lab_systems: {
      enabled: boolean;
      systems: string[];
      connection_type: string;
    };
    scheduling: {
      enabled: boolean;
      system: string;
      integration: string;
      ai_assistance: string;
    };
  };
}

// Utility Functions
export const getBHLConfig = (): HealthlinkGenomicTwinConfig => {
  return {
    organization: {
      name: "Baptist Health Louisville",
      location: "Jeffersonville, KY",
      region: "Kentuckiana",
      type: "Healthcare System"
    },
    compliance: {
      hipaa: {
        enabled: true,
        phi_handling: "privacy-first",
        deidentification: "automatic",
        audit_trail: true,
        retention_policy: "7_years"
      },
      fips: {
        enabled: true,
        encryption_standard: "FIPS_140_2",
        key_management: "HSM"
      }
    },
    approved_llms: {
      internal: [
        {
          name: "BHL-GPT-4",
          provider: "OpenAI",
          model: "gpt-4",
          use_case: "clinical_decision_support",
          data_handling: "deidentified_only"
        },
        {
          name: "BHL-Claude",
          provider: "Anthropic",
          model: "claude-3-sonnet",
          use_case: "documentation_assistance",
          data_handling: "deidentified_only"
        }
      ],
      external: [
        {
          name: "Epic-Embedded",
          provider: "Epic",
          model: "epic-ai",
          use_case: "ehr_integration",
          data_handling: "epic_managed"
        },
        {
          name: "Cerner-Embedded",
          provider: "Cerner",
          model: "cerner-ai",
          use_case: "ehr_integration",
          data_handling: "cerner_managed"
        }
      ]
    },
    integrations: {
      ehr: {
        primary: "Epic",
        secondary: "Cerner",
        connection_type: "FHIR_R4",
        authentication: "OAuth2",
        data_sync: "real_time"
      },
      pacs: {
        enabled: true,
        system: "BHL-PACS",
        connection_type: "DICOM",
        ai_analysis: "enabled"
      },
      lab_systems: {
        enabled: true,
        systems: ["BHL-Lab", "Quest-Diagnostics", "LabCorp"],
        connection_type: "HL7_FHIR"
      },
      scheduling: {
        enabled: true,
        system: "BHL-Scheduler",
        integration: "epic_scheduling",
        ai_assistance: "enabled"
      }
    }
  };
};

// System Information
export const SYSTEM_INFO = {
  name: "Healthlink-Genomic-Twin AI",
  version: "1.0.0",
  organization: "Baptist Health Louisville",
  description: "Baptist Health Louisville's intelligent healthcare assistant powered by IRIS SDK Scaffold",
  features: [
    "Patient Care Navigation",
    "Clinical Efficiency Enhancement",
    "Community Health Coordination",
    "Privacy-First Design",
    "HIPAA Compliance",
    "FIPS 140-2 Encryption"
  ],
  agents: [
    "PatientCareNavigatorAgent",
    "ClinicalEfficiencyAgent",
    "CommunityHealthCoordinatorAgent"
  ]
};

// Default export for convenience
export default {
  core: healthlinkGenomicTwinCore,
  agents: {
    PatientCareNavigatorAgent,
    ClinicalEfficiencyAgent,
    CommunityHealthCoordinatorAgent
  },
  config: getBHLConfig(),
  info: SYSTEM_INFO
};