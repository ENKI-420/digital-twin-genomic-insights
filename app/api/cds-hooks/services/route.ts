import { NextRequest, NextResponse } from "next/server"
import { CDSHooksService } from "@/lib/epic/cds-hooks-service"

// CDS Hooks Discovery Endpoint
// Epic calls this endpoint to discover available CDS services
export async function GET(request: NextRequest) {
  try {
    const cdsService = new CDSHooksService()
    const discoveryResponse = cdsService.getDiscoveryResponse()

    return NextResponse.json(discoveryResponse, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    })
  } catch (error) {
    console.error("CDS Hooks discovery error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve CDS Hooks services" },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  })
}