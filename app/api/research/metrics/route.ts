import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock metrics data - in production this would be calculated from real data
    const mockMetrics = {
      totalOpportunities: 47,
      activeCoordinations: 12,
      matchedPatients: 156,
      generatedDocuments: 23,
      fundingPipeline: 2800000, // $2.8M
      complianceScore: 95,
    }

    return NextResponse.json(mockMetrics)
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
