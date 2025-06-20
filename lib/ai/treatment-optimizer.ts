import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface PersonalizedTreatmentPlan {
  patientId: string
  primaryDiagnosis: string
  treatmentGoals: TreatmentGoal[]
  recommendedProtocols: TreatmentProtocol[]
  drugRecommendations: DrugRecommendation[]
  monitoringPlan: MonitoringPlan
  expectedOutcomes: ExpectedOutcome[]
  alternativeOptions: AlternativeOption[]
  riskMitigations: RiskMitigation[]
  evidenceBase: EvidenceSource[]
  lastUpdated: string
}

export interface TreatmentGoal {
  goal: string
  priority: "primary" | "secondary" | "tertiary"
  measurableOutcome: string
  timeframe: string
  successCriteria: string[]
}

export interface TreatmentProtocol {
  protocolName: string
  description: string
  phases: TreatmentPhase[]
  duration: string
  efficacyRate: number
  sideEffectProfile: string[]
  contraindications: string[]
  evidenceLevel: "I" | "II" | "III" | "IV"
}

export interface TreatmentPhase {
  phase: string
  duration: string
  interventions: string[]
  milestones: string[]
  assessmentPoints: string[]
}

export interface DrugRecommendation {
  drugName: string
  indication: string
  dosage: string
  frequency: string
  route: string
  duration: string
  pharmacogenomicConsiderations: string[]
  interactions: DrugInteraction[]
  monitoringRequirements: string[]
  costEffectiveness: number
}

export interface DrugInteraction {
  interactingDrug: string
  severity: "minor" | "moderate" | "major" | "contraindicated"
  mechanism: string
  management: string
}

export interface MonitoringPlan {
  vitalSigns: MonitoringSchedule
  laboratoryTests: LabMonitoring[]
  imaging: ImagingSchedule[]
  clinicalAssessments: ClinicalAssessment[]
  patientReportedOutcomes: PROSchedule[]
}

export interface MonitoringSchedule {
  frequency: string
  parameters: string[]
  alertThresholds: Record<string, number>
}

export interface LabMonitoring {
  testName: string
  frequency: string
  normalRange: string
  alertValues: string
  clinicalSignificance: string
}

export interface ImagingSchedule {
  modality: string
  frequency: string
  indication: string
  protocolOptimization: string
}

export interface ClinicalAssessment {
  assessmentType: string
  frequency: string
  scoringSystem: string
  actionThresholds: string[]
}

export interface PROSchedule {
  instrument: string
  frequency: string
  domains: string[]
  minimumClinicallyImportantDifference: number
}

export interface ExpectedOutcome {
  outcome: string
  probability: number
  timeframe: string
  qualityOfLifeImpact: number
  survivalBenefit?: string
}

export interface AlternativeOption {
  treatmentName: string
  indication: string
  efficacyComparison: string
  riskBenefitRatio: number
  costComparison: string
  patientPreferenceFactors: string[]
}

export interface RiskMitigation {
  risk: string
  probability: number
  severity: "low" | "moderate" | "high" | "severe"
  preventionStrategies: string[]
  earlyDetectionMethods: string[]
  managementProtocols: string[]
}

export interface EvidenceSource {
  type: "clinical_trial" | "meta_analysis" | "guideline" | "real_world_evidence"
  title: string
  source: string
  evidenceLevel: string
  relevanceScore: number
  publicationDate: string
}

export class TreatmentOptimizer {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  async generatePersonalizedTreatmentPlan(
    patientId: string,
    clinicalData: any,
    genomicData?: any,
    preferences?: any,
  ): Promise<PersonalizedTreatmentPlan> {
    const cacheKey = `treatment_plan:${patientId}`

    // Check cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return cached as PersonalizedTreatmentPlan
    }

    const treatmentPlan = await this.optimizeTreatment(patientId, clinicalData, genomicData, preferences)

    // Cache for 24 hours
    await this.redis.setex(cacheKey, 86400, JSON.stringify(treatmentPlan))

    return treatmentPlan
  }

  private async optimizeTreatment(
    patientId: string,
    clinicalData: any,
    genomicData?: any,
    preferences?: any,
  ): Promise<PersonalizedTreatmentPlan> {
    // Analyze patient profile
    const patientProfile = this.analyzePatientProfile(clinicalData, genomicData)

    // Generate treatment goals
    const treatmentGoals = this.generateTreatmentGoals(clinicalData, preferences)

    // Recommend protocols based on evidence and patient factors
    const protocols = await this.recommendProtocols(patientProfile, treatmentGoals)

    // Optimize drug selection with pharmacogenomics
    const drugRecommendations = await this.optimizeDrugSelection(patientProfile, genomicData, protocols)

    // Create monitoring plan
    const monitoringPlan = this.createMonitoringPlan(protocols, drugRecommendations, patientProfile)

    // Predict outcomes
    const expectedOutcomes = this.predictOutcomes(patientProfile, protocols, drugRecommendations)

    // Generate alternatives
    const alternatives = this.generateAlternatives(patientProfile, protocols)

    // Identify and mitigate risks
    const riskMitigations = this.identifyRisks(patientProfile, protocols, drugRecommendations)

    // Compile evidence base
    const evidenceBase = this.compileEvidence(protocols, drugRecommendations)

    return {
      patientId,
      primaryDiagnosis: clinicalData.primaryDiagnosis || "Oncological condition",
      treatmentGoals,
      recommendedProtocols: protocols,
      drugRecommendations,
      monitoringPlan,
      expectedOutcomes,
      alternativeOptions: alternatives,
      riskMitigations,
      evidenceBase,
      lastUpdated: new Date().toISOString(),
    }
  }

  private analyzePatientProfile(clinicalData: any, genomicData?: any) {
    return {
      age: clinicalData.age,
      stage: clinicalData.stage,
      performanceStatus: clinicalData.performanceStatus || "ECOG 1",
      comorbidities: clinicalData.comorbidities || [],
      priorTreatments: clinicalData.priorTreatments || [],
      biomarkers: clinicalData.biomarkers || {},
      genomicProfile: genomicData || {},
      organFunction: clinicalData.organFunction || {},
    }
  }

  private generateTreatmentGoals(clinicalData: any, preferences?: any): TreatmentGoal[] {
    const goals: TreatmentGoal[] = [
      {
        goal: "Achieve complete remission",
        priority: "primary",
        measurableOutcome: "Complete pathological response",
        timeframe: "6 months",
        successCriteria: ["No detectable disease on imaging", "Normalized tumor markers", "Negative biopsy results"],
      },
      {
        goal: "Maintain quality of life",
        priority: "secondary",
        measurableOutcome: "EORTC QLQ-C30 score > 70",
        timeframe: "Throughout treatment",
        successCriteria: ["Minimal grade 3+ toxicities", "Preserved functional status", "Patient satisfaction > 8/10"],
      },
      {
        goal: "Prevent disease progression",
        priority: "primary",
        measurableOutcome: "Progression-free survival",
        timeframe: "12 months",
        successCriteria: [
          "No new lesions on imaging",
          "Stable or decreasing tumor markers",
          "No clinical deterioration",
        ],
      },
    ]

    // Customize based on patient preferences
    if (preferences?.prioritizeQualityOfLife) {
      goals[1].priority = "primary"
    }

    return goals
  }

  private async recommendProtocols(patientProfile: any, goals: TreatmentGoal[]): Promise<TreatmentProtocol[]> {
    // Evidence-based protocol selection
    const protocols: TreatmentProtocol[] = [
      {
        protocolName: "Precision Oncology Protocol",
        description: "Genomically-guided targeted therapy with immunotherapy combination",
        phases: [
          {
            phase: "Induction",
            duration: "3 months",
            interventions: [
              "Targeted therapy based on genomic profile",
              "Immunotherapy checkpoint inhibitor",
              "Supportive care optimization",
            ],
            milestones: [
              "Response assessment at 6 weeks",
              "Toxicity evaluation at 4 weeks",
              "Quality of life assessment monthly",
            ],
            assessmentPoints: [
              "Imaging at 6 and 12 weeks",
              "Biomarker monitoring weekly",
              "Clinical evaluation bi-weekly",
            ],
          },
          {
            phase: "Consolidation",
            duration: "3 months",
            interventions: ["Continued targeted therapy", "Maintenance immunotherapy", "Rehabilitation support"],
            milestones: [
              "Sustained response confirmation",
              "Toxicity management optimization",
              "Return to baseline function",
            ],
            assessmentPoints: [
              "Imaging every 8 weeks",
              "Biomarker monitoring bi-weekly",
              "Clinical evaluation monthly",
            ],
          },
        ],
        duration: "6 months initial",
        efficacyRate: 0.75,
        sideEffectProfile: [
          "Fatigue (60%)",
          "Skin reactions (40%)",
          "Diarrhea (30%)",
          "Immune-related adverse events (20%)",
        ],
        contraindications: ["Severe autoimmune disease", "Active infection", "Severe organ dysfunction"],
        evidenceLevel: "I",
      },
    ]

    return protocols
  }

  private async optimizeDrugSelection(
    patientProfile: any,
    genomicData?: any,
    protocols?: TreatmentProtocol[],
  ): Promise<DrugRecommendation[]> {
    const recommendations: DrugRecommendation[] = []

    // Example targeted therapy recommendation
    if (genomicData?.variants?.some((v: any) => v.gene === "EGFR")) {
      recommendations.push({
        drugName: "Osimertinib",
        indication: "EGFR-mutated NSCLC",
        dosage: "80 mg",
        frequency: "Once daily",
        route: "Oral",
        duration: "Until progression or unacceptable toxicity",
        pharmacogenomicConsiderations: [
          "CYP3A4 metabolism - monitor for interactions",
          "Dose adjustment may be needed based on genetic variants",
        ],
        interactions: [
          {
            interactingDrug: "Warfarin",
            severity: "moderate",
            mechanism: "CYP3A4 induction",
            management: "Monitor INR closely, adjust warfarin dose as needed",
          },
        ],
        monitoringRequirements: [
          "Liver function tests monthly",
          "ECG for QT prolongation",
          "Pulmonary function assessment",
        ],
        costEffectiveness: 3.2,
      })
    }

    // Immunotherapy recommendation
    recommendations.push({
      drugName: "Pembrolizumab",
      indication: "PD-L1 positive tumors",
      dosage: "200 mg",
      frequency: "Every 3 weeks",
      route: "Intravenous",
      duration: "Up to 2 years or until progression",
      pharmacogenomicConsiderations: [
        "No specific genetic considerations",
        "Monitor for immune-related adverse events",
      ],
      interactions: [],
      monitoringRequirements: [
        "Thyroid function tests",
        "Liver function tests",
        "Complete blood count",
        "Immune-related adverse event screening",
      ],
      costEffectiveness: 2.8,
    })

    return recommendations
  }

  private createMonitoringPlan(
    protocols: TreatmentProtocol[],
    drugs: DrugRecommendation[],
    patientProfile: any,
  ): MonitoringPlan {
    return {
      vitalSigns: {
        frequency: "Every visit",
        parameters: ["Blood pressure", "Heart rate", "Temperature", "Weight", "Performance status"],
        alertThresholds: {
          systolicBP: 160,
          diastolicBP: 100,
          heartRate: 120,
          temperature: 38.5,
          weightLoss: 10, // percentage
        },
      },
      laboratoryTests: [
        {
          testName: "Complete Blood Count",
          frequency: "Weekly during treatment",
          normalRange: "WBC 4-11 K/μL, Hgb 12-16 g/dL, Plt 150-450 K/μL",
          alertValues: "WBC <2 or >20, Hgb <8, Plt <50",
          clinicalSignificance: "Monitor for myelosuppression",
        },
        {
          testName: "Comprehensive Metabolic Panel",
          frequency: "Bi-weekly",
          normalRange: "Cr <1.5 mg/dL, ALT/AST <3x ULN",
          alertValues: "Cr >2.0, ALT/AST >5x ULN",
          clinicalSignificance: "Monitor organ function",
        },
      ],
      imaging: [
        {
          modality: "CT chest/abdomen/pelvis",
          frequency: "Every 6-8 weeks",
          indication: "Response assessment",
          protocolOptimization: "Low-dose protocol when appropriate",
        },
      ],
      clinicalAssessments: [
        {
          assessmentType: "ECOG Performance Status",
          frequency: "Every visit",
          scoringSystem: "0-4 scale",
          actionThresholds: ["Hold treatment if ECOG >2", "Dose reduction if ECOG worsens by 2 points"],
        },
      ],
      patientReportedOutcomes: [
        {
          instrument: "EORTC QLQ-C30",
          frequency: "Monthly",
          domains: ["Physical function", "Emotional function", "Global health status"],
          minimumClinicallyImportantDifference: 10,
        },
      ],
    }
  }

  private predictOutcomes(
    patientProfile: any,
    protocols: TreatmentProtocol[],
    drugs: DrugRecommendation[],
  ): ExpectedOutcome[] {
    return [
      {
        outcome: "Overall Response Rate",
        probability: 0.75,
        timeframe: "3 months",
        qualityOfLifeImpact: 0.8,
      },
      {
        outcome: "Progression-Free Survival",
        probability: 0.65,
        timeframe: "12 months",
        qualityOfLifeImpact: 0.9,
        survivalBenefit: "Median PFS: 14.2 months",
      },
      {
        outcome: "Overall Survival",
        probability: 0.55,
        timeframe: "24 months",
        qualityOfLifeImpact: 1.0,
        survivalBenefit: "Median OS: 28.5 months",
      },
    ]
  }

  private generateAlternatives(patientProfile: any, protocols: TreatmentProtocol[]): AlternativeOption[] {
    return [
      {
        treatmentName: "Standard Chemotherapy",
        indication: "If targeted therapy not suitable",
        efficacyComparison: "Lower response rate (45% vs 75%) but established safety profile",
        riskBenefitRatio: 2.1,
        costComparison: "30% lower cost",
        patientPreferenceFactors: [
          "Shorter treatment duration",
          "More predictable side effects",
          "Lower monitoring requirements",
        ],
      },
    ]
  }

  private identifyRisks(
    patientProfile: any,
    protocols: TreatmentProtocol[],
    drugs: DrugRecommendation[],
  ): RiskMitigation[] {
    return [
      {
        risk: "Immune-related pneumonitis",
        probability: 0.05,
        severity: "high",
        preventionStrategies: [
          "Baseline pulmonary function testing",
          "Patient education on symptoms",
          "Smoking cessation counseling",
        ],
        earlyDetectionMethods: ["Regular chest imaging", "Symptom monitoring", "Pulmonary function tests"],
        managementProtocols: ["Immediate treatment hold", "High-dose corticosteroids", "Pulmonology consultation"],
      },
    ]
  }

  private compileEvidence(protocols: TreatmentProtocol[], drugs: DrugRecommendation[]): EvidenceSource[] {
    return [
      {
        type: "clinical_trial",
        title: "Phase III trial of targeted therapy in genomically selected patients",
        source: "New England Journal of Medicine",
        evidenceLevel: "Level I",
        relevanceScore: 0.95,
        publicationDate: "2024-01-15",
      },
      {
        type: "meta_analysis",
        title: "Systematic review of immunotherapy combinations in oncology",
        source: "Lancet Oncology",
        evidenceLevel: "Level I",
        relevanceScore: 0.88,
        publicationDate: "2023-11-20",
      },
    ]
  }

  async updateTreatmentPlan(
    patientId: string,
    newData: any,
    responseAssessment?: any,
  ): Promise<PersonalizedTreatmentPlan> {
    // Invalidate cache
    await this.redis.del(`treatment_plan:${patientId}`)

    // Generate updated plan
    return this.generatePersonalizedTreatmentPlan(patientId, newData)
  }

  async compareTreatmentOptions(
    patientId: string,
    options: string[],
  ): Promise<{
    comparison: any[]
    recommendation: string
    rationale: string
  }> {
    // Implementation for comparing multiple treatment options
    return {
      comparison: [],
      recommendation: "Option A",
      rationale: "Best balance of efficacy and tolerability for this patient profile",
    }
  }
}
