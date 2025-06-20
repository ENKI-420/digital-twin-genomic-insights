export interface SecurityFramework {
  dataProtection: {
    classification: string[]
    encryption: string[]
    access: string[]
    retention: string[]
  }
  networkSecurity: {
    perimeter: string[]
    internal: string[]
    monitoring: string[]
    response: string[]
  }
  applicationSecurity: {
    authentication: string[]
    authorization: string[]
    validation: string[]
    logging: string[]
  }
  complianceFrameworks: {
    hipaa: string[]
    sox2: string[]
    fedramp: string[]
    nist: string[]
  }
}

export const securityImplementation: SecurityFramework = {
  dataProtection: {
    classification: [
      "PHI (Protected Health Information) - Highest security",
      "PII (Personally Identifiable Information) - High security",
      "Research Data - Medium security",
      "Public Data - Standard security",
    ],
    encryption: [
      "AES-256 encryption for data at rest",
      "TLS 1.3 for data in transit",
      "Field-level encryption for sensitive fields",
      "Hardware Security Module (HSM) for key management",
    ],
    access: [
      "Role-based access control (RBAC)",
      "Principle of least privilege",
      "Multi-factor authentication required",
      "Regular access reviews and deprovisioning",
    ],
    retention: [
      "7-year retention for research data",
      "Automated data lifecycle management",
      "Secure data destruction procedures",
      "Compliance with federal retention requirements",
    ],
  },
  networkSecurity: {
    perimeter: [
      "Web Application Firewall (WAF)",
      "DDoS protection and mitigation",
      "IP allowlisting for administrative access",
      "Geographic access restrictions",
    ],
    internal: [
      "Network segmentation and microsegmentation",
      "Zero-trust network architecture",
      "Encrypted internal communications",
      "Regular network vulnerability assessments",
    ],
    monitoring: [
      "24/7 Security Operations Center (SOC)",
      "Real-time threat detection and response",
      "Automated incident response procedures",
      "Continuous security monitoring",
    ],
    response: [
      "Incident response playbooks",
      "Automated threat containment",
      "Forensic analysis capabilities",
      "Regulatory notification procedures",
    ],
  },
  applicationSecurity: {
    authentication: [
      "Epic OAuth2 integration",
      "Multi-factor authentication (MFA)",
      "Single sign-on (SSO) capabilities",
      "Session management and timeout",
    ],
    authorization: [
      "Fine-grained permission system",
      "Dynamic access control based on context",
      "API rate limiting and throttling",
      "Resource-level access controls",
    ],
    validation: [
      "Input validation and sanitization",
      "SQL injection prevention",
      "Cross-site scripting (XSS) protection",
      "API security testing",
    ],
    logging: [
      "Comprehensive audit trails",
      "Real-time log analysis",
      "Tamper-evident logging",
      "Automated compliance reporting",
    ],
  },
  complianceFrameworks: {
    hipaa: [
      "Administrative safeguards implementation",
      "Physical safeguards for data centers",
      "Technical safeguards for PHI",
      "Business Associate Agreements (BAAs)",
    ],
    sox2: [
      "SOC 2 Type II audit preparation",
      "Security controls documentation",
      "Availability and confidentiality controls",
      "Annual third-party assessments",
    ],
    fedramp: [
      "FedRAMP Moderate baseline implementation",
      "Continuous monitoring program",
      "Security control assessments",
      "Authority to Operate (ATO) process",
    ],
    nist: [
      "NIST Cybersecurity Framework alignment",
      "Risk assessment and management",
      "Security control implementation",
      "Continuous improvement processes",
    ],
  },
}
