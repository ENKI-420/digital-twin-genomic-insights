import { NextRequest, NextResponse } from 'next/server'
import { patientWebAppGenerator, PatientProfile } from '@/lib/ai/patient-app-generator'
import { platformCore } from '@/lib/ai/platform-core'
import { clinicalDecisionSupport } from '@/lib/ai/clinical-decision-support'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, patientProfile, options } = body

    // Validate required fields
    if (!tenantId || !patientProfile) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId and patientProfile' },
        { status: 400 }
      )
    }

    // Check rate limits
    const rateLimitOk = await platformCore.checkRateLimit(tenantId, '/api/ai/patient-app-generator')
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Generate clinical recommendations first
    const clinicalRecommendations = await clinicalDecisionSupport.generateRecommendations(
      tenantId,
      patientProfile.clinicalData,
      { maxRecommendations: 10 }
    )

    // Generate patient-specific web app
    const generatedApp = await patientWebAppGenerator.generatePatientApp(
      tenantId,
      patientProfile as PatientProfile,
      clinicalRecommendations.recommendations,
      options
    )

    return NextResponse.json({
      success: true,
      data: {
        app: generatedApp,
        clinicalContext: {
          recommendationsCount: clinicalRecommendations.recommendations.length,
          riskPredictionsCount: clinicalRecommendations.riskPredictions.length,
          alertsCount: clinicalRecommendations.alerts.length
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Patient app generator API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const appId = searchParams.get('appId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId parameter' },
        { status: 400 }
      )
    }

    // If appId provided, return specific app
    if (appId) {
      // Implementation for retrieving specific generated app
      return NextResponse.json({
        success: true,
        data: { message: 'App retrieval not implemented yet' }
      })
    }

    // Return service information
    return NextResponse.json({
      success: true,
      data: {
        service: 'Patient-Specific Web App Generator',
        version: 'v1.2.0',
        aiAgents: [
          'Clinical Content Specialist',
          'Patient Education Specialist',
          'Patient Engagement Specialist',
          'Health Monitoring Specialist'
        ],
        capabilities: [
          'Multi-modal AI agent collaboration',
          'Advanced reflection system',
          'Personalized component generation',
          'Adaptive user experiences',
          'Real-time optimization',
          'Clinical outcome tracking'
        ]
      }
    })

  } catch (error) {
    console.error('Patient app generator API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}