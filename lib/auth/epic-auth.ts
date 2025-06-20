import { v4 as uuidv4 } from "uuid"

// Epic FHIR OAuth2 configuration
const EPIC_CONFIG = {
  authorizationUrl: process.env.EPIC_AUTHORIZATION_URL || "",
  tokenUrl: process.env.EPIC_TOKEN_URL || "",
  clientId: process.env.EPIC_CLIENT_ID || "",
  clientSecret: process.env.EPIC_CLIENT_SECRET || "",
  redirectUri: process.env.EPIC_REDIRECT_URI || "",
  scopes: process.env.EPIC_SCOPES || "patient/DiagnosticReport.read patient/Patient.read",
  fhirBaseUrl: process.env.EPIC_FHIR_BASE_URL || "",
}

// Token storage - in a real app, this would be in a secure database
interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const tokenStore: Record<string, TokenData> = {}

export async function getAuthorizationUrl(state: string = uuidv4()): Promise<string> {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: EPIC_CONFIG.clientId,
    redirect_uri: EPIC_CONFIG.redirectUri,
    scope: EPIC_CONFIG.scopes,
    state,
  })

  return `${EPIC_CONFIG.authorizationUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<TokenData> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: EPIC_CONFIG.redirectUri,
    client_id: EPIC_CONFIG.clientId,
  })

  const response = await fetch(EPIC_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${EPIC_CONFIG.clientId}:${EPIC_CONFIG.clientSecret}`).toString("base64")}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  const data = await response.json()

  // Store the token with expiration
  const tokenData: TokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  // Store token by user ID or session ID in a real app
  const userId = "demo-user"
  tokenStore[userId] = tokenData

  return tokenData
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenData> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: EPIC_CONFIG.clientId,
  })

  const response = await fetch(EPIC_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${EPIC_CONFIG.clientId}:${EPIC_CONFIG.clientSecret}`).toString("base64")}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data = await response.json()

  // Store the refreshed token
  const tokenData: TokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Some providers don't return a new refresh token
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  // Update token store
  const userId = "demo-user"
  tokenStore[userId] = tokenData

  return tokenData
}

export async function getValidAccessToken(): Promise<string> {
  const userId = "demo-user"
  const tokenData = tokenStore[userId]

  if (!tokenData) {
    throw new Error("No token available. User must authenticate.")
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (tokenData.expiresAt - Date.now() < 5 * 60 * 1000) {
    // Token is expired or about to expire, refresh it
    const refreshedToken = await refreshAccessToken(tokenData.refreshToken)
    return refreshedToken.accessToken
  }

  return tokenData.accessToken
}

export async function clearTokens(): Promise<void> {
  const userId = "demo-user"
  delete tokenStore[userId]
}
