import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface MutationAnalysisRequest {
  patientId: string
  genomicData: {
    variants: GenomicVariant[]
    sequencingMetadata: {
      platform: string
      coverage: number
      quality: number
    }
  }
  clinicalContext: {
    diagnosis?: string
    medications?: string[]
    familyHistory?: string[]
    phenotypes?: string[]
  }
}

export interface GenomicVariant {
  chromosome: string
  position: number
  ref: string
  alt: string
  gene: string
  transcript: string
  consequence: string
  clinvarId?: string
  dbsnpId?: string
  alleleFrequency: number
  zygosity: "homozygous" | "heterozygous"
  quality: number
  depth: number
}

export interface MutationAnalysisResult {
  analysisId: string
  patientId: string
  timestamp: string
  results: {
    pathogenicVariants: PathogenicVariant[]
    pharmacogenomicVariants: PharmacogenomicVariant[]
    riskAssessment: RiskAssessment
    treatmentRecommendations: TreatmentRecommendation[]
    clinicalTrialMatches: TrialMatch[]
  }
  confidence: number
  processingTime: number
}

export interface PathogenicVariant {
  variant: GenomicVariant
  classification: "pathogenic" | "likely_pathogenic" | "vus" | "likely_benign" | "benign"
  evidence: {
    clinvarStars: number
    literatureSupport: number
    functionalEvidence: string[]
    populationData: {
      gnomadFrequency: number
      clinvarSubmissions: number
    }
  }
  clinicalSignificance: {
    disease: string
    inheritance: string
    penetrance: number
    actionability: "high" | "medium" | "low"
  }
}

export interface PharmacogenomicVariant {
  variant: GenomicVariant
  drug: string
  effect: "increased_sensitivity" | "decreased_sensitivity" | "toxicity_risk" | "no_effect"
  recommendation: string
  evidence: {
    cpicLevel: "A" | "B" | "C" | "D"
    fdaLabel: boolean
    studies: number
  }
}

export interface RiskAssessment {
  overallRisk: "high" | "moderate" | "low"
  diseaseRisks: {
    condition: string
    risk: number
    confidence: number
    timeframe: string
  }[]
  actionableFindings: number
  incidentalFindings: number
}

export interface TreatmentRecommendation {
  category: "medication" | "monitoring" | "lifestyle" | "referral"
  recommendation: string
  priority: "urgent" | "high" | "medium" | "low"
  evidence: string
  contraindications?: string[]
}

export interface TrialMatch {
  nctId: string
  title: string
  phase: string
  matchScore: number
  eligibilityCriteria: {
    met: string[]
    notMet: string[]
    unknown: string[]
  }
  location: string
  contact: string
}

export class MutationAnalysisPipeline {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  async analyzeMutations(request: MutationAnalysisRequest): Promise<MutationAnalysisResult> {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    try {
      // Store analysis request
      await this.redis.setex(`analysis_request:${analysisId}`, 3600, JSON.stringify(request))

      // Step 1: Variant Classification
      const pathogenicVariants = await this.classifyVariants(request.genomicData.variants)

      // Step 2: Pharmacogenomic Analysis
      const pharmacogenomicVariants = await this.analyzePharmacogenomics(
        request.genomicData.variants,
        request.clinicalContext.medications || [],
      )

      // Step 3: Risk Assessment
      const riskAssessment = await this.assessRisk(pathogenicVariants, request.clinicalContext)

      // Step 4: Treatment Recommendations
      const treatmentRecommendations = await this.generateTreatmentRecommendations(
        pathogenicVariants,
        pharmacogenomicVariants,
        request.clinicalContext,
      )

      // Step 5: Clinical Trial Matching
      const clinicalTrialMatches = await this.matchClinicalTrials(pathogenicVariants, request.clinicalContext)

      const processingTime = Date.now() - startTime
      const confidence = this.calculateConfidence(
        pathogenicVariants,
        pharmacogenomicVariants,
        request.genomicData.sequencingMetadata,
      )

      const result: MutationAnalysisResult = {
        analysisId,
        patientId: request.patientId,
        timestamp: new Date().toISOString(),
        results: {
          pathogenicVariants,
          pharmacogenomicVariants,
          riskAssessment,
          treatmentRecommendations,
          clinicalTrialMatches,
        },
        confidence,
        processingTime,
      }

      // Cache results
      await this.redis.setex(
        `analysis_result:${analysisId}`,
        86400, // 24 hours
        JSON.stringify(result),
      )

      return result
    } catch (error) {
      console.error("Mutation analysis failed:", error)
      throw new Error(`Analysis failed: ${error}`)
    }
  }

  private async classifyVariants(variants: GenomicVariant[]): Promise<PathogenicVariant[]> {
    const pathogenicVariants: PathogenicVariant[] = []

    for (const variant of variants) {
      // Simulate AI-powered variant classification
      const classification = await this.classifySingleVariant(variant)

      if (classification.classification !== "benign" && classification.classification !== "likely_benign") {
        pathogenicVariants.push(classification)
      }
    }

    return pathogenicVariants
  }

  private async classifySingleVariant(variant: GenomicVariant): Promise<PathogenicVariant> {
    // Simulate comprehensive variant analysis
    const knownPathogenicGenes = [
      "BRCA1",
      "BRCA2",
      "TP53",
      "APC",
      "MLH1",
      "MSH2",
      "MSH6",
      "PMS2",
      "ATM",
      "CHEK2",
      "PALB2",
      "CDH1",
      "PTEN",
      "STK11",
      "VHL",
    ]

    const isKnownGene = knownPathogenicGenes.includes(variant.gene)
    const isRareVariant = variant.alleleFrequency < 0.01
    const isHighQuality = variant.quality > 30 && variant.depth > 10

    let classification: PathogenicVariant["classification"] = "benign"
    let clinvarStars = Math.floor(Math.random() * 5)
    let actionability: "high" | "medium" | "low" = "low"

    if (isKnownGene && isRareVariant && isHighQuality) {
      if (variant.consequence.includes("frameshift") || variant.consequence.includes("nonsense")) {
        classification = "pathogenic"
        clinvarStars = 4
        actionability = "high"
      } else if (variant.consequence.includes("missense")) {
        classification = Math.random() > 0.5 ? "likely_pathogenic" : "vus"
        clinvarStars = 3
        actionability = "medium"
      }
    } else if (isRareVariant && variant.consequence.includes("missense")) {
      classification = "vus"
      clinvarStars = 2
      actionability = "low"
    }

    return {
      variant,
      classification,
      evidence: {
        clinvarStars,
        literatureSupport: Math.floor(Math.random() * 100),
        functionalEvidence: this.getFunctionalEvidence(variant),
        populationData: {
          gnomadFrequency: variant.alleleFrequency,
          clinvarSubmissions: Math.floor(Math.random() * 50),
        },
      },
      clinicalSignificance: {
        disease: this.getAssociatedDisease(variant.gene),
        inheritance: Math.random() > 0.5 ? "autosomal_dominant" : "autosomal_recessive",
        penetrance: Math.random() * 0.8 + 0.2, // 20-100%
        actionability,
      },
    }
  }

  private async analyzePharmacogenomics(
    variants: GenomicVariant[],
    medications: string[],
  ): Promise<PharmacogenomicVariant[]> {
    const pgxVariants: PharmacogenomicVariant[] = []

    // Known pharmacogenomic genes
    const pgxGenes = ["CYP2D6", "CYP2C19", "CYP3A4", "DPYD", "TPMT", "UGT1A1", "SLCO1B1"]

    for (const variant of variants) {
      if (pgxGenes.includes(variant.gene)) {
        for (const medication of medications) {
          const pgxVariant = await this.analyzePgxVariant(variant, medication)
          if (pgxVariant) {
            pgxVariants.push(pgxVariant)
          }
        }
      }
    }

    return pgxVariants
  }

  private async analyzePgxVariant(variant: GenomicVariant, medication: string): Promise<PharmacogenomicVariant | null> {
    // Simulate pharmacogenomic analysis
    const drugGeneInteractions: Record<string, string[]> = {
      CYP2D6: ["codeine", "tramadol", "metoprolol", "fluoxetine"],
      CYP2C19: ["clopidogrel", "omeprazole", "escitalopram"],
      DPYD: ["5-fluorouracil", "capecitabine"],
      TPMT: ["azathioprine", "mercaptopurine"],
      UGT1A1: ["irinotecan"],
      SLCO1B1: ["simvastatin", "atorvastatin"],
    }

    const relevantDrugs = drugGeneInteractions[variant.gene] || []
    const isRelevant = relevantDrugs.some((drug) => medication.toLowerCase().includes(drug.toLowerCase()))

    if (!isRelevant) return null

    const effects = ["increased_sensitivity", "decreased_sensitivity", "toxicity_risk", "no_effect"] as const
    const effect = effects[Math.floor(Math.random() * effects.length)]

    return {
      variant,
      drug: medication,
      effect,
      recommendation: this.generatePgxRecommendation(variant.gene, medication, effect),
      evidence: {
        cpicLevel: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)] as "A" | "B" | "C" | "D",
        fdaLabel: Math.random() > 0.5,
        studies: Math.floor(Math.random() * 20) + 5,
      },
    }
  }

  private async assessRisk(
    pathogenicVariants: PathogenicVariant[],
    clinicalContext: MutationAnalysisRequest["clinicalContext"],
  ): Promise<RiskAssessment> {
    const highRiskVariants = pathogenicVariants.filter(
      (v) => v.classification === "pathogenic" && v.clinicalSignificance.actionability === "high",
    )

    const overallRisk: "high" | "moderate" | "low" =
      highRiskVariants.length > 2 ? "high" : highRiskVariants.length > 0 ? "moderate" : "low"

    const diseaseRisks = pathogenicVariants.map((variant) => ({
      condition: variant.clinicalSignificance.disease,
      risk: variant.clinicalSignificance.penetrance,
      confidence: variant.evidence.clinvarStars / 4,
      timeframe: "lifetime",
    }))

    return {
      overallRisk,
      diseaseRisks,
      actionableFindings: pathogenicVariants.filter((v) => v.clinicalSignificance.actionability === "high").length,
      incidentalFindings: pathogenicVariants.filter(
        (v) => !clinicalContext.diagnosis?.toLowerCase().includes(v.clinicalSignificance.disease.toLowerCase()),
      ).length,
    }
  }

  private async generateTreatmentRecommendations(
    pathogenicVariants: PathogenicVariant[],
    pharmacogenomicVariants: PharmacogenomicVariant[],
    clinicalContext: MutationAnalysisRequest["clinicalContext"],
  ): Promise<TreatmentRecommendation[]> {
    const recommendations: TreatmentRecommendation[] = []

    // High-priority pathogenic variants
    for (const variant of pathogenicVariants) {
      if (variant.clinicalSignificance.actionability === "high") {
        recommendations.push({
          category: "monitoring",
          recommendation: `Enhanced screening for ${variant.clinicalSignificance.disease} due to ${variant.variant.gene} variant`,
          priority: "high",
          evidence: `Pathogenic variant with ${variant.evidence.clinvarStars}-star ClinVar evidence`,
        })
      }
    }

    // Pharmacogenomic recommendations
    for (const pgxVariant of pharmacogenomicVariants) {
      if (pgxVariant.effect !== "no_effect") {
        recommendations.push({
          category: "medication",
          recommendation: pgxVariant.recommendation,
          priority: pgxVariant.effect === "toxicity_risk" ? "urgent" : "medium",
          evidence: `CPIC Level ${pgxVariant.evidence.cpicLevel} evidence`,
        })
      }
    }

    return recommendations
  }

  private async matchClinicalTrials(
    pathogenicVariants: PathogenicVariant[],
    clinicalContext: MutationAnalysisRequest["clinicalContext"],
  ): Promise<TrialMatch[]> {
    // Simulate clinical trial matching
    const mockTrials: TrialMatch[] = [
      {
        nctId: "NCT04567890",
        title: "Targeted Therapy for BRCA1/2 Mutations",
        phase: "Phase II",
        matchScore: 0.85,
        eligibilityCriteria: {
          met: ["BRCA1 mutation", "Age 18-75"],
          notMet: [],
          unknown: ["Prior chemotherapy"],
        },
        location: "Baptist Health Medical Group Hematology & Oncology at Baptist Health Louisville, 4003 Kresge Way, Suite 500, Louisville, KY 40207",
        contact: "502.897.1166",
      },
      {
        nctId: "NCT04123456",
        title: "Immunotherapy for TP53 Wild-type Tumors",
        phase: "Phase I/II",
        matchScore: 0.72,
        eligibilityCriteria: {
          met: ["TP53 wild-type", "Solid tumor"],
          notMet: ["Prior immunotherapy"],
          unknown: [],
        },
        location: "Baptist Health Medical Group Hematology & Oncology at Baptist Health Louisville, 4003 Kresge Way, Suite 500, Louisville, KY 40207",
        contact: "502.897.1166",
      },
    ]

    // Filter based on patient's variants
    return mockTrials.filter((trial) => {
      const relevantGenes = pathogenicVariants.map((v) => v.variant.gene)
      return relevantGenes.some((gene) => trial.title.toLowerCase().includes(gene.toLowerCase()))
    })
  }

  private calculateConfidence(
    pathogenicVariants: PathogenicVariant[],
    pharmacogenomicVariants: PharmacogenomicVariant[],
    sequencingMetadata: { platform: string; coverage: number; quality: number },
  ): number {
    let confidence = 0.5 // Base confidence

    // Quality factors
    if (sequencingMetadata.coverage > 30) confidence += 0.2
    if (sequencingMetadata.quality > 90) confidence += 0.1

    // Evidence factors
    const avgClinvarStars =
      pathogenicVariants.reduce((sum, v) => sum + v.evidence.clinvarStars, 0) / Math.max(pathogenicVariants.length, 1)

    confidence += (avgClinvarStars / 4) * 0.2

    return Math.min(confidence, 1.0)
  }

  // Helper methods
  private getFunctionalEvidence(variant: GenomicVariant): string[] {
    const evidence = []
    if (variant.consequence.includes("frameshift")) evidence.push("Loss of function")
    if (variant.consequence.includes("missense")) evidence.push("Protein structure analysis")
    if (variant.quality > 50) evidence.push("High-quality sequencing")
    return evidence
  }

  private getAssociatedDisease(gene: string): string {
    const diseaseMap: Record<string, string> = {
      BRCA1: "Hereditary breast and ovarian cancer",
      BRCA2: "Hereditary breast and ovarian cancer",
      TP53: "Li-Fraumeni syndrome",
      APC: "Familial adenomatous polyposis",
      MLH1: "Lynch syndrome",
      MSH2: "Lynch syndrome",
      MSH6: "Lynch syndrome",
      PMS2: "Lynch syndrome",
    }
    return diseaseMap[gene] || "Unknown genetic condition"
  }

  private generatePgxRecommendation(gene: string, medication: string, effect: string): string {
    const recommendations: Record<string, Record<string, string>> = {
      CYP2D6: {
        increased_sensitivity: "Consider dose reduction and close monitoring",
        decreased_sensitivity: "Consider alternative medication or increased dose",
        toxicity_risk: "Avoid medication or use with extreme caution",
      },
      DPYD: {
        toxicity_risk: "Contraindicated - high risk of severe toxicity",
        decreased_sensitivity: "Standard dosing may be used",
      },
    }

    return recommendations[gene]?.[effect] || "Consult pharmacogenomics specialist"
  }

  async getAnalysisResult(analysisId: string): Promise<MutationAnalysisResult | null> {
    try {
      const cached = await this.redis.get(`analysis_result:${analysisId}`)
      return cached as MutationAnalysisResult | null
    } catch (error) {
      console.error("Failed to retrieve analysis result:", error)
      return null
    }
  }

  async listPatientAnalyses(patientId: string): Promise<string[]> {
    try {
      // In a real implementation, you'd maintain an index of analyses per patient
      const keys = await this.redis.keys(`analysis_result:*`)
      const analyses = []

      for (const key of keys) {
        const result = await this.redis.get(key)
        if (result && (result as any).patientId === patientId) {
          analyses.push((result as any).analysisId)
        }
      }

      return analyses
    } catch (error) {
      console.error("Failed to list patient analyses:", error)
      return []
    }
  }
}
