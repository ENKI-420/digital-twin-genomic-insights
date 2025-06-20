import { FederatedBaseAgent } from '../federated-base-agent'
import { AgentMessage } from '../orchestration/agent-registry'

export interface CancerDiagnosis {
  cancerType: string
  stage: string
  grade?: string
  biomarkers: Biomarker[]
  molecularProfile: MolecularProfile
  treatmentHistory: TreatmentHistory[]
}

export interface Biomarker {
  name: string
  value: string | number
  unit?: string
  status: 'positive' | 'negative' | 'equivocal'
  clinicalSignificance: string
}

export interface MolecularProfile {
  mutations: Mutation[]
  geneExpression: GeneExpression[]
  copyNumberVariants: CopyNumberVariant[]
  fusionGenes: FusionGene[]
}

export interface Mutation {
  gene: string
  variant: string
  alleleFrequency: number
  clinicalSignificance: string
  therapeuticImplications: string[]
}

export interface GeneExpression {
  gene: string
  expressionLevel: 'high' | 'normal' | 'low'
  foldChange: number
  clinicalRelevance: string
}

export interface CopyNumberVariant {
  gene: string
  type: 'amplification' | 'deletion'
  copyNumber: number
  clinicalSignificance: string
}

export interface FusionGene {
  genes: string[]
  fusionType: string
  clinicalSignificance: string
  targetedTherapies: string[]
}

export interface TreatmentHistory {
  treatment: string
  startDate: string
  endDate?: string
  response: 'complete' | 'partial' | 'stable' | 'progressive'
  toxicity: ToxicityGrade[]
}

export interface ToxicityGrade {
  type: string
  grade: 1 | 2 | 3 | 4 | 5
  description: string
}

export interface TreatmentRecommendation {
  regimen: string
  rationale: string
  evidenceLevel: 'A' | 'B' | 'C' | 'D'
  nccnGuidelines: string[]
  molecularTargets: string[]
  expectedResponse: number
  toxicityProfile: string[]
  alternatives: string[]
  clinicalTrials: ClinicalTrial[]
}

export interface ClinicalTrial {
  id: string
  title: string
  phase: string
  eligibility: string[]
  molecularInclusion: string[]
  location: string
  contact: string
}

export class OncologyAgent extends FederatedBaseAgent {
  constructor() {
    super({
      id: 'oncology-agent-001',
      name: 'Oncology AI Assistant',
      department: 'Oncology',
      capabilities: [
        'treatment_planning',
        'nccn_guidelines',
        'clinical_trials',
        'molecular_analysis',
        'toxicity_monitoring',
        'survival_prediction'
      ],
      requiredPermissions: [
        'patient:read',
        'genomic:read',
        'treatment:plan',
        'trial:match',
        'ai:inference'
      ]
    })
  }

  async processMessage(message: AgentMessage): Promise<void> {
    switch (message.payload.action) {
      case 'urgent_review':
        await this.handleUrgentReview(message.payload)
        break
      case 'pathogenic_variant_detected':
        await this.handlePathogenicVariant(message.payload)
        break
      case 'create_treatment_plan':
        await this.createTreatmentPlan(message.payload.patientId, message.payload.diagnosis)
        break
      case 'match_clinical_trials':
        await this.matchClinicalTrials(message.payload.patientId, message.payload.criteria)
        break
      case 'predict_survival':
        await this.predictSurvival(message.payload.patientId, message.payload.factors)
        break
      case 'monitor_toxicity':
        await this.monitorToxicity(message.payload.patientId, message.payload.treatment)
        break
      default:
        await this.handleUnknownAction(message)
    }
  }

  private async handleUrgentReview(payload: any): Promise<void> {
    try {
      const { studyId, findings } = payload

      // Analyze radiology findings for cancer suspicion
      const cancerRisk = await this.assessCancerRisk(findings)

      if (cancerRisk.probability > 0.7) {
        // High suspicion - escalate to multidisciplinary team
        await this.sendMessage({
          to: 'admin-agent-001',
          type: 'event',
          payload: {
            action: 'schedule_mdt_meeting',
            patientId: payload.patientId,
            urgency: 'urgent',
            reason: 'High cancer suspicion on imaging',
            findings: cancerRisk
          },
          priority: 'critical'
        })

        // Notify patient for urgent follow-up
        await this.sendMessage({
          to: 'notification-agent-001',
          type: 'event',
          payload: {
            action: 'urgent_patient_notification',
            patientId: payload.patientId,
            message: 'Urgent follow-up required for imaging findings',
            priority: 'urgent'
          },
          priority: 'high'
        })
      }

      // Store assessment for future reference
      await this.storeCancerAssessment(studyId, cancerRisk)

    } catch (error) {
      await this.handleError(error, 'handleUrgentReview', payload)
    }
  }

  private async handlePathogenicVariant(payload: any): Promise<void> {
    try {
      const { variant, classification } = payload

      // Check if variant has therapeutic implications
      const therapeuticImplications = await this.analyzeTherapeuticImplications(variant)

      if (therapeuticImplications.length > 0) {
        // Create targeted therapy recommendations
        const recommendations = await this.createTargetedTherapyPlan(
          payload.patientId,
          variant,
          therapeuticImplications
        )

        // Send to clinical team
        await this.sendMessage({
          to: 'notification-agent-001',
          type: 'event',
          payload: {
            action: 'therapeutic_variant_detected',
            patientId: payload.patientId,
            variant,
            recommendations,
            priority: 'high'
          },
          priority: 'high'
        })

        // Update patient's molecular profile
        await this.updateMolecularProfile(payload.patientId, variant)
      }

    } catch (error) {
      await this.handleError(error, 'handlePathogenicVariant', payload)
    }
  }

  private async createTreatmentPlan(patientId: string, diagnosis: CancerDiagnosis): Promise<TreatmentRecommendation> {
    try {
      // Fetch patient's complete profile
      const patientProfile = await this.fetchPatientProfile(patientId)

      // Apply NCCN guidelines
      const nccnRecommendations = await this.applyNCCNGuidelines(diagnosis)

      // Consider molecular profile
      const molecularRecommendations = await this.analyzeMolecularProfile(diagnosis.molecularProfile)

      // Check for clinical trials
      const trialMatches = await this.findRelevantTrials(patientId, diagnosis)

      // Generate personalized treatment plan
      const treatmentPlan: TreatmentRecommendation = {
        regimen: this.selectOptimalRegimen(nccnRecommendations, molecularRecommendations),
        rationale: this.generateRationale(diagnosis, nccnRecommendations, molecularRecommendations),
        evidenceLevel: this.calculateEvidenceLevel(nccnRecommendations, molecularRecommendations),
        nccnGuidelines: nccnRecommendations.guidelines,
        molecularTargets: molecularRecommendations.targets,
        expectedResponse: this.predictResponse(diagnosis, patientProfile),
        toxicityProfile: this.assessToxicityRisk(patientProfile, diagnosis),
        alternatives: this.generateAlternatives(nccnRecommendations, molecularRecommendations),
        clinicalTrials: trialMatches
      }

      // Store treatment plan
      await this.storeTreatmentPlan(patientId, treatmentPlan)

      // Notify care team
      await this.sendMessage({
        to: 'notification-agent-001',
        type: 'event',
        payload: {
          action: 'treatment_plan_ready',
          patientId,
          plan: treatmentPlan,
          priority: 'normal'
        },
        priority: 'normal'
      })

      return treatmentPlan
    } catch (error) {
      await this.handleError(error, 'createTreatmentPlan', { patientId, diagnosis })
      throw error
    }
  }

  private async matchClinicalTrials(patientId: string, criteria: any): Promise<ClinicalTrial[]> {
    try {
      const patientProfile = await this.fetchPatientProfile(patientId)
      const diagnosis = await this.fetchDiagnosis(patientId)

      // Query clinical trial databases
      const trials = await this.queryTrialDatabases({
        cancerType: diagnosis.cancerType,
        stage: diagnosis.stage,
        molecularProfile: diagnosis.molecularProfile,
        age: patientProfile.age,
        performanceStatus: patientProfile.performanceStatus,
        priorTreatments: patientProfile.treatmentHistory
      })

      // Filter and rank trials
      const matchedTrials = trials
        .filter(trial => this.evaluateEligibility(trial, patientProfile))
        .sort((a, b) => this.calculateTrialScore(b, patientProfile) - this.calculateTrialScore(a, patientProfile))

      return matchedTrials.slice(0, 5) // Top 5 matches
    } catch (error) {
      await this.handleError(error, 'matchClinicalTrials', { patientId, criteria })
      return []
    }
  }

  private async predictSurvival(patientId: string, factors: any): Promise<any> {
    try {
      const patientProfile = await this.fetchPatientProfile(patientId)
      const diagnosis = await this.fetchDiagnosis(patientId)

      // Use ML model for survival prediction
      const prediction = await this.runSurvivalModel({
        cancerType: diagnosis.cancerType,
        stage: diagnosis.stage,
        age: patientProfile.age,
        performanceStatus: patientProfile.performanceStatus,
        comorbidities: patientProfile.comorbidities,
        molecularProfile: diagnosis.molecularProfile,
        treatmentHistory: patientProfile.treatmentHistory
      })

      return {
        overallSurvival: prediction.overallSurvival,
        progressionFreeSurvival: prediction.progressionFreeSurvival,
        confidence: prediction.confidence,
        riskFactors: prediction.riskFactors,
        recommendations: prediction.recommendations
      }
    } catch (error) {
      await this.handleError(error, 'predictSurvival', { patientId, factors })
      throw error
    }
  }

  private async monitorToxicity(patientId: string, treatment: any): Promise<void> {
    try {
      const currentToxicity = await this.assessCurrentToxicity(patientId, treatment)

      // Check for severe toxicities
      const severeToxicities = currentToxicity.filter(t => t.grade >= 3)

      if (severeToxicities.length > 0) {
        // Alert care team
        await this.sendMessage({
          to: 'notification-agent-001',
          type: 'event',
          payload: {
            action: 'severe_toxicity_alert',
            patientId,
            toxicities: severeToxicities,
            treatment,
            priority: 'urgent'
          },
          priority: 'critical'
        })

        // Suggest dose modifications
        const doseModifications = await this.suggestDoseModifications(treatment, severeToxicities)

        await this.sendMessage({
          to: 'admin-agent-001',
          type: 'request',
          payload: {
            action: 'review_dose_modification',
            patientId,
            modifications: doseModifications,
            priority: 'high'
          },
          priority: 'high'
        })
      }
    } catch (error) {
      await this.handleError(error, 'monitorToxicity', { patientId, treatment })
    }
  }

  // Helper methods
  private async assessCancerRisk(findings: any): Promise<any> {
    // Mock implementation - would use ML model
    return {
      probability: 0.85,
      confidence: 0.78,
      suspiciousFeatures: findings.map((f: any) => f.type),
      recommendations: ['Biopsy recommended', 'Follow-up imaging in 3 months']
    }
  }

  private async analyzeTherapeuticImplications(variant: any): Promise<string[]> {
    // Mock implementation - would query therapeutic databases
    const therapeuticVariants: Record<string, string[]> = {
      'BRCA1': ['PARP inhibitors', 'Platinum-based chemotherapy'],
      'EGFR': ['EGFR inhibitors', 'Tyrosine kinase inhibitors'],
      'ALK': ['ALK inhibitors', 'Crizotinib', 'Alectinib']
    }

    return therapeuticVariants[variant.gene] || []
  }

  private async applyNCCNGuidelines(diagnosis: CancerDiagnosis): Promise<any> {
    // Mock NCCN guidelines application
    return {
      guidelines: [`NCCN ${diagnosis.cancerType} v2024.1`],
      recommendedRegimens: ['Standard of care', 'Alternative regimen'],
      evidenceLevel: 'A'
    }
  }

  private async analyzeMolecularProfile(profile: MolecularProfile): Promise<any> {
    return {
      targets: profile.mutations.map(m => m.gene),
      actionableMutations: profile.mutations.filter(m => m.therapeuticImplications.length > 0),
      resistanceMarkers: profile.mutations.filter(m => m.clinicalSignificance === 'resistance')
    }
  }

  private async queryTrialDatabases(criteria: any): Promise<ClinicalTrial[]> {
    // Mock trial database query
    return [
      {
        id: 'NCT123456',
        title: 'Novel Targeted Therapy for Advanced Cancer',
        phase: 'II',
        eligibility: ['Age 18+', 'ECOG 0-1'],
        molecularInclusion: ['EGFR mutation'],
        location: 'Multiple sites',
        contact: 'trial@institution.edu'
      }
    ]
  }

  private async runSurvivalModel(factors: any): Promise<any> {
    // Mock survival prediction model
    return {
      overallSurvival: { median: '24 months', confidence: [18, 32] },
      progressionFreeSurvival: { median: '8 months', confidence: [6, 12] },
      confidence: 0.82,
      riskFactors: ['Age', 'Performance status', 'Molecular profile'],
      recommendations: ['Close monitoring', 'Consider clinical trial']
    }
  }

  private async fetchPatientProfile(patientId: string): Promise<any> {
    // Mock patient profile
    return {
      age: 65,
      performanceStatus: 1,
      comorbidities: ['Hypertension', 'Diabetes'],
      treatmentHistory: []
    }
  }

  private async fetchDiagnosis(patientId: string): Promise<CancerDiagnosis> {
    // Mock diagnosis
    return {
      cancerType: 'Non-small cell lung cancer',
      stage: 'IV',
      biomarkers: [],
      molecularProfile: {
        mutations: [],
        geneExpression: [],
        copyNumberVariants: [],
        fusionGenes: []
      },
      treatmentHistory: []
    }
  }

  private selectOptimalRegimen(nccn: any, molecular: any): string {
    return 'Platinum-based chemotherapy + immunotherapy'
  }

  private generateRationale(diagnosis: CancerDiagnosis, nccn: any, molecular: any): string {
    return 'Based on NCCN guidelines and molecular profile analysis'
  }

  private calculateEvidenceLevel(nccn: any, molecular: any): 'A' | 'B' | 'C' | 'D' {
    return 'A'
  }

  private predictResponse(diagnosis: CancerDiagnosis, profile: any): number {
    return 0.75
  }

  private assessToxicityRisk(profile: any, diagnosis: CancerDiagnosis): string[] {
    return ['Neutropenia', 'Fatigue', 'Nausea']
  }

  private generateAlternatives(nccn: any, molecular: any): string[] {
    return ['Alternative regimen 1', 'Alternative regimen 2']
  }

  private evaluateEligibility(trial: ClinicalTrial, profile: any): boolean {
    return true
  }

  private calculateTrialScore(trial: ClinicalTrial, profile: any): number {
    return 0.85
  }

  private async assessCurrentToxicity(patientId: string, treatment: any): Promise<ToxicityGrade[]> {
    return []
  }

  private async suggestDoseModifications(treatment: any, toxicities: ToxicityGrade[]): Promise<any[]> {
    return [{ type: 'dose_reduction', percentage: 25, reason: 'Grade 3 toxicity' }]
  }

  private async storeCancerAssessment(studyId: string, assessment: any): Promise<void> {
    await this.redis.hset('oncology:assessments', studyId, JSON.stringify(assessment))
  }

  private async updateMolecularProfile(patientId: string, variant: any): Promise<void> {
    await this.redis.hset('oncology:molecular_profiles', patientId, JSON.stringify(variant))
  }

  private async storeTreatmentPlan(patientId: string, plan: TreatmentRecommendation): Promise<void> {
    await this.redis.hset('oncology:treatment_plans', patientId, JSON.stringify(plan))
  }
}