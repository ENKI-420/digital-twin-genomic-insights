import { NextRequest, NextResponse } from "next/server"
import { CDSHooksService } from "@/lib/epic/cds-hooks-service"

export async function POST(request: NextRequest) {
  try {
    const hookRequest = await request.json()

    // Validate required fields
    if (!hookRequest.hook || hookRequest.hook !== "medication-prescribe") {
      return NextResponse.json(
        { error: "Invalid hook type" },
        { status: 400 }
      )
    }

    if (!hookRequest.fhirServer || !hookRequest.user) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("Processing medication-prescribe hook for patient:", hookRequest.patient)

    const cdsService = new CDSHooksService()
    const response = await cdsService.processHook(hookRequest)

    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    })
  } catch (error) {
    console.error("Medication prescribe hook error:", error)
    return NextResponse.json(
      {
        cards: [],
        error: "Failed to process medication prescribe hook"
      },
      { status: 500 }
    )
  }
}

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