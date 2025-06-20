import { type NextRequest, NextResponse } from "next/server"
import { EpicSandboxConnector } from "@/lib/epic/sandbox-connector"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("Epic OAuth error:", error)
      return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error)}`, request.url))
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(new URL("/auth/error?error=missing_parameters", request.url))
    }

    const connector = new EpicSandboxConnector()

    try {
      // Exchange authorization code for access token
      const session = await connector.exchangeCodeForToken(code, state)

      console.log("Epic OAuth success:", {
        patientId: session.patientId,
        userId: session.userId,
        scope: session.scope,
        expiresAt: new Date(session.expiresAt).toISOString(),
      })

      // Redirect to dashboard with success
      const redirectUrl = new URL("/dashboard", request.url)
      redirectUrl.searchParams.set("epic_auth", "success")
      redirectUrl.searchParams.set("patient_id", session.patientId || "")

      return NextResponse.redirect(redirectUrl)
    } catch (tokenError) {
      console.error("Token exchange error:", tokenError)
      return NextResponse.redirect(new URL(`/auth/error?error=token_exchange_failed`, request.url))
    }
  } catch (error) {
    console.error("Epic callback error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=callback_failed", request.url))
  }
}
