import { type NextRequest, NextResponse } from "next/server"
import { BeakerIntegration } from "@/lib/api/beaker-integration"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const beaker = new BeakerIntegration()

    const query = {
      patientId: searchParams.get("patientId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      reportType: searchParams.getAll("reportType"),
      status: searchParams.getAll("status"),
      department: searchParams.get("department") || undefined,
      provider: searchParams.get("provider") || undefined,
      limit: Number.parseInt(searchParams.get("limit") || "50"),
      offset: Number.parseInt(searchParams.get("offset") || "0"),
    }

    const result = await beaker.fetchReports(query)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in /api/beaker/reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
