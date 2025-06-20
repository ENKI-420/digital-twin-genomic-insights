import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface DeviceReading {
  id: string
  deviceId: string
  patientId: string
  timestamp: string
  type: "blood_pressure" | "heart_rate" | "weight" | "glucose" | "steps" | "sleep" | "temperature"
  value: number | { systolic: number; diastolic: number }
  unit: string
  deviceName: string
  source: "apple_health" | "google_fit" | "epic_mychart" | "manual_entry"
  quality: "high" | "medium" | "low"
  flags?: string[]
}

export interface DeviceAlert {
  id: string
  patientId: string
  type: "critical" | "warning" | "info"
  metric: string
  value: any
  threshold: any
  message: string
  timestamp: string
  acknowledged: boolean
  clinicalAction?: string
}

export interface GenomicRiskProfile {
  patientId: string
  highRiskConditions: string[]
  monitoringRecommendations: {
    metric: string
    frequency: string
    thresholds: {
      critical: number
      warning: number
    }
    genomicBasis: string
  }[]
}

export class EpicDeviceIntegrationService {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  // Main device data ingestion from Epic Tesseract APIs
  async ingestDeviceData(readings: DeviceReading[]): Promise<{
    processed: number
    alerts: DeviceAlert[]
    recommendations: string[]
  }> {
    const alerts: DeviceAlert[] = []
    const recommendations: string[] = []
    let processed = 0

    for (const reading of readings) {
      try {
        // Store reading
        await this.storeDeviceReading(reading)

        // Get patient's genomic risk profile
        const riskProfile = await this.getGenomicRiskProfile(reading.patientId)

        // Check for genomic-informed alerts
        const genomicAlerts = await this.evaluateGenomicAlerts(reading, riskProfile)
        alerts.push(...genomicAlerts)

        // Generate personalized recommendations
        const personalizedRecs = await this.generatePersonalizedRecommendations(reading, riskProfile)
        recommendations.push(...personalizedRecs)

        processed++
      } catch (error) {
        console.error(`Failed to process reading ${reading.id}:`, error)
      }
    }

    // Send critical alerts to Epic via FHIR
    for (const alert of alerts.filter(a => a.type === "critical")) {
      await this.sendEpicAlert(alert)
    }

    return { processed, alerts, recommendations }
  }

  // Apple HealthKit integration
  async syncAppleHealthData(patientId: string, healthData: any[]): Promise<DeviceReading[]> {
    const readings: DeviceReading[] = []

    for (const data of healthData) {
      const reading: DeviceReading = {
        id: `apple_${data.uuid}`,
        deviceId: data.device?.name || "iPhone",
        patientId,
        timestamp: data.startDate,
        type: this.mapAppleHealthType(data.type),
        value: data.value,
        unit: data.unit,
        deviceName: data.device?.name || "Apple Health",
        source: "apple_health",
        quality: this.assessDataQuality(data),
      }

      readings.push(reading)
    }

    await this.ingestDeviceData(readings)
    return readings
  }

  // Google Fit integration
  async syncGoogleFitData(patientId: string, fitData: any[]): Promise<DeviceReading[]> {
    const readings: DeviceReading[] = []

    for (const data of fitData) {
      const reading: DeviceReading = {
        id: `google_${data.dataSourceId}_${data.startTimeNanos}`,
        deviceId: data.originDataSourceId,
        patientId,
        timestamp: new Date(parseInt(data.startTimeNanos) / 1000000).toISOString(),
        type: this.mapGoogleFitType(data.dataTypeName),
        value: data.value[0]?.fpVal || data.value[0]?.intVal,
        unit: this.getGoogleFitUnit(data.dataTypeName),
        deviceName: data.device?.manufacturer || "Google Fit",
        source: "google_fit",
        quality: this.assessDataQuality(data),
      }

      readings.push(reading)
    }

    await this.ingestDeviceData(readings)
    return readings
  }

  // Genomic-informed monitoring recommendations
  async getPersonalizedMonitoringPlan(patientId: string): Promise<{
    recommendations: any[]
    devices: string[]
    frequency: string
    alerts: any[]
  }> {
    const riskProfile = await this.getGenomicRiskProfile(patientId)
    const recentReadings = await this.getRecentReadings(patientId, 30) // Last 30 days

    const recommendations = []
    const devices = new Set<string>()
    const alerts = []

    for (const condition of riskProfile.highRiskConditions) {
      switch (condition) {
        case "hypertension":
          recommendations.push({
            type: "blood_pressure",
            frequency: "daily",
            target: "< 130/80 mmHg",
            genomicBasis: "ACE gene variants detected",
            deviceRecommendation: "Automated BP cuff with Bluetooth"
          })
          devices.add("blood_pressure_monitor")
          break

        case "diabetes":
          recommendations.push({
            type: "glucose",
            frequency: "4x daily",
            target: "80-130 mg/dL fasting",
            genomicBasis: "TCF7L2 variant increases diabetes risk",
            deviceRecommendation: "Continuous glucose monitor"
          })
          devices.add("glucose_monitor")
          break

        case "cardiac_arrhythmia":
          recommendations.push({
            type: "heart_rate",
            frequency: "continuous",
            target: "60-100 bpm resting",
            genomicBasis: "SCN5A variant affects cardiac conduction",
            deviceRecommendation: "Apple Watch with ECG capability"
          })
          devices.add("wearable_ecg")
          break
      }
    }

    return {
      recommendations,
      devices: Array.from(devices),
      frequency: "Daily monitoring recommended",
      alerts
    }
  }

  // Epic FHIR integration for device data
  async sendDeviceDataToEpic(patientId: string, readings: DeviceReading[]): Promise<boolean> {
    try {
      const fhirObservations = readings.map(reading => this.convertToFHIRObservation(reading))

      // Send to Epic FHIR endpoint
      const response = await fetch(`${process.env.EPIC_FHIR_BASE_URL}/api/FHIR/R4/Observation`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${await this.getEpicAccessToken()}`,
          "Content-Type": "application/fhir+json"
        },
        body: JSON.stringify({
          resourceType: "Bundle",
          type: "transaction",
          entry: fhirObservations.map(obs => ({
            request: { method: "POST", url: "Observation" },
            resource: obs
          }))
        })
      })

      return response.ok
    } catch (error) {
      console.error("Failed to send device data to Epic:", error)
      return false
    }
  }

  // Private helper methods
  private async storeDeviceReading(reading: DeviceReading): Promise<void> {
    const key = `device_reading:${reading.patientId}:${reading.id}`
    await this.redis.setex(key, 86400 * 90, JSON.stringify(reading)) // 90 days retention

    // Also store in time-series format for trending
    const timeSeriesKey = `device_series:${reading.patientId}:${reading.type}`
    await this.redis.zadd(timeSeriesKey, {
      score: new Date(reading.timestamp).getTime(),
      member: JSON.stringify({ value: reading.value, quality: reading.quality })
    })
  }

  private async getGenomicRiskProfile(patientId: string): Promise<GenomicRiskProfile> {
    const cacheKey = `genomic_risk:${patientId}`
    const cached = await this.redis.get(cacheKey)

    if (cached) {
      return cached as GenomicRiskProfile
    }

    // Mock genomic risk profile - in real implementation, fetch from genomic analysis
    const profile: GenomicRiskProfile = {
      patientId,
      highRiskConditions: ["hypertension", "diabetes", "cardiac_arrhythmia"],
      monitoringRecommendations: [
        {
          metric: "blood_pressure",
          frequency: "daily",
          thresholds: { critical: 160, warning: 140 },
          genomicBasis: "ACE I/D polymorphism - increased hypertension risk"
        },
        {
          metric: "glucose",
          frequency: "4x daily",
          thresholds: { critical: 250, warning: 180 },
          genomicBasis: "TCF7L2 variant - 40% increased diabetes risk"
        }
      ]
    }

    await this.redis.setex(cacheKey, 3600, JSON.stringify(profile)) // 1 hour cache
    return profile
  }

  private async evaluateGenomicAlerts(reading: DeviceReading, riskProfile: GenomicRiskProfile): Promise<DeviceAlert[]> {
    const alerts: DeviceAlert[] = []

    for (const rec of riskProfile.monitoringRecommendations) {
      if (rec.metric === reading.type) {
        let alertType: "critical" | "warning" | "info" | null = null
        let message = ""

        if (typeof reading.value === "number") {
          if (reading.value >= rec.thresholds.critical) {
            alertType = "critical"
            message = `Critical ${reading.type} reading: ${reading.value}${reading.unit}. Genomic risk factor: ${rec.genomicBasis}`
          } else if (reading.value >= rec.thresholds.warning) {
            alertType = "warning"
            message = `Elevated ${reading.type}: ${reading.value}${reading.unit}. Monitor closely due to genetic predisposition.`
          }
        }

        if (alertType) {
          alerts.push({
            id: `alert_${reading.id}`,
            patientId: reading.patientId,
            type: alertType,
            metric: reading.type,
            value: reading.value,
            threshold: rec.thresholds,
            message,
            timestamp: reading.timestamp,
            acknowledged: false,
            clinicalAction: alertType === "critical" ? "Contact patient immediately" : "Schedule follow-up"
          })
        }
      }
    }

    return alerts
  }

  private async generatePersonalizedRecommendations(reading: DeviceReading, riskProfile: GenomicRiskProfile): Promise<string[]> {
    const recommendations: string[] = []

    // Generate genomic-informed recommendations
    if (reading.type === "blood_pressure" && typeof reading.value === "object") {
      const systolic = reading.value.systolic
      if (systolic > 130) {
        recommendations.push("Consider DASH diet and reduced sodium intake based on your genetic salt sensitivity")
        recommendations.push("ACE inhibitors may be particularly effective given your genetic profile")
      }
    }

    if (reading.type === "glucose" && typeof reading.value === "number" && reading.value > 140) {
      recommendations.push("Your genetic variant increases diabetes risk - consider low-carb diet")
      recommendations.push("Metformin may be especially beneficial for your genotype")
    }

    return recommendations
  }

  private mapAppleHealthType(appleType: string): DeviceReading["type"] {
    const mapping: Record<string, DeviceReading["type"]> = {
      "HKQuantityTypeIdentifierBloodPressureSystolic": "blood_pressure",
      "HKQuantityTypeIdentifierHeartRate": "heart_rate",
      "HKQuantityTypeIdentifierBodyMass": "weight",
      "HKQuantityTypeIdentifierStepCount": "steps",
      "HKQuantityTypeIdentifierBloodGlucose": "glucose",
    }
    return mapping[appleType] || "heart_rate"
  }

  private mapGoogleFitType(fitType: string): DeviceReading["type"] {
    const mapping: Record<string, DeviceReading["type"]> = {
      "com.google.blood_pressure": "blood_pressure",
      "com.google.heart_rate.bpm": "heart_rate",
      "com.google.weight": "weight",
      "com.google.step_count.delta": "steps",
      "com.google.blood_glucose": "glucose",
    }
    return mapping[fitType] || "heart_rate"
  }

  private getGoogleFitUnit(fitType: string): string {
    const units: Record<string, string> = {
      "com.google.blood_pressure": "mmHg",
      "com.google.heart_rate.bpm": "bpm",
      "com.google.weight": "kg",
      "com.google.step_count.delta": "steps",
      "com.google.blood_glucose": "mg/dL",
    }
    return units[fitType] || ""
  }

  private assessDataQuality(data: any): "high" | "medium" | "low" {
    // Simple quality assessment - can be enhanced
    if (data.accuracy && data.accuracy > 0.9) return "high"
    if (data.confidence && data.confidence > 0.8) return "high"
    return "medium"
  }

  private convertToFHIRObservation(reading: DeviceReading): any {
    return {
      resourceType: "Observation",
      status: "final",
      category: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/observation-category",
          code: "vital-signs",
          display: "Vital Signs"
        }]
      }],
      code: {
        coding: [{
          system: "http://loinc.org",
          code: this.getLOINCCode(reading.type),
          display: this.getLOINCDisplay(reading.type)
        }]
      },
      subject: {
        reference: `Patient/${reading.patientId}`
      },
      effectiveDateTime: reading.timestamp,
      valueQuantity: {
        value: reading.value,
        unit: reading.unit,
        system: "http://unitsofmeasure.org"
      },
      device: {
        display: reading.deviceName
      }
    }
  }

  private getLOINCCode(type: string): string {
    const codes: Record<string, string> = {
      "blood_pressure": "85354-9",
      "heart_rate": "8867-4",
      "weight": "29463-7",
      "glucose": "33747-0",
      "steps": "55423-8",
    }
    return codes[type] || "8867-4"
  }

  private getLOINCDisplay(type: string): string {
    const displays: Record<string, string> = {
      "blood_pressure": "Blood pressure panel",
      "heart_rate": "Heart rate",
      "weight": "Body weight",
      "glucose": "Glucose",
      "steps": "Steps",
    }
    return displays[type] || "Vital sign"
  }

  private async getRecentReadings(patientId: string, days: number): Promise<DeviceReading[]> {
    // Implementation to get recent readings
    return []
  }

  private async sendEpicAlert(alert: DeviceAlert): Promise<void> {
    // Send critical alerts to Epic InBasket or create tasks
    try {
      const task = {
        resourceType: "Task",
        status: "requested",
        intent: "order",
        priority: alert.type === "critical" ? "urgent" : "routine",
        description: alert.message,
        for: { reference: `Patient/${alert.patientId}` },
        authoredOn: alert.timestamp
      }

      await fetch(`${process.env.EPIC_FHIR_BASE_URL}/api/FHIR/R4/Task`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${await this.getEpicAccessToken()}`,
          "Content-Type": "application/fhir+json"
        },
        body: JSON.stringify(task)
      })
    } catch (error) {
      console.error("Failed to send Epic alert:", error)
    }
  }

  private async getEpicAccessToken(): Promise<string> {
    // Get Epic access token - implementation depends on your auth setup
    return process.env.EPIC_ACCESS_TOKEN || ""
  }
}