import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/config/environment"

// CDS Hooks Service Discovery Response
export async function GET(request: NextRequest) {
  // Check if CDS Hooks is enabled
  if (!env.ENABLE_CDS_HOOKS) {
    return NextResponse.json(
      { error: "CDS Hooks not enabled" },
      { status: 404 }
    )
  }

  const baseUrl = env.NEXTAUTH_URL

  const services = [
    {
      hook: 'patient-view',
      title: 'AGILE Genomic Insights - Patient View',
      description: 'Provides genomic analysis insights and recommendations in the patient view context',
      id: 'agile-patient-view',
      prefetch: {
        patient: 'Patient/{{context.patientId}}',
        conditions: 'Condition?patient={{context.patientId}}&clinical-status=active',
        observations: 'Observation?patient={{context.patientId}}&category=laboratory&_sort=-date&_count=100',
        diagnosticReports: 'DiagnosticReport?patient={{context.patientId}}&category=GE&_sort=-date&_count=50',
        medications: 'MedicationRequest?patient={{context.patientId}}&status=active',
        allergies: 'AllergyIntolerance?patient={{context.patientId}}&clinical-status=verified'
      },
      configuration: {
        cards: {
          genomic_analysis: {
            enabled: true,
            priority: 'high',
            title: 'Genomic Analysis Available',
            description: 'AI-powered genomic analysis and variant interpretation'
          },
          drug_interactions: {
            enabled: true,
            priority: 'critical',
            title: 'Pharmacogenomic Interactions',
            description: 'Genomic-based drug interaction and dosing recommendations'
          },
          clinical_trials: {
            enabled: true,
            priority: 'medium',
            title: 'Clinical Trial Matching',
            description: 'Precision medicine clinical trial opportunities'
          }
        }
      }
    },
    {
      hook: 'medication-prescribe',
      title: 'AGILE Genomic Insights - Medication Prescribe',
      description: 'Provides pharmacogenomic guidance during medication prescribing',
      id: 'agile-medication-prescribe',
      prefetch: {
        patient: 'Patient/{{context.patientId}}',
        medications: 'MedicationRequest?patient={{context.patientId}}&status=active',
        genomicObservations: 'Observation?patient={{context.patientId}}&code=http://loinc.org|81247-9,http://loinc.org|69548-6&_sort=-date&_count=20',
        allergies: 'AllergyIntolerance?patient={{context.patientId}}&clinical-status=verified'
      },
      configuration: {
        cards: {
          pharmacogenomic_guidance: {
            enabled: true,
            priority: 'critical',
            title: 'Pharmacogenomic Guidance',
            description: 'Genomic-based prescribing recommendations and warnings'
          },
          drug_gene_interactions: {
            enabled: true,
            priority: 'high',
            title: 'Drug-Gene Interactions',
            description: 'Identify potential drug-gene interactions and dosing adjustments'
          },
          alternative_medications: {
            enabled: true,
            priority: 'medium',
            title: 'Alternative Medications',
            description: 'Suggest genetically-optimized alternative medications'
          }
        }
      }
    },
    {
      hook: 'order-review',
      title: 'AGILE Genomic Insights - Order Review',
      description: 'Reviews orders for genomic testing opportunities and contraindications',
      id: 'agile-order-review',
      prefetch: {
        patient: 'Patient/{{context.patientId}}',
        conditions: 'Condition?patient={{context.patientId}}&clinical-status=active',
        familyHistory: 'FamilyMemberHistory?patient={{context.patientId}}',
        existingGenomicTests: 'DiagnosticReport?patient={{context.patientId}}&category=GE'
      },
      configuration: {
        cards: {
          genomic_testing_recommendations: {
            enabled: true,
            priority: 'medium',
            title: 'Genomic Testing Recommendations',
            description: 'AI-suggested genomic tests based on patient phenotype'
          },
          test_optimization: {
            enabled: true,
            priority: 'low',
            title: 'Test Panel Optimization',
            description: 'Optimize genomic test panels for maximum clinical utility'
          }
        }
      }
    },
    {
      hook: 'encounter-discharge',
      title: 'AGILE Genomic Insights - Encounter Discharge',
      description: 'Provides discharge recommendations and follow-up genomic care plans',
      id: 'agile-encounter-discharge',
      prefetch: {
        patient: 'Patient/{{context.patientId}}',
        encounter: 'Encounter/{{context.encounterId}}',
        conditions: 'Condition?patient={{context.patientId}}&clinical-status=active',
        procedures: 'Procedure?patient={{context.patientId}}&date={{context.encounterDate}}',
        genomicReports: 'DiagnosticReport?patient={{context.patientId}}&category=GE&date={{context.encounterDate}}'
      },
      configuration: {
        cards: {
          genomic_follow_up: {
            enabled: true,
            priority: 'medium',
            title: 'Genomic Follow-up Plan',
            description: 'Personalized genomic medicine follow-up recommendations'
          },
          family_screening: {
            enabled: true,
            priority: 'low',
            title: 'Family Cascade Screening',
            description: 'Recommendations for family member genetic screening'
          }
        }
      }
    }
  ]

  // Add hook endpoints
  const servicesWithEndpoints = services.map(service => ({
    ...service,
    hook: service.hook,
    title: service.title,
    description: service.description,
    id: service.id,
    prefetch: service.prefetch,
    // CDS Hooks endpoint URL
    url: `${baseUrl}/api/cds-hooks/${service.hook}`,
    // Optional SMART App Launch URL for more complex interactions
    appLink: service.hook === 'patient-view' ? `${baseUrl}/genomics/analysis?launch=cds-hooks` : undefined
  }))

  return NextResponse.json({
    services: servicesWithEndpoints
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}