import { NextRequest, NextResponse } from 'next/server'
import { engagementEngine } from '@/lib/ai/engagement-engine'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, currentPage, userContext } = await req.json()

    if (!userId || !currentPage || !userContext) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get proactive assistance from engagement engine
    const assistance = await engagementEngine.getProactiveAssistance(userId, {
      currentPage,
      timeOnPage: userContext.timeOnPage || 0,
      lastAction: userContext.lastAction || 'none',
      errorState: userContext.errorState,
      taskInProgress: userContext.taskInProgress
    })

    // If no intervention needed, return early
    if (!assistance.shouldIntervene) {
      return NextResponse.json({
        shouldIntervene: false,
        assistance: null
      })
    }

    // Generate specific assistance based on context and user behavior
    let specificAssistance = null

    switch (assistance.interventionType) {
      case 'help':
        specificAssistance = {
          id: `help_${Date.now()}`,
          type: 'help',
          title: 'Need assistance?',
          message: assistance.message,
          actions: [
            { label: 'Show me how', action: 'start_tutorial', primary: true },
            { label: 'Get help', action: 'show_help' },
            { label: 'Not now', action: 'dismiss' }
          ],
          dismissible: true,
          persistUntilAction: false,
          showCount: 1,
          maxShows: 3
        }
        break

      case 'suggestion':
        specificAssistance = {
          id: `suggestion_${Date.now()}`,
          type: 'suggestion',
          title: '💡 Helpful suggestion',
          message: assistance.message,
          actions: [
            { label: 'Try it', action: 'accept_suggestion', primary: true },
            { label: 'Learn more', action: 'show_help' },
            { label: 'Maybe later', action: 'dismiss' }
          ],
          dismissible: true,
          persistUntilAction: false,
          showCount: 1,
          maxShows: 2
        }
        break

      case 'tutorial':
        specificAssistance = {
          id: `tutorial_${Date.now()}`,
          type: 'tutorial',
          title: 'Want a quick walkthrough?',
          message: assistance.message,
          actions: [
            { label: 'Yes, show me', action: 'start_tutorial', primary: true },
            { label: 'I\'ll explore on my own', action: 'dismiss' }
          ],
          dismissible: true,
          persistUntilAction: false,
          showCount: 1,
          maxShows: 1
        }
        break

      case 'encouragement':
        specificAssistance = {
          id: `encouragement_${Date.now()}`,
          type: 'tip',
          title: '🎉 You\'re doing great!',
          message: assistance.message,
          actions: [
            { label: 'Thanks!', action: 'dismiss', primary: true },
            { label: 'Show me more', action: 'show_advanced_features' }
          ],
          dismissible: true,
          persistUntilAction: false,
          showCount: 1,
          maxShows: 1
        }
        break

      default:
        specificAssistance = {
          id: `default_${Date.now()}`,
          type: 'tip',
          title: 'Tip',
          message: assistance.message,
          actions: assistance.actionButtons || [
            { label: 'Got it', action: 'dismiss', primary: true }
          ],
          dismissible: true,
          persistUntilAction: false,
          showCount: 1,
          maxShows: 3
        }
    }

    return NextResponse.json({
      shouldIntervene: true,
      assistance: specificAssistance,
      context: {
        interventionReason: 'User behavior analysis',
        confidenceScore: 0.85,
        userEngagementLevel: determineEngagementLevel(userContext),
        recommendedNextSteps: generateNextSteps(currentPage, userContext)
      }
    })

  } catch (error) {
    console.error('Proactive assistance error:', error)
    return NextResponse.json(
      { error: 'Failed to generate proactive assistance' },
      { status: 500 }
    )
  }
}

function determineEngagementLevel(userContext: any): 'high' | 'medium' | 'low' {
  const { timeOnPage, lastAction, role, experience } = userContext

  // High engagement: Active interaction, appropriate time on page
  if (lastAction !== 'none' && timeOnPage > 30000 && timeOnPage < 300000) {
    return 'high'
  }

  // Low engagement: No interaction, very short or very long time
  if (lastAction === 'none' || timeOnPage < 5000 || timeOnPage > 600000) {
    return 'low'
  }

  // Medium engagement: Some interaction, moderate time
  return 'medium'
}

function generateNextSteps(currentPage: string, userContext: any): string[] {
  const steps = []

  switch (currentPage) {
    case 'platform-overview':
      steps.push(
        'Explore the clinical decision support feature',
        'Try generating a patient app',
        'Check your EHR integration status'
      )
      break

    case 'clinical-decision-support':
      steps.push(
        'Run a sample patient analysis',
        'Review AI recommendation explanations',
        'Customize your clinical preferences'
      )
      break

    case 'patient-app-generator':
      steps.push(
        'Create your first patient education app',
        'Explore multi-modal content options',
        'Review patient engagement analytics'
      )
      break

    case 'mutation-analysis':
      steps.push(
        'Upload a genomic variant file',
        'Explore population frequency data',
        'Review clinical significance predictions'
      )
      break

    default:
      steps.push(
        'Take a guided tour of the platform',
        'Explore features relevant to your role',
        'Set up your preferences for better recommendations'
      )
  }

  return steps.slice(0, 3) // Return top 3 recommendations
}