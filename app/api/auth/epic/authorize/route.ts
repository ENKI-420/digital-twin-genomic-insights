import { type NextRequest, NextResponse } from "next/server"
import { EpicSandboxConnector } from "@/lib/epic/sandbox-connector"

export async function GET(request: NextRequest) {
  try {
    const connector = new EpicSandboxConnector()
    const { url, state } = await connector.getAuthorizationUrl()

    console.log("Generated Epic authorization URL:", {
      state,
      redirectUri: process.env.EPIC_REDIRECT_URI,
      clientId: process.env.EPIC_CLIENT_ID,
    })

    return NextResponse.json({
      success: true,
      authorizationUrl: url,
      state,
      message: "Redirect user to this URL to begin Epic authentication",
    })
  } catch (error) {
    console.error("Error generating Epic authorization URL:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to generate Epic authorization URL",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { redirectTo } = body

    const connector = new EpicSandboxConnector()
    const { url, state } = await connector.getAuthorizationUrl()

    // If redirectTo is provided, store it for post-auth redirect
    if (redirectTo) {
      // Store redirect destination (implement as needed)
      console.log("Post-auth redirect destination:", redirectTo)
    }

    // Return redirect response
    return NextResponse.redirect(url)
  } catch (error) {
    console.error("Error in Epic authorization POST:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
