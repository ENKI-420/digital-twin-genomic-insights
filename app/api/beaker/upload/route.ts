import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { BeakerIntegration } from "@/lib/api/beaker-integration"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const patientId = formData.get("patientId") as string

    if (!file || !patientId) {
      return NextResponse.json({ error: "File and patientId are required" }, { status: 400 })
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `beaker-upload-${patientId}-${timestamp}-${file.name}`

    // Store file in Vercel Blob
    const blob = await put(`beaker-uploads/${filename}`, file, {
      access: "public",
    })

    // Process the uploaded file
    const beaker = new BeakerIntegration()

    // In a real implementation, you would parse the file and create a report
    // For now, we'll just return the blob URL

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: blob.contentLength,
      contentType: blob.contentType,
      patientId,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
