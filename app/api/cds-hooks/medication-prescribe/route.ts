import { NextRequest, NextResponse } from "next/server"
import { getFHIRClient } from "@/lib/epic/fhir-client"
import { env } from "@/lib/config/environment"

interface MedicationPrescribeCDSRequest {
  hook: 'medication-prescribe'
  hookInstance: string
  fhirServer: string
  fhirAuthorization?: {
    access_token: string
    token_type: string
    expires_in: number
    scope: string
    subject: string
  }
  context: {
    patientId: string
    encounterId?: string
    userId?: string
    draftOrders: {
      resourceType: 'Bundle'
      entry: Array<{
        resource: {
          resourceType: 'MedicationRequest'
          id?: string
          status: string
          intent: string
          medicationCodeableConcept?: {
            coding: Array<{
              system: string
              code: string
              display: string
            }>
            text?: string
          }
          subject: {
            reference: string
          }
          dosageInstruction?: Array<{
            text?: string
            doseAndRate?: Array<{
              doseQuantity?: {
                value: number
                unit: string
              }
            }>
          }>
        }
      }>
    }
  }
  prefetch?: {
    patient?: any
    medications?: any
    genomicObservations?: any
    allergies?: any
  }
}

interface CDSHooksCard {
  uuid?: string
  summary: string
  detail?: string
  indicator: 'info' | 'warning' | 'critical'
  source: {
    label: string
    url?: string
    icon?: string
  }
  suggestions?: Array<{
    label: string
    uuid?: string
    actions?: Array<{
      type: string
      description: string
      resource?: any
    }>
  }>
  selectionBehavior?: 'at-most-one' | 'any'
  links?: Array<{
    label: string
    url: string
    type: 'absolute' | 'smart'
    appContext?: string
  }>
}

interface CDSHooksResponse {
  cards: CDSHooksCard[]
}

export async function POST(request: NextRequest) {
  // In real-world, you'd inspect request for FHIR context
  const body = await request.json()

  const cards = [
    {
      summary: 'Potential drug–drug interaction detected',
      indicator: 'warning',
      detail: 'Prescribed medication may interact with Patient\'s current statin therapy.',
      source: { label: 'GenomicTwin CDS' },
    },
    {
      summary: 'Consider pharmacogenomic dosing',
      indicator: 'info',
      detail: 'Patient\'s CYP2C19 *2/*17 genotype suggests altered metabolism. Recommend dose adjustment.',
      source: { label: 'GenomicTwin CDS' },
    },
  ]

  return NextResponse.json({ cards })
}

async function generatePharmacogenomicGuidanceCard(
  patientId: string,
  medicationRequest: any,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    // Extract medication information
    const medicationCode = medicationRequest.medicationCodeableConcept?.coding?.[0]
    if (!medicationCode) return null

    const medicationName = medicationCode.display || medicationCode.code

    // Look for relevant genomic observations
    const genomicObservations = prefetch?.genomicObservations?.entry || []
    const relevantObservations = genomicObservations.filter((entry: any) => {
      const obs = entry.resource
      return obs?.code?.coding?.some((code: any) =>
        code.system === 'http://loinc.org' &&
        ['81247-9', '69548-6', '81695-9'].includes(code.code)
      )
    })

    if (relevantObservations.length === 0) {
      return null
    }

    // Analyze pharmacogenomic implications
    const pgxImplications = await analyzePharmacogenomicImplications(
      medicationCode,
      relevantObservations.map((e: any) => e.resource)
    )

    if (!pgxImplications || pgxImplications.length === 0) {
      return null
    }

    const criticalImplications = pgxImplications.filter(impl => impl.severity === 'critical')
    const warningImplications = pgxImplications.filter(impl => impl.severity === 'warning')

    let indicator: 'info' | 'warning' | 'critical' = 'info'
    let summary = `Pharmacogenomic Information for ${medicationName}`

    if (criticalImplications.length > 0) {
      indicator = 'critical'
      summary = `Critical Pharmacogenomic Alert: ${medicationName}`
    } else if (warningImplications.length > 0) {
      indicator = 'warning'
      summary = `Pharmacogenomic Guidance: ${medicationName}`
    }

    const topImplication = criticalImplications[0] || warningImplications[0] || pgxImplications[0]
    const detail = `${topImplication.gene} variant detected: ${topImplication.recommendation}`

    const suggestions = []
    if (topImplication.alternativeDosing) {
      suggestions.push({
        label: 'Apply Genomic-Based Dosing',
        actions: [{
          type: 'update',
          description: `Update dosing based on ${topImplication.gene} genotype`,
          resource: {
            ...medicationRequest,
            dosageInstruction: [{
              text: topImplication.alternativeDosing,
              doseAndRate: [{
                doseQuantity: topImplication.recommendedDose
              }]
            }]
          }
        }]
      })
    }

    if (topImplication.alternativeMedication) {
      suggestions.push({
        label: 'Consider Alternative Medication',
        actions: [{
          type: 'create',
          description: `Consider ${topImplication.alternativeMedication} as genomically-optimized alternative`,
          resource: {
            ...medicationRequest,
            medicationCodeableConcept: {
              coding: [{
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: topImplication.alternativeMedicationCode,
                display: topImplication.alternativeMedication
              }]
            }
          }
        }]
      })
    }

    return {
      summary,
      detail,
      indicator,
      source: {
        label: 'AGILE Pharmacogenomics',
        url: 'https://genomictwin.com',
        icon: 'https://genomictwin.com/pgx-icon.png'
      },
      suggestions,
      links: [{
        label: 'View Detailed Pharmacogenomic Report',
        url: `${env.NEXTAUTH_URL}/genomics/pharmacogenomics?patientId=${patientId}&medication=${medicationCode.code}`,
        type: 'smart' as const
      }]
    }

  } catch (error) {
    console.error('Error generating pharmacogenomic guidance card:', error)
    return null
  }
}

async function generateDrugGeneInteractionCard(
  patientId: string,
  medicationRequest: any,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    const medicationCode = medicationRequest.medicationCodeableConcept?.coding?.[0]
    if (!medicationCode) return null

    const genomicObservations = prefetch?.genomicObservations?.entry || []
    const existingMedications = prefetch?.medications?.entry || []

    // Check for drug-gene interactions
    const interactions = await analyzeDrugGeneInteractions(
      medicationCode,
      genomicObservations.map((e: any) => e.resource),
      existingMedications.map((e: any) => e.resource)
    )

    const significantInteractions = interactions.filter(i =>
      i.severity === 'critical' || i.severity === 'warning'
    )

    if (significantInteractions.length === 0) {
      return null
    }

    const criticalInteractions = significantInteractions.filter(i => i.severity === 'critical')
    let indicator: 'warning' | 'critical' = criticalInteractions.length > 0 ? 'critical' : 'warning'

    return {
      summary: `${significantInteractions.length} Drug-Gene Interaction(s) Detected`,
      detail: significantInteractions
        .slice(0, 2)
        .map(i => `${i.gene}: ${i.recommendation}`)
        .join('; '),
      indicator,
      source: {
        label: 'AGILE Drug-Gene Interactions',
        url: 'https://genomictwin.com'
      },
      links: [{
        label: 'View Interaction Details',
        url: `${env.NEXTAUTH_URL}/genomics/drug-interactions?patientId=${patientId}&medication=${medicationCode.code}`,
        type: 'smart' as const
      }]
    }

  } catch (error) {
    console.error('Error generating drug-gene interaction card:', error)
    return null
  }
}

async function generateAlternativeMedicationCard(
  patientId: string,
  medicationRequest: any,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    const medicationCode = medicationRequest.medicationCodeableConcept?.coding?.[0]
    if (!medicationCode) return null

    const genomicObservations = prefetch?.genomicObservations?.entry || []

    // Find genomically-optimized alternatives
    const alternatives = await findGenomicOptimizedAlternatives(
      medicationCode,
      genomicObservations.map((e: any) => e.resource)
    )

    if (alternatives.length === 0) {
      return null
    }

    const topAlternative = alternatives[0]

    return {
      summary: `Genomically-Optimized Alternative Available`,
      detail: `${topAlternative.medication} may be more effective based on patient's genetic profile (${topAlternative.reason})`,
      indicator: 'info' as const,
      source: {
        label: 'AGILE Medication Optimization',
        url: 'https://genomictwin.com'
      },
      suggestions: [{
        label: `Consider ${topAlternative.medication}`,
        actions: [{
          type: 'create',
          description: `Create order for genomically-optimized alternative`,
          resource: {
            ...medicationRequest,
            medicationCodeableConcept: {
              coding: [{
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: topAlternative.code,
                display: topAlternative.medication
              }]
            }
          }
        }]
      }]
    }

  } catch (error) {
    console.error('Error generating alternative medication card:', error)
    return null
  }
}

async function generateDosingGuidanceCard(
  patientId: string,
  medicationRequest: any,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    const medicationCode = medicationRequest.medicationCodeableConcept?.coding?.[0]
    if (!medicationCode) return null

    const currentDose = medicationRequest.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity
    if (!currentDose) return null

    const genomicObservations = prefetch?.genomicObservations?.entry || []

    // Calculate genomic-based dosing recommendations
    const dosingRecommendation = await calculateGenomicBasedDosing(
      medicationCode,
      currentDose,
      genomicObservations.map((e: any) => e.resource)
    )

    if (!dosingRecommendation || !dosingRecommendation.adjustmentNeeded) {
      return null
    }

    const adjustmentPercentage = Math.abs(
      ((dosingRecommendation.recommendedDose.value - currentDose.value) / currentDose.value) * 100
    )

    let indicator: 'info' | 'warning' | 'critical' = 'info'
    if (adjustmentPercentage > 50) {
      indicator = 'critical'
    } else if (adjustmentPercentage > 25) {
      indicator = 'warning'
    }

    return {
      summary: `Genomic-Based Dosing Adjustment Recommended`,
      detail: `Based on ${dosingRecommendation.gene} genotype, consider ${dosingRecommendation.adjustment} (${dosingRecommendation.recommendedDose.value} ${dosingRecommendation.recommendedDose.unit})`,
      indicator,
      source: {
        label: 'AGILE Dosing Guidance',
        url: 'https://genomictwin.com'
      },
      suggestions: [{
        label: 'Apply Genomic-Based Dosing',
        actions: [{
          type: 'update',
          description: 'Update dose based on genetic profile',
          resource: {
            ...medicationRequest,
            dosageInstruction: [{
              text: `Genomic-based dosing: ${dosingRecommendation.recommendedDose.value} ${dosingRecommendation.recommendedDose.unit}`,
              doseAndRate: [{
                doseQuantity: dosingRecommendation.recommendedDose
              }]
            }]
          }
        }]
      }]
    }

  } catch (error) {
    console.error('Error generating dosing guidance card:', error)
    return null
  }
}

// Helper functions (simplified implementations - would use real databases in production)
async function analyzePharmacogenomicImplications(
  medicationCode: any,
  observations: any[]
): Promise<Array<{
  gene: string
  severity: 'critical' | 'warning' | 'info'
  recommendation: string
  alternativeDosing?: string
  recommendedDose?: { value: number; unit: string }
  alternativeMedication?: string
  alternativeMedicationCode?: string
}>> {
  // Mock implementation - in production would query PharmGKB, CPIC guidelines, etc.
  const implications = []

  if (medicationCode.display?.toLowerCase().includes('warfarin')) {
    implications.push({
      gene: 'CYP2C9',
      severity: 'critical' as const,
      recommendation: 'Poor metabolizer - reduce dose by 50%',
      alternativeDosing: 'Start with 2.5mg daily instead of standard 5mg',
      recommendedDose: { value: 2.5, unit: 'mg' }
    })
  }

  if (medicationCode.display?.toLowerCase().includes('clopidogrel')) {
    implications.push({
      gene: 'CYP2C19',
      severity: 'critical' as const,
      recommendation: 'Poor metabolizer - consider alternative therapy',
      alternativeMedication: 'Prasugrel',
      alternativeMedicationCode: '855812'
    })
  }

  return implications
}

async function analyzeDrugGeneInteractions(
  medicationCode: any,
  genomicObservations: any[],
  existingMedications: any[]
): Promise<Array<{
  gene: string
  severity: 'critical' | 'warning' | 'info'
  recommendation: string
}>> {
  // Mock implementation
  return [
    {
      gene: 'CYP2D6',
      severity: 'warning' as const,
      recommendation: 'Monitor for reduced efficacy due to poor metabolizer status'
    }
  ]
}

async function findGenomicOptimizedAlternatives(
  medicationCode: any,
  genomicObservations: any[]
): Promise<Array<{
  medication: string
  code: string
  reason: string
  efficacyImprovement: number
}>> {
  // Mock implementation
  return [
    {
      medication: 'Atorvastatin',
      code: '83367',
      reason: 'Better response based on SLCO1B1 genotype',
      efficacyImprovement: 30
    }
  ]
}

async function calculateGenomicBasedDosing(
  medicationCode: any,
  currentDose: any,
  genomicObservations: any[]
): Promise<{
  adjustmentNeeded: boolean
  gene: string
  adjustment: string
  recommendedDose: { value: number; unit: string }
}> {
  // Mock implementation
  return {
    adjustmentNeeded: true,
    gene: 'CYP2C9',
    adjustment: 'reduce dose by 30%',
    recommendedDose: {
      value: currentDose.value * 0.7,
      unit: currentDose.unit
    }
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}