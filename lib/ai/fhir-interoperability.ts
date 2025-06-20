import { Redis } from "@upstash/redis"
import { platformCore } from "./platform-core"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// FHIR Resource Interfaces
export interface FHIRResource {
  resourceType: string
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    profile?: string[]
    security?: string[]
    tag?: string[]
  }
  identifier?: FHIRIdentifier[]
  active?: boolean
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary'
  type?: {
    coding: FHIRCoding[]
    text?: string
  }
  system?: string
  value?: string
  period?: {
    start?: string
    end?: string
  }
}

export interface FHIRCoding {
  system?: string
  version?: string
  code?: string
  display?: string
  userSelected?: boolean
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient'
  name?: FHIRHumanName[]
  telecom?: FHIRContactPoint[]
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  address?: FHIRAddress[]
  maritalStatus?: {
    coding: FHIRCoding[]
  }
  communication?: {
    language: {
      coding: FHIRCoding[]
    }
    preferred?: boolean
  }[]
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden'
  text?: string
  family?: string
  given?: string[]
  prefix?: string[]
  suffix?: string[]
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other'
  value?: string
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile'
  rank?: number
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing'
  type?: 'postal' | 'physical' | 'both'
  text?: string
  line?: string[]
  city?: string
  district?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation'
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: {
    coding: FHIRCoding[]
  }[]
  code: {
    coding: FHIRCoding[]
    text?: string
  }
  subject: {
    reference: string
    display?: string
  }
  effectiveDateTime?: string
  valueQuantity?: {
    value: number
    unit: string
    system: string
    code: string
  }
  valueString?: string
  valueBoolean?: boolean
  interpretation?: {
    coding: FHIRCoding[]
  }[]
  referenceRange?: {
    low?: {
      value: number
      unit: string
    }
    high?: {
      value: number
      unit: string
    }
    text?: string
  }[]
}

export interface FHIRMedicationStatement extends FHIRResource {
  resourceType: 'MedicationStatement'
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold' | 'unknown'
  medicationCodeableConcept?: {
    coding: FHIRCoding[]
    text?: string
  }
  subject: {
    reference: string
    display?: string
  }
  effectiveDateTime?: string
  dateAsserted?: string
  dosage?: {
    text?: string
    timing?: {
      repeat?: {
        frequency?: number
        period?: number
        periodUnit?: string
      }
    }
    doseAndRate?: {
      doseQuantity?: {
        value: number
        unit: string
        system: string
        code: string
      }
    }[]
  }[]
}

export interface FHIRCondition extends FHIRResource {
  resourceType: 'Condition'
  clinicalStatus?: {
    coding: FHIRCoding[]
  }
  verificationStatus?: {
    coding: FHIRCoding[]
  }
  category?: {
    coding: FHIRCoding[]
  }[]
  severity?: {
    coding: FHIRCoding[]
  }
  code?: {
    coding: FHIRCoding[]
    text?: string
  }
  subject: {
    reference: string
    display?: string
  }
  onsetDateTime?: string
  recordedDate?: string
}

export interface FHIRDiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport'
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled' | 'entered-in-error' | 'unknown'
  category?: {
    coding: FHIRCoding[]
  }[]
  code: {
    coding: FHIRCoding[]
    text?: string
  }
  subject: {
    reference: string
    display?: string
  }
  effectiveDateTime?: string
  issued?: string
  result?: {
    reference: string
    display?: string
  }[]
  conclusion?: string
}

export interface EHRIntegrationConfig {
  ehrSystem: 'epic' | 'cerner' | 'allscripts' | 'meditech' | 'custom'
  baseUrl: string
  clientId: string
  clientSecret: string
  scope: string[]
  redirectUri: string
  authEndpoint: string
  tokenEndpoint: string
  fhirEndpoint: string
}

export interface DataMappingRule {
  id: string
  sourceSystem: string
  targetSystem: string
  sourceField: string
  targetField: string
  transformFunction?: string
  validation?: {
    required: boolean
    type: string
    format?: string
  }
}

export interface TerminologyMapping {
  sourceCode: string
  sourceSystem: string
  targetCode: string
  targetSystem: string
  equivalence: 'relatedto' | 'equivalent' | 'equal' | 'wider' | 'subsumes' | 'narrower' | 'specializes' | 'inexact' | 'unmatched' | 'disjoint'
}

// FHIR Interoperability Engine
export class FHIRInteroperabilityEngine {
  private redis: Redis
  private terminologyMappings: Map<string, TerminologyMapping[]>
  private dataMappingRules: Map<string, DataMappingRule[]>

  constructor() {
    this.redis = redis
    this.terminologyMappings = new Map()
    this.dataMappingRules = new Map()
    this.initializeStandardMappings()
  }

  // EHR Authentication & Authorization
  async authenticateWithEHR(tenantId: string, ehrSystem: string): Promise<boolean> {
    // Implementation placeholder
    return true
  }

  // Bi-directional Data Synchronization
  async syncPatientData(
    tenantId: string,
    patientId: string,
    ehrSystem: string,
    direction: 'import' | 'export' | 'bidirectional'
  ): Promise<{
    imported: number
    exported: number
    errors: string[]
    lastSync: string
  }> {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    let imported = 0
    let exported = 0
    const errors: string[] = []

    try {
      // Get EHR authentication tokens
      const tokens = await this.getEHRTokens(tenantId, ehrSystem)
      if (!tokens) throw new Error('EHR authentication required')

      // Import data from EHR
      if (direction === 'import' || direction === 'bidirectional') {
        const importResult = await this.importPatientDataFromEHR(
          tenantId,
          patientId,
          ehrSystem,
          tokens.accessToken
        )
        imported = importResult.resourceCount
        errors.push(...importResult.errors)
      }

      // Export data to EHR
      if (direction === 'export' || direction === 'bidirectional') {
        const exportResult = await this.exportPatientDataToEHR(
          tenantId,
          patientId,
          ehrSystem,
          tokens.accessToken
        )
        exported = exportResult.resourceCount
        errors.push(...exportResult.errors)
      }

      // Record sync metrics
      await this.recordSyncMetrics(tenantId, syncId, {
        patientId,
        ehrSystem,
        direction,
        imported,
        exported,
        errors: errors.length
      })

      return {
        imported,
        exported,
        errors,
        lastSync: new Date().toISOString()
      }

    } catch (error) {
      console.error('Data sync failed:', error)
      throw new Error(`Sync failed: ${error}`)
    }
  }

  // FHIR Resource Transformation
  async transformToFHIR(
    tenantId: string,
    sourceData: any,
    sourceSystem: string,
    resourceType: string
  ): Promise<FHIRResource> {
    try {
      const mappingRules = this.dataMappingRules.get(`${sourceSystem}_to_fhir_${resourceType}`) || []

      let fhirResource: Partial<FHIRResource> = {
        resourceType: resourceType as any,
        id: this.generateFHIRId(),
        meta: {
          lastUpdated: new Date().toISOString(),
          profile: [`http://hl7.org/fhir/StructureDefinition/${resourceType}`]
        }
      }

      // Apply mapping rules
      for (const rule of mappingRules) {
        const sourceValue = this.extractValueByPath(sourceData, rule.sourceField)
        if (sourceValue !== undefined) {
          const transformedValue = await this.applyTransformation(
            sourceValue,
            rule.transformFunction,
            rule.validation
          )
          this.setValueByPath(fhirResource, rule.targetField, transformedValue)
        }
      }

      // Apply terminology mappings
      fhirResource = await this.applyTerminologyMappings(fhirResource, sourceSystem)

      // Validate FHIR resource
      const validationResult = await this.validateFHIRResource(fhirResource)
      if (!validationResult.isValid) {
        throw new Error(`FHIR validation failed: ${validationResult.errors.join(', ')}`)
      }

      // Log transformation for compliance
      await platformCore.logComplianceEvent(tenantId, {
        type: 'data_modification',
        userId: 'system',
        resource: 'fhir_transformation',
        action: 'transform_to_fhir',
        metadata: { sourceSystem, resourceType }
      })

      return fhirResource as FHIRResource

    } catch (error) {
      console.error('FHIR transformation failed:', error)
      throw new Error(`Transformation failed: ${error}`)
    }
  }

  async transformFromFHIR(
    tenantId: string,
    fhirResource: FHIRResource,
    targetSystem: string
  ): Promise<any> {
    try {
      const mappingRules = this.dataMappingRules.get(`fhir_${fhirResource.resourceType}_to_${targetSystem}`) || []

      let targetData: any = {}

      // Apply reverse mapping rules
      for (const rule of mappingRules) {
        const fhirValue = this.extractValueByPath(fhirResource, rule.sourceField)
        if (fhirValue !== undefined) {
          const transformedValue = await this.applyReverseTransformation(
            fhirValue,
            rule.transformFunction
          )
          this.setValueByPath(targetData, rule.targetField, transformedValue)
        }
      }

      // Apply reverse terminology mappings
      targetData = await this.applyReverseTerminologyMappings(targetData, targetSystem)

      return targetData

    } catch (error) {
      console.error('FHIR reverse transformation failed:', error)
      throw new Error(`Reverse transformation failed: ${error}`)
    }
  }

  // Semantic Interoperability
  async mapTerminology(
    sourceCode: string,
    sourceSystem: string,
    targetSystem: string
  ): Promise<TerminologyMapping | null> {
    const mappingKey = `${sourceSystem}_${sourceCode}`
    const mappings = this.terminologyMappings.get(mappingKey) || []

    return mappings.find(mapping => mapping.targetSystem === targetSystem) || null
  }

  async addTerminologyMapping(mapping: TerminologyMapping): Promise<void> {
    const mappingKey = `${mapping.sourceSystem}_${mapping.sourceCode}`
    const existingMappings = this.terminologyMappings.get(mappingKey) || []
    existingMappings.push(mapping)
    this.terminologyMappings.set(mappingKey, existingMappings)

    // Persist to cache
    await this.redis.hset(
      'terminology_mappings',
      mappingKey,
      JSON.stringify(existingMappings)
    )
  }

  // FHIR API Operations
  async createFHIRResource(
    tenantId: string,
    ehrSystem: string,
    resource: FHIRResource
  ): Promise<{ id: string; version: string }> {
    try {
      const tokens = await this.getEHRTokens(tenantId, ehrSystem)
      if (!tokens) throw new Error('EHR authentication required')

      const ehrConfig = await this.getEHRConfig(tenantId, ehrSystem)
      const response = await fetch(`${ehrConfig.fhirEndpoint}/${resource.resourceType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json'
        },
        body: JSON.stringify(resource)
      })

      if (!response.ok) {
        throw new Error(`FHIR creation failed: ${response.status} ${response.statusText}`)
      }

      const createdResource = await response.json()

      // Log operation for compliance
      await platformCore.logComplianceEvent(tenantId, {
        type: 'data_modification',
        userId: 'system',
        resource: 'fhir_resource',
        action: 'create',
        metadata: {
          ehrSystem,
          resourceType: resource.resourceType,
          resourceId: createdResource.id
        }
      })

      return {
        id: createdResource.id,
        version: createdResource.meta?.versionId || '1'
      }

    } catch (error) {
      console.error('FHIR resource creation failed:', error)
      throw new Error(`Creation failed: ${error}`)
    }
  }

  async readFHIRResource(
    tenantId: string,
    ehrSystem: string,
    resourceType: string,
    resourceId: string
  ): Promise<FHIRResource> {
    try {
      const tokens = await this.getEHRTokens(tenantId, ehrSystem)
      if (!tokens) throw new Error('EHR authentication required')

      const ehrConfig = await this.getEHRConfig(tenantId, ehrSystem)
      const response = await fetch(`${ehrConfig.fhirEndpoint}/${resourceType}/${resourceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Accept': 'application/fhir+json'
        }
      })

      if (!response.ok) {
        throw new Error(`FHIR read failed: ${response.status} ${response.statusText}`)
      }

      const resource = await response.json()

      // Log access for compliance
      await platformCore.logComplianceEvent(tenantId, {
        type: 'data_access',
        userId: 'system',
        resource: 'fhir_resource',
        action: 'read',
        metadata: { ehrSystem, resourceType, resourceId }
      })

      return resource

    } catch (error) {
      console.error('FHIR resource read failed:', error)
      throw new Error(`Read failed: ${error}`)
    }
  }

  async searchFHIRResources(
    tenantId: string,
    ehrSystem: string,
    resourceType: string,
    searchParams: Record<string, string>
  ): Promise<{ resources: FHIRResource[]; total: number }> {
    try {
      const tokens = await this.getEHRTokens(tenantId, ehrSystem)
      if (!tokens) throw new Error('EHR authentication required')

      const ehrConfig = await this.getEHRConfig(tenantId, ehrSystem)
      const queryString = new URLSearchParams(searchParams).toString()

      const response = await fetch(`${ehrConfig.fhirEndpoint}/${resourceType}?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Accept': 'application/fhir+json'
        }
      })

      if (!response.ok) {
        throw new Error(`FHIR search failed: ${response.status} ${response.statusText}`)
      }

      const bundle = await response.json()
      const resources = bundle.entry?.map((entry: any) => entry.resource) || []

      // Log search for compliance
      await platformCore.logComplianceEvent(tenantId, {
        type: 'data_access',
        userId: 'system',
        resource: 'fhir_search',
        action: 'search',
        metadata: { ehrSystem, resourceType, searchParams }
      })

      return {
        resources,
        total: bundle.total || resources.length
      }

    } catch (error) {
      console.error('FHIR search failed:', error)
      throw new Error(`Search failed: ${error}`)
    }
  }

  // Private helper methods
  private async exchangeCodeForToken(
    ehrConfig: EHRIntegrationConfig,
    authCode: string
  ): Promise<any> {
    const tokenData = {
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: ehrConfig.redirectUri,
      client_id: ehrConfig.clientId,
      client_secret: ehrConfig.clientSecret
    }

    const response = await fetch(ehrConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(tokenData)
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    return await response.json()
  }

  private async storeEHRTokens(
    tenantId: string,
    ehrSystem: string,
    tokens: any
  ): Promise<void> {
    const tokenKey = `ehr_tokens:${tenantId}:${ehrSystem}`
    await this.redis.setex(
      tokenKey,
      tokens.expires_in || 3600,
      JSON.stringify(tokens)
    )
  }

  private async getEHRTokens(tenantId: string, ehrSystem: string): Promise<any> {
    const tokenKey = `ehr_tokens:${tenantId}:${ehrSystem}`
    const tokens = await this.redis.get(tokenKey)
    return tokens ? JSON.parse(tokens as string) : null
  }

  private async getEHRConfig(tenantId: string, ehrSystem: string): Promise<EHRIntegrationConfig> {
    // In production, retrieve from secure configuration store
    return {
      ehrSystem: ehrSystem as any,
      baseUrl: process.env[`${ehrSystem.toUpperCase()}_BASE_URL`] || '',
      clientId: process.env[`${ehrSystem.toUpperCase()}_CLIENT_ID`] || '',
      clientSecret: process.env[`${ehrSystem.toUpperCase()}_CLIENT_SECRET`] || '',
      scope: ['patient/read', 'observation/read', 'condition/read'],
      redirectUri: process.env[`${ehrSystem.toUpperCase()}_REDIRECT_URI`] || '',
      authEndpoint: process.env[`${ehrSystem.toUpperCase()}_AUTH_ENDPOINT`] || '',
      tokenEndpoint: process.env[`${ehrSystem.toUpperCase()}_TOKEN_ENDPOINT`] || '',
      fhirEndpoint: process.env[`${ehrSystem.toUpperCase()}_FHIR_ENDPOINT`] || ''
    }
  }

  private async importPatientDataFromEHR(
    tenantId: string,
    patientId: string,
    ehrSystem: string,
    accessToken: string
  ): Promise<{ resourceCount: number; errors: string[] }> {
    let resourceCount = 0
    const errors: string[] = []

    try {
      // Import patient demographics
      const patient = await this.readFHIRResource(tenantId, ehrSystem, 'Patient', patientId)
      await this.storeFHIRResource(tenantId, patient)
      resourceCount++

      // Import observations (lab results, vitals)
      const observations = await this.searchFHIRResources(tenantId, ehrSystem, 'Observation', {
        'subject': `Patient/${patientId}`,
        '_count': '100'
      })
      for (const observation of observations.resources) {
        await this.storeFHIRResource(tenantId, observation)
        resourceCount++
      }

      // Import conditions
      const conditions = await this.searchFHIRResources(tenantId, ehrSystem, 'Condition', {
        'subject': `Patient/${patientId}`,
        '_count': '100'
      })
      for (const condition of conditions.resources) {
        await this.storeFHIRResource(tenantId, condition)
        resourceCount++
      }

      // Import medications
      const medications = await this.searchFHIRResources(tenantId, ehrSystem, 'MedicationStatement', {
        'subject': `Patient/${patientId}`,
        '_count': '100'
      })
      for (const medication of medications.resources) {
        await this.storeFHIRResource(tenantId, medication)
        resourceCount++
      }

    } catch (error) {
      errors.push(`Import error: ${error}`)
    }

    return { resourceCount, errors }
  }

  private async exportPatientDataToEHR(
    tenantId: string,
    patientId: string,
    ehrSystem: string,
    accessToken: string
  ): Promise<{ resourceCount: number; errors: string[] }> {
    let resourceCount = 0
    const errors: string[] = []

    try {
      // Export AI-generated observations and recommendations
      const aiObservations = await this.getAIGeneratedObservations(tenantId, patientId)
      for (const observation of aiObservations) {
        const result = await this.createFHIRResource(tenantId, ehrSystem, observation)
        if (result.id) resourceCount++
      }

    } catch (error) {
      errors.push(`Export error: ${error}`)
    }

    return { resourceCount, errors }
  }

  private async storeFHIRResource(tenantId: string, resource: FHIRResource): Promise<void> {
    const resourceKey = `fhir:${tenantId}:${resource.resourceType}:${resource.id}`
    await this.redis.setex(resourceKey, 86400 * 30, JSON.stringify(resource)) // 30 days
  }

  private async getAIGeneratedObservations(tenantId: string, patientId: string): Promise<FHIRObservation[]> {
    // Retrieve AI-generated insights and convert to FHIR observations
    return []
  }

  private generateFHIRId(): string {
    return `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private extractValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  private async applyTransformation(
    value: any,
    transformFunction?: string,
    validation?: any
  ): Promise<any> {
    // Apply validation
    if (validation) {
      if (validation.required && (value === undefined || value === null)) {
        throw new Error('Required field is missing')
      }
      // Additional validation logic
    }

    // Apply transformation function
    if (transformFunction) {
      switch (transformFunction) {
        case 'date_to_fhir':
          return new Date(value).toISOString()
        case 'string_to_upper':
          return value.toString().toUpperCase()
        case 'numeric_to_string':
          return value.toString()
        default:
          return value
      }
    }

    return value
  }

  private async applyReverseTransformation(value: any, transformFunction?: string): Promise<any> {
    if (transformFunction) {
      switch (transformFunction) {
        case 'date_to_fhir':
          return new Date(value).toLocaleDateString()
        case 'string_to_upper':
          return value.toString().toLowerCase()
        case 'numeric_to_string':
          return parseFloat(value)
        default:
          return value
      }
    }
    return value
  }

  private async applyTerminologyMappings(resource: any, sourceSystem: string): Promise<any> {
    // Apply terminology mappings to coded values
    if (resource.code?.coding) {
      for (const coding of resource.code.coding) {
        const mapping = await this.mapTerminology(coding.code, sourceSystem, 'http://snomed.info/sct')
        if (mapping) {
          coding.system = mapping.targetSystem
          coding.code = mapping.targetCode
        }
      }
    }
    return resource
  }

  private async applyReverseTerminologyMappings(data: any, targetSystem: string): Promise<any> {
    // Apply reverse terminology mappings
    return data
  }

  private async validateFHIRResource(resource: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Basic FHIR validation
    if (!resource.resourceType) {
      errors.push('resourceType is required')
    }

    // Resource-specific validation
    switch (resource.resourceType) {
      case 'Patient':
        if (!resource.name || resource.name.length === 0) {
          errors.push('Patient must have at least one name')
        }
        break
      case 'Observation':
        if (!resource.status) {
          errors.push('Observation status is required')
        }
        if (!resource.code) {
          errors.push('Observation code is required')
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private async recordSyncMetrics(tenantId: string, syncId: string, metrics: any): Promise<void> {
    await this.redis.hset(`sync_metrics:${tenantId}`, syncId, JSON.stringify({
      ...metrics,
      timestamp: new Date().toISOString()
    }))
  }

  private initializeStandardMappings(): void {
    // Initialize common terminology mappings
    this.addTerminologyMapping({
      sourceCode: 'M',
      sourceSystem: 'internal',
      targetCode: 'male',
      targetSystem: 'http://hl7.org/fhir/administrative-gender',
      equivalence: 'equivalent'
    })

    this.addTerminologyMapping({
      sourceCode: 'F',
      sourceSystem: 'internal',
      targetCode: 'female',
      targetSystem: 'http://hl7.org/fhir/administrative-gender',
      equivalence: 'equivalent'
    })

    // Initialize data mapping rules for common transformations
    this.dataMappingRules.set('internal_to_fhir_Patient', [
      {
        id: 'patient_name',
        sourceSystem: 'internal',
        targetSystem: 'fhir',
        sourceField: 'firstName',
        targetField: 'name.0.given.0'
      },
      {
        id: 'patient_family',
        sourceSystem: 'internal',
        targetSystem: 'fhir',
        sourceField: 'lastName',
        targetField: 'name.0.family'
      },
      {
        id: 'patient_gender',
        sourceSystem: 'internal',
        targetSystem: 'fhir',
        sourceField: 'gender',
        targetField: 'gender'
      },
      {
        id: 'patient_birthdate',
        sourceSystem: 'internal',
        targetSystem: 'fhir',
        sourceField: 'dateOfBirth',
        targetField: 'birthDate',
        transformFunction: 'date_to_fhir'
      }
    ])
  }
}

// Export singleton
export const fhirInteroperability = new FHIRInteroperabilityEngine()