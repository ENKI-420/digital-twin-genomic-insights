import { NextRequest, NextResponse } from 'next/server'
import { redisConfig } from '@/lib/config/environment'

interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  userId?: string
  patientId?: string
  sessionId: string
  timestamp: string
  userAgent: string
  ip: string
}

interface TrackingRequest {
  event: string
  properties?: Record<string, any>
  userId?: string
  patientId?: string
  sessionId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingRequest = await request.json()
    const { event, properties = {}, userId, patientId, sessionId } = body

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.ip || 'unknown'

    // Create analytics event
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: request.url,
        referrer: request.headers.get('referer') || undefined
      },
      userId,
      patientId,
      sessionId,
      timestamp: new Date().toISOString(),
      userAgent,
      ip: anonymizeIP(ip) // HIPAA compliance - anonymize IP
    }

    // Store in multiple channels for redundancy
    await Promise.allSettled([
      storeInRedis(analyticsEvent),
      logToConsole(analyticsEvent),
      sendToAnalyticsService(analyticsEvent)
    ])

    // HIPAA audit log for patient-related events
    if (patientId && isPatientRelatedEvent(event)) {
      console.log(`[AUDIT] Patient analytics - Patient: ${patientId}, Event: ${event}, User: ${userId || 'anonymous'}, Timestamp: ${analyticsEvent.timestamp}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventType = searchParams.get('event')
    const timeRange = searchParams.get('timeRange') || '24h'
    const userId = searchParams.get('userId')

    // Get analytics data (mock implementation)
    const analytics = await getAnalyticsData({
      eventType,
      timeRange,
      userId
    })

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      { error: 'Analytics retrieval failed' },
      { status: 500 }
    )
  }
}

async function storeInRedis(event: AnalyticsEvent) {
  try {
    // Store event in Redis with expiration (90 days for HIPAA compliance)
    const key = `analytics:${event.sessionId}:${Date.now()}`
    const expiration = 90 * 24 * 60 * 60 // 90 days in seconds

    if (redisConfig.url && redisConfig.token) {
      // Store using Upstash Redis REST API
      await fetch(`${redisConfig.url}/set/${key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${redisConfig.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: JSON.stringify(event),
          ex: expiration
        })
      })
    }
  } catch (error) {
    console.error('Redis storage error:', error)
  }
}

async function logToConsole(event: AnalyticsEvent) {
  const logLevel = event.patientId ? 'AUDIT' : 'INFO'
  console.log(`[${logLevel}] Analytics: ${event.event} - ${JSON.stringify({
    userId: event.userId,
    patientId: event.patientId,
    properties: event.properties,
    timestamp: event.timestamp
  })}`)
}

async function sendToAnalyticsService(event: AnalyticsEvent) {
  // Integration with external analytics services (Google Analytics, Mixpanel, etc.)
  try {
    // Example: Send to Google Analytics 4
    if (process.env.GOOGLE_ANALYTICS_ID) {
      await sendToGA4(event)
    }

    // Example: Send to custom analytics endpoint
    if (process.env.CUSTOM_ANALYTICS_ENDPOINT) {
      await fetch(process.env.CUSTOM_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CUSTOM_ANALYTICS_TOKEN}`
        },
        body: JSON.stringify(event)
      })
    }
  } catch (error) {
    console.error('External analytics service error:', error)
  }
}

async function sendToGA4(event: AnalyticsEvent) {
  // Google Analytics 4 Measurement Protocol
  const measurementId = process.env.GOOGLE_ANALYTICS_ID
  const apiSecret = process.env.GA4_API_SECRET

  if (!measurementId || !apiSecret) return

  const payload = {
    client_id: event.sessionId,
    user_id: event.userId,
    events: [{
      name: event.event.replace(/[^a-zA-Z0-9_]/g, '_'), // GA4 event name requirements
      parameters: {
        ...event.properties,
        session_id: event.sessionId,
        user_agent: event.userAgent
      }
    }]
  }

  await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}

function anonymizeIP(ip: string): string {
  // HIPAA compliance - anonymize last octet of IPv4 or last 80 bits of IPv6
  if (ip.includes('.')) {
    // IPv4
    const parts = ip.split('.')
    parts[3] = '0'
    return parts.join('.')
  } else if (ip.includes(':')) {
    // IPv6 - keep only first 48 bits
    const parts = ip.split(':')
    return parts.slice(0, 3).join(':') + '::0'
  }
  return 'anonymized'
}

function isPatientRelatedEvent(event: string): boolean {
  const patientEvents = [
    'patient_view',
    'report_generated',
    'genomic_analysis',
    'clinical_trial_match',
    'treatment_recommendation',
    'ai_analysis_completed',
    'pdf_generated',
    'consultation_summary'
  ]
  return patientEvents.includes(event)
}

async function getAnalyticsData(params: {
  eventType?: string | null
  timeRange: string
  userId?: string | null
}): Promise<any> {
  // Mock analytics data retrieval
  const now = new Date()
  const timeRangeHours = params.timeRange === '24h' ? 24 :
                        params.timeRange === '7d' ? 168 :
                        params.timeRange === '30d' ? 720 : 24

  return {
    summary: {
      total_events: Math.floor(Math.random() * 1000),
      unique_users: Math.floor(Math.random() * 100),
      patient_sessions: Math.floor(Math.random() * 50),
      ai_analyses: Math.floor(Math.random() * 200)
    },
    events: [
      {
        event: 'page_view',
        count: Math.floor(Math.random() * 300),
        percentage: 35.2
      },
      {
        event: 'ai_analysis_completed',
        count: Math.floor(Math.random() * 150),
        percentage: 18.7
      },
      {
        event: 'report_generated',
        count: Math.floor(Math.random() * 100),
        percentage: 12.1
      },
      {
        event: 'clinical_trial_match',
        count: Math.floor(Math.random() * 80),
        percentage: 9.8
      }
    ],
    timeline: Array.from({ length: 24 }, (_, i) => ({
      hour: now.getHours() - (23 - i),
      events: Math.floor(Math.random() * 50)
    })),
    user_agents: {
      'Chrome': 65.3,
      'Firefox': 18.7,
      'Safari': 12.1,
      'Edge': 3.9
    },
    compliance: {
      hipaa_audit_events: Math.floor(Math.random() * 50),
      anonymized_ips: '100%',
      retention_policy: '90 days',
      last_audit: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
}