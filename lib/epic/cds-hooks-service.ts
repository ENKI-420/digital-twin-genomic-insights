import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface CDSHookRequest {
  hook: string
  hookInstance: string
  fhirServer: string
  fhirAuthorization?: {
    access_token: string
    token_type: string
    expires_in: number
    scope: string
  }
  user: string
  patient?: string
  encounter?: string
  context: Record<string, any>
  prefetch?: Record<string, any>
}

export interface CDSCard {
  uuid?: string
  summary: string
  detail?: string
  indicator: "info" | "warning" | "critical"
  source: {
    label: string
    url?: string
    icon?: string
  }
  suggestions?: CDSSuggestion[]
  selectionBehavior?: "at-most-one" | "any"
  overrideReasons?: CDSOverrideReason[]
  links?: CDSLink[]
}

export interface CDSSuggestion {
  label: string
  uuid?: string
  isRecommended?: boolean
  actions?: CDSAction[]
}

export interface CDSAction {
  type: "create" | "update" | "delete"
  description?: string
  resource?: any
}

export interface CDSOverrideReason {
  code: string
  display: string
  system?: string
}

export interface CDSLink {
  label: string
  url: string
  type: "absolute" | "smart"
  appContext?: string
}

export interface CDSResponse {
  cards: CDSCard[]
  systemActions?: CDSAction[]
}

export class CDSHooksService {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  // Main CDS Hook endpoint handler
  async processHook(hookRequest: CDSHookRequest): Promise<CDSResponse> {
    console.log(`Processing CDS Hook: ${hookRequest.hook}`)

    try {
      switch (hookRequest.hook) {
        case "medication-prescribe":
          return await this.handleMedicationPrescribe(hookRequest)
        case "order-select":
          return await this.handleOrderSelect(hookRequest)
        case "patient-view":
          return await this.handlePatientView(hookRequest)
        case "encounter-start":
          return await this.handleEncounterStart(hookRequest)
        default:
          return { cards: [] }
      }
    } catch (error) {
      console.error("CDS Hook processing error:", error)
      return { cards: [] }
    }
  }

  // Handle medication prescribe hook for pharmacogenomics
  private async handleMedicationPrescribe(request: CDSHookRequest): Promise<CDSResponse> {
    const cards: CDSCard[] = []

    if (!request.patient || !request.context.medications) {
      return { cards }
    }

    // Get patient's genomic data
    const genomicData = await this.getPatientGenomicData(request.patient)
    if (!genomicData) {
      return { cards }
    }

    // Check for pharmacogenomic interactions
    for (const medication of request.context.medications) {
      const interactions = await this.checkPharmacogenomicInteractions(
        medication,
        genomicData
      )

      for (const interaction of interactions) {
        cards.push({
          summary: `Pharmacogenomic Alert: ${medication.medicationCodeableConcept?.text}`,
          detail: `Patient carries ${interaction.gene} variant (${interaction.variant}) that may affect ${medication.medicationCodeableConcept?.text} metabolism. ${interaction.recommendation}`,
          indicator: interaction.severity === "high" ? "critical" : "warning",
          source: {
            label: "AGENT Genomics AI",
            url: `${process.env.NEXTAUTH_URL}/pharmacogenomics/${request.patient}`,
            icon: "https://your-app.com/icon.png"
          },
          suggestions: [
            {
              label: "View detailed pharmacogenomic profile",
              isRecommended: true,
              actions: [
                {
                  type: "create",
                  description: "Launch genomic dashboard",
                  resource: {
                    resourceType: "Task",
                    status: "requested",
                    intent: "order",
                    description: "Review pharmacogenomic profile for medication optimization"
                  }
                }
              ]
            }
          ],
          links: [
            {
              label: "View Genomic Profile",
              url: `${process.env.NEXTAUTH_URL}/patients/${request.patient}/genomics`,
              type: "absolute"
            },
            {
              label: "CPIC Guidelines",
              url: `https://cpicpgx.org/genes-drugs/`,
              type: "absolute"
            }
          ],
          overrideReasons: [
            {
              code: "patient-preference",
              display: "Patient preference"
            },
            {
              code: "clinical-judgment",
              display: "Clinical judgment"
            }
          ]
        })
      }
    }

    return { cards }
  }

  // Handle order selection hook for genomic test recommendations
  private async handleOrderSelect(request: CDSHookRequest): Promise<CDSResponse> {
    const cards: CDSCard[] = []

    if (!request.patient || !request.context.selections) {
      return { cards }
    }

    // Check if cancer-related orders are being placed
    const cancerRelatedOrders = request.context.selections.filter((selection: any) =>
      this.isCancerRelatedOrder(selection)
    )

    if (cancerRelatedOrders.length > 0) {
      // Check if patient has existing genomic testing
      const existingGenomicTests = await this.getExistingGenomicTests(request.patient)

      if (existingGenomicTests.length === 0) {
        cards.push({
          summary: "Consider Genomic Testing",
          detail: "Based on the selected orders, this patient may benefit from tumor genomic profiling to guide treatment decisions and identify targeted therapy options.",
          indicator: "info",
          source: {
            label: "AGENT Genomics AI",
            url: `${process.env.NEXTAUTH_URL}/genomics/recommendations`
          },
          suggestions: [
            {
              label: "Order comprehensive tumor profiling",
              isRecommended: true,
              actions: [
                {
                  type: "create",
                  description: "Add genomic testing order",
                  resource: {
                    resourceType: "ServiceRequest",
                    status: "draft",
                    intent: "order",
                    code: {
                      coding: [
                        {
                          system: "http://loinc.org",
                          code: "94233-7",
                          display: "Genetic analysis comprehensive panel"
                        }
                      ]
                    },
                    subject: { reference: `Patient/${request.patient}` }
                  }
                }
              ]
            }
          ],
          links: [
            {
              label: "View genomic testing guidelines",
              url: `${process.env.NEXTAUTH_URL}/guidelines/genomic-testing`,
              type: "absolute"
            }
          ]
        })
      }
    }

    return { cards }
  }

  // Handle patient view hook for genomic insights
  private async handlePatientView(request: CDSHookRequest): Promise<CDSResponse> {
    const cards: CDSCard[] = []

    if (!request.patient) {
      return { cards }
    }

    // Get patient's genomic insights
    const genomicInsights = await this.getGenomicInsights(request.patient)

    if (genomicInsights.length > 0) {
      cards.push({
        summary: `${genomicInsights.length} Genomic Insights Available`,
        detail: "This patient has genomic data that may inform clinical decisions. Click to view detailed genomic profile and AI-generated insights.",
        indicator: "info",
        source: {
          label: "AGENT Genomics AI",
          url: `${process.env.NEXTAUTH_URL}/patients/${request.patient}/genomics`
        },
        links: [
          {
            label: "View Genomic Dashboard",
            url: `${process.env.NEXTAUTH_URL}/patients/${request.patient}/genomics`,
            type: "absolute"
          },
          {
            label: "View AI Insights",
            url: `${process.env.NEXTAUTH_URL}/ai-predictions?patient=${request.patient}`,
            type: "absolute"
          }
        ]
      })
    }

    // Check for high-risk variants requiring action
    const highRiskVariants = genomicInsights.filter(insight =>
      insight.clinicalSignificance === "pathogenic" && insight.actionable
    )

    if (highRiskVariants.length > 0) {
      cards.push({
        summary: `${highRiskVariants.length} Actionable Genomic Findings`,
        detail: "Patient has pathogenic variants that require clinical action. Consider genetic counseling, enhanced screening, or targeted interventions.",
        indicator: "warning",
        source: {
          label: "AGENT Genomics AI"
        },
        suggestions: [
          {
            label: "Refer to genetic counseling",
            isRecommended: true,
            actions: [
              {
                type: "create",
                description: "Create genetic counseling referral",
                resource: {
                  resourceType: "ServiceRequest",
                  status: "draft",
                  intent: "order",
                  code: {
                    coding: [
                      {
                        system: "http://snomed.info/sct",
                        code: "422979000",
                        display: "Genetic counseling"
                      }
                    ]
                  },
                  subject: { reference: `Patient/${request.patient}` }
                }
              }
            ]
          }
        ]
      })
    }

    return { cards }
  }

  // Handle encounter start hook
  private async handleEncounterStart(request: CDSHookRequest): Promise<CDSResponse> {
    const cards: CDSCard[] = []

    if (!request.patient) {
      return { cards }
    }

    // Check for pending genomic results
    const pendingResults = await this.getPendingGenomicResults(request.patient)

    if (pendingResults.length > 0) {
      cards.push({
        summary: `${pendingResults.length} Pending Genomic Results`,
        detail: "Patient has genomic tests with results available for review. These results may impact clinical decisions for this encounter.",
        indicator: "info",
        source: {
          label: "AGENT Genomics AI"
        },
        links: [
          {
            label: "Review Genomic Results",
            url: `${process.env.NEXTAUTH_URL}/reports?patient=${request.patient}&status=pending`,
            type: "absolute"
          }
        ]
      })
    }

    return { cards }
  }

  // Discovery endpoint for CDS Hooks
  getDiscoveryResponse() {
    return {
      services: [
        {
          hook: "medication-prescribe",
          title: "Pharmacogenomic Drug Interaction Check",
          description: "Provides pharmacogenomic alerts based on patient's genetic profile",
          id: "genomics-pgx-check",
          prefetch: {
            patient: "Patient/{{context.patientId}}",
            medications: "MedicationStatement?patient={{context.patientId}}&status=active"
          }
        },
        {
          hook: "order-select",
          title: "Genomic Testing Recommendations",
          description: "Suggests genomic testing based on clinical context",
          id: "genomics-test-recommend",
          prefetch: {
            patient: "Patient/{{context.patientId}}",
            conditions: "Condition?patient={{context.patientId}}&clinical-status=active"
          }
        },
        {
          hook: "patient-view",
          title: "Genomic Insights Summary",
          description: "Displays available genomic insights for the patient",
          id: "genomics-insights",
          prefetch: {
            patient: "Patient/{{context.patientId}}"
          }
        },
        {
          hook: "encounter-start",
          title: "Genomic Results Notification",
          description: "Alerts about pending genomic results",
          id: "genomics-results-alert",
          prefetch: {
            patient: "Patient/{{context.patientId}}"
          }
        }
      ]
    }
  }

  // Helper methods
  private async getPatientGenomicData(patientId: string) {
    try {
      const cacheKey = `genomic_data:${patientId}`
      const cached = await this.redis.get(cacheKey)
      if (cached) return cached

      // In real implementation, fetch from FHIR or genomic database
      return null
    } catch (error) {
      console.error("Error fetching genomic data:", error)
      return null
    }
  }

  private async checkPharmacogenomicInteractions(medication: any, genomicData: any) {
    // Implementation would check against CPIC guidelines and patient variants
    return []
  }

  private isCancerRelatedOrder(selection: any): boolean {
    // Check if order is cancer-related based on codes
    const cancerCodes = ["C78.9", "C25.9", "C50.9"] // Example ICD-10 codes
    return cancerCodes.some(code =>
      selection.code?.coding?.some((coding: any) => coding.code === code)
    )
  }

  private async getExistingGenomicTests(patientId: string) {
    // Query for existing genomic tests
    return []
  }

  private async getGenomicInsights(patientId: string) {
    // Get patient's genomic insights
    return []
  }

  private async getPendingGenomicResults(patientId: string) {
    // Query for pending results
    return []
  }
}