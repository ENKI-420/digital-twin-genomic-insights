import { getAuthorizationUrl, clearTokens } from "./epic-auth"

// Session timeout in milliseconds (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000

let sessionStartTime: number | null = null
let sessionTimeoutId: NodeJS.Timeout | null = null

export function initSession(): void {
  sessionStartTime = Date.now()

  // Clear any existing timeout
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
  }

  // Set a new timeout
  sessionTimeoutId = setTimeout(() => {
    handleSessionTimeout()
  }, SESSION_TIMEOUT)
}

export function refreshSession(): void {
  // Reset the session start time
  sessionStartTime = Date.now()

  // Clear any existing timeout
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
  }

  // Set a new timeout
  sessionTimeoutId = setTimeout(() => {
    handleSessionTimeout()
  }, SESSION_TIMEOUT)
}

export function isSessionActive(): boolean {
  if (!sessionStartTime) {
    return false
  }

  return Date.now() - sessionStartTime < SESSION_TIMEOUT
}

export function getSessionRemainingTime(): number {
  if (!sessionStartTime) {
    return 0
  }

  const elapsed = Date.now() - sessionStartTime
  return Math.max(0, SESSION_TIMEOUT - elapsed)
}

export function endSession(): void {
  sessionStartTime = null

  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
    sessionTimeoutId = null
  }

  // Clear tokens
  clearTokens()
}

async function handleSessionTimeout(): Promise<void> {
  sessionStartTime = null
  sessionTimeoutId = null

  // Clear tokens
  await clearTokens()

  // Dispatch a custom event that components can listen for
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sessionTimeout"))
  }
}

export async function quickSignIn(): Promise<string> {
  // Generate a new authorization URL
  const state = Math.random().toString(36).substring(2, 15)
  return await getAuthorizationUrl(state)
}
