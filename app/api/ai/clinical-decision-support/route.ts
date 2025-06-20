import { NextRequest, NextResponse } from 'next/server'
import { clinicalDecisionSupport, ClinicalContext } from '@/lib/ai/clinical-decision-support'
import { platformCore } from '@/lib/ai/platform-core'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, clinicalContext, options } = body

    // Validate required fields
    if (!tenantId || !clinicalContext) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId and clinicalContext' },
        { status: 400 }
      )
    }

    // Check rate limits
    const rateLimitOk = await platformCore.checkRateLimit(tenantId, '/api/ai/clinical-decision-support')
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Generate clinical recommendations
    const recommendations = await clinicalDecisionSupport.generateRecommendations(
      tenantId,
      clinicalContext as ClinicalContext,
      options
    )

    return NextResponse.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Clinical decision support API error:', error)
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
    const sessionId = searchParams.get('sessionId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId parameter' },
        { status: 400 }
      )
    }

    // If sessionId provided, return cached results
    if (sessionId) {
      // Implementation for retrieving cached session results
      return NextResponse.json({
        success: true,
        data: { message: 'Session retrieval not implemented yet' }
      })
    }

    // Return API information
    return NextResponse.json({
      success: true,
      data: {
        service: 'Clinical Decision Support',
        version: 'v2.1.0',
        capabilities: [
          'Risk stratification',
          'Differential diagnosis',
          'Drug interaction analysis',
          'Clinical alerts',
          'Treatment recommendations',
          'Explainable AI insights'
        ]
      }
    })

  } catch (error) {
    console.error('Clinical decision support API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}