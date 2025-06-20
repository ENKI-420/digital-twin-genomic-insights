import { FederatedBaseAgent } from '../federated-base-agent'
import { AgentMessage } from '../orchestration/agent-registry'

export interface DicomStudy {
  studyId: string
  patientId: string
  modality: string
  bodyPart: string
  studyDate: Date
  images: DicomImage[]
}

export interface DicomImage {
  imageId: string
  sopInstanceUID: string
  pixelData?: ArrayBuffer
  metadata: Record<string, any>
}

export interface AnomalyDetection {
  studyId: string
  findings: Finding[]
  confidence: number
  priorityScore: number
  recommendations: string[]
}

export interface Finding {
  type: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  boundingBox?: { x: number; y: number; width: number; height: number }
}

export class RadiologyAgent extends FederatedBaseAgent {
  constructor() {
    super({
      id: 'radiology-agent-001',
      name: 'Radiology AI Assistant',
      department: 'Radiology',
      capabilities: [
        'dicom_triage',
        'anomaly_detection',
        'priority_scheduling',
        'report_generation',
        'image_enhancement'
      ],
      requiredPermissions: [
        'dicom:read',
        'patient:read',
        'report:write',
        'ai:inference'
      ]
    })
  }

  async processMessage(message: AgentMessage): Promise<void> {
    switch (message.payload.action) {
      case 'triage_study':
        await this.triageStudy(message.payload.studyId)
        break
      case 'detect_anomalies':
        await this.detectAnomalies(message.payload.study)
        break
      case 'generate_preliminary_report':
        await this.generatePreliminaryReport(message.payload.studyId)
        break
      default:
        await this.handleUnknownAction(message)
    }
  }

  private async triageStudy(studyId: string): Promise<void> {
    try {
      // Fetch DICOM metadata
      const study = await this.fetchDicomStudy(studyId)

      // Run AI triage model
      const triageResult = await this.runTriageModel(study)

      // Calculate priority score
      const priorityScore = this.calculatePriorityScore(triageResult)

      // Route to appropriate workflow
      if (priorityScore > 0.8) {
        await this.sendMessage({
          to: 'oncology-agent-001',
          type: 'request',
          payload: {
            action: 'urgent_review',
            studyId,
            findings: triageResult.findings,
            priority: 'critical'
          },
          priority: 'critical'
        })
      }

      // Update worklist
      await this.updateRadiologyWorklist(studyId, priorityScore)

    } catch (error) {
      await this.handleError(error, 'triage_study', { studyId })
    }
  }

  private async detectAnomalies(study: DicomStudy): Promise<AnomalyDetection> {
    // Prepare images for AI model
    const preprocessedImages = await this.preprocessDicomImages(study.images)

    // Run anomaly detection model (mock implementation)
    const findings: Finding[] = []

    // Simulate AI detection based on modality
    if (study.modality === 'CT' && study.bodyPart === 'CHEST') {
      findings.push({
        type: 'nodule',
        location: 'right upper lobe',
        severity: 'medium',
        confidence: 0.89,
        boundingBox: { x: 120, y: 200, width: 30, height: 35 }
      })
    }

    const anomalyResult: AnomalyDetection = {
      studyId: study.studyId,
      findings,
      confidence: findings.length > 0 ? 0.85 : 0.95,
      priorityScore: this.calculateFindingsPriority(findings),
      recommendations: this.generateRecommendations(findings, study)
    }

    // Send results to requesting agent
    await this.sendMessage({
      to: message.from,
      type: 'response',
      payload: {
        action: 'anomaly_detection_complete',
        result: anomalyResult
      },
      correlationId: message.id,
      priority: anomalyResult.priorityScore > 0.7 ? 'high' : 'normal'
    })

    return anomalyResult
  }

  private async generatePreliminaryReport(studyId: string): Promise<string> {
    const study = await this.fetchDicomStudy(studyId)
    const anomalies = await this.detectAnomalies(study)

    const report = `
PRELIMINARY RADIOLOGY REPORT
Study ID: ${studyId}
Modality: ${study.modality}
Body Part: ${study.bodyPart}
Date: ${study.studyDate.toISOString()}

AI-ASSISTED FINDINGS:
${anomalies.findings.map(f =>
  `- ${f.type} detected in ${f.location} (Confidence: ${(f.confidence * 100).toFixed(1)}%)`
).join('\n')}

RECOMMENDATIONS:
${anomalies.recommendations.join('\n')}

Note: This is an AI-generated preliminary report. Final interpretation pending radiologist review.
`

    // Store report
    await this.storeReport(studyId, report)

    // Notify radiologist
    await this.sendMessage({
      to: 'notification-agent-001',
      type: 'event',
      payload: {
        action: 'notify_radiologist',
        studyId,
        message: 'Preliminary AI report ready for review',
        priority: anomalies.priorityScore > 0.7 ? 'urgent' : 'routine'
      },
      priority: 'normal'
    })

    return report
  }

  private async fetchDicomStudy(studyId: string): Promise<DicomStudy> {
    // Mock implementation - would integrate with PACS
    return {
      studyId,
      patientId: 'PT-' + Math.random().toString(36).substr(2, 9),
      modality: 'CT',
      bodyPart: 'CHEST',
      studyDate: new Date(),
      images: []
    }
  }

  private async preprocessDicomImages(images: DicomImage[]): Promise<any[]> {
    // Image preprocessing for AI model
    return images.map(img => ({
      id: img.imageId,
      // Normalize, resize, etc.
      processed: true
    }))
  }

  private calculatePriorityScore(triageResult: any): number {
    // Complex scoring algorithm
    let score = 0.5

    if (triageResult.findings.some((f: Finding) => f.severity === 'critical')) {
      score = 0.95
    } else if (triageResult.findings.some((f: Finding) => f.severity === 'high')) {
      score = 0.8
    }

    return score
  }

  private calculateFindingsPriority(findings: Finding[]): number {
    if (findings.length === 0) return 0.1

    const severityScores = {
      low: 0.3,
      medium: 0.5,
      high: 0.8,
      critical: 1.0
    }

    const maxSeverity = Math.max(
      ...findings.map(f => severityScores[f.severity])
    )

    return maxSeverity
  }

  private generateRecommendations(findings: Finding[], study: DicomStudy): string[] {
    const recommendations: string[] = []

    if (findings.some(f => f.type === 'nodule')) {
      recommendations.push('Consider follow-up CT in 3-6 months')
      recommendations.push('Correlate with prior imaging if available')
    }

    if (findings.some(f => f.severity === 'high' || f.severity === 'critical')) {
      recommendations.push('Urgent radiologist review recommended')
      recommendations.push('Consider multidisciplinary team discussion')
    }

    return recommendations
  }

  private async updateRadiologyWorklist(studyId: string, priority: number): Promise<void> {
    // Update PACS worklist with AI priority
    await this.redis.zadd('radiology:worklist', {
      score: priority,
      member: studyId
    })
  }

  private async storeReport(studyId: string, report: string): Promise<void> {
    await this.redis.hset('radiology:reports', studyId, report)
    await this.redis.expire(`radiology:reports:${studyId}`, 90 * 24 * 60 * 60) // 90 days
  }
}