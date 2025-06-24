// IRIS SDK API Endpoint - Main processing interface
// Integrates with ISIS MCP for secure AI operations

import { NextRequest, NextResponse } from 'next/server'
import { iris, IRISRequest } from '@/lib/iris-sdk/iris-sdk'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    // 1. Authentication & Authorization
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // 2. Get user profile and permissions
    const supabase = createServerSupabaseClient()
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('auth_user_id', session.user.id)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    // 3. Parse and validate request
    const body = await request.json()
    const {
      task,
      input,
      attachments,
      preferences,
      security
    } = body as Partial<IRISRequest>

    if (!task || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: task, input', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // 4. Check task permissions
    const taskPermissions = {
      'summarize_report': ['read_phi', 'ai_analysis'],
      'analyze_mutations': ['genomic_analysis', 'ai_analysis'],
      'recommend_treatment': ['read_phi', 'ai_analysis', 'write_clinical'],
      'match_trials': ['read_phi', 'ai_analysis'],
      'clinical_decision': ['read_phi', 'ai_analysis'],
      'patient_education': ['ai_analysis'],
      'risk_assessment': ['read_phi', 'ai_analysis'],
      'drug_interaction': ['read_phi', 'ai_analysis']
    }

    const requiredPermissions = taskPermissions[task] || []
    for (const permission of requiredPermissions) {
      const { data: hasPermission } = await supabase.rpc('check_user_permission', {
        auth_user_uuid: session.user.id,
        permission_name: permission
      })

      if (!hasPermission) {
        await logSecurityEvent(supabase, {
          event_type: 'permission_denied',
          severity: 'warning',
          user_id: userProfile.id,
          description: `User attempted to access ${task} without ${permission} permission`,
          event_data: { task, permission, user_role: userProfile.role.name }
        })

        return NextResponse.json(
          {
            error: `Insufficient permissions for task: ${task}`,
            code: 'PERMISSION_DENIED',
            required_permissions: requiredPermissions
          },
          { status: 403 }
        )
      }
    }

    // 5. Build IRIS request with security context
    const irisRequest: IRISRequest = {
      userId: userProfile.id,
      userRole: userProfile.role.name as any,
      department: userProfile.department || 'Unknown',
      sessionId: requestId,
      task,
      input,
      attachments,
      preferences: {
        ...preferences,
        // Apply department-specific defaults
        model: preferences?.model || getDefaultModelForRole(userProfile.role.name),
        outputFormat: preferences?.outputFormat || 'summary'
      },
      security: {
        redactPHI: security?.redactPHI ?? true,
        safetyLevel: security?.safetyLevel || getSafetyLevelForRole(userProfile.role.name),
        auditLevel: security?.auditLevel || 'detailed'
      },
      requestContext: {
        ip: request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown',
        userAgent: request.headers.get('user-agent') ?? 'unknown',
        referrer: request.headers.get('referer') ?? undefined
      }
    }

    // 6. Log request initiation
    await logDataAccess(supabase, {
      user_id: userProfile.id,
      resource_type: 'ai_model',
      resource_id: task,
      action: 'execute',
      phi_accessed: attachments?.fhirResources || attachments?.genomicData ? true : false,
      endpoint: '/api/iris/process',
      ip_address: irisRequest.requestContext.ip,
      user_agent: irisRequest.requestContext.userAgent
    })

    // 7. Process through IRIS SDK
    const result = await iris.process(irisRequest)

    // 8. Enhanced response with metadata
    const response = {
      success: result.success,
      data: result.response,
      metadata: {
        ...result.metadata,
        processing_time_ms: result.processing_time_ms,
        model_used: result.model_used,
        confidence: result.confidence,
        request_id: requestId,
        isis_mcp_version: '1.0'
      },
      audit: result.audit,
      error: result.error
    }

    // 9. Log successful completion
    if (result.success) {
      await logDataAccess(supabase, {
        user_id: userProfile.id,
        resource_type: 'ai_model',
        resource_id: task,
        action: 'complete',
        phi_accessed: result.audit?.phi_detected || false,
        endpoint: '/api/iris/process',
        response_size: JSON.stringify(response).length,
        ip_address: irisRequest.requestContext.ip,
        user_agent: irisRequest.requestContext.userAgent,
        success: true
      })
    } else {
      // Log error
      await logSecurityEvent(supabase, {
        event_type: 'ai_processing_error',
        severity: 'error',
        user_id: userProfile.id,
        description: `AI processing failed for task: ${task}`,
        event_data: {
          task,
          error: result.error?.message,
          processing_time: result.processing_time_ms
        }
      })
    }

    return NextResponse.json(response)

  } catch (error) {
    // 10. Error handling and logging
    console.error('IRIS API error:', error)

    const errorResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        request_id: requestId
      },
      metadata: {
        processing_time_ms: Date.now() - startTime,
        request_id: requestId
      }
    }

    // Log error to security events
    const supabase = createServerSupabaseClient()
    await logSecurityEvent(supabase, {
      event_type: 'api_error',
      severity: 'error',
      description: `IRIS API internal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      event_data: {
        endpoint: '/api/iris/process',
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time: Date.now() - startTime
      }
    })

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Workflow execution endpoint
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { workflow, ...irisRequest } = body

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow name required' },
        { status: 400 }
      )
    }

    // Get user profile
    const supabase = createServerSupabaseClient()
    const { data: userProfile } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Build enhanced request
    const enhancedRequest: IRISRequest = {
      ...irisRequest,
      userId: userProfile.id,
      userRole: userProfile.role.name as any,
      department: userProfile.department || 'Unknown',
      requestContext: {
        ip: request.ip ?? 'unknown',
        userAgent: request.headers.get('user-agent') ?? 'unknown'
      }
    }

    // Execute workflow
    const result = await iris.executeWorkflow(workflow, enhancedRequest)

    // Log workflow execution
    await logDataAccess(supabase, {
      user_id: userProfile.id,
      resource_type: 'workflow',
      resource_id: workflow,
      action: 'execute',
      endpoint: '/api/iris/process',
      success: result.success
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Workflow execution error:', error)
    return NextResponse.json(
      { error: 'Workflow execution failed' },
      { status: 500 }
    )
  }
}

// Get usage analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      userId: searchParams.get('userId') || undefined,
      department: searchParams.get('department') || undefined,
      timeRange: searchParams.get('timeRange') || undefined
    }

    // Get user permissions
    const supabase = createServerSupabaseClient()
    const { data: userProfile } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user can view analytics
    const { data: canViewAnalytics } = await supabase.rpc('check_user_permission', {
      auth_user_uuid: session.user.id,
      permission_name: 'admin_users'
    })

    if (!canViewAnalytics) {
      // Users can only see their own analytics
      filters.userId = userProfile.id
    }

    const analytics = await iris.getUsageAnalytics(filters)

    return NextResponse.json({
      success: true,
      data: analytics,
      user_context: {
        can_view_all: canViewAnalytics,
        role: userProfile.role.name,
        department: userProfile.department
      }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}

// Helper functions
function getDefaultModelForRole(roleName: string): 'smart' | 'fast' | 'local' | 'precise' {
  const roleDefaults = {
    'admin': 'smart',
    'clinician': 'smart',
    'oncologist': 'precise',
    'nurse': 'fast',
    'technician': 'local',
    'researcher': 'precise',
    'patient': 'fast'
  }
  return roleDefaults[roleName] || 'fast'
}

function getSafetyLevelForRole(roleName: string): 'standard' | 'high' | 'maximum' {
  const roleSafety = {
    'admin': 'high',
    'clinician': 'high',
    'oncologist': 'high',
    'nurse': 'high',
    'technician': 'maximum',
    'researcher': 'standard',
    'patient': 'maximum'
  }
  return roleSafety[roleName] || 'high'
}

async function logSecurityEvent(supabase: any, event: {
  event_type: string
  severity: string
  user_id?: string
  description: string
  event_data: any
}) {
  try {
    await supabase.from('security_events').insert({
      event_type: event.event_type,
      severity: event.severity,
      user_id: event.user_id,
      description: event.description,
      event_data: event.event_data,
      source_ip: 'api_server',
      endpoint: '/api/iris/process'
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

async function logDataAccess(supabase: any, access: {
  user_id: string
  resource_type: string
  resource_id: string
  action: string
  phi_accessed?: boolean
  endpoint?: string
  response_size?: number
  ip_address?: string
  user_agent?: string
  success?: boolean
}) {
  try {
    await supabase.from('data_access_log').insert({
      user_id: access.user_id,
      resource_type: access.resource_type,
      resource_id: access.resource_id,
      action: access.action,
      phi_accessed: access.phi_accessed || false,
      endpoint: access.endpoint,
      response_size: access.response_size,
      ip_address: access.ip_address,
      user_agent: access.user_agent,
      success: access.success ?? true
    })
  } catch (error) {
    console.error('Failed to log data access:', error)
  }
}