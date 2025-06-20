import { type NextRequest, NextResponse } from "next/server"
import { getWatchtowerScheduler } from "@/lib/research-engine/watchtower-scheduler"

export async function GET(request: NextRequest) {
  try {
    const scheduler = getWatchtowerScheduler()
    const status = await scheduler.getSchedulerStatus()

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error getting scheduler status:", error)
    return NextResponse.json({ error: "Failed to get scheduler status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const scheduler = getWatchtowerScheduler()

    switch (action) {
      case "start":
        await scheduler.startScheduler()
        return NextResponse.json({ message: "Scheduler started" })

      case "stop":
        await scheduler.stopScheduler()
        return NextResponse.json({ message: "Scheduler stopped" })

      case "status":
        const status = await scheduler.getSchedulerStatus()
        return NextResponse.json(status)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error controlling scheduler:", error)
    return NextResponse.json({ error: "Failed to control scheduler" }, { status: 500 })
  }
}
