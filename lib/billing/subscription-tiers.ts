export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  limits: {
    genomicAnalyses: number; // -1 for unlimited
    patientsPerMonth: number;
    apiCalls: number;
    storageGB: number;
    trialMatches: number;
    aiRecommendations: number;
  };
  features: string[];
  description: string;
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'monthly',
    limits: {
      genomicAnalyses: 10,
      patientsPerMonth: 5,
      apiCalls: 1000,
      storageGB: 1,
      trialMatches: 5,
      aiRecommendations: 20
    },
    features: [
      'basic_analysis',
      'educational_content',
      'community_access',
      'basic_visualization',
      'limited_support'
    ],
    description: 'Perfect for learning and basic genomic analysis'
  },

  CLINICIAN_PRO: {
    id: 'clinician_pro',
    name: 'Clinician Pro',
    price: 299,
    billingPeriod: 'monthly',
    limits: {
      genomicAnalyses: -1,
      patientsPerMonth: -1,
      apiCalls: 100000,
      storageGB: 100,
      trialMatches: -1,
      aiRecommendations: -1
    },
    features: [
      'epic_integration',
      'ai_recommendations',
      'cpic_guidelines',
      '3d_visualization',
      'trial_matching',
      'priority_support',
      'advanced_analytics',
      'patient_dashboard'
    ],
    description: 'Complete clinical decision support for healthcare providers',
    popular: true
  },

  RESEARCH_INSTITUTION: {
    id: 'research_institution',
    name: 'Research Institution',
    price: 2999,
    billingPeriod: 'monthly',
    limits: {
      genomicAnalyses: -1,
      patientsPerMonth: -1,
      apiCalls: 1000000,
      storageGB: 1000,
      trialMatches: -1,
      aiRecommendations: -1
    },
    features: [
      'multi_user_collaboration',
      'advanced_ai',
      'federated_learning',
      'custom_integrations',
      'research_tools',
      'data_export',
      'white_labeling',
      'priority_support',
      'training_sessions'
    ],
    description: 'Advanced research capabilities with multi-user collaboration'
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    billingPeriod: 'yearly',
    limits: {
      genomicAnalyses: -1,
      patientsPerMonth: -1,
      apiCalls: -1,
      storageGB: -1,
      trialMatches: -1,
      aiRecommendations: -1
    },
    features: [
      'custom_deployment',
      'unlimited_everything',
      'dedicated_support',
      'custom_integrations',
      'sla_guarantee',
      'compliance_certification',
      'training_program',
      'on_premise_option'
    ],
    description: 'Custom solution for large healthcare organizations'
  }
};

export function getTierById(tierId: string): SubscriptionTier | null {
  return SUBSCRIPTION_TIERS[tierId.toUpperCase()] || null;
}

export function getAllTiers(): SubscriptionTier[] {
  return Object.values(SUBSCRIPTION_TIERS);
}

export function getFeatureAvailability(tierId: string, feature: string): boolean {
  const tier = getTierById(tierId);
  return tier ? tier.features.includes(feature) : false;
}

export function checkUsageLimit(
  tierId: string,
  usageType: keyof SubscriptionTier['limits'],
  currentUsage: number
): { allowed: boolean; remaining: number; limit: number } {
  const tier = getTierById(tierId);

  if (!tier) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  const limit = tier.limits[usageType];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  const remaining = Math.max(0, limit - currentUsage);

  return {
    allowed: currentUsage < limit,
    remaining,
    limit
  };
}