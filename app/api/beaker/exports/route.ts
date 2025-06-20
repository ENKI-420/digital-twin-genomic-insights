import { type NextRequest, NextResponse } from "next/server"
import { BeakerIntegration } from "@/lib/api/beaker-integration"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportIds, format, twinData } = body

    if (!reportIds && !twinData) {
      return NextResponse.json({ error: "Either reportIds or twinData is required" }, { status: 400 })
    }

    if (!["csv", "excel", "pdf", "json"].includes(format)) {
      return NextResponse.json({ error: "Invalid format. Must be csv, excel, pdf, or json" }, { status: 400 })
    }

    const beaker = new BeakerIntegration()

    // Handle genomic twin data export
    if (twinData) {
      const filename = `twin-data-export-${Date.now()}.${format}`
      const contentType = format === "json" ? "application/json" : "text/csv"

      // Convert twinData to appropriate format based on format
      let exportData
      if (format === "json") {
        exportData = JSON.stringify(twinData)
      } else if (format === "csv") {
        // Simple CSV conversion for twin data
        exportData = convertTwinDataToCsv(twinData)
      } else {
        return NextResponse.json({ error: "Only CSV and JSON formats are supported for twin data" }, { status: 400 })
      }

      const result = await beaker.storeInBlob(exportData, filename, contentType)
      return NextResponse.json({ url: result.url, filename })
    }

    // Handle report exports
    const result = await beaker.exportReports(reportIds, format)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in /api/beaker/exports:", error)
    return NextResponse.json({ error: "Failed to create export" }, { status: 500 })
  }
}

// Helper function to convert twin data to CSV
function convertTwinDataToCsv(twinData: any[]): string {
  // Create headers
  const headers = [
    "TwinID",
    "PatientID",
    "Chromosome",
    "Position",
    "Type",
    "Significance",
    "Gene",
    "Zygosity",
    "Quality",
    "Depth",
    "AlleleFrequency",
  ]

  // Create rows
  const rows = [headers.join(",")]

  twinData.forEach((twin) => {
    if (twin.variants && Array.isArray(twin.variants)) {
      twin.variants.forEach((variant) => {
        const row = [
          twin.twinId,
          twin.patientId,
          variant.chromosome,
          variant.position,
          variant.type,
          variant.significance,
          variant.gene || "",
          variant.zygosity,
          variant.quality,
          variant.depth,
          variant.alleleFrequency,
        ].map((value) => `"${String(value).replace(/"/g, '""')}"`)

        rows.push(row.join(","))
      })
    }
  })

  return rows.join("\n")
}

// Add a GET route to list available exports
export async function GET(request: NextRequest) {
  try {
    const beaker = new BeakerIntegration()
    const result = await beaker.listBlobFiles()

    return NextResponse.json({
      files: result.blobs.map((blob) => ({
        url: blob.url,
        filename: blob.pathname.split("/").pop(),
        contentType: blob.contentType,
        size: blob.contentLength,
      })),
    })
  } catch (error) {
    console.error("Error listing exports:", error)
    return NextResponse.json({ error: "Failed to list exports" }, { status: 500 })
  }
}

// Add a DELETE route to remove exports
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = await request.json()

    if (!pathname) {
      return NextResponse.json({ error: "Pathname is required" }, { status: 400 })
    }

    const beaker = new BeakerIntegration()
    await beaker.deleteBlob(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting export:", error)
    return NextResponse.json({ error: "Failed to delete export" }, { status: 500 })
  }
}
