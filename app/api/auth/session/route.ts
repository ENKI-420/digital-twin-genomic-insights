import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const hasSessionToken =
    cookieStore.has("next-auth.session-token") || cookieStore.has("__Secure-next-auth.session-token")

  if (!hasSessionToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // For demo purposes, we'll return a mock session
  // In a real app, you would decode the JWT and return the actual session data
  return NextResponse.json({
    authenticated: true,
    user: {
      id: "demo-user-id",
      name: "Demo User",
      email: "user@example.com",
      role: "patient",
    },
  })
}
