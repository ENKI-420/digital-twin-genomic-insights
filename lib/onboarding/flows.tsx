import { OnboardingFlow, UserRole } from './types';

export const CLINICIAN_ONBOARDING: OnboardingFlow = {
  id: 'clinician_welcome',
  name: 'Clinician Welcome Tour',
  description: 'Get started with GenomicTwin1 clinical features',
  role: 'clinician',
  estimatedTime: 8,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to GenomicTwin1',
      description: 'Your AI-powered precision medicine platform',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Welcome, Doctor!</h3>
          <p>GenomicTwin1 integrates seamlessly with your Epic EHR to provide:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Real-time genomic analysis</li>
            <li>CPIC-aligned drug recommendations</li>
            <li>Clinical trial matching</li>
            <li>AI-powered insights</li>
          </ul>
          <p className="text-sm text-gray-600">This tour will take about 8 minutes to complete.</p>
        </div>
      ),
      position: 'center',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'dashboard_overview',
      title: 'Your Clinical Dashboard',
      description: 'Overview of your main workspace',
      content: 'This is your clinical dashboard where you can access patient genomic data, view analysis results, and manage clinical decisions.',
      targetElement: '[data-testid="dashboard-main"]',
      position: 'bottom',
      canSkip: false,
      triggerNext: 'manual'
    },
    {
      id: 'patient_search',
      title: 'Find Patients',
      description: 'Search and access patient genomic profiles',
      content: 'Use the patient search to quickly find and access genomic profiles. Data syncs automatically from your Epic EHR.',
      targetElement: '[data-testid="patient-search"]',
      position: 'bottom',
      action: {
        type: 'click',
        target: '[data-testid="patient-search"]'
      },
      canSkip: true,
      triggerNext: 'auto'
    },
    {
      id: 'genomic_analysis',
      title: 'Genomic Analysis Tools',
      description: 'AI-powered genomic insights',
      content: 'Access comprehensive genomic analysis including variant interpretation, pharmacogenomic recommendations, and 3D visualization.',
      targetElement: '[data-testid="genomics-nav"]',
      position: 'right',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'trial_matching',
      title: 'Clinical Trial Matching',
      description: 'Find relevant trials for your patients',
      content: 'Our AI automatically matches patients to clinical trials based on their genomic profile and clinical criteria.',
      targetElement: '[data-testid="trial-matching-nav"]',
      position: 'right',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'ai_assistant',
      title: 'AI Clinical Assistant',
      description: 'Get intelligent recommendations',
      content: 'Chat with our AI assistant for genomic interpretation help, treatment recommendations, and clinical decision support.',
      targetElement: '[data-testid="ai-assistant-nav"]',
      position: 'right',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'epic_integration',
      title: 'Epic EHR Integration',
      description: 'Seamless workflow integration',
      content: (
        <div className="space-y-3">
          <p>GenomicTwin1 integrates directly with your Epic EHR:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Automatic patient data sync</li>
            <li>Results posted back to Epic</li>
            <li>SMART on FHIR compliance</li>
            <li>Single sign-on authentication</li>
          </ul>
          <p className="text-sm font-medium text-blue-600">No duplicate data entry required!</p>
        </div>
      ),
      position: 'center',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'completion',
      title: 'Ready to Start!',
      description: 'You\'re all set to use GenomicTwin1',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Congratulations!</h3>
          <p>You've completed the onboarding tour. You can now:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access patient genomic data</li>
            <li>Run AI-powered analyses</li>
            <li>Find clinical trial matches</li>
            <li>Get treatment recommendations</li>
          </ul>
          <p className="text-sm text-gray-600">Need help? Access the help center anytime from the top menu.</p>
        </div>
      ),
      position: 'center',
      canSkip: false,
      triggerNext: 'manual'
    }
  ]
};

export const PATIENT_ONBOARDING: OnboardingFlow = {
  id: 'patient_welcome',
  name: 'Patient Welcome Tour',
  description: 'Learn how to access your genomic health insights',
  role: 'patient',
  estimatedTime: 5,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Your Genomic Health Dashboard',
      description: 'Understand your genetic information safely and securely',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hello!</h3>
          <p>Your healthcare provider has given you access to GenomicTwin1 to help you understand your genetic health information.</p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm"><strong>Your privacy is protected:</strong> All data is encrypted and only accessible to you and your healthcare team.</p>
          </div>
        </div>
      ),
      position: 'center',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'health_overview',
      title: 'Your Health Overview',
      description: 'See your genetic health summary',
      content: 'This dashboard shows your genetic health information in an easy-to-understand format, including any important findings your doctor wants you to know about.',
      targetElement: '[data-testid="patient-overview"]',
      position: 'bottom',
      canSkip: false,
      triggerNext: 'manual'
    },
    {
      id: 'genetic_insights',
      title: 'Genetic Insights',
      description: 'Learn about your genetic variants',
      content: 'View your genetic variants and what they mean for your health. We explain everything in plain language.',
      targetElement: '[data-testid="genetic-insights"]',
      position: 'right',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'medication_guidance',
      title: 'Medication Guidance',
      description: 'Personalized medication recommendations',
      content: 'See how your genetics might affect how you respond to certain medications. Always discuss any changes with your doctor.',
      targetElement: '[data-testid="medication-guidance"]',
      position: 'right',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'family_history',
      title: 'Family Health Information',
      description: 'Information relevant to your family',
      content: 'Some genetic findings might be relevant to your family members. We\'ll help you understand what to discuss with them.',
      targetElement: '[data-testid="family-info"]',
      position: 'left',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'questions_support',
      title: 'Questions & Support',
      description: 'Get help when you need it',
      content: (
        <div className="space-y-3">
          <p>Have questions about your genetic information?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Chat with our AI assistant for basic questions</li>
            <li>Schedule time with a genetic counselor</li>
            <li>Contact your healthcare provider</li>
          </ul>
          <p className="text-sm text-blue-600">You're never alone in understanding your genetic health!</p>
        </div>
      ),
      position: 'center',
      canSkip: false,
      triggerNext: 'manual'
    }
  ]
};

export const RESEARCHER_ONBOARDING: OnboardingFlow = {
  id: 'researcher_welcome',
  name: 'Researcher Platform Tour',
  description: 'Explore research collaboration and analysis tools',
  role: 'researcher',
  estimatedTime: 12,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to GenomicTwin1 Research Platform',
      description: 'Advanced genomic research and collaboration tools',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Welcome, Researcher!</h3>
          <p>GenomicTwin1 provides cutting-edge tools for genomic research:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Multi-institutional collaboration</li>
            <li>AI-powered discovery tools</li>
            <li>Federated learning capabilities</li>
            <li>Advanced analytics pipeline</li>
            <li>Grant opportunity matching</li>
          </ul>
        </div>
      ),
      position: 'center',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'research_dashboard',
      title: 'Research Dashboard',
      description: 'Your research workspace overview',
      content: 'Access ongoing projects, collaborate with colleagues, and monitor research progress from your centralized dashboard.',
      targetElement: '[data-testid="research-dashboard"]',
      position: 'bottom',
      canSkip: false,
      triggerNext: 'manual'
    },
    {
      id: 'data_analysis',
      title: 'Advanced Analytics',
      description: 'Powerful genomic analysis tools',
      content: 'Use our advanced analytics pipeline for population genomics, variant discovery, and biomarker identification.',
      targetElement: '[data-testid="analytics-tools"]',
      position: 'right',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'collaboration_hub',
      title: 'Collaboration Hub',
      description: 'Work with researchers worldwide',
      content: 'Connect with researchers, share datasets, and collaborate on multi-institutional studies while maintaining data privacy.',
      targetElement: '[data-testid="collaboration-nav"]',
      position: 'right',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'funding_opportunities',
      title: 'Grant & Funding Opportunities',
      description: 'AI-powered opportunity discovery',
      content: 'Our AI automatically identifies relevant grants, funding opportunities, and collaboration requests based on your research interests.',
      targetElement: '[data-testid="funding-nav"]',
      position: 'left',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'publication_tools',
      title: 'Publication & Reporting',
      description: 'Streamlined research dissemination',
      content: 'Generate publication-ready figures, export data for journals, and track research impact metrics.',
      targetElement: '[data-testid="publications"]',
      position: 'left',
      canSkip: true,
      triggerNext: 'manual'
    },
    {
      id: 'completion',
      title: 'Research Platform Ready!',
      description: 'Start your genomic research journey',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ready to Research!</h3>
          <p>You now have access to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Advanced genomic analytics</li>
            <li>Global research collaboration</li>
            <li>AI-powered discovery tools</li>
            <li>Funding opportunity alerts</li>
          </ul>
          <p className="text-sm text-gray-600">Start by creating your first research project or joining an existing collaboration.</p>
        </div>
      ),
      position: 'center',
      canSkip: false,
      triggerNext: 'manual'
    }
  ]
};

export function getOnboardingFlow(role: UserRole): OnboardingFlow | null {
  switch (role) {
    case 'clinician':
      return CLINICIAN_ONBOARDING;
    case 'patient':
      return PATIENT_ONBOARDING;
    case 'researcher':
      return RESEARCHER_ONBOARDING;
    default:
      return null;
  }
}

export function getAllOnboardingFlows(): OnboardingFlow[] {
  return [
    CLINICIAN_ONBOARDING,
    PATIENT_ONBOARDING,
    RESEARCHER_ONBOARDING
  ];
}