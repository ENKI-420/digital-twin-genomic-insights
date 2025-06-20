import { NextResponse } from "next/server"
import { MicrositeGenerator } from "@/lib/funding/microsite-generator"

export async function GET() {
  try {
    const generator = new MicrositeGenerator()
    const html = generator.generateMicrositeHTML()

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Failed to generate microsite:", error)
    return NextResponse.json({ error: "Failed to generate microsite" }, { status: 500 })
  }
}
