import { NextRequest, NextResponse } from 'next/server'
import { engagementEngine } from '@/lib/ai/engagement-engine'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Generate personalized onboarding experience
    const landingExperience = await engagementEngine.generateLandingExperience(
      userId,
      true // isFirstVisit - we can determine this from user data
    )

    // Create detailed onboarding flow
    const onboarding = {
      id: `onboarding_${userId}_${Date.now()}`,
      title: 'Welcome to AI-Driven Personalized Medicine',
      description: 'Let\'s get you started with the most relevant features for your role',
      estimatedDuration: landingExperience.estimatedJourneyTime,
      userRole: 'clinician', // Default, would be determined from user profile
      experienceLevel: 'novice',
      steps: [
        {
          id: 'welcome',
          title: 'Platform Overview',
          description: 'Get familiar with your personalized AI-powered healthcare platform',
          action: 'observe',
          target: 'main-dashboard',
          expectedResult: 'Understanding of main features and navigation',
          tips: [
            'Take your time to explore the interface',
            'Notice how features are organized by clinical workflow',
            'Look for the AI assistant icon for help'
          ],
          estimatedTime: 60,
          difficulty: 'easy'
        },
        {
          id: 'clinical_decision_support',
          title: 'AI Clinical Decision Support',
          description: 'Discover how AI enhances your clinical decision-making',
          action: 'click',
          target: '[data-tour="clinical-decision-support"]',
          expectedResult: 'Clinical decision support panel opens with AI recommendations',
          tips: [
            'This is where AI analyzes patient data in real-time',
            'Notice the confidence scores and evidence links',
            'Recommendations adapt to your specialty and preferences'
          ],
          estimatedTime: 120,
          difficulty: 'easy'
        },
        {
          id: 'patient_app_generation',
          title: 'Generate Patient Apps',
          description: 'Learn how to create personalized patient education apps',
          action: 'navigate',
          target: '/ai/patient-app-generator',
          expectedResult: 'Patient app generator page loads',
          tips: [
            'Apps are tailored to each patient\'s condition and preferences',
            'Multi-modal content includes text, audio, and interactive elements',
            'Apps integrate with your treatment plans automatically'
          ],
          estimatedTime: 90,
          difficulty: 'medium'
        },
        {
          id: 'fhir_integration',
          title: 'EHR Integration',
          description: 'See how your EHR data enhances AI recommendations',
          action: 'click',
          target: '[data-tour="fhir-status"]',
          expectedResult: 'FHIR integration status panel opens',
          tips: [
            'Real-time sync with Epic, Cerner, and other major EHRs',
            'Patient data is automatically analyzed for insights',
            'Recommendations appear directly in your clinical workflow'
          ],
          estimatedTime: 75,
          difficulty: 'intermediate'
        },
        {
          id: 'personalization',
          title: 'Customize Your Experience',
          description: 'Set your preferences for optimal AI assistance',
          action: 'navigate',
          target: '/profile?tab=ai-preferences',
          expectedResult: 'AI preferences page loads with customization options',
          tips: [
            'Adjust AI recommendation frequency and detail level',
            'Set your clinical specialties and areas of interest',
            'Configure notification preferences for different alert types'
          ],
          estimatedTime: 100,
          difficulty: 'medium'
        }
      ],
      completionReward: {
        xp: 150,
        badge: 'AI Medicine Pioneer',
        unlocks: [
          'Advanced AI Features',
          'Beta Clinical Trials Matching',
          'Priority Support Access',
          'Exclusive Research Insights'
        ]
      }
    }

    // Generate personalized content based on user context
    const personalizedContent = {
      message: landingExperience.personalizedGreeting,
      recommendations: [
        'Start with clinical cases similar to your recent patients',
        'Explore AI-powered differential diagnosis tools',
        'Try the mutation analysis feature for complex cases',
        'Set up automated alerts for drug interactions'
      ],
      quickTips: landingExperience.contextualTips,
      estimatedBenefit: 'Clinical efficiency improved by 35% on average'
    }

    return NextResponse.json({
      success: true,
      onboarding,
      personalizedContent,
      landingExperience
    })

  } catch (error) {
    console.error('Onboarding generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate personalized onboarding' },
      { status: 500 }
    )
  }
}