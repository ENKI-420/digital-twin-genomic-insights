import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface SDOHAssessment {
  id: string
  patientId: string
  assessmentDate: string
  assessmentType: "screening" | "comprehensive" | "follow_up"
  domains: {
    housing: SDOHDomain
    food: SDOHDomain
    transportation: SDOHDomain
    utilities: SDOHDomain
    safety: SDOHDomain
    employment: SDOHDomain
    education: SDOHDomain
    social_support: SDOHDomain
  }
  overallRiskLevel: "low" | "moderate" | "high" | "critical"
  genomicFactors?: GenomicSDOHFactors
}

export interface SDOHDomain {
  status: "stable" | "at_risk" | "crisis"
  needs: string[]
  resources: CommunityResource[]
  interventions: SDOHIntervention[]
  lastAssessed: string
}

export interface CommunityResource {
  id: string
  name: string
  organization: string
  category: "housing" | "food" | "transportation" | "healthcare" | "social_services"
  description: string
  eligibilityRequirements: string[]
  contactInfo: {
    phone: string
    website: string
    address: string
  }
  availability: string
  cost: string
  referralRequired: boolean
}

export interface SDOHIntervention {
  id: string
  type: "referral" | "education" | "support" | "financial_assistance"
  description: string
  status: "planned" | "in_progress" | "completed" | "discontinued"
  assignedTo: string
  dueDate: string
  outcomeTracking?: {
    metrics: string[]
    frequency: string
    lastUpdate: string
  }
}

export interface GenomicSDOHFactors {
  geneticPredispositions: {
    condition: string
    environmentalTriggers: string[]
    preventiveActions: string[]
  }[]
  pharmacogenomicConsiderations: {
    medication: string
    environmentalFactors: string[]
    monitoringNeeds: string[]
  }[]
}

export class SDOHIntegrationService {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  // Comprehensive SDOH assessment with genomic context
  async conductSDOHAssessment(
    patientId: string,
    responses: Record<string, any>,
    genomicData?: any
  ): Promise<SDOHAssessment> {
    const assessmentId = `sdoh_${patientId}_${Date.now()}`

    const assessment: SDOHAssessment = {
      id: assessmentId,
      patientId,
      assessmentDate: new Date().toISOString(),
      assessmentType: "comprehensive",
      domains: {
        housing: await this.assessHousingDomain(responses.housing),
        food: await this.assessFoodDomain(responses.food),
        transportation: await this.assessTransportationDomain(responses.transportation),
        utilities: await this.assessUtilitiesDomain(responses.utilities),
        safety: await this.assessSafetyDomain(responses.safety),
        employment: await this.assessEmploymentDomain(responses.employment),
        education: await this.assessEducationDomain(responses.education),
        social_support: await this.assessSocialSupportDomain(responses.social_support)
      },
      overallRiskLevel: "moderate", // Will be calculated
      genomicFactors: genomicData ? await this.analyzeGenomicSDOHFactors(genomicData) : undefined
    }

    // Calculate overall risk level
    assessment.overallRiskLevel = this.calculateOverallRiskLevel(assessment.domains)

    // Generate genomic-informed interventions
    if (assessment.genomicFactors) {
      await this.generateGenomicInformedInterventions(assessment)
    }

    // Store assessment
    await this.redis.setex(
      `sdoh_assessment:${patientId}:${assessmentId}`,
      86400 * 365, // 1 year retention
      JSON.stringify(assessment)
    )

    // Send to Epic FHIR as Observation
    await this.sendSDOHToEpic(assessment)

    return assessment
  }

  // Find community resources based on SDOH needs and location
  async findCommunityResources(
    patientId: string,
    needs: string[],
    location?: { zipCode: string; city: string; state: string }
  ): Promise<{
    resources: CommunityResource[]
    referralOpportunities: any[]
    prioritizedActions: string[]
  }> {
    const resources: CommunityResource[] = []
    const referralOpportunities: any[] = []

    // Mock 211 (United Way) integration - in real implementation, connect to 211 API
    const mockResources = await this.get211Resources(needs, location)
    resources.push(...mockResources)

    // Healthcare-specific resources
    const healthcareResources = await this.getHealthcareResources(needs, location)
    resources.push(...healthcareResources)

    // Generate prioritized actions based on genomic risk factors
    const genomicData = await this.getPatientGenomicData(patientId)
    const prioritizedActions = genomicData
      ? await this.prioritizeActionsWithGenomics(needs, genomicData)
      : this.prioritizeActions(needs)

    // Create Epic-compatible referral opportunities
    for (const resource of resources.slice(0, 5)) { // Top 5 resources
      if (resource.referralRequired) {
        referralOpportunities.push({
          resource,
          epic_task: await this.createEpicReferralTask(patientId, resource),
          urgency: this.calculateReferralUrgency(resource, needs)
        })
      }
    }

    return { resources, referralOpportunities, prioritizedActions }
  }

  // Generate Epic-compatible SDOH care plan
  async generateSDOHCarePlan(assessment: SDOHAssessment): Promise<any> {
    const carePlan = {
      resourceType: "CarePlan",
      status: "active",
      intent: "plan",
      category: [{
        coding: [{
          system: "http://hl7.org/fhir/us/sdoh-clinicalcare/CodeSystem/SDOHCC-CodeSystemTemporaryCodes",
          code: "sdoh-category-unspecified",
          display: "SDOH Category Unspecified"
        }]
      }],
      subject: { reference: `Patient/${assessment.patientId}` },
      period: {
        start: assessment.assessmentDate,
        end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      },
      activity: []
    }

    // Add activities for each high-risk domain
    for (const [domainName, domain] of Object.entries(assessment.domains)) {
      if (domain.status === "at_risk" || domain.status === "crisis") {
        carePlan.activity.push({
          detail: {
            kind: "ServiceRequest",
            code: {
              coding: [{
                system: "http://snomed.info/sct",
                code: this.getSDOHSnomedCode(domainName),
                display: `${domainName.replace('_', ' ')} support services`
              }]
            },
            status: "not-started",
            description: `Address ${domainName} needs: ${domain.needs.join(', ')}`,
            scheduledPeriod: {
              start: new Date().toISOString(),
              end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        })
      }
    }

    // Add genomic-specific considerations
    if (assessment.genomicFactors) {
      for (const predisposition of assessment.genomicFactors.geneticPredispositions) {
        carePlan.activity.push({
          detail: {
            kind: "ServiceRequest",
            code: {
              coding: [{
                system: "http://snomed.info/sct",
                code: "182836005",
                display: "Environmental risk assessment"
              }]
            },
            status: "not-started",
            description: `Monitor environmental triggers for ${predisposition.condition}: ${predisposition.environmentalTriggers.join(', ')}`,
            reasonReference: [{
              display: `Genetic predisposition to ${predisposition.condition}`
            }]
          }
        })
      }
    }

    return carePlan
  }

  // Epic InBasket integration for SDOH alerts
  async sendSDOHAlert(patientId: string, domain: string, urgency: "low" | "medium" | "high" | "critical"): Promise<void> {
    const alert = {
      resourceType: "Communication",
      status: "completed",
      category: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/communication-category",
          code: "alert",
          display: "Alert"
        }]
      }],
      priority: urgency === "critical" ? "urgent" : urgency === "high" ? "asap" : "routine",
      subject: { reference: `Patient/${patientId}` },
      payload: [{
        contentString: `SDOH Alert: Patient has high-risk ${domain} needs requiring immediate attention. Review community resource referrals.`
      }],
      sent: new Date().toISOString()
    }

    try {
      await fetch(`${process.env.EPIC_FHIR_BASE_URL}/api/FHIR/R4/Communication`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${await this.getEpicAccessToken()}`,
          "Content-Type": "application/fhir+json"
        },
        body: JSON.stringify(alert)
      })
    } catch (error) {
      console.error("Failed to send SDOH alert to Epic:", error)
    }
  }

  // Private helper methods
  private async assessHousingDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    const resources: CommunityResource[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.housing_insecurity) {
      needs.push("Stable housing assistance")
      status = "at_risk"
    }
    if (responses.homelessness) {
      needs.push("Emergency shelter", "Permanent housing placement")
      status = "crisis"
    }
    if (responses.housing_quality_issues) {
      needs.push("Housing quality improvement", "Safety inspection")
      status = "at_risk"
    }

    return {
      status,
      needs,
      resources,
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private async assessFoodDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.food_insecurity) {
      needs.push("Food assistance programs", "SNAP benefits")
      status = "at_risk"
    }
    if (responses.unable_to_afford_food) {
      needs.push("Emergency food assistance", "Food pantry referral")
      status = "crisis"
    }

    return {
      status,
      needs,
      resources: [],
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private async assessTransportationDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.transportation_barriers) {
      needs.push("Medical transportation", "Public transit assistance")
      status = "at_risk"
    }

    return {
      status,
      needs,
      resources: [],
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private async assessUtilitiesDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.utility_shutoff_risk) {
      needs.push("Utility assistance programs", "Energy efficiency programs")
      status = "at_risk"
    }

    return {
      status,
      needs,
      resources: [],
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private async assessSafetyDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.domestic_violence) {
      needs.push("Domestic violence support", "Safety planning")
      status = "crisis"
    }
    if (responses.neighborhood_safety) {
      needs.push("Community safety resources")
      status = "at_risk"
    }

    return {
      status,
      needs,
      resources: [],
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private async assessEmploymentDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.unemployment) {
      needs.push("Job training programs", "Employment assistance")
      status = "at_risk"
    }

    return {
      status,
      needs,
      resources: [],
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private async assessEducationDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.education_barriers) {
      needs.push("Educational support", "Health literacy programs")
      status = "at_risk"
    }

    return {
      status,
      needs,
      resources: [],
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private async assessSocialSupportDomain(responses: any): Promise<SDOHDomain> {
    const needs: string[] = []
    let status: "stable" | "at_risk" | "crisis" = "stable"

    if (responses.social_isolation) {
      needs.push("Social support groups", "Community engagement programs")
      status = "at_risk"
    }

    return {
      status,
      needs,
      resources: [],
      interventions: [],
      lastAssessed: new Date().toISOString()
    }
  }

  private calculateOverallRiskLevel(domains: SDOHAssessment["domains"]): "low" | "moderate" | "high" | "critical" {
    const crisisCount = Object.values(domains).filter(d => d.status === "crisis").length
    const atRiskCount = Object.values(domains).filter(d => d.status === "at_risk").length

    if (crisisCount > 0) return "critical"
    if (atRiskCount >= 3) return "high"
    if (atRiskCount >= 1) return "moderate"
    return "low"
  }

  private async analyzeGenomicSDOHFactors(genomicData: any): Promise<GenomicSDOHFactors> {
    return {
      geneticPredispositions: [
        {
          condition: "Type 2 Diabetes",
          environmentalTriggers: ["Poor diet", "Sedentary lifestyle", "Stress"],
          preventiveActions: ["Nutritional counseling", "Exercise programs", "Stress management"]
        },
        {
          condition: "Hypertension",
          environmentalTriggers: ["High sodium diet", "Environmental pollutants", "Chronic stress"],
          preventiveActions: ["DASH diet education", "Environmental assessment", "Mindfulness programs"]
        }
      ],
      pharmacogenomicConsiderations: [
        {
          medication: "Warfarin",
          environmentalFactors: ["Diet consistency", "Alcohol consumption"],
          monitoringNeeds: ["Dietary counseling", "Social support for medication adherence"]
        }
      ]
    }
  }

  private async generateGenomicInformedInterventions(assessment: SDOHAssessment): Promise<void> {
    // Add genomic-specific interventions to domains
    if (assessment.genomicFactors) {
      for (const predisposition of assessment.genomicFactors.geneticPredispositions) {
        if (predisposition.condition.includes("Diabetes") && assessment.domains.food.status !== "stable") {
          assessment.domains.food.interventions.push({
            id: `genomic_food_${Date.now()}`,
            type: "education",
            description: `Diabetes-specific nutritional counseling based on genetic risk`,
            status: "planned",
            assignedTo: "nutritionist",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
      }
    }
  }

  private async get211Resources(needs: string[], location?: any): Promise<CommunityResource[]> {
    // Mock 211 integration - in real implementation, call 211 API
    return [
      {
        id: "211_food_001",
        name: "Community Food Bank",
        organization: "United Way",
        category: "food",
        description: "Emergency food assistance for families in need",
        eligibilityRequirements: ["Income below 185% of federal poverty level"],
        contactInfo: {
          phone: "(555) 123-4567",
          website: "https://foodbank.org",
          address: "123 Main St, City, State"
        },
        availability: "Monday-Friday 9AM-5PM",
        cost: "Free",
        referralRequired: true
      }
    ]
  }

  private async getHealthcareResources(needs: string[], location?: any): Promise<CommunityResource[]> {
    return [
      {
        id: "health_001",
        name: "Community Health Center",
        organization: "FQHC Network",
        category: "healthcare",
        description: "Primary care services for uninsured and underinsured",
        eligibilityRequirements: ["Sliding fee scale based on income"],
        contactInfo: {
          phone: "(555) 987-6543",
          website: "https://communityhealthcenter.org",
          address: "456 Health Way, City, State"
        },
        availability: "24/7 urgent care, appointments available",
        cost: "Sliding scale",
        referralRequired: false
      }
    ]
  }

  private async prioritizeActionsWithGenomics(needs: string[], genomicData: any): Promise<string[]> {
    const actions = this.prioritizeActions(needs)

    // Add genomic-specific priorities
    if (genomicData?.highRiskConditions?.includes("diabetes")) {
      actions.unshift("Urgent: Address food insecurity due to genetic diabetes risk")
    }

    return actions
  }

  private prioritizeActions(needs: string[]): string[] {
    return needs.sort((a, b) => {
      const priorities = { "Emergency": 1, "Housing": 2, "Food": 3, "Transportation": 4 }
      return (priorities[a.split(" ")[0] as keyof typeof priorities] || 5) -
             (priorities[b.split(" ")[0] as keyof typeof priorities] || 5)
    })
  }

  private async createEpicReferralTask(patientId: string, resource: CommunityResource): Promise<any> {
    return {
      resourceType: "Task",
      status: "requested",
      intent: "order",
      priority: "routine",
      description: `Refer patient to ${resource.name} for ${resource.category} assistance`,
      for: { reference: `Patient/${patientId}` },
      owner: { display: "Social Worker" },
      authoredOn: new Date().toISOString()
    }
  }

  private calculateReferralUrgency(resource: CommunityResource, needs: string[]): "low" | "medium" | "high" {
    if (needs.some(need => need.includes("Emergency") || need.includes("Crisis"))) return "high"
    if (resource.category === "housing" || resource.category === "food") return "medium"
    return "low"
  }

  private getSDOHSnomedCode(domain: string): string {
    const codes: Record<string, string> = {
      "housing": "32911000",
      "food": "733423003",
      "transportation": "160245001",
      "safety": "225746001",
      "employment": "224363007",
      "education": "409073007",
      "social_support": "410605003"
    }
    return codes[domain] || "410605003"
  }

  private async sendSDOHToEpic(assessment: SDOHAssessment): Promise<void> {
    const observation = {
      resourceType: "Observation",
      status: "final",
      category: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/observation-category",
          code: "social-history",
          display: "Social History"
        }]
      }],
      code: {
        coding: [{
          system: "http://loinc.org",
          code: "76513-1",
          display: "Social determinants of health"
        }]
      },
      subject: { reference: `Patient/${assessment.patientId}` },
      effectiveDateTime: assessment.assessmentDate,
      valueString: `SDOH Risk Level: ${assessment.overallRiskLevel}`
    }

    try {
      await fetch(`${process.env.EPIC_FHIR_BASE_URL}/api/FHIR/R4/Observation`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${await this.getEpicAccessToken()}`,
          "Content-Type": "application/fhir+json"
        },
        body: JSON.stringify(observation)
      })
    } catch (error) {
      console.error("Failed to send SDOH assessment to Epic:", error)
    }
  }

  private async getPatientGenomicData(patientId: string): Promise<any> {
    const cacheKey = `genomic_data:${patientId}`
    return await this.redis.get(cacheKey)
  }

  private async getEpicAccessToken(): Promise<string> {
    return process.env.EPIC_ACCESS_TOKEN || ""
  }
}