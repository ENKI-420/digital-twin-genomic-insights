import { Redis } from "@upstash/redis"
import { createClient } from "@/lib/supabase/client"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface GenomicProfile {
  gene: string
  variant?: string
  expression?: "high" | "low" | "normal"
  biomarker?: string
  confidence?: number
}

export interface GenomicCriterion {
  gene: string
  variant?: string
  expression?: "high" | "low" | "normal"
  biomarker?: string
  required: boolean
}

export interface TrialMatch {
  trialId: string
  patientId: string
  matchScore: number
  eligibilityStatus: "eligible" | "potentially_eligible" | "ineligible"
  genomicMatch: boolean
  clinicalMatch: boolean
  matchDetails: {
    matchedCriteria: string[]
    unmatchedCriteria: string[]
    notes: string[]
  }
}

export class TrialMatchingService {
  /**
   * Calculate genomic match score between patient profile and trial criteria
   */
  static calculateGenomicMatchScore(
    patientGenomics: GenomicProfile[],
    trialCriteria: GenomicCriterion[],
  ): {
    score: number
    matchedCriteria: string[]
    unmatchedCriteria: string[]
    notes: string[]
  } {
    if (!trialCriteria.length) {
      return {
        score: 1.0,
        matchedCriteria: [],
        unmatchedCriteria: [],
        notes: ["No genomic criteria specified for this trial"],
      }
    }

    if (!patientGenomics.length) {
      return {
        score: 0.0,
        matchedCriteria: [],
        unmatchedCriteria: trialCriteria.map((c) => c.gene),
        notes: ["No genomic profile available for patient"],
      }
    }

    let totalScore = 0
    let requiredCriteriaCount = 0
    let requiredCriteriaMet = 0
    const matchedCriteria: string[] = []
    const unmatchedCriteria: string[] = []
    const notes: string[] = []

    // Check each trial criterion
    for (const criterion of trialCriteria) {
      if (criterion.required) requiredCriteriaCount++

      // Find matching patient genomic profile for this gene
      const matchingProfiles = patientGenomics.filter((p) => p.gene === criterion.gene)

      if (matchingProfiles.length) {
        let bestProfileScore = 0
        let bestProfileMatch = false

        // Check each matching profile for this gene
        for (const profile of matchingProfiles) {
          let criterionScore = 0.5 // Base score for gene match
          const criterionNotes: string[] = []

          // Check variant match if specified
          if (criterion.variant && profile.variant) {
            if (criterion.variant === profile.variant) {
              criterionScore += 0.3
              criterionNotes.push(`Variant match: ${criterion.variant}`)
            } else {
              criterionScore -= 0.1
              criterionNotes.push(`Variant mismatch: expected ${criterion.variant}, found ${profile.variant}`)
            }
          }

          // Check expression match if specified
          if (criterion.expression && profile.expression) {
            if (criterion.expression === profile.expression) {
              criterionScore += 0.2
              criterionNotes.push(`Expression match: ${criterion.expression}`)
            } else {
              criterionScore -= 0.1
              criterionNotes.push(`Expression mismatch: expected ${criterion.expression}, found ${profile.expression}`)
            }
          }

          // Check biomarker match if specified
          if (criterion.biomarker && profile.biomarker) {
            if (criterion.biomarker === profile.biomarker) {
              criterionScore += 0.2
              criterionNotes.push(`Biomarker match: ${criterion.biomarker}`)
            } else {
              criterionScore -= 0.1
              criterionNotes.push(`Biomarker mismatch: expected ${criterion.biomarker}, found ${profile.biomarker}`)
            }
          }

          // Apply confidence weighting if available
          if (profile.confidence) {
            criterionScore *= profile.confidence
            criterionNotes.push(`Confidence factor: ${profile.confidence.toFixed(2)}`)
          }

          // Keep track of best matching profile for this gene
          if (criterionScore > bestProfileScore) {
            bestProfileScore = criterionScore
            bestProfileMatch = criterionScore > 0.5

            if (bestProfileMatch) {
              notes.push(`${criterion.gene}: ${criterionNotes.join(", ")}`)
            }
          }
        }

        totalScore += bestProfileScore

        // Track matched/unmatched criteria
        if (bestProfileMatch) {
          matchedCriteria.push(criterion.gene)

          // Count required criteria that were met
          if (criterion.required) {
            requiredCriteriaMet++
          }
        } else {
          unmatchedCriteria.push(criterion.gene)
        }
      } else {
        unmatchedCriteria.push(criterion.gene)
        notes.push(`${criterion.gene}: No matching profile found`)
      }
    }

    // Calculate average score
    const averageScore = totalScore / trialCriteria.length

    // If any required criteria weren't met, penalize the score
    let finalScore = averageScore
    if (requiredCriteriaCount > 0 && requiredCriteriaMet < requiredCriteriaCount) {
      finalScore = averageScore * (requiredCriteriaMet / requiredCriteriaCount)
      notes.push(`Required criteria penalty: ${requiredCriteriaMet}/${requiredCriteriaCount} met`)
    }

    return {
      score: finalScore,
      matchedCriteria,
      unmatchedCriteria,
      notes,
    }
  }

  /**
   * Get cached match results or calculate new ones
   */
  static async getMatchResults(patientId: string, trialId: string): Promise<TrialMatch | null> {
    const cacheKey = `match:${patientId}:${trialId}`

    // Check cache first
    const cachedMatch = await redis.get(cacheKey)
    if (cachedMatch) {
      return cachedMatch as TrialMatch
    }

    // Calculate match if not in cache
    const match = await this.calculateMatch(patientId, trialId)

    if (match) {
      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, match)
    }

    return match
  }

  /**
   * Calculate match between a patient and a trial
   */
  static async calculateMatch(patientId: string, trialId: string): Promise<TrialMatch | null> {
    const supabase = createClient()

    // Get patient genomic profile
    const { data: patientProfiles, error: profileError } = await supabase
      .from("patient_genomic_profiles")
      .select("*")
      .eq("patient_id", patientId)

    if (profileError) {
      console.error("Error fetching patient genomic profile:", profileError)
      return null
    }

    // Get patient clinical data
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single()

    if (patientError || !patientData) {
      console.error("Error fetching patient data:", patientError)
      return null
    }

    // Get trial criteria
    const { data: trialCriteria, error: criteriaError } = await supabase
      .from("trial_genomic_criteria")
      .select("*")
      .eq("trial_id", trialId)

    if (criteriaError) {
      console.error("Error fetching trial criteria:", criteriaError)
      return null
    }

    // Get trial data
    const { data: trialData, error: trialError } = await supabase
      .from("clinical_trials")
      .select("*")
      .eq("id", trialId)
      .single()

    if (trialError || !trialData) {
      console.error("Error fetching trial data:", trialError)
      return null
    }

    // Calculate genomic match
    const genomicResult = this.calculateGenomicMatchScore(
      patientProfiles as GenomicProfile[],
      trialCriteria as GenomicCriterion[],
    )

    // Check clinical eligibility (condition match)
    const clinicalMatch =
      !trialData.condition ||
      trialData.condition.toLowerCase().includes(patientData.condition?.toLowerCase() || "") ||
      patientData.condition?.toLowerCase().includes(trialData.condition.toLowerCase() || "")

    // Determine overall eligibility
    let eligibilityStatus = "ineligible"
    if (genomicResult.score > 0.8 && clinicalMatch) {
      eligibilityStatus = "eligible"
    } else if (genomicResult.score > 0.5 && clinicalMatch) {
      eligibilityStatus = "potentially_eligible"
    }

    return {
      trialId,
      patientId,
      matchScore: genomicResult.score,
      eligibilityStatus: eligibilityStatus as "eligible" | "potentially_eligible" | "ineligible",
      genomicMatch: genomicResult.score > 0.5,
      clinicalMatch,
      matchDetails: {
        matchedCriteria: genomicResult.matchedCriteria,
        unmatchedCriteria: genomicResult.unmatchedCriteria,
        notes: genomicResult.notes,
      },
    }
  }

  /**
   * Clear match cache for a patient or trial
   */
  static async clearMatchCache(patientId?: string, trialId?: string): Promise<void> {
    let pattern = "match:"

    if (patientId && trialId) {
      pattern = `match:${patientId}:${trialId}`
    } else if (patientId) {
      pattern = `match:${patientId}:*`
    } else if (trialId) {
      pattern = `match:*:${trialId}`
    }

    const keys = await redis.keys(pattern)

    for (const key of keys) {
      await redis.del(key)
    }
  }
}
