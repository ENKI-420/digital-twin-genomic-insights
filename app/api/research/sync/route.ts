import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface ResearchSyncData {
  title: string
  description: string
  variants: {
    chromosome: string
    position: number
    reference_allele: string
    alternate_allele: string
    gene: string
    consequence: string
    clinical_significance: string
    cosmic_variant_id?: string
    nih_variant_id?: string
  }[]
  cosmic_id?: string
  nih_reference_id?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: syncData }: { data: ResearchSyncData[] } = await request.json()

    // Simulate sync with OncologyResearchHub API
    const hubResponse = await syncWithResearchHub()

    const results = []

    for (const research of [...syncData, ...hubResponse.data]) {
      // Check cache first
      const cacheKey = `research:${research.cosmic_id || research.nih_reference_id}`
      const cached = await redis.get(cacheKey)

      if (cached) {
        console.log(`Using cached data for ${cacheKey}`)
        results.push(cached)
        continue
      }

      // Insert research data
      const { data: researchRecord, error: researchError } = await supabase
        .from("genomic_research")
        .insert({
          title: research.title,
          description: research.description,
          cosmic_id: research.cosmic_id,
          nih_reference_id: research.nih_reference_id,
          user_id: "00000000-0000-0000-0000-000000000000", // System user
          is_public: true,
        })
        .select()
        .single()

      if (researchError) {
        console.error("Error inserting research:", researchError)
        continue
      }

      // Insert variants
      if (research.variants && research.variants.length > 0) {
        const variantsToInsert = research.variants.map((variant) => ({
          research_id: researchRecord.id,
          chromosome: variant.chromosome,
          position: variant.position,
          reference_allele: variant.reference_allele,
          alternate_allele: variant.alternate_allele,
          gene: variant.gene,
          consequence: variant.consequence,
          clinical_significance: variant.clinical_significance,
          cosmic_variant_id: variant.cosmic_variant_id,
          nih_variant_id: variant.nih_variant_id,
        }))

        const { error: variantsError } = await supabase.from("genomic_variants").insert(variantsToInsert)

        if (variantsError) {
          console.error("Error inserting variants:", variantsError)
        }
      }

      // Cache the result for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(researchRecord))
      results.push(researchRecord)
    }

    // Log the sync
    await supabase.from("sync_logs").insert({
      source: "oncology_research_hub",
      records_synced: results.length,
      status: "success",
    })

    return NextResponse.json({
      success: true,
      synced_records: results.length,
      data: results,
    })
  } catch (error) {
    console.error("Sync error:", error)

    // Log the error
    const supabase = createServerSupabaseClient()
    await supabase.from("sync_logs").insert({
      source: "oncology_research_hub",
      records_synced: 0,
      status: "error",
      error_message: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get recent sync logs
    const { data: syncLogs } = await supabase
      .from("sync_logs")
      .select("*")
      .order("sync_time", { ascending: false })
      .limit(10)

    // Get cached research count
    const keys = await redis.keys("research:*")
    const cachedCount = keys.length

    return NextResponse.json({
      recent_syncs: syncLogs,
      cached_records: cachedCount,
    })
  } catch (error) {
    console.error("Error getting sync status:", error)
    return NextResponse.json({ error: "Failed to get sync status" }, { status: 500 })
  }
}

// Mock function to simulate OncologyResearchHub API
async function syncWithResearchHub(): Promise<{ data: ResearchSyncData[] }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    data: [
      {
        title: "BRCA1 Mutations in Triple-Negative Breast Cancer",
        description: "Comprehensive analysis of BRCA1 mutations and their clinical implications",
        cosmic_id: "COSMIC_001",
        nih_reference_id: "NIH_BRCA1_2024",
        variants: [
          {
            chromosome: "17",
            position: 43094692,
            reference_allele: "G",
            alternate_allele: "A",
            gene: "BRCA1",
            consequence: "missense_variant",
            clinical_significance: "pathogenic",
            cosmic_variant_id: "COSV57014428",
            nih_variant_id: "rs80357382",
          },
          {
            chromosome: "17",
            position: 43095845,
            reference_allele: "C",
            alternate_allele: "T",
            gene: "BRCA1",
            consequence: "nonsense",
            clinical_significance: "pathogenic",
            cosmic_variant_id: "COSV57014429",
            nih_variant_id: "rs80357383",
          },
        ],
      },
      {
        title: "TP53 Pathway Alterations in Lung Cancer",
        description: "Analysis of TP53 mutations and pathway disruptions in NSCLC",
        cosmic_id: "COSMIC_002",
        nih_reference_id: "NIH_TP53_2024",
        variants: [
          {
            chromosome: "17",
            position: 7673803,
            reference_allele: "G",
            alternate_allele: "A",
            gene: "TP53",
            consequence: "missense_variant",
            clinical_significance: "likely_pathogenic",
            cosmic_variant_id: "COSV57014430",
            nih_variant_id: "rs121913343",
          },
        ],
      },
    ],
  }
}
