// IRIS SDK Monitoring API - Real-time security and performance data
// Feeds the AI Safety Dashboard with live metrics

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { mcpCore } from '@/lib/iris-sdk/mcp-core'
import { Redis } from '@upstash/redis'
import { env } from '@/lib/config/environment'

// Initialize Redis for real-time data
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Authorization check - only admins and clinicians can view monitoring
    const supabase = createServerSupabaseClient()
    const { data: userProfile } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile || !['admin', 'clinician', 'oncologist'].includes(userProfile.role.name)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view monitoring data' },
        { status: 403 }
      )
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '1h'

    // 4. Gather monitoring data
    const [
      securityMetrics,
      securityEvents,
      modelMetrics,
      userActivity,
      timeSeriesData,
      alerts
    ] = await Promise.all([
      getSecurityMetrics(timeRange),
      getSecurityEvents(timeRange),
      getModelMetrics(timeRange),
      getUserActivity(timeRange),
      getTimeSeriesData(timeRange),
      getCriticalAlerts()
    ])

    // 5. Calculate threat level
    const threatLevel = calculateThreatLevel(securityMetrics, securityEvents)

    const dashboardData = {
      security: {
        ...securityMetrics,
        threatLevel
      },
      events: securityEvents,
      models: modelMetrics,
      userActivity,
      timeSeriesData,
      alerts
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
      timeRange
    })

  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

// Security metrics aggregation
async function getSecurityMetrics(timeRange: string) {
  const supabase = createServerSupabaseClient()
  const timeConstraint = getTimeConstraint(timeRange)

  // Get basic security metrics from database
  const { data: auditSummary } = await supabase
    .from('mcp_audit_log')
    .select('*')
    .gte('created_at', timeConstraint)

  const { data: securityEvents } = await supabase
    .from('security_events')
    .select('*')
    .gte('created_at', timeConstraint)

  // Calculate metrics
  const totalRequests = auditSummary?.length || 0
  const securityViolations = securityEvents?.filter(e => e.severity === 'error' || e.severity === 'critical').length || 0
  const blockedRequests = securityEvents?.filter(e => e.blocked === true).length || 0
  const phiDetected = auditSummary?.filter(a => a.phi_detected === true).length || 0
  const promptInjections = securityEvents?.filter(e => e.event_type === 'prompt_injection').length || 0

  const averageResponseTime = auditSummary?.length > 0
    ? auditSummary.reduce((sum, a) => sum + (a.response_time_ms || 0), 0) / auditSummary.length
    : 0

  // Get system health from Redis metrics
  const systemHealth = await getSystemHealth()

  return {
    totalRequests,
    blockedRequests,
    securityViolations,
    phiDetected,
    promptInjections,
    averageResponseTime: Math.round(averageResponseTime),
    systemHealth
  }
}

// Get recent security events
async function getSecurityEvents(timeRange: string) {
  const supabase = createServerSupabaseClient()
  const timeConstraint = getTimeConstraint(timeRange)

  const { data: events } = await supabase
    .from('security_events')
    .select('*')
    .gte('created_at', timeConstraint)
    .order('created_at', { ascending: false })
    .limit(50)

  return events?.map(event => ({
    id: event.id,
    timestamp: event.created_at,
    type: event.event_type,
    severity: event.severity,
    description: event.description,
    user_id: event.user_id,
    ip_address: event.source_ip || 'unknown',
    resolved: event.investigated
  })) || []
}

// Get model performance metrics
async function getModelMetrics(timeRange: string) {
  const supabase = createServerSupabaseClient()
  const timeConstraint = getTimeConstraint(timeRange)

  const { data: auditData } = await supabase
    .from('mcp_audit_log')
    .select('*')
    .gte('created_at', timeConstraint)

  if (!auditData || auditData.length === 0) {
    return []
  }

  // Group by model and calculate metrics
  const modelGroups = auditData.reduce((acc, record) => {
    const model = record.model_name
    if (!acc[model]) {
      acc[model] = {
        total_calls: 0,
        successful_calls: 0,
        total_response_time: 0,
        fallback_count: 0,
        total_cost: 0
      }
    }

    acc[model].total_calls++
    if (record.model_name !== 'error') {
      acc[model].successful_calls++
    }
    acc[model].total_response_time += record.response_time_ms || 0
    if (record.fallback_triggered) {
      acc[model].fallback_count++
    }
    acc[model].total_cost += record.cost_estimate || 0

    return acc
  }, {} as Record<string, any>)

  return Object.entries(modelGroups).map(([model_name, metrics]) => ({
    model_name,
    total_calls: metrics.total_calls,
    success_rate: Math.round((metrics.successful_calls / metrics.total_calls) * 100),
    avg_response_time: Math.round(metrics.total_response_time / metrics.total_calls),
    fallback_rate: Math.round((metrics.fallback_count / metrics.total_calls) * 100),
    cost_estimate: Number(metrics.total_cost.toFixed(4))
  }))
}

// Get user activity by department
async function getUserActivity(timeRange: string) {
  const supabase = createServerSupabaseClient()
  const timeConstraint = getTimeConstraint(timeRange)

  const { data: activity } = await supabase
    .from('data_access_log')
    .select(`
      *,
      user:users(department, role:roles(name))
    `)
    .gte('created_at', timeConstraint)

  if (!activity || activity.length === 0) {
    return []
  }

  // Group by department
  const departmentGroups = activity.reduce((acc, record) => {
    const department = record.user?.department || 'Unknown'
    if (!acc[department]) {
      acc[department] = {
        requests: 0,
        violations: 0,
        phi_access: 0
      }
    }

    acc[department].requests++
    if (!record.success) {
      acc[department].violations++
    }
    if (record.phi_accessed) {
      acc[department].phi_access++
    }

    return acc
  }, {} as Record<string, any>)

  return Object.entries(departmentGroups).map(([department, metrics]) => ({
    department,
    requests: metrics.requests,
    violations: metrics.violations,
    phi_access: metrics.phi_access
  }))
}

// Get time series data for charts
async function getTimeSeriesData(timeRange: string) {
  const supabase = createServerSupabaseClient()
  const timeConstraint = getTimeConstraint(timeRange)

  // Get hourly aggregated data
  const { data: auditData } = await supabase
    .from('mcp_audit_log')
    .select('created_at, model_name')
    .gte('created_at', timeConstraint)

  const { data: securityData } = await supabase
    .from('security_events')
    .select('created_at, severity')
    .gte('created_at', timeConstraint)

  // Group by hour
  const hourlyData = {}

  // Process audit data
  auditData?.forEach(record => {
    const hour = new Date(record.created_at).toISOString().substring(0, 13) + ':00:00Z'
    if (!hourlyData[hour]) {
      hourlyData[hour] = { time: hour, requests: 0, violations: 0 }
    }
    hourlyData[hour].requests++
  })

  // Process security data
  securityData?.forEach(record => {
    const hour = new Date(record.created_at).toISOString().substring(0, 13) + ':00:00Z'
    if (!hourlyData[hour]) {
      hourlyData[hour] = { time: hour, requests: 0, violations: 0 }
    }
    if (record.severity === 'error' || record.severity === 'critical') {
      hourlyData[hour].violations++
    }
  })

  return Object.values(hourlyData).sort((a: any, b: any) => a.time.localeCompare(b.time))
}

// Get critical alerts
async function getCriticalAlerts() {
  const supabase = createServerSupabaseClient()

  const { data: criticalEvents } = await supabase
    .from('security_events')
    .select('*')
    .eq('severity', 'critical')
    .eq('investigated', false)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

  return criticalEvents || []
}

// Calculate system health from various metrics
async function getSystemHealth(): Promise<number> {
  try {
    const [
      totalRequests,
      errorCount,
      avgResponseTime
    ] = await Promise.all([
      redis.get('metrics:total_requests'),
      redis.llen('security_alerts'),
      getAverageResponseTime()
    ])

    let health = 100

    // Deduct points for errors
    const errorRate = (Number(errorCount) || 0) / (Number(totalRequests) || 1)
    health -= errorRate * 50

    // Deduct points for slow response times
    if (avgResponseTime > 2000) {
      health -= 20
    } else if (avgResponseTime > 1000) {
      health -= 10
    }

    return Math.max(Math.round(health), 0)
  } catch (error) {
    console.error('Error calculating system health:', error)
    return 85 // Default fallback
  }
}

// Get average response time from Redis
async function getAverageResponseTime(): Promise<number> {
  try {
    const responseTimes = await redis.lrange('response_times', 0, -1)
    if (responseTimes.length === 0) return 0

    const times = responseTimes.map(Number)
    return times.reduce((sum, time) => sum + time, 0) / times.length
  } catch (error) {
    return 0
  }
}

// Calculate threat level based on current metrics
function calculateThreatLevel(securityMetrics: any, securityEvents: any[]): 'low' | 'medium' | 'high' | 'critical' {
  let score = 0

  // Factor in security violations
  if (securityMetrics.securityViolations > 10) score += 3
  else if (securityMetrics.securityViolations > 5) score += 2
  else if (securityMetrics.securityViolations > 0) score += 1

  // Factor in blocked requests
  if (securityMetrics.blockedRequests > 20) score += 3
  else if (securityMetrics.blockedRequests > 10) score += 2
  else if (securityMetrics.blockedRequests > 0) score += 1

  // Factor in PHI detection
  if (securityMetrics.phiDetected > 5) score += 2
  else if (securityMetrics.phiDetected > 0) score += 1

  // Factor in critical events
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length
  if (criticalEvents > 0) score += 4

  // Factor in prompt injections
  if (securityMetrics.promptInjections > 0) score += 3

  // Determine threat level
  if (score >= 8) return 'critical'
  if (score >= 5) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

// Helper function to get time constraint for queries
function getTimeConstraint(timeRange: string): string {
  const now = new Date()
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
  }
}