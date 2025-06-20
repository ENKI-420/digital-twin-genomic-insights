import { NextResponse } from "next/server"
import { EpicAuthTester } from "@/tests/epic-auth-test"

export async function GET() {
  try {
    console.log("🔐 Starting Epic Authentication & FHIR Access Tests...")

    const tester = new EpicAuthTester()
    const testResults = await tester.runAllTests()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        epicBaseUrl: process.env.EPIC_FHIR_BASE_URL,
        hasClientId: !!process.env.EPIC_CLIENT_ID,
        hasClientSecret: !!process.env.EPIC_CLIENT_SECRET,
      },
      ...testResults,
    })
  } catch (error) {
    console.error("Error running Epic auth tests:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  // Allow running tests with custom parameters
  try {
    const tester = new EpicAuthTester()
    const testResults = await tester.runAllTests()

    return NextResponse.json({
      success: true,
      message: "Epic authentication tests completed",
      timestamp: new Date().toISOString(),
      ...testResults,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
