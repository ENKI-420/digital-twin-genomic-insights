import { v4 as uuidv4 } from 'uuid'

// FHIR R4 Resource Types
export interface FHIRPatient {
  resourceType: 'Patient'
  id?: string
  identifier?: Array<{
    system: string
    value: string
  }>
  name?: Array<{
    family: string
    given: string[]
  }>
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  address?: Array<{
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
}

export interface FHIRObservation {
  resourceType: 'Observation'
  id?: string
  status: 'registered' | 'preliminary' | 'final' | 'amended'
  code: {
    coding: Array<{
      system: string
      code: string
      display?: string
    }>
  }
  subject: {
    reference: string
  }
  valueCodeableConcept?: {
    coding: Array<{
      system: string
      code: string
      display?: string
    }>
  }
  valueQuantity?: {
    value: number
    unit: string
    system?: string
    code?: string
  }
  effectiveDateTime?: string
  performer?: Array<{
    reference: string
  }>
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport'
  id?: string
  status: 'registered' | 'partial' | 'preliminary' | 'final'
  code: {
    coding: Array<{
      system: string
      code: string
      display?: string
    }>
  }
  subject: {
    reference: string
  }
  result?: Array<{
    reference: string
  }>
  conclusion?: string
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest'
  id?: string
  status: 'active' | 'on-hold' | 'cancelled' | 'completed'
  intent: 'proposal' | 'plan' | 'order' | 'instance-order'
  medicationCodeableConcept: {
    coding: Array<{
      system: string
      code: string
      display?: string
    }>
  }
  subject: {
    reference: string
  }
  dosageInstruction?: Array<{
    text?: string
    timing?: {
      repeat?: {
        frequency?: number
        period?: number
        periodUnit?: string
      }
    }
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number
        unit: string
      }
    }>
  }>
}

export class FHIRConnector {
  private baseUrl: string
  private authToken: string

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl
    this.authToken = authToken
  }

  // Generic FHIR API request
  private async fhirRequest(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      throw new Error(`FHIR API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Patient operations
  async getPatient(patientId: string): Promise<FHIRPatient> {
    return this.fhirRequest('GET', `/Patient/${patientId}`)
  }

  async searchPatients(params: Record<string, string>): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    return this.fhirRequest('GET', `/Patient?${queryString}`)
  }

  async createPatient(patient: FHIRPatient): Promise<FHIRPatient> {
    return this.fhirRequest('POST', '/Patient', patient)
  }

  // Observation operations (for genomic data)
  async createGenomicObservation(
    patientId: string,
    variant: any
  ): Promise<FHIRObservation> {
    const observation: FHIRObservation = {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '69548-6',
          display: 'Genetic variant assessment'
        }]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      valueCodeableConcept: {
        coding: [{
          system: 'http://www.genenames.org',
          code: variant.gene,
          display: `${variant.gene} ${variant.reference}>${variant.alternative}`
        }]
      },
      effectiveDateTime: new Date().toISOString()
    }

    return this.fhirRequest('POST', '/Observation', observation)
  }

  async getPatientObservations(
    patientId: string,
    category?: string
  ): Promise<any> {
    let url = `/Observation?patient=${patientId}`
    if (category) {
      url += `&category=${category}`
    }
    return this.fhirRequest('GET', url)
  }

  // Diagnostic Report operations
  async createGenomicReport(
    patientId: string,
    variants: any[],
    conclusion: string
  ): Promise<FHIRDiagnosticReport> {
    const report: FHIRDiagnosticReport = {
      resourceType: 'DiagnosticReport',
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '51969-4',
          display: 'Genetic analysis summary report'
        }]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      conclusion
    }

    return this.fhirRequest('POST', '/DiagnosticReport', report)
  }

  // Medication operations (for pharmacogenomics)
  async createMedicationRecommendation(
    patientId: string,
    medication: any,
    dosageAdjustment?: string
  ): Promise<FHIRMedicationRequest> {
    const request: FHIRMedicationRequest = {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'proposal',
      medicationCodeableConcept: {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: medication.rxnormCode,
          display: medication.name
        }]
      },
      subject: {
        reference: `Patient/${patientId}`
      }
    }

    if (dosageAdjustment) {
      request.dosageInstruction = [{
        text: dosageAdjustment
      }]
    }

    return this.fhirRequest('POST', '/MedicationRequest', request)
  }

  // Convert internal variant format to FHIR
  variantToFHIR(variant: any, patientId: string): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '81252-9',
            display: 'Discrete genetic variant'
          }
        ]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://varnomen.hgvs.org',
            code: `${variant.chromosome}:g.${variant.position}${variant.reference}>${variant.alternative}`,
            display: variant.hgvs || `${variant.gene} variant`
          }
        ]
      },
      component: [
        {
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '48018-6',
              display: 'Gene studied'
            }]
          },
          valueCodeableConcept: {
            coding: [{
              system: 'http://www.genenames.org',
              code: variant.gene,
              display: variant.gene
            }]
          }
        },
        {
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '53037-8',
              display: 'Genetic disease sequence variant interpretation'
            }]
          },
          valueCodeableConcept: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: this.mapACMGToFHIR(variant.acmgClassification),
              display: variant.acmgClassification
            }]
          }
        }
      ]
    }
  }

  // Map ACMG classifications to FHIR interpretation codes
  private mapACMGToFHIR(classification: string): string {
    const mapping: Record<string, string> = {
      'Pathogenic': 'POS',
      'Likely_Pathogenic': 'POS',
      'Uncertain_Significance': 'IND',
      'Likely_Benign': 'NEG',
      'Benign': 'NEG'
    }
    return mapping[classification] || 'IND'
  }

  // Batch operations
  async createBundle(resources: any[]): Promise<any> {
    const bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: resources.map(resource => ({
        resource,
        request: {
          method: 'POST',
          url: resource.resourceType
        }
      }))
    }

    return this.fhirRequest('POST', '/', bundle)
  }

  // CDS Hooks integration
  async sendCDSHookRequest(
    hook: string,
    context: any,
    prefetch?: any
  ): Promise<any> {
    const request = {
      hook,
      hookInstance: uuidv4(),
      context,
      prefetch
    }

    const response = await fetch(`${this.baseUrl}/cds-services/${hook}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`CDS Hook error: ${response.status}`)
    }

    return response.json()
  }
}