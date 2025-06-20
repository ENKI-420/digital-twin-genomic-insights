import { Redis } from "@upstash/redis"
import { createServerSupabaseClient } from "@/lib/supabase/client"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface ScrapedOpportunity {
  id: string
  source: "clinicaltrials.gov" | "grants.gov" | "nih.gov" | "sbir.gov" | "cdmrp"
  title: string
  description: string
  url: string
  deadline?: string
  amount?: number
  eligibility?: string[]
  keywords?: string[]
  status: "active" | "closed" | "upcoming"
  scrapedAt: string
}

export interface ClinicalTrialData {
  nctId: string
  title: string
  status: string
  phase?: string
  condition: string
  intervention: string
  eligibilityCriteria: string[]
  locations: Array<{
    facility: string
    city: string
    state: string
    country: string
    status: string
  }>
  contacts: Array<{
    name: string
    email?: string
    phone?: string
  }>
  genomicCriteria?: string[]
}

export class OpportunityScraper {
  private supabase = createServerSupabaseClient()

  async scrapeClinicalTrials(keywords: string[] = []): Promise<ClinicalTrialData[]> {
    const cacheKey = `scraper:clinicaltrials:${keywords.join(",")}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log("Using cached clinical trials data")
      return cached as ClinicalTrialData[]
    }

    try {
      // Mock scraping ClinicalTrials.gov API
      const searchTerms = keywords.length ? keywords.join("+") : "genomic+precision+medicine"
      const apiUrl = `https://clinicaltrials.gov/api/query/study_fields?expr=${searchTerms}&fields=NCTId,BriefTitle,OverallStatus,Phase,Condition,InterventionName,EligibilityCriteria,LocationFacility,LocationCity,LocationState,LocationCountry,LocationStatus,OverallOfficialName,OverallOfficialAffiliation&min_rnk=1&max_rnk=50&fmt=json`

      console.log("Scraping ClinicalTrials.gov...")

      // Simulate API response with mock data
      const mockTrials: ClinicalTrialData[] = [
        {
          nctId: "NCT05123456",
          title: "Precision Oncology Trial for BRCA1/2 Mutations",
          status: "Recruiting",
          phase: "Phase II",
          condition: "Breast Cancer",
          intervention: "Olaparib",
          eligibilityCriteria: [
            "BRCA1 or BRCA2 mutation positive",
            "Age 18-75 years",
            "ECOG performance status 0-1",
            "Adequate organ function",
          ],
          locations: [
            {
              facility: "Baptist Health Medical Group Hematology & Oncology at Baptist Health Louisville",
              city: "Louisville",
              state: "Kentucky",
              country: "United States",
              status: "Recruiting",
            },
          ],
          contacts: [
            {
              name: "Dr. Sameer Talwalkar",
              email: "sameer.talwalkar@nortonhealthcare.org",
            },
          ],
          genomicCriteria: ["BRCA1", "BRCA2"],
        },
        {
          nctId: "NCT05234567",
          title: "AI-Guided Treatment Selection in Lung Cancer",
          status: "Recruiting",
          phase: "Phase III",
          condition: "Non-Small Cell Lung Cancer",
          intervention: "AI-guided therapy selection",
          eligibilityCriteria: ["EGFR, ALK, or ROS1 mutation positive", "Stage IV NSCLC", "No prior targeted therapy"],
          locations: [
            {
              facility: "Multiple Sites",
              city: "Various",
              state: "Various",
              country: "United States",
              status: "Recruiting",
            },
          ],
          contacts: [
            {
              name: "Study Coordinator",
              email: "trials@example.com",
            },
          ],
          genomicCriteria: ["EGFR", "ALK", "ROS1"],
        },
      ]

      // Cache for 6 hours
      await redis.setex(cacheKey, 21600, mockTrials)

      console.log(`Scraped ${mockTrials.length} clinical trials`)
      return mockTrials
    } catch (error) {
      console.error("Error scraping clinical trials:", error)
      return []
    }
  }

  async scrapeGrantOpportunities(): Promise<ScrapedOpportunity[]> {
    const cacheKey = "scraper:grants:all"
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log("Using cached grant opportunities")
      return cached as ScrapedOpportunity[]
    }

    try {
      console.log("Scraping grant opportunities...")

      // Mock grant opportunities from various sources
      const mockGrants: ScrapedOpportunity[] = [
        {
          id: "NIH_R01_CA_2024_003",
          source: "nih.gov",
          title: "Precision Medicine Implementation in Cancer Care",
          description: "Support for implementing precision medicine approaches in clinical oncology practice",
          url: "https://grants.nih.gov/grants/guide/rfa-files/RFA-CA-24-015.html",
          deadline: "2024-04-15",
          amount: 500000,
          eligibility: ["Academic medical centers", "Healthcare systems"],
          keywords: ["precision medicine", "oncology", "implementation"],
          status: "active",
          scrapedAt: new Date().toISOString(),
        },
        {
          id: "SBIR_HHS_2024_002",
          source: "sbir.gov",
          title: "AI-Powered Clinical Decision Support Systems",
          description: "Development of AI tools for clinical decision making in healthcare",
          url: "https://www.sbir.gov/opportunities/123456",
          deadline: "2024-03-30",
          amount: 300000,
          eligibility: ["Small businesses", "Startups"],
          keywords: ["AI", "clinical decision support", "healthcare"],
          status: "active",
          scrapedAt: new Date().toISOString(),
        },
        {
          id: "DOD_CDMRP_2024_002",
          source: "cdmrp",
          title: "Military Precision Medicine Initiative",
          description: "Precision medicine applications for military and veteran healthcare",
          url: "https://cdmrp.army.mil/funding/2024",
          deadline: "2024-05-01",
          amount: 1000000,
          eligibility: ["Research institutions", "Healthcare systems"],
          keywords: ["precision medicine", "military", "veterans"],
          status: "active",
          scrapedAt: new Date().toISOString(),
        },
      ]

      // Cache for 12 hours
      await redis.setex(cacheKey, 43200, mockGrants)

      console.log(`Scraped ${mockGrants.length} grant opportunities`)
      return mockGrants
    } catch (error) {
      console.error("Error scraping grant opportunities:", error)
      return []
    }
  }

  async storeOpportunities(opportunities: ScrapedOpportunity[]): Promise<void> {
    for (const opportunity of opportunities) {
      // Store in database
      await this.supabase.from("scraped_opportunities").upsert({
        external_id: opportunity.id,
        source: opportunity.source,
        title: opportunity.title,
        description: opportunity.description,
        url: opportunity.url,
        deadline: opportunity.deadline,
        amount: opportunity.amount,
        eligibility: opportunity.eligibility,
        keywords: opportunity.keywords,
        status: opportunity.status,
        scraped_at: opportunity.scrapedAt,
      })
    }
  }

  async runFullScrape(): Promise<{
    trials: ClinicalTrialData[]
    grants: ScrapedOpportunity[]
  }> {
    console.log("🔍 Starting full opportunity scrape...")

    const [trials, grants] = await Promise.all([
      this.scrapeClinicalTrials(["genomic", "precision", "AI"]),
      this.scrapeGrantOpportunities(),
    ])

    // Store opportunities in database
    await this.storeOpportunities(grants)

    console.log(`✅ Scrape complete: ${trials.length} trials, ${grants.length} grants`)

    return { trials, grants }
  }
}
