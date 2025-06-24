// IRIS SDK - Intelligent Rapid Intelligence System
// High-level interface for healthcare AI interactions

import { mcpCore, ContextPacket } from './mcp-core'
import { randomUUID } from 'crypto'

// Simplified request interface for common use cases
export interface IRISRequest {
  userId: string
  userRole: 'clinician' | 'oncologist' | 'nurse' | 'technician' | 'researcher' | 'admin'
  department: string
  sessionId?: string

  // Task definition
  task: 'summarize_report' | 'analyze_mutations' | 'recommend_treatment' | 'match_trials' |
        'clinical_decision' | 'patient_education' | 'risk_assessment' | 'drug_interaction'

  // Input data
  input: string
  attachments?: {
    fhirResources?: any[]
    genomicData?: any[]
    labResults?: any[]
    clinicalNotes?: string[]
  }

  // Preferences
  preferences?: {
    model?: 'smart' | 'fast' | 'local' | 'precise'
    outputFormat?: 'summary' | 'detailed' | 'bullet_points' | 'structured'
    maxLength?: 'short' | 'medium' | 'long'
    includeCitations?: boolean
    patientFriendly?: boolean
  }

  // Security & compliance
  security?: {
    redactPHI?: boolean
    safetyLevel?: 'standard' | 'high' | 'maximum'
    auditLevel?: 'basic' | 'detailed' | 'forensic'
  }

  // Context from request
  requestContext?: {
    ip: string
    userAgent: string
    referrer?: string
  }
}

// Simplified response interface
export interface IRISResponse {
  success: boolean
  response?: string
  confidence?: number
  model_used?: string
  processing_time_ms?: number

  // Metadata
  metadata?: {
    citations?: string[]
    actionable_items?: string[]
    followup_recommendations?: string[]
    safety_warnings?: string[]
  }

  // Audit & compliance
  audit?: {
    audit_id: string
    compliance_status: 'compliant' | 'warning' | 'violation'
    phi_detected: boolean
    fallback_used: boolean
  }

  // Error handling
  error?: {
    message: string
    code: string
    suggestions?: string[]
  }
}

// Pre-built clinical workflows
export interface ClinicalWorkflow {
  name: string
  description: string
  steps: ClinicalWorkflowStep[]
  requiredRole: string[]
  estimatedTime: number
}

export interface ClinicalWorkflowStep {
  id: string
  name: string
  prompt_template: string
  expected_input: string
  validation_rules: string[]
}

export class IRIS {
  private sessionContext: Map<string, any> = new Map()

  // Built-in clinical workflows
  private workflows: Record<string, ClinicalWorkflow> = {
    'tumor_board_prep': {
      name: 'Tumor Board Preparation',
      description: 'Comprehensive analysis for tumor board presentation',
      steps: [
        {
          id: 'patient_summary',
          name: 'Patient Summary',
          prompt_template: 'Create a concise patient summary for tumor board review',
          expected_input: 'patient_data',
          validation_rules: ['require_demographics', 'require_diagnosis']
        },
        {
          id: 'genomic_analysis',
          name: 'Genomic Analysis',
          prompt_template: 'Analyze genomic findings and therapeutic implications',
          expected_input: 'genomic_data',
          validation_rules: ['require_mutations', 'require_classification']
        },
        {
          id: 'treatment_options',
          name: 'Treatment Recommendations',
          prompt_template: 'Provide evidence-based treatment recommendations',
          expected_input: 'clinical_genomic_data',
          validation_rules: ['require_evidence_level', 'require_safety_profile']
        }
      ],
      requiredRole: ['clinician', 'oncologist'],
      estimatedTime: 180000 // 3 minutes
    }
  }

  constructor() {}

  // Main API method - simple interface for complex AI interactions
  async process(request: IRISRequest): Promise<IRISResponse> {
    try {
      const startTime = Date.now()

      // 1. Create context packet from simplified request
      const contextPacket = await this.buildContextPacket(request)

      // 2. Process through MCP
      const mcpResult = await mcpCore.processContextPacket(contextPacket)

      // 3. Post-process and enhance response
      const response = await this.buildResponse(mcpResult, request, startTime)

      // 4. Update session context
      await this.updateSessionContext(request, response)

      return response

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'IRIS_PROCESSING_ERROR',
          suggestions: [
            'Check your request parameters',
            'Verify user permissions',
            'Try again with reduced complexity'
          ]
        }
      }
    }
  }

  // Clinical workflow execution
  async executeWorkflow(workflowName: string, request: IRISRequest): Promise<{
    success: boolean
    results: IRISResponse[]
    workflow_id: string
    total_time_ms: number
    error?: string
  }> {
    const workflow = this.workflows[workflowName]
    if (!workflow) {
      return {
        success: false,
        results: [],
        workflow_id: '',
        total_time_ms: 0,
        error: `Workflow '${workflowName}' not found`
      }
    }

    // Check role permissions
    if (!workflow.requiredRole.includes(request.userRole)) {
      return {
        success: false,
        results: [],
        workflow_id: '',
        total_time_ms: 0,
        error: `Insufficient permissions. Required roles: ${workflow.requiredRole.join(', ')}`
      }
    }

    const workflowId = randomUUID()
    const startTime = Date.now()
    const results: IRISResponse[] = []

    try {
      for (const step of workflow.steps) {
        // Create step-specific request
        const stepRequest: IRISRequest = {
          ...request,
          task: 'clinical_decision', // Map to generic task
          input: `${step.prompt_template}\n\nContext: ${request.input}`
        }

        const stepResult = await this.process(stepRequest)
        results.push(stepResult)

        if (!stepResult.success) {
          break // Stop on first failure
        }
      }

      return {
        success: results.every(r => r.success),
        results,
        workflow_id: workflowId,
        total_time_ms: Date.now() - startTime
      }

    } catch (error) {
      return {
        success: false,
        results,
        workflow_id: workflowId,
        total_time_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Workflow execution failed'
      }
    }
  }

  // Convenience methods for common clinical tasks
  async summarizeGenomicReport(request: Omit<IRISRequest, 'task'>): Promise<IRISResponse> {
    return await this.process({
      ...request,
      task: 'summarize_report'
    })
  }

  async recommendTreatment(request: Omit<IRISRequest, 'task'>): Promise<IRISResponse> {
    return await this.process({
      ...request,
      task: 'recommend_treatment'
    })
  }

  async assessDrugInteractions(request: Omit<IRISRequest, 'task'>): Promise<IRISResponse> {
    return await this.process({
      ...request,
      task: 'drug_interaction'
    })
  }

  async matchClinicalTrials(request: Omit<IRISRequest, 'task'>): Promise<IRISResponse> {
    return await this.process({
      ...request,
      task: 'match_trials'
    })
  }

  async generatePatientEducation(request: Omit<IRISRequest, 'task'>): Promise<IRISResponse> {
    return await this.process({
      ...request,
      task: 'patient_education',
      preferences: {
        ...request.preferences,
        patientFriendly: true,
        outputFormat: 'summary'
      }
    })
  }

  // Batch processing for multiple requests
  async processBatch(requests: IRISRequest[]): Promise<IRISResponse[]> {
    const results: IRISResponse[] = []

    // Process in parallel with concurrency limit
    const concurrencyLimit = 3
    const chunks = this.chunkArray(requests, concurrencyLimit)

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(request => this.process(request))
      )
      results.push(...chunkResults)
    }

    return results
  }

  // Session management
  async getSessionContext(sessionId: string): Promise<any> {
    return this.sessionContext.get(sessionId) || {}
  }

  async updateSessionContext(request: IRISRequest, response: IRISResponse): Promise<void> {
    const sessionId = request.sessionId || 'default'
    const currentContext = this.sessionContext.get(sessionId) || {}

    const updatedContext = {
      ...currentContext,
      lastRequest: request,
      lastResponse: response,
      requestCount: (currentContext.requestCount || 0) + 1,
      totalProcessingTime: (currentContext.totalProcessingTime || 0) + (response.processing_time_ms || 0),
      lastActivity: new Date().toISOString()
    }

    this.sessionContext.set(sessionId, updatedContext)
  }

  // Monitoring and analytics
  async getUsageAnalytics(filters?: {
    userId?: string
    department?: string
    timeRange?: string
  }): Promise<{
    totalRequests: number
    successRate: number
    averageResponseTime: number
    topTasks: Array<{ task: string; count: number }>
    modelDistribution: Record<string, number>
    errorSummary: Array<{ error: string; count: number }>
  }> {
    // This would pull from MCP audit logs
    const auditLogs = await mcpCore.getAuditLog()

    const analytics = {
      totalRequests: auditLogs.length,
      successRate: 0,
      averageResponseTime: 0,
      topTasks: [] as Array<{ task: string; count: number }>,
      modelDistribution: {} as Record<string, number>,
      errorSummary: [] as Array<{ error: string; count: number }>
    }

    if (auditLogs.length === 0) return analytics

    // Calculate metrics
    const successfulRequests = auditLogs.filter(log => log.model_name !== 'error').length
    analytics.successRate = successfulRequests / auditLogs.length

    const totalResponseTime = auditLogs.reduce((sum, log) => sum + log.response_time_ms, 0)
    analytics.averageResponseTime = totalResponseTime / auditLogs.length

    // Task distribution
    const taskCounts = auditLogs.reduce((acc, log) => {
      acc[log.task] = (acc[log.task] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    analytics.topTasks = Object.entries(taskCounts)
      .map(([task, count]) => ({ task, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Model distribution
    auditLogs.forEach(log => {
      analytics.modelDistribution[log.model_name] = (analytics.modelDistribution[log.model_name] || 0) + 1
    })

    return analytics
  }

  // Private helper methods
  private async buildContextPacket(request: IRISRequest): Promise<ContextPacket> {
    const sessionId = request.sessionId || randomUUID()

    // Map simplified task to detailed intent
    const taskMapping = {
      'summarize_report': 'Generate comprehensive summary of genomic/clinical report',
      'analyze_mutations': 'Analyze genetic mutations and clinical significance',
      'recommend_treatment': 'Provide evidence-based treatment recommendations',
      'match_trials': 'Match patient to relevant clinical trials',
      'clinical_decision': 'Support clinical decision making',
      'patient_education': 'Create patient-friendly educational content',
      'risk_assessment': 'Assess clinical risk factors and outcomes',
      'drug_interaction': 'Analyze drug-drug and drug-gene interactions'
    }

    // Map simplified model preference to specific model
    const modelMapping = {
      'smart': 'OpenAI-GPT-4o',
      'fast': 'Claude-Sonnet',
      'local': 'Local-Model',
      'precise': 'Claude-Opus'
    }

    // Build enhanced prompt with context
    let enhancedPrompt = request.input

    if (request.attachments) {
      enhancedPrompt += '\n\nAdditional Context:'
      if (request.attachments.fhirResources) {
        enhancedPrompt += `\nFHIR Resources: ${JSON.stringify(request.attachments.fhirResources)}`
      }
      if (request.attachments.genomicData) {
        enhancedPrompt += `\nGenomic Data: ${JSON.stringify(request.attachments.genomicData)}`
      }
      if (request.attachments.labResults) {
        enhancedPrompt += `\nLab Results: ${JSON.stringify(request.attachments.labResults)}`
      }
      if (request.attachments.clinicalNotes) {
        enhancedPrompt += `\nClinical Notes: ${request.attachments.clinicalNotes.join('\n')}`
      }
    }

    if (request.preferences) {
      enhancedPrompt += '\n\nOutput Preferences:'
      if (request.preferences.outputFormat) {
        enhancedPrompt += `\nFormat: ${request.preferences.outputFormat}`
      }
      if (request.preferences.maxLength) {
        enhancedPrompt += `\nLength: ${request.preferences.maxLength}`
      }
      if (request.preferences.includeCitations) {
        enhancedPrompt += '\nInclude citations and evidence levels'
      }
      if (request.preferences.patientFriendly) {
        enhancedPrompt += '\nUse patient-friendly language (9th grade reading level)'
      }
    }

    const contextPacket: ContextPacket = {
      v: '1.0',
      user: {
        id: request.userId,
        role: request.userRole,
        department: request.department,
        session_id: sessionId
      },
      task: {
        intent: taskMapping[request.task] || request.task,
        model_family: modelMapping[request.preferences?.model || 'smart'] || 'OpenAI-GPT-4o',
        expected_output: this.mapOutputType(request.preferences?.outputFormat)
      },
      inputs: {
        prompt: enhancedPrompt,
        data_refs: request.attachments?.fhirResources?.map(r => r.id) || [],
        context_window: this.buildContextWindow(request)
      },
      constraints: {
        max_tokens: this.mapMaxTokens(request.preferences?.maxLength),
        redact_phi: request.security?.redactPHI ?? true,
        safety_mode: request.security?.safetyLevel || 'high'
      },
      routing: {
        agent: `IRIS_${request.task.toUpperCase()}`,
        use_fallback: true,
        priority: 'normal'
      },
      audit: {
        request_time: new Date().toISOString(),
        ip: request.requestContext?.ip || 'unknown',
        user_agent: request.requestContext?.userAgent || 'unknown',
        hash: this.generateRequestHash(request),
        compliance_flags: request.security?.auditLevel === 'forensic' ? ['detailed_audit'] : []
      }
    }

    return contextPacket
  }

  private async buildResponse(mcpResult: any, request: IRISRequest, startTime: number): Promise<IRISResponse> {
    const response: IRISResponse = {
      success: mcpResult.success,
      processing_time_ms: Date.now() - startTime
    }

    if (mcpResult.success) {
      response.response = mcpResult.output
      response.model_used = mcpResult.model_used
      response.confidence = this.calculateConfidence(mcpResult)

      // Extract metadata from response
      response.metadata = await this.extractMetadata(mcpResult.output, request)

      response.audit = {
        audit_id: mcpResult.audit_id,
        compliance_status: mcpResult.security_violations ? 'violation' : 'compliant',
        phi_detected: false, // This would come from MCP analysis
        fallback_used: mcpResult.fallback_triggered
      }
    } else {
      response.error = {
        message: mcpResult.error || 'Processing failed',
        code: 'MCP_ERROR',
        suggestions: mcpResult.security_violations || []
      }
    }

    return response
  }

  private mapOutputType(format?: string): 'clinical_summary' | 'analysis' | 'recommendation' | 'report' | 'data_transform' {
    switch (format) {
      case 'summary': return 'clinical_summary'
      case 'detailed': return 'analysis'
      case 'bullet_points': return 'report'
      case 'structured': return 'data_transform'
      default: return 'clinical_summary'
    }
  }

  private mapMaxTokens(length?: string): number {
    switch (length) {
      case 'short': return 500
      case 'medium': return 1500
      case 'long': return 3000
      default: return 1500
    }
  }

  private buildContextWindow(request: IRISRequest): string[] {
    const context: string[] = []

    // Add session context if available
    const sessionContext = this.sessionContext.get(request.sessionId || 'default')
    if (sessionContext?.lastResponse) {
      context.push(`Previous interaction: ${sessionContext.lastResponse.response?.substring(0, 200)}...`)
    }

    // Add department context
    context.push(`Department: ${request.department}`)
    context.push(`User role: ${request.userRole}`)

    return context
  }

  private generateRequestHash(request: IRISRequest): string {
    const crypto = require('crypto')
    const requestString = JSON.stringify({
      task: request.task,
      input: request.input,
      userId: request.userId,
      timestamp: Date.now()
    })
    return crypto.createHash('sha256').update(requestString).digest('hex')
  }

  private calculateConfidence(mcpResult: any): number {
    // Calculate confidence based on model performance, fallback usage, etc.
    let confidence = 85 // Base confidence

    if (mcpResult.fallback_triggered) {
      confidence -= 15
    }

    if (mcpResult.security_violations?.length > 0) {
      confidence -= 10
    }

    return Math.max(confidence, 0)
  }

  private async extractMetadata(output: string, request: IRISRequest): Promise<any> {
    // Extract actionable items, citations, etc. from the output
    const metadata: any = {}

    // Simple extraction - in production, use NLP
    if (output.includes('recommend')) {
      metadata.actionable_items = ['Review recommendations with patient', 'Schedule follow-up']
    }

    if (output.includes('trial') || output.includes('study')) {
      metadata.followup_recommendations = ['Consider clinical trial enrollment']
    }

    // Extract citations (mock implementation)
    const citationRegex = /\[(.*?)\]/g
    const citations = []
    let match
    while ((match = citationRegex.exec(output)) !== null) {
      citations.push(match[1])
    }
    if (citations.length > 0) {
      metadata.citations = citations
    }

    return metadata
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// Export singleton instance
export const iris = new IRIS()

// Export convenience functions
export const summarizeGenomicReport = (request: Omit<IRISRequest, 'task'>) =>
  iris.summarizeGenomicReport(request)

export const recommendTreatment = (request: Omit<IRISRequest, 'task'>) =>
  iris.recommendTreatment(request)

export const matchClinicalTrials = (request: Omit<IRISRequest, 'task'>) =>
  iris.matchClinicalTrials(request)

export const generatePatientEducation = (request: Omit<IRISRequest, 'task'>) =>
  iris.generatePatientEducation(request)