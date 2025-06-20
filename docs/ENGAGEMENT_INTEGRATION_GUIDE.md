# User Engagement Integration Guide

## Quick Start: Adding Engagement Features to Your Application

This guide shows how to integrate the comprehensive user engagement system into your existing AI-driven personalized medicine platform.

### 1. Adding Interactive Onboarding

#### For New User Welcome Pages

```tsx
// app/welcome/page.tsx
import InteractiveOnboarding from '@/components/engagement/interactive-onboarding'

export default function WelcomePage() {
  const [showOnboarding, setShowOnboarding] = useState(true)

  return (
    <div>
      {/* Your existing welcome content */}

      {showOnboarding && (
        <InteractiveOnboarding
          userId={session.user.id}
          onComplete={(data) => {
            // Track completion analytics
            trackEvent('onboarding_completed', data)
            setShowOnboarding(false)
            // Redirect to main dashboard
            router.push('/dashboard')
          }}
          onSkip={() => {
            trackEvent('onboarding_skipped')
            setShowOnboarding(false)
          }}
        />
      )}
    </div>
  )
}
```

#### For Feature Introduction Pages

```tsx
// app/clinical-decision-support/page.tsx
import InteractiveOnboarding from '@/components/engagement/interactive-onboarding'

export default function ClinicalDecisionSupportPage() {
  const [showFeatureTour, setShowFeatureTour] = useState(false)

  useEffect(() => {
    // Show feature tour for first-time visitors to this page
    const hasSeenTour = localStorage.getItem('cds_tour_completed')
    if (!hasSeenTour) {
      setShowFeatureTour(true)
    }
  }, [])

  return (
    <div>
      {/* Add data-tour attributes to key elements */}
      <div data-tour="clinical-decision-support" className="...">
        <h1>Clinical Decision Support</h1>
        {/* Your existing content */}
      </div>

      {showFeatureTour && (
        <InteractiveOnboarding
          userId={session.user.id}
          onComplete={(data) => {
            localStorage.setItem('cds_tour_completed', 'true')
            setShowFeatureTour(false)
          }}
          onSkip={() => setShowFeatureTour(false)}
        />
      )}
    </div>
  )
}
```

### 2. Adding Contextual Help System

#### Global Integration (Layout Level)

```tsx
// app/layout.tsx
import ContextualHelp from '@/components/engagement/contextual-help'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const pathname = usePathname()

  return (
    <html>
      <body>
        {children}

        {/* Add contextual help to every page */}
        {session.data?.user && (
          <ContextualHelp
            userId={session.data.user.id}
            currentPage={pathname}
            userContext={{
              role: session.data.user.role,
              experience: session.data.user.experience || 'intermediate',
              timeOnPage: Date.now(),
              lastAction: 'page_load'
            }}
          />
        )}
      </body>
    </html>
  )
}
```

#### Page-Specific Integration

```tsx
// app/mutation-analysis/page.tsx
import ContextualHelp from '@/components/engagement/contextual-help'

export default function MutationAnalysisPage() {
  const [userContext, setUserContext] = useState({
    role: 'researcher',
    experience: 'intermediate',
    timeOnPage: Date.now(),
    lastAction: 'page_load',
    strugglingWith: []
  })

  const handleUserAction = (action: string) => {
    setUserContext(prev => ({
      ...prev,
      lastAction: action,
      timeOnPage: Date.now() - prev.timeOnPage
    }))
  }

  return (
    <div>
      {/* Add data attributes for contextual help targeting */}
      <button
        data-tour="upload-vcf"
        onClick={() => handleUserAction('upload_clicked')}
        className="..."
      >
        Upload VCF File
      </button>

      <div data-tour="analysis-results" className="...">
        {/* Analysis results */}
      </div>

      <ContextualHelp
        userId={session.user.id}
        currentPage="mutation-analysis"
        userContext={userContext}
      />
    </div>
  )
}
```

### 3. Adding Behavioral Tracking

#### Custom Hook for User Behavior

```tsx
// hooks/useEngagementTracking.ts
import { useCallback, useEffect, useRef } from 'react'
import { engagementEngine } from '@/lib/ai/engagement-engine'

export function useEngagementTracking(userId: string, currentPage: string) {
  const sessionId = useRef(Date.now().toString())
  const startTime = useRef(Date.now())

  const trackAction = useCallback(async (action: string, context?: any) => {
    try {
      await engagementEngine.recordUserBehavior(userId, sessionId.current, {
        action,
        context: { currentPage, ...context },
        timestamp: new Date().toISOString(),
        outcome: 'success',
        duration: Date.now() - startTime.current
      })
    } catch (error) {
      console.error('Failed to track user behavior:', error)
    }
  }, [userId, currentPage])

  useEffect(() => {
    // Track page view
    trackAction('page_view', { referrer: document.referrer })

    // Track page exit
    return () => {
      trackAction('page_exit', {
        timeSpent: Date.now() - startTime.current
      })
    }
  }, [trackAction])

  return { trackAction }
}
```

#### Using the Tracking Hook

```tsx
// app/patient-app-generator/page.tsx
import { useEngagementTracking } from '@/hooks/useEngagementTracking'

export default function PatientAppGeneratorPage() {
  const { trackAction } = useEngagementTracking(session.user.id, 'patient-app-generator')

  const handleGenerateApp = async (patientData: any) => {
    trackAction('generate_app_started', { patientType: patientData.condition })

    try {
      const result = await generatePatientApp(patientData)
      trackAction('generate_app_completed', { success: true, appId: result.id })
    } catch (error) {
      trackAction('generate_app_failed', { error: error.message })
    }
  }

  return (
    <div>
      <button
        onClick={handleGenerateApp}
        onMouseEnter={() => trackAction('generate_button_hover')}
      >
        Generate Patient App
      </button>
    </div>
  )
}
```

### 4. Dashboard Integration

#### Adding Engagement Metrics to Existing Dashboards

```tsx
// app/dashboard/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function DashboardPage() {
  const [engagementData, setEngagementData] = useState(null)

  useEffect(() => {
    // Fetch user's engagement progress
    fetchEngagementData(session.user.id)
      .then(setEngagementData)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Existing dashboard cards */}

      {/* New engagement progress card */}
      {engagementData && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Platform Mastery</span>
                  <span>{engagementData.masteryLevel}%</span>
                </div>
                <Progress value={engagementData.masteryLevel} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Features Explored</span>
                  <span>{engagementData.featuresExplored}/{engagementData.totalFeatures}</span>
                </div>
                <Progress value={(engagementData.featuresExplored / engagementData.totalFeatures) * 100} />
              </div>

              {engagementData.nextRecommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recommended Next Steps</h4>
                  <ul className="text-sm space-y-1">
                    {engagementData.nextRecommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="text-blue-600">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 5. Feature-Specific Enhancements

#### Clinical Decision Support Page

```tsx
// app/clinical-decision-support/page.tsx
export default function ClinicalDecisionSupportPage() {
  return (
    <div>
      {/* Add contextual help attributes */}
      <div data-tour="patient-input" className="...">
        <h2>Patient Information</h2>
        {/* Patient input form */}
      </div>

      <div data-tour="ai-recommendations" className="...">
        <h2>AI Recommendations</h2>
        {/* AI recommendations display */}
      </div>

      <div data-tour="evidence-links" className="...">
        <h2>Supporting Evidence</h2>
        {/* Clinical evidence and references */}
      </div>
    </div>
  )
}
```

#### Genomics Analysis Page

```tsx
// app/genomics/analysis/page.tsx
export default function GenomicsAnalysisPage() {
  return (
    <div>
      <div data-tour="file-upload" className="...">
        <h2>Upload Genomic Data</h2>
        {/* File upload component */}
      </div>

      <div data-tour="analysis-options" className="...">
        <h2>Analysis Options</h2>
        {/* Analysis configuration */}
      </div>

      <div data-tour="results-visualization" className="...">
        <h2>Results</h2>
        {/* 3D visualization and results */}
      </div>
    </div>
  )
}
```

### 6. Mobile-Responsive Integration

#### Responsive Engagement Components

```tsx
// components/engagement/mobile-friendly-onboarding.tsx
export default function MobileFriendlyOnboarding(props) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className={`${isMobile ? 'mobile-optimized' : 'desktop-optimized'}`}>
      <InteractiveOnboarding
        {...props}
        adaptForMobile={isMobile}
      />
    </div>
  )
}
```

### 7. Performance Optimization

#### Lazy Loading Engagement Components

```tsx
// Lazy load heavy engagement components
const InteractiveOnboarding = lazy(() => import('@/components/engagement/interactive-onboarding'))
const ContextualHelp = lazy(() => import('@/components/engagement/contextual-help'))

export default function OptimizedPage() {
  return (
    <div>
      {/* Your page content */}

      <Suspense fallback={<div>Loading assistance...</div>}>
        <ContextualHelp {...props} />
      </Suspense>
    </div>
  )
}
```

### 8. Analytics Integration

#### Custom Analytics Events

```tsx
// lib/analytics/engagement-events.ts
export const trackEngagementEvent = (eventName: string, properties: any) => {
  // Integration with your analytics platform
  analytics.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    sessionId: getSessionId()
  })
}

// Usage in components
trackEngagementEvent('onboarding_step_completed', {
  stepId: 'clinical_decision_support',
  timeSpent: 45,
  difficultLevel: 'easy'
})
```

### 9. A/B Testing Integration

#### Testing Different Onboarding Flows

```tsx
// hooks/useEngagementExperiment.ts
export function useEngagementExperiment(experimentName: string) {
  const [variant, setVariant] = useState('control')

  useEffect(() => {
    // Determine experiment variant based on user ID
    const userVariant = getExperimentVariant(experimentName, getCurrentUserId())
    setVariant(userVariant)
  }, [experimentName])

  return variant
}

// Usage
export default function WelcomePage() {
  const onboardingVariant = useEngagementExperiment('onboarding_flow_v2')

  return (
    <div>
      {onboardingVariant === 'control' ? (
        <StandardOnboarding />
      ) : (
        <EnhancedOnboarding />
      )}
    </div>
  )
}
```

### 10. Environment Configuration

#### Environment Variables

```bash
# .env.local
ENGAGEMENT_ENGINE_VERSION=v1.0.0
REDIS_URL=your_redis_url
ENGAGEMENT_DEBUG=true
PROACTIVE_ASSISTANCE_ENABLED=true
ONBOARDING_ANALYTICS_ENDPOINT=your_analytics_endpoint
```

#### Feature Flags

```tsx
// lib/config/engagement-config.ts
export const engagementConfig = {
  proactiveAssistance: {
    enabled: process.env.PROACTIVE_ASSISTANCE_ENABLED === 'true',
    checkInterval: 10000, // 10 seconds
    maxInterventionsPerSession: 3
  },
  onboarding: {
    enabled: true,
    autoStart: true,
    gamificationEnabled: true
  },
  contextualHelp: {
    enabled: true,
    tooltipDelay: 500,
    helpPanelEnabled: true
  }
}
```

This integration guide provides practical examples for incorporating the comprehensive user engagement system into your existing AI-driven personalized medicine platform. The system will enhance user adoption, reduce support requests, and improve overall user satisfaction through intelligent, personalized assistance.
