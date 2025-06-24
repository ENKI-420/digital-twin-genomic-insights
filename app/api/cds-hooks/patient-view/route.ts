import { NextRequest, NextResponse } from "next/server"
import { getFHIRClient, formatObservationValue } from "@/lib/epic/fhir-client"
import { env } from "@/lib/config/environment"

interface CDSHooksRequest {
  hook: string
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
  }
  prefetch?: {
    patient?: any
    conditions?: any
    observations?: any
    diagnosticReports?: any
    medications?: any
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
  try {
    // Check if CDS Hooks is enabled
    if (!env.ENABLE_CDS_HOOKS) {
      return NextResponse.json(
        { error: 'CDS Hooks not enabled' },
        { status: 404 }
      )
    }

    const hookRequest: CDSHooksRequest = await request.json()

    // Validate hook type
    if (hookRequest.hook !== 'patient-view') {
      return NextResponse.json(
        { error: 'Invalid hook type' },
        { status: 400 }
      )
    }

    const { context, prefetch, fhirAuthorization } = hookRequest
    const { patientId } = context

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID required' },
        { status: 400 }
      )
    }

    // Initialize FHIR client with authorization if provided
    const fhirClient = getFHIRClient()
    if (fhirAuthorization?.access_token) {
      await fhirClient.setAccessToken(
        fhirAuthorization.access_token,
        fhirAuthorization.expires_in
      )
    }

    const cards: CDSHooksCard[] = []

    // Process genomic data and generate cards
    if (prefetch?.diagnosticReports || prefetch?.observations) {
      await Promise.all([
        generateGenomicAnalysisCard(patientId, prefetch, fhirClient),
        generatePharmacogenomicCard(patientId, prefetch, fhirClient),
        generateClinicalTrialsCard(patientId, prefetch, fhirClient),
        generateVariantInterpretationCard(patientId, prefetch, fhirClient)
      ]).then(results => {
        results.forEach(card => {
          if (card) cards.push(card)
        })
      })
    }

    // If no prefetch data, generate informational card
    if (cards.length === 0) {
      cards.push({
        summary: 'AGILE Genomic Insights Available',
        detail: 'Enhanced genomic analysis and precision medicine recommendations are available for this patient. Click to access comprehensive genomic insights.',
        indicator: 'info',
        source: {
          label: 'AGILE Genomic Insights',
          url: 'https://genomictwin.com',
          icon: 'https://genomictwin.com/icon.png'
        },
        links: [{
          label: 'Open Genomic Analysis',
          url: `${env.NEXTAUTH_URL}/genomics/analysis?patientId=${patientId}&launch=cds-hooks`,
          type: 'smart' as const,
          appContext: `patientId=${patientId}`
        }]
      })
    }

    const response: CDSHooksResponse = { cards }

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  } catch (error) {
    console.error('CDS Hooks patient-view error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateGenomicAnalysisCard(
  patientId: string,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    const diagnosticReports = prefetch?.diagnosticReports?.entry || []
    const genomicReports = diagnosticReports.filter((entry: any) =>
      entry.resource?.category?.some((cat: any) =>
        cat.coding?.some((code: any) => code.code === 'GE')
      )
    )

    if (genomicReports.length === 0) {
      return null
    }

    const latestReport = genomicReports[0]?.resource
    const reportDate = new Date(latestReport?.effectiveDateTime || latestReport?.issued).toLocaleDateString()

    // Analyze genomic variants from reports
    const variants = await analyzeGenomicVariants(genomicReports)
    const pathogenicVariants = variants.filter(v => v.significance?.includes('pathogenic'))
    const variantsOfUncertainSignificance = variants.filter(v => v.significance?.includes('uncertain'))

    let indicator: 'info' | 'warning' | 'critical' = 'info'
    let summary = 'Genomic Analysis Available'
    let detail = `Latest genomic analysis from ${reportDate} shows `

    if (pathogenicVariants.length > 0) {
      indicator = 'critical'
      summary = `${pathogenicVariants.length} Pathogenic Variant(s) Found`
      detail += `${pathogenicVariants.length} pathogenic variant(s) requiring clinical attention. `
    }

    if (variantsOfUncertainSignificance.length > 0) {
      if (indicator === 'info') indicator = 'warning'
      detail += `${variantsOfUncertainSignificance.length} variant(s) of uncertain significance requiring evaluation. `
    }

    detail += 'Click for detailed genomic analysis and recommendations.'

    return {
      summary,
      detail,
      indicator,
      source: {
        label: 'AGILE Genomic Analysis',
        url: 'https://genomictwin.com'
      },
      links: [{
        label: 'View Genomic Analysis',
        url: `${env.NEXTAUTH_URL}/genomics/analysis?patientId=${patientId}&reportId=${latestReport?.id}`,
        type: 'smart' as const
      }],
      suggestions: pathogenicVariants.length > 0 ? [{
        label: 'Review Pathogenic Variants',
        actions: [{
          type: 'create',
          description: 'Create follow-up task for genetic counseling',
          resource: {
            resourceType: 'Task',
            status: 'requested',
            intent: 'order',
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: 'LA14021-8',
                display: 'Genetic counseling'
              }]
            },
            for: { reference: `Patient/${patientId}` },
            reasonReference: { reference: `DiagnosticReport/${latestReport?.id}` }
          }
        }]
      }] : undefined
    }

  } catch (error) {
    console.error('Error generating genomic analysis card:', error)
    return null
  }
}

async function generatePharmacogenomicCard(
  patientId: string,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    const observations = prefetch?.observations?.entry || []
    const medications = prefetch?.medications?.entry || []

    // Look for pharmacogenomic observations
    const pgxObservations = observations.filter((entry: any) => {
      const obs = entry.resource
      return obs?.code?.coding?.some((code: any) =>
        code.system === 'http://loinc.org' &&
        ['81247-9', '69548-6', '81695-9'].includes(code.code)
      )
    })

    if (pgxObservations.length === 0 || medications.length === 0) {
      return null
    }

    // Analyze drug-gene interactions
    const drugGeneInteractions = await analyzeDrugGeneInteractions(
      pgxObservations.map((e: any) => e.resource),
      medications.map((e: any) => e.resource)
    )

    if (drugGeneInteractions.length === 0) {
      return null
    }

    const criticalInteractions = drugGeneInteractions.filter(i => i.severity === 'critical')
    const warningInteractions = drugGeneInteractions.filter(i => i.severity === 'warning')

    let indicator: 'info' | 'warning' | 'critical' = 'info'
    let summary = 'Pharmacogenomic Information Available'

    if (criticalInteractions.length > 0) {
      indicator = 'critical'
      summary = `${criticalInteractions.length} Critical Drug-Gene Interaction(s)`
    } else if (warningInteractions.length > 0) {
      indicator = 'warning'
      summary = `${warningInteractions.length} Drug-Gene Interaction(s) to Monitor`
    }

    const detail = drugGeneInteractions
      .slice(0, 3)
      .map(i => `${i.medication} - ${i.gene}: ${i.recommendation}`)
      .join('; ')

    return {
      summary,
      detail,
      indicator,
      source: {
        label: 'AGILE Pharmacogenomics',
        url: 'https://genomictwin.com'
      },
      links: [{
        label: 'View Pharmacogenomic Report',
        url: `${env.NEXTAUTH_URL}/genomics/pharmacogenomics?patientId=${patientId}`,
        type: 'smart' as const
      }]
    }

  } catch (error) {
    console.error('Error generating pharmacogenomic card:', error)
    return null
  }
}

async function generateClinicalTrialsCard(
  patientId: string,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    const conditions = prefetch?.conditions?.entry || []
    const diagnosticReports = prefetch?.diagnosticReports?.entry || []

    if (conditions.length === 0) {
      return null
    }

    // Extract condition codes for trial matching
    const conditionCodes = conditions
      .map((entry: any) => entry.resource?.code?.coding || [])
      .flat()
      .filter((coding: any) => coding.system && coding.code)

    if (conditionCodes.length === 0) {
      return null
    }

    // Simple trial matching logic (in production, this would query a trials database)
    const potentialTrials = await findMatchingClinicalTrials(conditionCodes, diagnosticReports)

    if (potentialTrials.length === 0) {
      return null
    }

    return {
      summary: `${potentialTrials.length} Clinical Trial(s) May Be Available`,
      detail: `Found ${potentialTrials.length} precision medicine clinical trial(s) that may be relevant based on patient's genomic profile and conditions. Review eligibility criteria and discuss with patient.`,
      indicator: 'info' as const,
      source: {
        label: 'AGILE Clinical Trials',
        url: 'https://genomictwin.com'
      },
      links: [{
        label: 'Review Clinical Trials',
        url: `${env.NEXTAUTH_URL}/research/opportunities?patientId=${patientId}`,
        type: 'smart' as const
      }]
    }

  } catch (error) {
    console.error('Error generating clinical trials card:', error)
    return null
  }
}

async function generateVariantInterpretationCard(
  patientId: string,
  prefetch: any,
  fhirClient: any
): Promise<CDSHooksCard | null> {
  try {
    const observations = prefetch?.observations?.entry || []

    // Look for variant observations that need interpretation
    const variantObservations = observations.filter((entry: any) => {
      const obs = entry.resource
      return obs?.code?.coding?.some((code: any) =>
        code.system === 'http://loinc.org' &&
        code.code === '69548-6' // Genetic variant assessment
      )
    })

    if (variantObservations.length === 0) {
      return null
    }

    // Check for variants that may need reinterpretation
    const outdatedVariants = variantObservations.filter((entry: any) => {
      const obs = entry.resource
      const observationDate = new Date(obs?.effectiveDateTime || obs?.issued)
      const monthsOld = (Date.now() - observationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsOld > 12 // Variants older than 12 months
    })

    if (outdatedVariants.length === 0) {
      return null
    }

    return {
      summary: 'Variant Reinterpretation Available',
      detail: `${outdatedVariants.length} genomic variant(s) from previous analyses may benefit from reinterpretation based on updated clinical evidence and databases.`,
      indicator: 'info' as const,
      source: {
        label: 'AGILE Variant Interpretation',
        url: 'https://genomictwin.com'
      },
      links: [{
        label: 'Request Reinterpretation',
        url: `${env.NEXTAUTH_URL}/genomics/reinterpretation?patientId=${patientId}`,
        type: 'smart' as const
      }]
    }

  } catch (error) {
    console.error('Error generating variant interpretation card:', error)
    return null
  }
}

// Helper functions (simplified implementations)
async function analyzeGenomicVariants(reports: any[]): Promise<Array<{
  gene: string
  variant: string
  significance: string
  source: string
}>> {
  // In production, this would parse actual genomic reports
  // For now, return mock data based on report content
  return reports.flatMap(() => [
    {
      gene: 'BRCA1',
      variant: 'c.5266dupC',
      significance: 'pathogenic',
      source: 'ClinVar'
    },
    {
      gene: 'TP53',
      variant: 'c.524G>A',
      significance: 'uncertain significance',
      source: 'ClinVar'
    }
  ])
}

async function analyzeDrugGeneInteractions(observations: any[], medications: any[]): Promise<Array<{
  medication: string
  gene: string
  severity: 'critical' | 'warning' | 'info'
  recommendation: string
}>> {
  // In production, this would use PharmGKB or similar database
  // For now, return mock interactions
  return [
    {
      medication: 'Warfarin',
      gene: 'CYP2C9',
      severity: 'critical' as const,
      recommendation: 'Consider 50% dose reduction'
    },
    {
      medication: 'Citalopram',
      gene: 'CYP2C19',
      severity: 'warning' as const,
      recommendation: 'Monitor for efficacy'
    }
  ]
}

async function findMatchingClinicalTrials(conditionCodes: any[], diagnosticReports: any[]): Promise<Array<{
  id: string
  title: string
  phase: string
  eligibility: string
}>> {
  // In production, this would query ClinicalTrials.gov or similar
  // For now, return mock trials
  return conditionCodes.length > 0 ? [
    {
      id: 'NCT12345678',
      title: 'Precision Oncology Trial for BRCA1/2 Mutations',
      phase: 'Phase II',
      eligibility: 'Adults with pathogenic BRCA1/2 mutations'
    }
  ] : []
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