import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logging/supabase-logger'
import { z } from 'zod'

// Service imports - consolidating all services
import { GenomicsService } from '../services/genomics'
import { ClinicalService } from '../services/clinical'
import { ResearchService } from '../services/research'
import { AnalyticsService } from '../services/analytics'
import { AgentService } from '../services/agents'
import { IntegrationService } from '../services/integrations'

// Rate limiting and caching
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
})

// Request validation schema
const RequestSchema = z.object({
  service: z.enum(['genomics', 'clinical', 'research', 'analytics', 'agents', 'integrations']),
  action: z.string(),
  data: z.any().optional(),
  options: z.object({
    cache: z.boolean().optional(),
    priority: z.enum(['low', 'normal', 'high']).optional(),
  }).optional(),
})

// Service registry
const services = {
  genomics: GenomicsService,
  clinical: ClinicalService,
  research: ResearchService,
  analytics: AnalyticsService,
  agents: AgentService,
  integrations: IntegrationService,
}

// Middleware for request processing
async function processRequest(req: NextRequest) {
  // Session validation
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const identifier = session.user.email || 'anonymous'
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', limit, reset, remaining },
      { status: 429 }
    )
  }

  return { session, rateLimitInfo: { limit, reset, remaining } }
}

// Cache management
async function getCachedResponse(key: string) {
  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached as string)
    }
  } catch (error) {
    logger.error('Cache retrieval error', { error, key })
  }
  return null
}

async function setCachedResponse(key: string, data: any, ttl = 300) {
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    logger.error('Cache storage error', { error, key })
  }
}

// Main API handler
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    // Process request middleware
    const middlewareResult = await processRequest(req)
    if (middlewareResult instanceof NextResponse) {
      return middlewareResult
    }

    const { session, rateLimitInfo } = middlewareResult

    // Parse and validate request body
    const body = await req.json()
    const validation = RequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { service, action, data, options } = validation.data

    // Check cache if enabled
    if (options?.cache) {
      const cacheKey = `gateway:${service}:${action}:${JSON.stringify(data)}`
      const cached = await getCachedResponse(cacheKey)
      if (cached) {
        return NextResponse.json({
          ...cached,
          meta: {
            cached: true,
            executionTime: Date.now() - startTime,
            rateLimitInfo,
          }
        })
      }
    }

    // Get service instance
    const ServiceClass = services[service]
    if (!ServiceClass) {
      return NextResponse.json(
        { error: `Service '${service}' not found` },
        { status: 404 }
      )
    }

    // Initialize service with context
    const serviceInstance = new ServiceClass({
      session,
      supabase: createClient(),
      logger,
    })

    // Check if action exists
    if (typeof serviceInstance[action] !== 'function') {
      return NextResponse.json(
        { error: `Action '${action}' not found in service '${service}'` },
        { status: 404 }
      )
    }

    // Execute service action
    const result = await serviceInstance[action](data)

    // Prepare response
    const response = {
      success: true,
      data: result,
      meta: {
        service,
        action,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        rateLimitInfo,
      }
    }

    // Cache response if enabled
    if (options?.cache && result) {
      const cacheKey = `gateway:${service}:${action}:${JSON.stringify(data)}`
      await setCachedResponse(cacheKey, response)
    }

    // Log successful request
    await logger.info('API Gateway Request', {
      service,
      action,
      userId: session.user.id,
      executionTime: response.meta.executionTime,
    })

    return NextResponse.json(response)

  } catch (error) {
    // Error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    await logger.error('API Gateway Error', {
      error: errorMessage,
      details: errorDetails,
      body: await req.text().catch(() => 'Unable to read body'),
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        meta: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET(req: NextRequest) {
  try {
    // Check all service health
    const healthChecks = await Promise.allSettled([
      redis.ping(),
      createClient().from('_health').select('*').limit(1),
    ])

    const redisHealthy = healthChecks[0].status === 'fulfilled'
    const dbHealthy = healthChecks[1].status === 'fulfilled'

    const healthy = redisHealthy && dbHealthy

    return NextResponse.json({
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        gateway: 'healthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy ? 'healthy' : 'unhealthy',
      },
      availableServices: Object.keys(services),
    }, { status: healthy ? 200 : 503 })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 })
  }
}

// Export service types for client SDK
export type GatewayRequest = z.infer<typeof RequestSchema>
export type GatewayServices = keyof typeof services