import { type NextRequest, NextResponse } from "next/server"
import { PFRCECore } from "@/lib/research-engine/pfrce-core"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get("source")
    const type = searchParams.get("type")
    const minMatchScore = Number.parseFloat(searchParams.get("minMatchScore") || "0")

    const pfrceCore = new PFRCECore()

    // Mock response - in real implementation would call pfrceCore methods
    const opportunities = [
      {
        id: "NIH_R01_CA_2024_001",
        source: "NIH",
        type: "R01",
        title: "Precision Oncology Implementation in Clinical Practice",
        agency: "NIH",
        institute: "NCI",
        program: "Cancer Prevention and Control Research Program",
        announcementNumber: "RFA-CA-24-015",
        dueDate: "2024-03-15",
        budgetCap: 500000,
        duration: 60,
        description: "Support implementation of precision oncology approaches in clinical practice settings",
        keyWords: ["precision oncology", "genomics", "clinical implementation", "CPIC"],
        eligibilityCriteria: ["Academic medical centers", "Healthcare systems", "Research institutions"],
        strategicPriorities: ["Cancer Moonshot", "Precision Medicine Initiative", "All of Us Research Program"],
        cpicAlignment: {
          genes: ["CYP2D6", "CYP2C19", "DPYD", "TPMT"],
          drugs: ["tamoxifen", "clopidogrel", "fluorouracil", "mercaptopurine"],
          guidelines: ["CPIC", "PharmGKB", "FDA"],
          evidenceLevel: "A",
          implementationScore: 95,
          reimbursementPotential: "high",
        },
        matchScore: 0.92,
        status: "active",
        submissionHistory: [],
      },
    ]

    // Apply filters
    let filteredOpportunities = opportunities

    if (source) {
      filteredOpportunities = filteredOpportunities.filter((opp) => opp.source === source)
    }

    if (type) {
      filteredOpportunities = filteredOpportunities.filter((opp) => opp.type === type)
    }

    if (minMatchScore > 0) {
      filteredOpportunities = filteredOpportunities.filter((opp) => opp.matchScore >= minMatchScore)
    }

    return NextResponse.json({
      opportunities: filteredOpportunities,
      total: filteredOpportunities.length,
      filters: { source, type, minMatchScore },
    })
  } catch (error) {
    console.error("Error fetching PFRCE opportunities:", error)
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, opportunityId, data } = body

    const pfrceCore = new PFRCECore()

    switch (action) {
      case "generate_proposal":
        // Mock proposal generation
        const proposal = await pfrceCore.generateGrantProposal({
          id: opportunityId,
          ...data,
        })
        return NextResponse.json({ proposal })

      case "create_coordination":
        const coordination = await pfrceCore.createResearchCoordination(data)
        return NextResponse.json({ coordination })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing PFRCE action:", error)
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 })
  }
}
