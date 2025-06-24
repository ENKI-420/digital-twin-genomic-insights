// Model Context Protocol (MCP) v1 - Core Implementation
// Secure Intelligence Stack for Healthcare AI

import { randomUUID } from 'crypto'
import { createHash } from 'crypto'
import { Redis } from '@upstash/redis'
import { env } from '@/lib/config/environment'

// Context Packet Structure - Every AI interaction must use this
export interface ContextPacket {
  v: string
  user: {
    id: string
    role: 'clinician' | 'oncologist' | 'nurse' | 'technician' | 'researcher' | 'admin'
    department: string
    session_id: string
    clearance_level?: 'basic' | 'enhanced' | 'restricted'
  }
  task: {
    intent: string
    model_family: 'OpenAI-GPT-4o' | 'Claude-Opus' | 'Claude-Sonnet' | 'Mistral' | 'Local-Model'
    expected_output: 'clinical_summary' | 'analysis' | 'recommendation' | 'report' | 'data_transform'
  }
  inputs: {
    prompt: string
    data_refs?: string[]
    file_refs?: string[]
    context_window?: string[]
  }
  constraints: {
    max_tokens: number
    redact_phi: boolean
    safety_mode: 'low' | 'medium' | 'high' | 'maximum'
    timeout_ms?: number
  }
  routing: {
    agent: string
    use_fallback: boolean
    fallback_model?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  }
  audit: {
    request_time: string
    ip: string
    user_agent?: string
    hash: string
    compliance_flags?: string[]
  }
}

// Model Call Audit Log
export interface ModelCallAudit {
  id: string
  user_id: string
  model_name: string
  task: string
  input_hash: string
  output_hash: string
  timestamp: string
  context_packet: ContextPacket
  fallback_triggered: boolean
  response_time_ms: number
  token_usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  safety_violations?: string[]
  phi_detected?: boolean
}

// Security & Compliance Hooks
export interface SecurityHooks {
  phiRedaction: (text: string) => Promise<string>
  promptInjectionFilter: (prompt: string) => Promise<{ safe: boolean; risk_score: number }>
  outputSignature: (output: string) => string
  contentFilter: (content: string) => Promise<{ approved: boolean; violations: string[] }>
}

// Router Decision Result
export interface RoutingDecision {
  selected_model: string
  provider: string
  reasoning: string
  fallback_cascade: string[]
  security_clearance: boolean
  estimated_cost: number
  estimated_tokens: number
}

export class MCPCore {
  private redis: Redis
  private securityHooks: SecurityHooks
  private auditLog: ModelCallAudit[] = []

  // Role-based model access matrix
  private roleModelMatrix = {
    'clinician': ['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet'],
    'oncologist': ['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet', 'Mistral'],
    'nurse': ['Claude-Sonnet', 'Local-Model'],
    'technician': ['Local-Model'],
    'researcher': ['Claude-Opus', 'Mistral', 'Local-Model'],
    'admin': ['OpenAI-GPT-4o', 'Claude-Opus', 'Claude-Sonnet', 'Mistral', 'Local-Model']
  }

  // Fallback cascade configuration
  private fallbackCascade = {
    'OpenAI-GPT-4o': ['Claude-Opus', 'Claude-Sonnet', 'Mistral', 'Local-Model'],
    'Claude-Opus': ['OpenAI-GPT-4o', 'Claude-Sonnet', 'Mistral', 'Local-Model'],
    'Claude-Sonnet': ['Claude-Opus', 'OpenAI-GPT-4o', 'Local-Model'],
    'Mistral': ['Claude-Sonnet', 'Local-Model'],
    'Local-Model': [] // No fallback for local model
  }

  constructor() {
    this.redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })

    this.securityHooks = {
      phiRedaction: this.redactPHI.bind(this),
      promptInjectionFilter: this.checkPromptInjection.bind(this),
      outputSignature: this.generateOutputSignature.bind(this),
      contentFilter: this.filterContent.bind(this)
    }
  }

  // Main MCP Entry Point - All AI calls go through this
  async processContextPacket(packet: ContextPacket): Promise<{
    success: boolean
    output?: string
    audit_id: string
    model_used: string
    fallback_triggered: boolean
    security_violations?: string[]
    error?: string
  }> {
    const startTime = Date.now()
    const auditId = randomUUID()

    try {
      // 1. Validate context packet
      const validation = await this.validateContextPacket(packet)
      if (!validation.valid) {
        throw new Error(`Context packet validation failed: ${validation.reason}`)
      }

      // 2. Security pre-processing
      const securityCheck = await this.runSecurityHooks(packet)
      if (!securityCheck.approved) {
        return {
          success: false,
          audit_id: auditId,
          model_used: 'none',
          fallback_triggered: false,
          security_violations: securityCheck.violations,
          error: 'Security policy violation'
        }
      }

      // 3. Route to appropriate model
      const routing = await this.routeToModel(packet)
      if (!routing.security_clearance) {
        throw new Error('Insufficient clearance for requested model')
      }

      // 4. Execute AI call with fallback handling
      const result = await this.executeWithFallback(packet, routing)

      // 5. Post-process output
      const processedOutput = await this.postProcessOutput(result.output, packet)

      // 6. Create audit log
      const audit: ModelCallAudit = {
        id: auditId,
        user_id: packet.user.id,
        model_name: result.model_used,
        task: packet.task.intent,
        input_hash: this.generateHash(packet.inputs.prompt),
        output_hash: this.generateHash(processedOutput),
        timestamp: new Date().toISOString(),
        context_packet: packet,
        fallback_triggered: result.fallback_triggered,
        response_time_ms: Date.now() - startTime,
        token_usage: result.token_usage,
        safety_violations: securityCheck.violations.length > 0 ? securityCheck.violations : undefined,
        phi_detected: securityCheck.phi_detected
      }

      await this.storeAudit(audit)

      return {
        success: true,
        output: processedOutput,
        audit_id: auditId,
        model_used: result.model_used,
        fallback_triggered: result.fallback_triggered
      }

    } catch (error) {
      // Log error and create audit entry
      const errorAudit: ModelCallAudit = {
        id: auditId,
        user_id: packet.user.id,
        model_name: 'error',
        task: packet.task.intent,
        input_hash: this.generateHash(packet.inputs.prompt),
        output_hash: this.generateHash('ERROR'),
        timestamp: new Date().toISOString(),
        context_packet: packet,
        fallback_triggered: false,
        response_time_ms: Date.now() - startTime,
        token_usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      }

      await this.storeAudit(errorAudit)

      return {
        success: false,
        audit_id: auditId,
        model_used: 'error',
        fallback_triggered: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Route request to appropriate model based on role and task
  private async routeToModel(packet: ContextPacket): Promise<RoutingDecision> {
    const userRole = packet.user.role
    const requestedModel = packet.task.model_family
    const allowedModels = this.roleModelMatrix[userRole] || []

    // Check if user has access to requested model
    if (!allowedModels.includes(requestedModel)) {
      // Auto-select highest tier model available to user
      const selectedModel = allowedModels[0] || 'Local-Model'

      return {
        selected_model: selectedModel,
        provider: this.getProviderForModel(selectedModel),
        reasoning: `User role '${userRole}' does not have access to '${requestedModel}'. Auto-selected '${selectedModel}'.`,
        fallback_cascade: this.fallbackCascade[selectedModel] || [],
        security_clearance: true,
        estimated_cost: this.estimateCost(selectedModel, packet.constraints.max_tokens),
        estimated_tokens: packet.constraints.max_tokens
      }
    }

    // Additional routing logic based on task complexity, safety mode, etc.
    let finalModel = requestedModel

    // High safety mode -> prefer local model for sensitive data
    if (packet.constraints.safety_mode === 'maximum' && packet.constraints.redact_phi) {
      finalModel = 'Local-Model'
    }

    return {
      selected_model: finalModel,
      provider: this.getProviderForModel(finalModel),
      reasoning: `Standard routing to requested model '${finalModel}'`,
      fallback_cascade: this.fallbackCascade[finalModel] || [],
      security_clearance: true,
      estimated_cost: this.estimateCost(finalModel, packet.constraints.max_tokens),
      estimated_tokens: packet.constraints.max_tokens
    }
  }

  // Execute AI call with automatic fallback
  private async executeWithFallback(packet: ContextPacket, routing: RoutingDecision): Promise<{
    output: string
    model_used: string
    fallback_triggered: boolean
    token_usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }> {
    const modelsToTry = [routing.selected_model, ...routing.fallback_cascade]
    let fallbackTriggered = false

    for (const modelName of modelsToTry) {
      try {
        const result = await this.callModel(modelName, packet)
        return {
          output: result.output,
          model_used: modelName,
          fallback_triggered,
          token_usage: result.token_usage
        }
      } catch (error) {
        console.warn(`Model ${modelName} failed, trying fallback:`, error)
        fallbackTriggered = true
        continue
      }
    }

    throw new Error('All models in fallback cascade failed')
  }

  // Individual model calling logic
  private async callModel(modelName: string, packet: ContextPacket): Promise<{
    output: string
    token_usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }> {
    // This would integrate with your existing model interface
    const provider = this.getProviderForModel(modelName)

    // Mock implementation - replace with actual model calls
    switch (provider) {
      case 'openai':
        return await this.callOpenAI(modelName, packet)
      case 'anthropic':
        return await this.callClaude(modelName, packet)
      case 'local':
        return await this.callLocalModel(modelName, packet)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }

  // Security validation and filtering
  private async runSecurityHooks(packet: ContextPacket): Promise<{
    approved: boolean
    violations: string[]
    phi_detected: boolean
  }> {
    const violations: string[] = []
    let phiDetected = false

    // 1. Check for prompt injection
    const injectionCheck = await this.securityHooks.promptInjectionFilter(packet.inputs.prompt)
    if (!injectionCheck.safe) {
      violations.push(`Prompt injection detected (risk score: ${injectionCheck.risk_score})`)
    }

    // 2. Content filtering
    const contentCheck = await this.securityHooks.contentFilter(packet.inputs.prompt)
    if (!contentCheck.approved) {
      violations.push(...contentCheck.violations)
    }

    // 3. PHI detection
    if (packet.constraints.redact_phi) {
      phiDetected = await this.detectPHI(packet.inputs.prompt)
    }

    return {
      approved: violations.length === 0,
      violations,
      phi_detected: phiDetected
    }
  }

  // Utility methods
  private validateContextPacket(packet: ContextPacket): { valid: boolean; reason?: string } {
    if (!packet.v || packet.v !== '1.0') {
      return { valid: false, reason: 'Invalid or missing version' }
    }
    if (!packet.user || !packet.user.id || !packet.user.role) {
      return { valid: false, reason: 'Invalid user context' }
    }
    if (!packet.task || !packet.task.intent) {
      return { valid: false, reason: 'Invalid task definition' }
    }
    return { valid: true }
  }

  private generateHash(input: string): string {
    return createHash('sha256').update(input).digest('hex')
  }

  private getProviderForModel(modelName: string): string {
    if (modelName.includes('GPT')) return 'openai'
    if (modelName.includes('Claude')) return 'anthropic'
    if (modelName.includes('Mistral')) return 'mistral'
    return 'local'
  }

  private estimateCost(modelName: string, tokens: number): number {
    const costPerKToken = {
      'OpenAI-GPT-4o': 0.03,
      'Claude-Opus': 0.075,
      'Claude-Sonnet': 0.015,
      'Mistral': 0.002,
      'Local-Model': 0
    }
    return ((costPerKToken[modelName] || 0) * tokens) / 1000
  }

  private async storeAudit(audit: ModelCallAudit): Promise<void> {
    // Store in Redis with 7-year retention for HIPAA compliance
    const key = `mcp:audit:${audit.id}`
    await this.redis.setex(key, 2555 * 24 * 60 * 60, JSON.stringify(audit)) // 7 years

    // Also add to daily audit log
    const dateKey = `mcp:daily:${new Date().toISOString().split('T')[0]}`
    await this.redis.lpush(dateKey, audit.id)
    await this.redis.expire(dateKey, 2555 * 24 * 60 * 60) // 7 years
  }

  // Security hook implementations
  private async redactPHI(text: string): Promise<string> {
    // Implement PHI redaction using Presidio or similar
    // This is a mock implementation
    return text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
      .replace(/\b\d{10,}\b/g, '[PHONE_REDACTED]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
  }

  private async checkPromptInjection(prompt: string): Promise<{ safe: boolean; risk_score: number }> {
    // Mock implementation - integrate with actual security scanning
    const suspiciousPatterns = [
      /ignore previous instructions/i,
      /system:\s*you are now/i,
      /\[SYSTEM\]/i,
      /forget everything/i
    ]

    const riskScore = suspiciousPatterns.reduce((score, pattern) => {
      return pattern.test(prompt) ? score + 0.3 : score
    }, 0)

    return {
      safe: riskScore < 0.5,
      risk_score: Math.min(riskScore, 1.0)
    }
  }

  private generateOutputSignature(output: string): string {
    return this.generateHash(output + new Date().toISOString())
  }

  private async filterContent(content: string): Promise<{ approved: boolean; violations: string[] }> {
    const violations: string[] = []

    // Check for inappropriate content
    if (content.toLowerCase().includes('harmful')) {
      violations.push('Potentially harmful content detected')
    }

    return {
      approved: violations.length === 0,
      violations
    }
  }

  private async detectPHI(text: string): Promise<boolean> {
    // Mock PHI detection - integrate with Presidio or similar
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{10,}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/ // Dates
    ]

    return phiPatterns.some(pattern => pattern.test(text))
  }

  private async postProcessOutput(output: string, packet: ContextPacket): Promise<string> {
    if (packet.constraints.redact_phi) {
      return await this.securityHooks.phiRedaction(output)
    }
    return output
  }

  // Mock model implementations - replace with actual API calls
  private async callOpenAI(modelName: string, packet: ContextPacket): Promise<{
    output: string
    token_usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }> {
    // Mock implementation
    return {
      output: `OpenAI ${modelName} response to: ${packet.task.intent}`,
      token_usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
    }
  }

  private async callClaude(modelName: string, packet: ContextPacket): Promise<{
    output: string
    token_usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }> {
    // Mock implementation
    return {
      output: `Claude ${modelName} response to: ${packet.task.intent}`,
      token_usage: { prompt_tokens: 120, completion_tokens: 60, total_tokens: 180 }
    }
  }

  private async callLocalModel(modelName: string, packet: ContextPacket): Promise<{
    output: string
    token_usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }> {
    // Mock implementation
    return {
      output: `Local model response to: ${packet.task.intent}`,
      token_usage: { prompt_tokens: 80, completion_tokens: 40, total_tokens: 120 }
    }
  }

  // Public methods for monitoring and administration
  async getAuditLog(filters?: {
    userId?: string
    startDate?: string
    endDate?: string
    modelName?: string
  }): Promise<ModelCallAudit[]> {
    // Implementation for retrieving audit logs
    const keys = await this.redis.keys('mcp:audit:*')
    const audits: ModelCallAudit[] = []

    for (const key of keys) {
      const auditData = await this.redis.get(key)
      if (auditData) {
        const audit = JSON.parse(auditData as string) as ModelCallAudit

        // Apply filters
        if (filters?.userId && audit.user_id !== filters.userId) continue
        if (filters?.modelName && audit.model_name !== filters.modelName) continue
        if (filters?.startDate && audit.timestamp < filters.startDate) continue
        if (filters?.endDate && audit.timestamp > filters.endDate) continue

        audits.push(audit)
      }
    }

    return audits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  async getUsageMetrics(): Promise<{
    totalCalls: number
    modelUsage: Record<string, number>
    averageResponseTime: number
    fallbackRate: number
    securityViolations: number
  }> {
    const audits = await this.getAuditLog()

    const metrics = {
      totalCalls: audits.length,
      modelUsage: {} as Record<string, number>,
      averageResponseTime: 0,
      fallbackRate: 0,
      securityViolations: 0
    }

    let totalResponseTime = 0
    let fallbackCount = 0

    for (const audit of audits) {
      // Model usage
      metrics.modelUsage[audit.model_name] = (metrics.modelUsage[audit.model_name] || 0) + 1

      // Response time
      totalResponseTime += audit.response_time_ms

      // Fallback tracking
      if (audit.fallback_triggered) fallbackCount++

      // Security violations
      if (audit.safety_violations && audit.safety_violations.length > 0) {
        metrics.securityViolations++
      }
    }

    metrics.averageResponseTime = audits.length > 0 ? totalResponseTime / audits.length : 0
    metrics.fallbackRate = audits.length > 0 ? fallbackCount / audits.length : 0

    return metrics
  }
}

// Export singleton instance
export const mcpCore = new MCPCore()