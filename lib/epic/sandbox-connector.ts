import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Epic Sandbox Configuration
const EPIC_SANDBOX_CONFIG = {
  // Epic's public sandbox endpoints
  fhirBaseUrl: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
  authorizationUrl: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize",
  tokenUrl: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",

  // Your app registration details (these need to be registered with Epic)
  clientId: process.env.EPIC_CLIENT_ID || "your-epic-client-id",
  redirectUri: process.env.EPIC_REDIRECT_URI || "https://your-app.vercel.app/api/auth/callback/epic",

  // Required scopes for genomic data access
  scopes: [
    "launch",
    "openid",
    "fhirUser",
    "patient/Patient.read",
    "patient/DiagnosticReport.read",
    "patient/Observation.read",
    "patient/DocumentReference.read",
    "offline_access",
  ].join(" "),

  // Epic's test patient IDs
  testPatients: {
    // Camron Smart (comprehensive test patient)
    camron: "eVHNQiVtf-nP6vguPHqfWwB",
    // Derrick Lin (genomics test patient)
    derrick: "erXuFYUfucBZaryVksYEcMg3",
    // Nancy Smart (family member)
    nancy: "eq081-VQEgP8drUUqCWzHfw3",
  },
}

export interface EpicSandboxSession {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  patientId?: string
  userId?: string
  scope: string
}

export class EpicSandboxConnector {
  private sessionKey = "epic:sandbox:session"

  async getAuthorizationUrl(state?: string): Promise<{
    url: string
    state: string
  }> {
    const authState = state || this.generateState()

    const params = new URLSearchParams({
      response_type: "code",
      client_id: EPIC_SANDBOX_CONFIG.clientId,
      redirect_uri: EPIC_SANDBOX_CONFIG.redirectUri,
      scope: EPIC_SANDBOX_CONFIG.scopes,
      state: authState,
      aud: EPIC_SANDBOX_CONFIG.fhirBaseUrl,
    })

    const authUrl = `${EPIC_SANDBOX_CONFIG.authorizationUrl}?${params.toString()}`

    // Store state for validation
    await redis.setex(
      `epic:auth:state:${authState}`,
      600,
      JSON.stringify({
        state: authState,
        timestamp: Date.now(),
        redirectUri: EPIC_SANDBOX_CONFIG.redirectUri,
      }),
    )

    return { url: authUrl, state: authState }
  }

  async exchangeCodeForToken(code: string, state: string): Promise<EpicSandboxSession> {
    // Validate state
    const storedState = await redis.get(`epic:auth:state:${state}`)
    if (!storedState) {
      throw new Error("Invalid or expired state parameter")
    }

    // Clean up state
    await redis.del(`epic:auth:state:${state}`)

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: EPIC_SANDBOX_CONFIG.redirectUri,
      client_id: EPIC_SANDBOX_CONFIG.clientId,
    })

    const response = await fetch(EPIC_SANDBOX_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenParams.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
    }

    const tokenData = await response.json()

    const session: EpicSandboxSession = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      patientId: tokenData.patient,
      userId: tokenData.user,
      scope: tokenData.scope || EPIC_SANDBOX_CONFIG.scopes,
    }

    // Store session
    await redis.setex(this.sessionKey, tokenData.expires_in, JSON.stringify(session))

    return session
  }

  async getValidSession(): Promise<EpicSandboxSession | null> {
    const sessionData = await redis.get(this.sessionKey)
    if (!sessionData) {
      return null
    }

    const session = JSON.parse(sessionData as string) as EpicSandboxSession

    // Check if token is expired or about to expire (within 5 minutes)
    if (session.expiresAt - Date.now() < 5 * 60 * 1000) {
      if (session.refreshToken) {
        return await this.refreshToken(session.refreshToken)
      }
      return null
    }

    return session
  }

  async refreshToken(refreshToken: string): Promise<EpicSandboxSession> {
    const refreshParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: EPIC_SANDBOX_CONFIG.clientId,
    })

    const response = await fetch(EPIC_SANDBOX_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: refreshParams.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`)
    }

    const tokenData = await response.json()

    const session: EpicSandboxSession = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      scope: tokenData.scope,
    }

    // Update stored session
    await redis.setex(this.sessionKey, tokenData.expires_in, JSON.stringify(session))

    return session
  }

  async clearSession(): Promise<void> {
    await redis.del(this.sessionKey)
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  getTestPatients() {
    return EPIC_SANDBOX_CONFIG.testPatients
  }
}
