import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface FHIRResource {
  resourceType: string
  id: string
  [key: string]: any
}

export interface DiagnosticReport extends FHIRResource {
  resourceType: "DiagnosticReport"
  status: string
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  effectiveDateTime: string
  result?: Array<{
    reference: string
  }>
}

export interface Observation extends FHIRResource {
  resourceType: "Observation"
  status: string
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  valueString?: string
  component?: Array<{
    code: {
      coding: Array<{
        system: string
        code: string
        display: string
      }>
    }
    valueString?: string
  }>
}

export class EpicFHIRClient {
  private baseUrl: string
  private accessToken: string

  constructor(accessToken: string) {
    this.baseUrl = process.env.EPIC_FHIR_BASE_URL!
    this.accessToken = accessToken
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/api/FHIR/R4/${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/fhir+json",
        "Content-Type": "application/fhir+json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`FHIR request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getPatient(patientId: string): Promise<FHIRResource> {
    const cacheKey = `fhir:patient:${patientId}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      return cached as FHIRResource
    }

    const patient = await this.makeRequest(`Patient/${patientId}`)

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, patient)

    return patient
  }

  async getDiagnosticReports(patientId: string): Promise<DiagnosticReport[]> {
    const cacheKey = `fhir:diagnostic_reports:${patientId}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      return cached as DiagnosticReport[]
    }

    const bundle = await this.makeRequest(`DiagnosticReport?patient=${patientId}`)
    const reports = bundle.entry?.map((entry: any) => entry.resource) || []

    // Cache for 30 minutes
    await redis.setex(cacheKey, 1800, reports)

    return reports
  }

  async getObservations(patientId: string, category?: string): Promise<Observation[]> {
    const cacheKey = `fhir:observations:${patientId}:${category || "all"}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      return cached as Observation[]
    }

    let endpoint = `Observation?patient=${patientId}`
    if (category) {
      endpoint += `&category=${category}`
    }

    const bundle = await this.makeRequest(endpoint)
    const observations = bundle.entry?.map((entry: any) => entry.resource) || []

    // Cache for 30 minutes
    await redis.setex(cacheKey, 1800, observations)

    return observations
  }

  async getGenomicObservations(patientId: string): Promise<Observation[]> {
    return this.getObservations(patientId, "laboratory")
  }

  async extractVariantsFromReports(reports: DiagnosticReport[]): Promise<
    Array<{
      gene: string
      variant: string
      hgvs?: string
      clinicalSignificance?: string
      source: string
    }>
  > {
    const variants: Array<{
      gene: string
      variant: string
      hgvs?: string
      clinicalSignificance?: string
      source: string
    }> = []

    for (const report of reports) {
      // Extract variants from diagnostic report text
      const reportText = JSON.stringify(report)

      // Simple regex patterns for common variant formats
      const hgvsPattern = /([A-Z0-9]+):([cgp]\.[A-Za-z0-9>_]+)/g
      const geneVariantPattern = /([A-Z0-9]+)\s+([A-Z][0-9]+[A-Z])/g

      let match

      // Extract HGVS variants
      while ((match = hgvsPattern.exec(reportText)) !== null) {
        variants.push({
          gene: match[1],
          variant: match[2],
          hgvs: `${match[1]}:${match[2]}`,
          source: `DiagnosticReport/${report.id}`,
        })
      }

      // Extract simple gene variants
      while ((match = geneVariantPattern.exec(reportText)) !== null) {
        variants.push({
          gene: match[1],
          variant: match[2],
          source: `DiagnosticReport/${report.id}`,
        })
      }
    }

    return variants
  }
}
