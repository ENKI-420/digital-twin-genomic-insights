import { NextResponse } from "next/server"
import { productionConfig } from "@/lib/config/production"

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  version: string
  environment: string
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    epic: ServiceStatus
    cpic: ServiceStatus
    genomics: ServiceStatus
    ai: ServiceStatus
  }
  performance: {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    responseTime: number
  }
  features: Record<string, boolean>
}

interface ServiceStatus {
  status: "healthy" | "degraded" | "unhealthy"
  responseTime?: number
  lastChecked: string
  error?: string
}

async function checkDatabase(): Promise<ServiceStatus> {
  try {
    const start = Date.now()
    // Simulate database check - replace with actual database connection test
    await new Promise(resolve => setTimeout(resolve, 10))
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      responseTime,
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  try {
    const start = Date.now()
    // Simulate Redis check - replace with actual Redis ping
    await new Promise(resolve => setTimeout(resolve, 5))
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      responseTime,
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkEpic(): Promise<ServiceStatus> {
  try {
    const start = Date.now()
    // Simulate Epic FHIR check - replace with actual Epic metadata endpoint check
    const response = await fetch(productionConfig.epic.baseUrl + "/metadata", {
      method: "GET",
      headers: {
        "Accept": "application/fhir+json",
      },
      signal: AbortSignal.timeout(5000),
    })

    const responseTime = Date.now() - start

    if (response.ok) {
      return {
        status: "healthy",
        responseTime,
        lastChecked: new Date().toISOString(),
      }
    } else {
      return {
        status: "degraded",
        responseTime,
        lastChecked: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      }
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}

async function checkCPIC(): Promise<ServiceStatus> {
  try {
    const start = Date.now()
    // Simulate CPIC API check
    await new Promise(resolve => setTimeout(resolve, 15))
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      responseTime,
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkGenomics(): Promise<ServiceStatus> {
  try {
    const start = Date.now()
    // Simulate genomics service check
    await new Promise(resolve => setTimeout(resolve, 20))
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      responseTime,
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkAI(): Promise<ServiceStatus> {
  try {
    const start = Date.now()
    // Simulate AI service check
    await new Promise(resolve => setTimeout(resolve, 25))
    const responseTime = Date.now() - start

    return {
      status: "healthy",
      responseTime,
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return {
      used: usage.heapUsed,
      total: usage.heapTotal,
      percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
    }
  }
  return {
    used: 0,
    total: 0,
    percentage: 0,
  }
}

function getUptime(): number {
  if (typeof process !== 'undefined' && process.uptime) {
    return Math.floor(process.uptime())
  }
  return 0
}

export async function GET() {
  const startTime = Date.now()

  try {
    // Run all health checks in parallel
    const [database, redis, epic, cpic, genomics, ai] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkEpic(),
      checkCPIC(),
      checkGenomics(),
      checkAI(),
    ])

    const services = { database, redis, epic, cpic, genomics, ai }

    // Determine overall status
    const unhealthyServices = Object.values(services).filter(s => s.status === "unhealthy")
    const degradedServices = Object.values(services).filter(s => s.status === "degraded")

    let overallStatus: "healthy" | "degraded" | "unhealthy"
    if (unhealthyServices.length > 0) {
      overallStatus = "unhealthy"
    } else if (degradedServices.length > 0) {
      overallStatus = "degraded"
    } else {
      overallStatus = "healthy"
    }

    const responseTime = Date.now() - startTime
    const memory = getMemoryUsage()

    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: productionConfig.app.version,
      environment: productionConfig.app.environment,
      services,
      performance: {
        uptime: getUptime(),
        memory,
        responseTime,
      },
      features: productionConfig.features,
    }

    // Set appropriate HTTP status code
    const httpStatus = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 207 : 503

    return NextResponse.json(healthCheck, {
      status: httpStatus,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    const errorResponse: HealthCheckResult = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      version: productionConfig.app.version,
      environment: productionConfig.app.environment,
      services: {
        database: { status: "unhealthy", lastChecked: new Date().toISOString(), error: "Health check failed" },
        redis: { status: "unhealthy", lastChecked: new Date().toISOString(), error: "Health check failed" },
        epic: { status: "unhealthy", lastChecked: new Date().toISOString(), error: "Health check failed" },
        cpic: { status: "unhealthy", lastChecked: new Date().toISOString(), error: "Health check failed" },
        genomics: { status: "unhealthy", lastChecked: new Date().toISOString(), error: "Health check failed" },
        ai: { status: "unhealthy", lastChecked: new Date().toISOString(), error: "Health check failed" },
      },
      performance: {
        uptime: getUptime(),
        memory: getMemoryUsage(),
        responseTime: Date.now() - startTime,
      },
      features: productionConfig.features,
    }

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  }
}

// Health check with detailed service information
export async function POST() {
  return GET() // For now, POST returns the same as GET
}