import { NextResponse } from "next/server"
import { OpportunityScraper } from "@/lib/scraper/opportunity-scraper"
import { withRBAC } from "@/lib/auth/rbac"

export async function POST(request: Request) {
  return withRBAC("manage_scraper")(request, async () => {
    try {
      const scraper = new OpportunityScraper()
      const results = await scraper.runFullScrape()

      return NextResponse.json({
        success: true,
        message: "Scraper completed successfully",
        data: {
          trials_found: results.trials.length,
          grants_found: results.grants.length,
        },
      })
    } catch (error) {
      console.error("Scraper error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Scraper failed to complete",
        },
        { status: 500 },
      )
    }
  })
}

export async function GET() {
  try {
    const scraper = new OpportunityScraper()

    // Get cached results
    const [trials, grants] = await Promise.all([scraper.scrapeClinicalTrials(), scraper.scrapeGrantOpportunities()])

    return NextResponse.json({
      trials: trials.slice(0, 10), // Return first 10
      grants: grants.slice(0, 10), // Return first 10
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting scraper results:", error)
    return NextResponse.json({ error: "Failed to get results" }, { status: 500 })
  }
}
