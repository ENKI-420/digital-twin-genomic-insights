import { epicConfig } from '@/lib/config/environment'
import { redisService } from '@/lib/supabase/redis'

// FHIR Resource Types
export interface FHIRPatient {
  resourceType: 'Patient'
  id: string
  identifier?: Array<{
    use?: string
    type?: {
      coding?: Array<{
        system?: string
        code?: string
        display?: string
      }>
    }
    system?: string
    value?: string
  }>
  name?: Array<{
    use?: string
    family?: string
    given?: string[]
    prefix?: string[]
    suffix?: string[]
  }>
  telecom?: Array<{
    system?: string
    value?: string
    use?: string
  }>
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  address?: Array<{
    use?: string
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  maritalStatus?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  contact?: Array<{
    relationship?: Array<{
      coding?: Array<{
        system?: string
        code?: string
        display?: string
      }>
    }>
    name?: {
      family?: string
      given?: string[]
    }
    telecom?: Array<{
      system?: string
      value?: string
    }>
  }>
}

export interface FHIRObservation {
  resourceType: 'Observation'
  id: string
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  code: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject: {
    reference: string
    display?: string
  }
  effectiveDateTime?: string
  effectivePeriod?: {
    start?: string
    end?: string
  }
  issued?: string
  valueQuantity?: {
    value?: number
    unit?: string
    system?: string
    code?: string
  }
  valueCodeableConcept?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  valueString?: string
  component?: Array<{
    code: {
      coding?: Array<{
        system?: string
        code?: string
        display?: string
      }>
    }
    valueQuantity?: {
      value?: number
      unit?: string
      system?: string
      code?: string
    }
    valueString?: string
  }>
  interpretation?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  referenceRange?: Array<{
    low?: {
      value?: number
      unit?: string
    }
    high?: {
      value?: number
      unit?: string
    }
    text?: string
  }>
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport'
  id: string
  identifier?: Array<{
    use?: string
    system?: string
    value?: string
  }>
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  code: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject: {
    reference: string
    display?: string
  }
  effectiveDateTime?: string
  effectivePeriod?: {
    start?: string
    end?: string
  }
  issued?: string
  performer?: Array<{
    reference?: string
    display?: string
  }>
  result?: Array<{
    reference: string
    display?: string
  }>
  conclusion?: string
  conclusionCode?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  presentedForm?: Array<{
    contentType?: string
    data?: string
    url?: string
    title?: string
  }>
}

export interface FHIRCondition {
  resourceType: 'Condition'
  id: string
  identifier?: Array<{
    use?: string
    system?: string
    value?: string
  }>
  clinicalStatus?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  verificationStatus?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  category?: Array<{
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }>
  severity?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
  }
  code?: {
    coding?: Array<{
      system?: string
      code?: string
      display?: string
    }>
    text?: string
  }
  subject: {
    reference: string
    display?: string
  }
  onsetDateTime?: string
  onsetAge?: {
    value?: number
    unit?: string
  }
  abatementDateTime?: string
  recordedDate?: string
  note?: Array<{
    text?: string
  }>
}

export interface FHIRBundle {
  resourceType: 'Bundle'
  id?: string
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection'
  total?: number
  link?: Array<{
    relation: string
    url: string
  }>
  entry?: Array<{
    fullUrl?: string
    resource?: FHIRPatient | FHIRObservation | FHIRDiagnosticReport | FHIRCondition | any
    search?: {
      mode?: string
      score?: number
    }
  }>
}

// FHIR Client Class
export class EpicFHIRClient {
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    this.baseUrl = epicConfig.baseUrl
  }

  async setAccessToken(token: string, expiresIn?: number) {
    this.accessToken = token
    this.tokenExpiry = expiresIn ? Date.now() + (expiresIn * 1000) : null

    // Cache token in Redis for session management
    if (token) {
      await redisService.set(`fhir_token:${token.substring(0, 10)}`, {
        token,
        expiresIn,
        timestamp: Date.now()
      }, expiresIn || 3600)
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    if (!this.accessToken || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
      throw new Error('Access token expired or not available')
    }

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json',
      'Epic-Client-ID': epicConfig.clientId,
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`

    try {
      const headers = await this.getHeaders()
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`FHIR API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()

      // Cache successful responses
      if (options.method === 'GET') {
        const cacheKey = `fhir_cache:${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
        await redisService.set(cacheKey, data, 300) // 5 minute cache
      }

      return data
    } catch (error) {
      console.error('FHIR API Request failed:', error)
      throw error
    }
  }

  // Patient Operations
  async getPatient(patientId: string): Promise<FHIRPatient> {
    return this.makeRequest<FHIRPatient>(`Patient/${patientId}`)
  }

  async searchPatients(params: {
    identifier?: string
    family?: string
    given?: string
    birthdate?: string
    gender?: string
    _count?: number
  }): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    return this.makeRequest<FHIRBundle>(`Patient?${searchParams.toString()}`)
  }

  // Observation Operations
  async getObservation(observationId: string): Promise<FHIRObservation> {
    return this.makeRequest<FHIRObservation>(`Observation/${observationId}`)
  }

  async getPatientObservations(patientId: string, params?: {
    category?: string
    code?: string
    date?: string
    _count?: number
    _sort?: string
  }): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams({
      patient: patientId,
    })

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.makeRequest<FHIRBundle>(`Observation?${searchParams.toString()}`)
  }

  // Diagnostic Report Operations
  async getDiagnosticReport(reportId: string): Promise<FHIRDiagnosticReport> {
    return this.makeRequest<FHIRDiagnosticReport>(`DiagnosticReport/${reportId}`)
  }

  async getPatientDiagnosticReports(patientId: string, params?: {
    category?: string
    code?: string
    date?: string
    _count?: number
    _sort?: string
  }): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams({
      patient: patientId,
    })

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.makeRequest<FHIRBundle>(`DiagnosticReport?${searchParams.toString()}`)
  }

  // Condition Operations
  async getCondition(conditionId: string): Promise<FHIRCondition> {
    return this.makeRequest<FHIRCondition>(`Condition/${conditionId}`)
  }

  async getPatientConditions(patientId: string, params?: {
    category?: string
    'clinical-status'?: string
    code?: string
    'onset-date'?: string
    _count?: number
    _sort?: string
  }): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams({
      patient: patientId,
    })

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return this.makeRequest<FHIRBundle>(`Condition?${searchParams.toString()}`)
  }

  // Genomic Data Operations
  async getGenomicObservations(patientId: string): Promise<FHIRBundle> {
    return this.getPatientObservations(patientId, {
      category: 'laboratory',
      code: 'http://loinc.org|81247-9,http://loinc.org|69548-6,http://loinc.org|81695-9',
      _sort: '-date',
      _count: 100
    })
  }

  async getGenomicDiagnosticReports(patientId: string): Promise<FHIRBundle> {
    return this.getPatientDiagnosticReports(patientId, {
      category: 'GE',
      _sort: '-date',
      _count: 50
    })
  }

  // Patient Everything Operation (Epic specific)
  async getPatientEverything(patientId: string, params?: {
    _since?: string
    _type?: string
    _count?: number
  }): Promise<FHIRBundle> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `Patient/${patientId}/$everything${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return this.makeRequest<FHIRBundle>(endpoint)
  }

  // Bulk Data Export (for research purposes)
  async exportPatientData(params?: {
    _type?: string
    _since?: string
    patient?: string[]
  }): Promise<{ contentLocation: string }> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','))
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }

    const response = await fetch(`${this.baseUrl}/Patient/$export${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, {
      method: 'GET',
      headers: {
        ...await this.getHeaders(),
        'Accept': 'application/fhir+json',
        'Prefer': 'respond-async'
      }
    })

    if (response.status === 202) {
      const contentLocation = response.headers.get('Content-Location')
      if (!contentLocation) {
        throw new Error('No Content-Location header in bulk export response')
      }
      return { contentLocation }
    }

    throw new Error(`Bulk export failed: ${response.status} ${response.statusText}`)
  }

  // Check bulk export status
  async checkBulkExportStatus(statusUrl: string): Promise<{
    transactionTime?: string
    request?: string
    requiresAccessToken?: boolean
    output?: Array<{
      type: string
      url: string
      count?: number
    }>
    error?: Array<{
      type: string
      url: string
    }>
  }> {
    const response = await fetch(statusUrl, {
      headers: await this.getHeaders()
    })

    if (response.status === 202) {
      // Still processing
      return {}
    }

    if (response.status === 200) {
      return response.json()
    }

    throw new Error(`Bulk export status check failed: ${response.status} ${response.statusText}`)
  }
}

// Singleton instance
let fhirClient: EpicFHIRClient | null = null

export const getFHIRClient = (): EpicFHIRClient => {
  if (!fhirClient) {
    fhirClient = new EpicFHIRClient()
  }
  return fhirClient
}

// Utility functions for common operations
export const extractPatientIdentifier = (patient: FHIRPatient, system?: string): string | null => {
  if (!patient.identifier) return null

  const identifier = system
    ? patient.identifier.find(id => id.system === system)
    : patient.identifier[0]

  return identifier?.value || null
}

export const extractPatientName = (patient: FHIRPatient): string | null => {
  if (!patient.name || patient.name.length === 0) return null

  const name = patient.name[0]
  const parts = []

  if (name.given) parts.push(...name.given)
  if (name.family) parts.push(name.family)

  return parts.length > 0 ? parts.join(' ') : null
}

export const formatObservationValue = (observation: FHIRObservation): string | null => {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit || ''}`
  }

  if (observation.valueString) {
    return observation.valueString
  }

  if (observation.valueCodeableConcept) {
    return observation.valueCodeableConcept.text ||
           observation.valueCodeableConcept.coding?.[0]?.display || null
  }

  return null
}

export default EpicFHIRClient
