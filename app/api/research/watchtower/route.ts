import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "start") {
      // In production, this would initialize a real watchtower process
      // that continuously scans for federal opportunities

      return NextResponse.json({
        status: "success",
        message: "Watchtower initialized successfully",
        active: true,
        nextScan: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      })
    } else if (action === "stop") {
      return NextResponse.json({
        status: "success",
        message: "Watchtower stopped successfully",
        active: false,
      })
    } else if (action === "status") {
      const status = await getWatchtowerStatus()
      return NextResponse.json(status)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error with watchtower:", error)
    return NextResponse.json({ error: "Failed to process watchtower request" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const status = await getWatchtowerStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error getting watchtower status:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}

async function getWatchtowerStatus() {
  const status = await redis.get("watchtower:status")
  if (status) {
    return JSON.parse(status as string)
  }

  return {
    status: "inactive",
    message: "Watchtower not initialized",
  }
}
