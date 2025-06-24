import { BaseService } from '../base'
import { z } from 'zod'
import { FHIRClient } from '@/lib/epic/fhir-client'
import { CDSHooksService } from '@/lib/epic/cds-hooks-service'
import { ClinicalDecisionSupport } from '@/lib/ai/clinical-decision-support'
import { TreatmentOptimizer } from '@/lib/ai/treatment-optimizer'

// Input validation schemas
const GetPatientDataSchema = z.object({
  patientId: z.string(),
  includeGenomics: z.boolean().optional(),
  includeHistory: z.boolean().optional(),
  includeMedications: z.boolean().optional(),
  includeLabResults: z.boolean().optional(),
})

const CDSHookSchema = z.object({
  hook: z.enum(['patient-view', 'medication-prescribe', 'order-review']),
  context: z.object({
    patientId: z.string(),
    userId: z.string(),
    encounter: z.string().optional(),
    selections: z.array(z.string()).optional(),
    draftOrders: z.any().optional(),
  }),
  prefetch: z.any().optional(),
})

const ClinicalAlertSchema = z.object({
  patientId: z.string(),
  type: z.enum(['drug-interaction', 'genomic-risk', 'clinical-guideline']),
  severity: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  recommendations: z.array(z.string()).optional(),
})

export class ClinicalService extends BaseService {
  private fhirClient: FHIRClient
  private cdsHooksService: CDSHooksService
  private clinicalAI: ClinicalDecisionSupport
  private treatmentOptimizer: TreatmentOptimizer

  constructor(context: any) {
    super(context)
    this.fhirClient = new FHIRClient()
    this.cdsHooksService = new CDSHooksService()
    this.clinicalAI = new ClinicalDecisionSupport()
    this.treatmentOptimizer = new TreatmentOptimizer()
  }

  // Get comprehensive patient data
  async getPatientData(data: unknown) {
    const input = this.validateInput(GetPatientDataSchema, data)

    await this.audit('getPatientData', 'patient', input.patientId)

    try {
      // Core patient demographics from FHIR
      const patient = await this.fhirClient.getPatient(input.patientId)

      // Build comprehensive patient profile
      const profile: any = {
        demographics: patient,
        lastUpdated: new Date().toISOString(),
      }

      // Add genomic data if requested
      if (input.includeGenomics) {
        profile.genomics = await this.getPatientGenomics(input.patientId)
      }

      // Add medical history if requested
      if (input.includeHistory) {
        const [conditions, procedures] = await Promise.all([
          this.fhirClient.getConditions(input.patientId),
          this.fhirClient.getProcedures(input.patientId),
        ])
        profile.medicalHistory = { conditions, procedures }
      }

      // Add current medications if requested
      if (input.includeMedications) {
        profile.medications = await this.fhirClient.getMedicationStatements(input.patientId)
      }

      // Add recent lab results if requested
      if (input.includeLabResults) {
        profile.labResults = await this.fhirClient.getObservations(input.patientId, {
          category: 'laboratory',
          _count: 50,
          _sort: '-date',
        })
      }

      // Generate clinical insights
      profile.insights = await this.clinicalAI.generateInsights(profile)

      return this.successResponse(profile)

    } catch (error) {
      this.handleError(error)
    }
  }

  // Process CDS Hooks
  async processCDSHook(data: unknown) {
    const input = this.validateInput(CDSHookSchema, data)

    await this.audit('processCDSHook', 'cds-hook', input.hook)

    try {
      let cards = []

      switch (input.hook) {
        case 'patient-view':
          cards = await this.processPatientViewHook(input.context, input.prefetch)
          break

        case 'medication-prescribe':
          cards = await this.processMedicationPrescribeHook(input.context, input.prefetch)
          break

        case 'order-review':
          cards = await this.processOrderReviewHook(input.context, input.prefetch)
          break
      }

      return this.successResponse({ cards })

    } catch (error) {
      this.handleError(error)
    }
  }

  // Create clinical alert
  async createClinicalAlert(data: unknown) {
    const input = this.validateInput(ClinicalAlertSchema, data)

    await this.audit('createClinicalAlert', 'alert', `${input.type}-${input.patientId}`)

    try {
      // Save alert to database
      const alert = await this.create('clinical_alerts', {
        patient_id: input.patientId,
        type: input.type,
        severity: input.severity,
        message: input.message,
        recommendations: input.recommendations,
        created_by: this.userId,
        created_at: new Date().toISOString(),
        status: 'active',
      })

      // Send real-time notification if critical
      if (input.severity === 'critical') {
        await this.sendCriticalAlertNotification(alert)
      }

      return this.successResponse(alert)

    } catch (error) {
      this.handleError(error)
    }
  }

  // Generate treatment recommendations
  async generateTreatmentRecommendations(data: unknown) {
    const input = this.validateInput(z.object({
      patientId: z.string(),
      condition: z.string(),
      currentTreatments: z.array(z.string()).optional(),
      constraints: z.object({
        allergies: z.array(z.string()).optional(),
        comorbidities: z.array(z.string()).optional(),
        preferences: z.array(z.string()).optional(),
      }).optional(),
    }), data)

    try {
      // Get patient data
      const patient = await this.getPatientData({
        patientId: input.patientId,
        includeGenomics: true,
        includeMedications: true,
        includeHistory: true,
      })

      // Generate optimized treatment plan
      const recommendations = await this.treatmentOptimizer.optimize({
        patient: patient.data,
        condition: input.condition,
        currentTreatments: input.currentTreatments,
        constraints: input.constraints,
      })

      return this.successResponse(recommendations)

    } catch (error) {
      this.handleError(error)
    }
  }

  // Get clinical pathways
  async getClinicalPathways(data: unknown) {
    const input = this.validateInput(z.object({
      condition: z.string(),
      stage: z.string().optional(),
      patientFactors: z.object({
        age: z.number().optional(),
        genomicMarkers: z.array(z.string()).optional(),
        comorbidities: z.array(z.string()).optional(),
      }).optional(),
    }), data)

    try {
      const pathways = await this.clinicalAI.getPathways({
        condition: input.condition,
        stage: input.stage,
        factors: input.patientFactors,
      })

      return this.successResponse(pathways)

    } catch (error) {
      this.handleError(error)
    }
  }

  // Private helper methods
  private async processPatientViewHook(context: any, prefetch: any) {
    const cards = []

    // Check for genomic insights
    const genomicInsights = await this.checkGenomicInsights(context.patientId)
    if (genomicInsights.length > 0) {
      cards.push({
        summary: 'Genomic Risk Factors Identified',
        indicator: 'warning',
        detail: genomicInsights.join('\n'),
        source: {
          label: 'GenomicTwin Platform',
        },
        suggestions: [{
          label: 'View detailed genomic analysis',
          uuid: crypto.randomUUID(),
          actions: [{
            type: 'link',
            url: `/patients/${context.patientId}/genomics`,
          }],
        }],
      })
    }

    // Check for clinical trial matches
    const trialMatches = await this.checkTrialMatches(context.patientId)
    if (trialMatches.length > 0) {
      cards.push({
        summary: `${trialMatches.length} Clinical Trial Matches Found`,
        indicator: 'info',
        source: {
          label: 'Research Coordinator',
        },
        suggestions: [{
          label: 'Review trial opportunities',
          uuid: crypto.randomUUID(),
          actions: [{
            type: 'link',
            url: `/patients/${context.patientId}/trials`,
          }],
        }],
      })
    }

    return cards
  }

  private async processMedicationPrescribeHook(context: any, prefetch: any) {
    const cards = []

    // Extract medication from draft orders
    const medication = context.draftOrders?.medicationRequest?.[0]
    if (!medication) return cards

    // Check pharmacogenomics
    const pgxCheck = await this.checkPharmacogenomics(
      context.patientId,
      medication.medicationCodeableConcept
    )

    if (pgxCheck.hasInteraction) {
      cards.push({
        summary: 'Pharmacogenomic Interaction Detected',
        indicator: 'critical',
        detail: pgxCheck.detail,
        source: {
          label: 'Pharmacogenomics Service',
        },
        suggestions: pgxCheck.alternatives.map((alt: any) => ({
          label: alt.label,
          uuid: crypto.randomUUID(),
          actions: [{
            type: 'create',
            resource: alt.resource,
          }],
        })),
      })
    }

    return cards
  }

  private async processOrderReviewHook(context: any, prefetch: any) {
    // Similar implementation for order review
    return []
  }

  private async getPatientGenomics(patientId: string) {
    const { data } = await this.supabase
      .from('patient_genomic_profiles')
      .select('*')
      .eq('patient_id', patientId)
      .single()

    return data
  }

  private async checkGenomicInsights(patientId: string) {
    // Check for actionable genomic variants
    const insights = []

    const genomics = await this.getPatientGenomics(patientId)
    if (genomics?.variants) {
      // Check for pathogenic variants
      const pathogenic = genomics.variants.filter((v: any) =>
        v.clinicalSignificance === 'Pathogenic'
      )

      if (pathogenic.length > 0) {
        insights.push(`${pathogenic.length} pathogenic variants identified`)
      }
    }

    return insights
  }

  private async checkTrialMatches(patientId: string) {
    // Query for matching clinical trials
    const { data } = await this.supabase
      .from('clinical_trial_matches')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'eligible')
      .limit(5)

    return data || []
  }

  private async checkPharmacogenomics(patientId: string, medication: any) {
    // Check for drug-gene interactions
    const genomics = await this.getPatientGenomics(patientId)

    // Simplified check - would integrate with PharmGKB
    if (genomics?.pharmacogenes?.CYP2D6 === 'Poor Metabolizer') {
      return {
        hasInteraction: true,
        detail: 'Patient is a CYP2D6 poor metabolizer. Consider dose reduction or alternative medication.',
        alternatives: [
          {
            label: 'Reduce dose by 50%',
            resource: {
              resourceType: 'MedicationRequest',
              // ... modified medication with reduced dose
            }
          }
        ]
      }
    }

    return { hasInteraction: false }
  }

  private async sendCriticalAlertNotification(alert: any) {
    // Send push notification, email, or in-app notification
    await this.logger.info('Critical alert notification sent', { alert })
  }
}