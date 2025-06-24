import { epicConfig } from '@/lib/config/environment'
import { redisService } from '@/lib/supabase/redis'
import { getFHIRClient } from './fhir-client'

// SMART on FHIR Authentication Flows
export interface SMARTAuthorizationParams {
  response_type: 'code'
  client_id: string
  redirect_uri: string
  scope: string
  state: string
  aud: string
  launch?: string
}

export interface SMARTTokenResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  scope: string
  refresh_token?: string
  patient?: string
  encounter?: string
  fhirUser?: string
  intent?: string
  smart_style_url?: string
}

export interface SMARTLaunchContext {
  patient?: string
  encounter?: string
  practitioner?: string
  organization?: string
  location?: string
  study?: string
}

export class EpicSMARTAuth {
  private clientId: string
  private clientSecret: string
  private baseUrl: string
  private redirectUri: string

  constructor() {
    this.clientId = epicConfig.clientId
    this.clientSecret = epicConfig.clientSecret
    this.baseUrl = epicConfig.baseUrl
    this.redirectUri = epicConfig.redirectUri
  }

  // Generate authorization URL for SMART App Launch
  generateAuthorizationUrl(params: {
    scope?: string[]
    state?: string
    launch?: string
    aud?: string
  } = {}): string {
    const scopes = params.scope || epicConfig.scopes
    const state = params.state || this.generateState()
    const aud = params.aud || this.baseUrl

    const authParams: SMARTAuthorizationParams = {
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state,
      aud
    }

    if (params.launch) {
      authParams.launch = params.launch
    }

    // Store state for validation
    redisService.set(`smart_state:${state}`, {
      timestamp: Date.now(),
      aud,
      launch: params.launch
    }, 600) // 10 minute expiry

    const searchParams = new URLSearchParams(authParams as any)
    return `${this.baseUrl}/oauth2/authorize?${searchParams.toString()}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state: string): Promise<SMARTTokenResponse> {
    // Validate state
    const storedState = await redisService.get(`smart_state:${state}`)
    if (!storedState) {
      throw new Error('Invalid or expired state parameter')
    }

    // Clean up state
    await redisService.del(`smart_state:${state}`)

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
    })

    // Add client secret if confidential client
    if (this.clientSecret) {
      tokenParams.append('client_secret', this.clientSecret)
    }

    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const tokenResponse: SMARTTokenResponse = await response.json()

    // Store token and launch context information
    const tokenKey = `smart_token:${tokenResponse.access_token.substring(0, 10)}`
    await redisService.set(tokenKey, {
      ...tokenResponse,
      timestamp: Date.now(),
      client_id: this.clientId
    }, tokenResponse.expires_in || 3600)

    // Initialize FHIR client with token
    const fhirClient = getFHIRClient()
    await fhirClient.setAccessToken(tokenResponse.access_token, tokenResponse.expires_in)

    return tokenResponse
  }

  // Refresh access token using refresh token
  async refreshToken(refreshToken: string): Promise<SMARTTokenResponse> {
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    })

    if (this.clientSecret) {
      tokenParams.append('client_secret', this.clientSecret)
    }

    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const tokenResponse: SMARTTokenResponse = await response.json()

    // Update stored token
    const tokenKey = `smart_token:${tokenResponse.access_token.substring(0, 10)}`
    await redisService.set(tokenKey, {
      ...tokenResponse,
      timestamp: Date.now(),
      client_id: this.clientId
    }, tokenResponse.expires_in || 3600)

    // Update FHIR client with new token
    const fhirClient = getFHIRClient()
    await fhirClient.setAccessToken(tokenResponse.access_token, tokenResponse.expires_in)

    return tokenResponse
  }

  // Revoke access token
  async revokeToken(token: string): Promise<void> {
    const revokeParams = new URLSearchParams({
      token,
      client_id: this.clientId,
    })

    if (this.clientSecret) {
      revokeParams.append('client_secret', this.clientSecret)
    }

    const response = await fetch(`${this.baseUrl}/oauth2/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: revokeParams.toString()
    })

    if (!response.ok) {
      console.warn(`Token revocation failed: ${response.status} ${response.statusText}`)
    }

    // Clean up stored token
    const tokenKey = `smart_token:${token.substring(0, 10)}`
    await redisService.del(tokenKey)
  }

  // Get SMART configuration/metadata
  async getWellKnownSMARTConfiguration(): Promise<{
    authorization_endpoint: string
    token_endpoint: string
    token_endpoint_auth_methods_supported: string[]
    scopes_supported?: string[]
    response_types_supported: string[]
    capabilities: string[]
  }> {
    const response = await fetch(`${this.baseUrl}/.well-known/smart_configuration`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch SMART configuration: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Standalone App Launch (without EHR context)
  generateStandaloneAuthUrl(params: {
    scope?: string[]
    state?: string
  } = {}): string {
    const scopes = params.scope || [
      'patient/Patient.read',
      'patient/Observation.read',
      'patient/DiagnosticReport.read',
      'offline_access',
      'openid',
      'fhirUser'
    ]

    return this.generateAuthorizationUrl({
      ...params,
      scope: scopes,
      aud: this.baseUrl
    })
  }

  // EHR Launch (with launch parameter)
  generateEHRLaunchUrl(launchToken: string, params: {
    scope?: string[]
    state?: string
  } = {}): string {
    const scopes = params.scope || [
      'launch',
      'patient/Patient.read',
      'patient/Observation.read',
      'patient/DiagnosticReport.read',
      'offline_access',
      'openid',
      'fhirUser'
    ]

    return this.generateAuthorizationUrl({
      ...params,
      scope: scopes,
      launch: launchToken,
      aud: this.baseUrl
    })
  }

  // Extract launch context from token response
  getLaunchContext(tokenResponse: SMARTTokenResponse): SMARTLaunchContext {
    const context: SMARTLaunchContext = {}

    if (tokenResponse.patient) {
      context.patient = tokenResponse.patient
    }

    if (tokenResponse.encounter) {
      context.encounter = tokenResponse.encounter
    }

    // Extract from fhirUser if present
    if (tokenResponse.fhirUser) {
      const userMatch = tokenResponse.fhirUser.match(/\/(\w+)\/(.+)$/)
      if (userMatch) {
        const [, resourceType, resourceId] = userMatch
        if (resourceType === 'Practitioner') {
          context.practitioner = resourceId
        }
      }
    }

    return context
  }

  // Validate SMART scopes
  validateScopes(requestedScopes: string[], grantedScopes: string): boolean {
    const granted = grantedScopes.split(' ')
    return requestedScopes.every(scope => granted.includes(scope))
  }

  // Generate secure state parameter
  private generateState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Check if token is valid and not expired
  async isTokenValid(token: string): Promise<boolean> {
    const tokenKey = `smart_token:${token.substring(0, 10)}`
    const storedToken = await redisService.get(tokenKey)

    if (!storedToken) {
      return false
    }

    const expiresAt = storedToken.timestamp + (storedToken.expires_in * 1000)
    return Date.now() < expiresAt
  }

  // Get stored token information
  async getTokenInfo(token: string): Promise<SMARTTokenResponse | null> {
    const tokenKey = `smart_token:${token.substring(0, 10)}`
    return redisService.get<SMARTTokenResponse>(tokenKey)
  }
}

// Singleton instance
let smartAuth: EpicSMARTAuth | null = null

export const getSMARTAuth = (): EpicSMARTAuth => {
  if (!smartAuth) {
    smartAuth = new EpicSMARTAuth()
  }
  return smartAuth
}

// Utility function to handle SMART App Launch from URL parameters
export const handleSMARTLaunch = async (searchParams: URLSearchParams): Promise<{
  launchUrl?: string
  error?: string
}> => {
  const launch = searchParams.get('launch')
  const iss = searchParams.get('iss')
  const error = searchParams.get('error')

  if (error) {
    return { error: searchParams.get('error_description') || error }
  }

  if (launch && iss) {
    const smartAuth = getSMARTAuth()
    try {
      const launchUrl = smartAuth.generateEHRLaunchUrl(launch)
      return { launchUrl }
    } catch (err) {
      return { error: 'Failed to generate launch URL' }
    }
  }

  return { error: 'Missing required launch parameters' }
}

export default EpicSMARTAuth