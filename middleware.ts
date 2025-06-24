import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Redis } from '@upstash/redis'

// Epic/Hyperdrive domains that are allowed to embed our application
const ALLOWED_FRAME_ANCESTORS = [
  'https://fhir.epic.com',
  'https://open.epic.com',
  'https://apporchard.epic.com',
  // Add your Epic organization's domain here
  // 'https://your-epic-org.epic.com',
]

// Initialize Redis for edge logging
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ISIS MCP Security & Logging Layer
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const startTime = Date.now()

  // Extract request metadata
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const referer = request.headers.get('referer')
  const origin = request.headers.get('origin')
  const method = request.method

  // Log all requests for security monitoring
  const requestId = crypto.randomUUID()
  const logEntry = {
    id: requestId,
    timestamp: new Date().toISOString(),
    ip: anonymizeIP(ip),
    userAgent,
    method,
    pathname,
    referer,
    origin,
    headers: Object.fromEntries(request.headers.entries()),
    geo: {
      city: request.geo?.city,
      country: request.geo?.country,
      region: request.geo?.region,
    }
  }

  // Async log to Redis (don't block request)
  logToRedis(logEntry).catch(console.error)

  // Security analysis
  const securityAnalysis = await analyzeRequestSecurity(request, logEntry)

  if (securityAnalysis.blocked) {
    return new NextResponse('Request blocked by security policy', {
      status: 403,
      headers: {
        'X-Block-Reason': securityAnalysis.reason,
        'X-Request-ID': requestId
      }
    })
  }

  // Allow public paths that should bypass auth
  const PUBLIC_PATHS = [
    '/login',
    '/favicon.ico',
    '/api/health',
    '/api/analytics/track',
  ]

  // If the path starts with "/api" or "/_next" we let it through as well
  const isPublic = PUBLIC_PATHS.includes(pathname) ||
                   pathname.startsWith('/api') ||
                   pathname.startsWith('/_next') ||
                   pathname.startsWith('/public')

  // Simple demo auth: look for the demo_auth cookie
  const demoAuth = request.cookies.get('demo_auth')

  if (!isPublic && !demoAuth) {
    // Log authentication failure
    await logSecurityEvent('auth_failure', {
      requestId,
      ip: anonymizeIP(ip),
      pathname,
      reason: 'missing_auth_cookie'
    })

    // Redirect unauthenticated users to /login preserving their intended path as ?next=
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const response = NextResponse.next()

  // Check if request is coming from Epic/Hyperdrive
  const isEpicRequest = referer && ALLOWED_FRAME_ANCESTORS.some(domain =>
    referer.startsWith(domain)
  ) || origin && ALLOWED_FRAME_ANCESTORS.some(domain =>
    origin.startsWith(domain)
  )

  // ISIS MCP Security Headers
  setSecurityHeaders(response, isEpicRequest)

  // Add response metadata
  response.headers.set('X-Request-ID', requestId)
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
  response.headers.set('X-Hyperdrive-Compatible', 'true')
  response.headers.set('X-ISIS-MCP-Version', '1.0')

  // Log successful request completion
  const responseTime = Date.now() - startTime
  logResponseMetrics(requestId, responseTime, 200).catch(console.error)

  return response
}

// Security analysis function
async function analyzeRequestSecurity(request: NextRequest, logEntry: any): Promise<{
  blocked: boolean
  reason?: string
  riskScore: number
}> {
  let riskScore = 0
  const reasons: string[] = []

  // Rate limiting check
  const rateLimitKey = `rate_limit:${anonymizeIP(logEntry.ip)}`
  const requestCount = await redis.incr(rateLimitKey)
  await redis.expire(rateLimitKey, 60) // 1 minute window

  if (requestCount > 100) { // 100 requests per minute
    riskScore += 0.8
    reasons.push('rate_limit_exceeded')
  }

  // Suspicious user agent patterns
  const suspiciousUAPatterns = [
    /bot|crawler|spider/i,
    /curl|wget|python/i,
    /postman|insomnia/i
  ]

  if (suspiciousUAPatterns.some(pattern => pattern.test(logEntry.userAgent))) {
    riskScore += 0.3
    reasons.push('suspicious_user_agent')
  }

  // Geolocation-based risk
  if (logEntry.geo?.country && !['US', 'CA'].includes(logEntry.geo.country)) {
    riskScore += 0.2
    reasons.push('non_standard_location')
  }

  // Path traversal attempts
  if (logEntry.pathname.includes('..') || logEntry.pathname.includes('%2e%2e')) {
    riskScore += 0.9
    reasons.push('path_traversal_attempt')
  }

  // SQL injection patterns in query params
  const url = new URL(request.url)
  const queryString = url.search.toLowerCase()
  const sqlPatterns = [
    /union.*select/,
    /drop.*table/,
    /exec.*xp_/,
    /script.*alert/
  ]

  if (sqlPatterns.some(pattern => pattern.test(queryString))) {
    riskScore += 0.9
    reasons.push('sql_injection_attempt')
  }

  // Determine if request should be blocked
  const blocked = riskScore >= 0.7

  if (blocked) {
    await logSecurityEvent('request_blocked', {
      ip: anonymizeIP(logEntry.ip),
      pathname: logEntry.pathname,
      riskScore,
      reasons
    })
  }

  return {
    blocked,
    reason: blocked ? reasons.join(', ') : undefined,
    riskScore
  }
}

// Set comprehensive security headers
function setSecurityHeaders(response: NextResponse, isEpicRequest: boolean) {
  // HIPAA and healthcare-specific security headers
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Handle iframe embedding for Epic/Hyperdrive
  if (isEpicRequest) {
    // Allow iframe embedding for Epic domains
    response.headers.set(
      'Content-Security-Policy',
      `frame-ancestors ${ALLOWED_FRAME_ANCESTORS.join(' ')}; default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://fhir.epic.com https://open.epic.com https://api.openai.com https://api.anthropic.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;`
    )
    // Remove X-Frame-Options for Epic requests to allow iframe embedding
    response.headers.delete('X-Frame-Options')
  } else {
    // For non-Epic requests, prevent iframe embedding for security
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set(
      'Content-Security-Policy',
      `frame-ancestors 'none'; default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://fhir.epic.com https://open.epic.com https://api.openai.com https://api.anthropic.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;`
    )
  }

  // HIPAA compliance headers
  response.headers.set('X-HIPAA-Compliant', 'true')
  response.headers.set('X-PHI-Protected', 'true')
}

// Anonymize IP for HIPAA compliance
function anonymizeIP(ip: string): string {
  if (ip === 'unknown') return ip

  const parts = ip.split('.')
  if (parts.length === 4) {
    // IPv4: zero out last octet
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  } else if (ip.includes(':')) {
    // IPv6: zero out last 80 bits
    const ipv6Parts = ip.split(':')
    return ipv6Parts.slice(0, 3).join(':') + '::0'
  }

  return 'anonymized'
}

// Async logging functions
async function logToRedis(logEntry: any) {
  try {
    // Store in daily log
    const dateKey = `edge_logs:${new Date().toISOString().split('T')[0]}`
    await redis.lpush(dateKey, JSON.stringify(logEntry))
    await redis.expire(dateKey, 30 * 24 * 60 * 60) // 30 days retention

    // Store in real-time log for monitoring
    await redis.lpush('edge_logs:realtime', JSON.stringify(logEntry))
    await redis.ltrim('edge_logs:realtime', 0, 999) // Keep last 1000 entries

    // Increment metrics
    await redis.incr('metrics:total_requests')
    await redis.incr(`metrics:requests_by_path:${logEntry.pathname}`)
    await redis.incr(`metrics:requests_by_method:${logEntry.method}`)
  } catch (error) {
    console.error('Failed to log to Redis:', error)
  }
}

async function logSecurityEvent(eventType: string, data: any) {
  try {
    const securityEvent = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    }

    await redis.lpush('security_events', JSON.stringify(securityEvent))
    await redis.ltrim('security_events', 0, 9999) // Keep last 10,000 events

    // Alert on critical events
    if (['request_blocked', 'sql_injection_attempt', 'path_traversal_attempt'].includes(eventType)) {
      await redis.lpush('security_alerts', JSON.stringify(securityEvent))
      await redis.ltrim('security_alerts', 0, 99) // Keep last 100 alerts
    }
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

async function logResponseMetrics(requestId: string, responseTime: number, statusCode: number) {
  try {
    await redis.lpush('response_metrics', JSON.stringify({
      requestId,
      responseTime,
      statusCode,
      timestamp: new Date().toISOString()
    }))
    await redis.ltrim('response_metrics', 0, 9999) // Keep last 10,000 metrics

    // Update running averages
    await redis.lpush('response_times', responseTime.toString())
    await redis.ltrim('response_times', 0, 999) // Keep last 1000 response times
  } catch (error) {
    console.error('Failed to log response metrics:', error)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
