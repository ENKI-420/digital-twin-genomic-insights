import { PFRCECore } from "./pfrce-core"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export class WatchtowerScheduler {
  private pfrceCore: PFRCECore
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.pfrceCore = new PFRCECore()
  }

  async startScheduler(): Promise<void> {
    console.log("🕐 Starting PFRCE Watchtower Scheduler")

    // Initialize PFRCE core
    await this.pfrceCore.initializeWatchtower()

    // Schedule recurring tasks
    this.scheduleOpportunityScanning()
    this.scheduleMatchingEngine()
    this.scheduleComplianceMonitoring()
    this.scheduleReportGeneration()
    this.scheduleNotifications()

    console.log("✅ PFRCE Watchtower Scheduler active")
  }

  private scheduleOpportunityScanning(): void {
    // Scan for new opportunities every 5 minutes
    const scanInterval = setInterval(
      async () => {
        try {
          console.log("🔍 Scanning for new federal opportunities...")

          // Track scan metrics
          const startTime = Date.now()

          // Perform scan (this would call actual APIs in production)
          const scanResults = await this.performOpportunityScan()

          const endTime = Date.now()
          const scanDuration = endTime - startTime

          // Store scan metrics
          await redis.setex(
            "watchtower:last_scan",
            3600,
            JSON.stringify({
              timestamp: new Date().toISOString(),
              duration: scanDuration,
              opportunitiesFound: scanResults.newOpportunities,
              totalOpportunities: scanResults.totalOpportunities,
              highPriorityAlerts: scanResults.highPriorityAlerts,
            }),
          )

          console.log(`📊 Scan completed: ${scanResults.newOpportunities} new opportunities found in ${scanDuration}ms`)
        } catch (error) {
          console.error("❌ Opportunity scanning failed:", error)
          await this.logError("opportunity_scanning", error)
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    this.scheduledTasks.set("opportunity_scanning", scanInterval)
  }

  private scheduleMatchingEngine(): void {
    // Run matching engine every 10 minutes
    const matchInterval = setInterval(
      async () => {
        try {
          console.log("🎯 Running opportunity matching engine...")

          const matchResults = await this.runMatchingEngine()

          await redis.setex(
            "watchtower:last_match",
            3600,
            JSON.stringify({
              timestamp: new Date().toISOString(),
              opportunitiesMatched: matchResults.matched,
              highScoreMatches: matchResults.highScore,
              averageMatchScore: matchResults.averageScore,
            }),
          )

          console.log(`🎯 Matching completed: ${matchResults.highScore} high-score matches found`)
        } catch (error) {
          console.error("❌ Matching engine failed:", error)
          await this.logError("matching_engine", error)
        }
      },
      10 * 60 * 1000,
    ) // 10 minutes

    this.scheduledTasks.set("matching_engine", matchInterval)
  }

  private scheduleComplianceMonitoring(): void {
    // Monitor compliance every 30 minutes
    const complianceInterval = setInterval(
      async () => {
        try {
          console.log("🔒 Monitoring compliance status...")

          const complianceResults = await this.monitorCompliance()

          await redis.setex(
            "watchtower:last_compliance",
            3600,
            JSON.stringify({
              timestamp: new Date().toISOString(),
              coordinationsChecked: complianceResults.checked,
              complianceIssues: complianceResults.issues,
              expiringCertifications: complianceResults.expiring,
            }),
          )

          if (complianceResults.issues > 0) {
            await this.sendComplianceAlert(complianceResults)
          }

          console.log(`🔒 Compliance check completed: ${complianceResults.issues} issues found`)
        } catch (error) {
          console.error("❌ Compliance monitoring failed:", error)
          await this.logError("compliance_monitoring", error)
        }
      },
      30 * 60 * 1000,
    ) // 30 minutes

    this.scheduledTasks.set("compliance_monitoring", complianceInterval)
  }

  private scheduleReportGeneration(): void {
    // Generate daily reports at 6 AM
    const now = new Date()
    const tomorrow6AM = new Date(now)
    tomorrow6AM.setDate(tomorrow6AM.getDate() + 1)
    tomorrow6AM.setHours(6, 0, 0, 0)

    const timeUntil6AM = tomorrow6AM.getTime() - now.getTime()

    setTimeout(() => {
      // Generate initial report
      this.generateDailyReport()

      // Then schedule daily reports
      const dailyInterval = setInterval(
        async () => {
          await this.generateDailyReport()
        },
        24 * 60 * 60 * 1000,
      ) // 24 hours

      this.scheduledTasks.set("daily_reports", dailyInterval)
    }, timeUntil6AM)
  }

  private scheduleNotifications(): void {
    // Send notifications every 2 minutes for urgent items
    const notificationInterval = setInterval(
      async () => {
        try {
          await this.processNotificationQueue()
        } catch (error) {
          console.error("❌ Notification processing failed:", error)
          await this.logError("notification_processing", error)
        }
      },
      2 * 60 * 1000,
    ) // 2 minutes

    this.scheduledTasks.set("notifications", notificationInterval)
  }

  private async performOpportunityScan(): Promise<{
    newOpportunities: number
    totalOpportunities: number
    highPriorityAlerts: number
  }> {
    // Mock implementation - in production this would call actual APIs
    const newOpportunities = Math.floor(Math.random() * 5) + 1
    const totalOpportunities = 47 + newOpportunities
    const highPriorityAlerts = Math.floor(Math.random() * 2)

    return {
      newOpportunities,
      totalOpportunities,
      highPriorityAlerts,
    }
  }

  private async runMatchingEngine(): Promise<{
    matched: number
    highScore: number
    averageScore: number
  }> {
    // Mock implementation
    const matched = 47
    const highScore = Math.floor(Math.random() * 5) + 2
    const averageScore = 0.75 + Math.random() * 0.2

    return {
      matched,
      highScore,
      averageScore,
    }
  }

  private async monitorCompliance(): Promise<{
    checked: number
    issues: number
    expiring: number
  }> {
    // Mock implementation
    const checked = 12
    const issues = Math.floor(Math.random() * 3)
    const expiring = Math.floor(Math.random() * 2)

    return {
      checked,
      issues,
      expiring,
    }
  }

  private async generateDailyReport(): Promise<void> {
    try {
      console.log("📊 Generating daily PFRCE report...")

      const report = {
        date: new Date().toISOString().split("T")[0],
        opportunities: {
          total: 47,
          new: 3,
          highPriority: 8,
          averageMatchScore: 0.78,
        },
        coordinations: {
          active: 12,
          completed: 2,
          complianceIssues: 1,
        },
        funding: {
          totalPipeline: 2800000,
          highProbability: 1200000,
          submitted: 500000,
        },
        automation: {
          proposalsGenerated: 5,
          documentsCreated: 23,
          alertsSent: 12,
        },
      }

      await redis.setex("watchtower:daily_report", 86400 * 7, JSON.stringify(report)) // Keep for 7 days

      // Send report to stakeholders
      await this.sendDailyReport(report)

      console.log("📊 Daily report generated and sent")
    } catch (error) {
      console.error("❌ Daily report generation failed:", error)
      await this.logError("daily_report", error)
    }
  }

  private async processNotificationQueue(): Promise<void> {
    // Check for urgent notifications
    const urgentAlerts = await redis.keys("alert:urgent:*")

    for (const alertKey of urgentAlerts) {
      const alert = await redis.get(alertKey)
      if (alert) {
        await this.sendUrgentNotification(alert as any)
        await redis.del(alertKey) // Remove after sending
      }
    }
  }

  private async sendComplianceAlert(results: any): Promise<void> {
    const alert = {
      type: "compliance_alert",
      severity: "high",
      message: `${results.issues} compliance issues detected`,
      details: results,
      timestamp: new Date().toISOString(),
    }

    await redis.setex(`alert:urgent:compliance_${Date.now()}`, 3600, JSON.stringify(alert))
    console.log("🚨 Compliance alert queued for notification")
  }

  private async sendDailyReport(report: any): Promise<void> {
    // Mock email sending - in production would use actual email service
    console.log("📧 Daily report sent to stakeholders:", {
      recipients: ["devin@ads-llc.com"],
      subject: `PFRCE Daily Report - ${report.date}`,
      summary: `${report.opportunities.new} new opportunities, ${report.coordinations.active} active coordinations`,
    })
  }
}

let schedulerInstance: WatchtowerScheduler | null = null;

export function getWatchtowerScheduler(): WatchtowerScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new WatchtowerScheduler();
  }
  return schedulerInstance;
}