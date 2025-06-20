import { Redis } from "@upstash/redis"
import { put, list, del } from "@vercel/blob"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface BeakerReport {
  id: string
  patientId: string
  reportType: "laboratory" | "imaging" | "pathology" | "clinical_notes"
  orderDate: string
  resultDate: string
  status: "pending" | "partial" | "final" | "corrected"
  priority: "routine" | "urgent" | "stat"
  provider: string
  department: string
  results: BeakerResult[]
  metadata: {
    accessionNumber: string
    specimenType?: string
    collectionDate?: string
    receivedDate?: string
  }
}

export interface BeakerResult {
  testCode: string
  testName: string
  value: string | number
  unit?: string
  referenceRange?: string
  abnormalFlag?: "L" | "H" | "LL" | "HH" | "A" | "AA"
  status: "pending" | "final" | "corrected"
  comments?: string
}

export interface BeakerQuery {
  patientId?: string
  dateFrom?: string
  dateTo?: string
  reportType?: string[]
  status?: string[]
  department?: string
  provider?: string
  testCodes?: string[]
  limit?: number
  offset?: number
}

export class BeakerIntegration {
  private redis: Redis
  private baseUrl: string
  // private apiKey: string

  constructor() {
    this.redis = redis
    this.baseUrl = process.env.EPIC_FHIR_BASE_URL || "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
    // Remove apiKey - we'll use OAuth2 tokens instead
  }

  async getEpicAccessToken(): Promise<string> {
    const cacheKey = "epic_access_token"

    // Check cached token
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return cached as string
    }

    try {
      const response = await fetch(process.env.EPIC_TOKEN_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.EPIC_CLIENT_ID!,
          client_secret: process.env.EPIC_CLIENT_SECRET!,
          scope: "patient/DiagnosticReport.read DiagnosticReport.read",
        }),
      })

      const tokenData = await response.json()

      // Cache token for 50 minutes (Epic tokens typically last 1 hour)
      await this.redis.setex(cacheKey, 3000, tokenData.access_token)

      return tokenData.access_token
    } catch (error) {
      console.error("Failed to get Epic access token:", error)
      throw new Error("Epic authentication failed")
    }
  }

  async fetchReports(query: BeakerQuery): Promise<{
    reports: BeakerReport[]
    totalCount: number
    hasMore: boolean
  }> {
    const cacheKey = `beaker_reports:${JSON.stringify(query)}`

    // Check cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return cached as any
    }

    try {
      const accessToken = await this.getEpicAccessToken()

      // Build FHIR query parameters
      const fhirParams = new URLSearchParams()
      if (query.patientId) fhirParams.append("subject", query.patientId)
      if (query.dateFrom) fhirParams.append("date", `ge${query.dateFrom}`)
      if (query.dateTo) fhirParams.append("date", `le${query.dateTo}`)
      if (query.limit) fhirParams.append("_count", query.limit.toString())

      const response = await fetch(`${this.baseUrl}/DiagnosticReport?${fhirParams}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/fhir+json",
          "Content-Type": "application/fhir+json",
        },
      })

      if (!response.ok) {
        throw new Error(`Epic FHIR API error: ${response.status}`)
      }

      const fhirBundle = await response.json()
      const reports = this.convertFhirToBeakerReports(fhirBundle)

      const result = {
        reports,
        totalCount: fhirBundle.total || reports.length,
        hasMore: fhirBundle.link?.some((link: any) => link.relation === "next") || false,
      }

      // Cache for 5 minutes
      await this.redis.setex(cacheKey, 300, JSON.stringify(result))

      return result
    } catch (error) {
      console.error("Error fetching Epic DiagnosticReports:", error)
      // Fallback to mock data for demo
      const reports = await this.mockFetchReports(query)
      return {
        reports,
        totalCount: reports.length,
        hasMore: false,
      }
    }
  }

  async getReportById(reportId: string): Promise<BeakerReport | null> {
    const cacheKey = `beaker_report:${reportId}`

    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return cached as BeakerReport
    }

    try {
      const report = await this.mockGetReportById(reportId)

      if (report) {
        await this.redis.setex(cacheKey, 3600, JSON.stringify(report))
      }

      return report
    } catch (error) {
      console.error("Error fetching Beaker report:", error)
      return null
    }
  }

  async storeInBlob(
    data: any,
    filename: string,
    contentType: string,
  ): Promise<{
    url: string
    pathname: string
    contentType: string
    contentLength: number
  }> {
    try {
      // Convert data to appropriate format based on contentType
      let blob: Blob

      if (typeof data === "string") {
        blob = new Blob([data], { type: contentType })
      } else if (data instanceof Blob) {
        blob = data
      } else {
        // Convert object to JSON string
        blob = new Blob([JSON.stringify(data)], { type: contentType })
      }

      // Store in Vercel Blob
      const result = await put(`beaker-exports/${filename}`, blob, {
        access: "public",
        contentType,
      })

      return result
    } catch (error) {
      console.error("Error storing data in Blob:", error)
      throw new Error("Failed to store data in Blob storage")
    }
  }

  // Add a method to list blobs in a directory
  async listBlobFiles(prefix = "beaker-exports/"): Promise<{
    blobs: {
      url: string
      pathname: string
      contentType: string
      contentLength: number
    }[]
  }> {
    try {
      return await list({ prefix })
    } catch (error) {
      console.error("Error listing blobs:", error)
      throw new Error("Failed to list files from Blob storage")
    }
  }

  // Add a method to delete a blob
  async deleteBlob(pathname: string): Promise<void> {
    try {
      await del(pathname)
    } catch (error) {
      console.error("Error deleting blob:", error)
      throw new Error("Failed to delete file from Blob storage")
    }
  }

  async exportReports(
    reportIds: string[],
    format: "csv" | "excel" | "pdf" | "json",
  ): Promise<{
    exportId: string
    downloadUrl: string
    expiresAt: string
  }> {
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Fetch all reports
      const reports = await Promise.all(reportIds.map((id) => this.getReportById(id)))
      const validReports = reports.filter(Boolean) as BeakerReport[]

      // Generate export based on format
      const exportData = await this.generateExport(validReports, format)

      // Store in Vercel Blob
      const contentType =
        format === "json"
          ? "application/json"
          : format === "csv"
            ? "text/csv"
            : format === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "application/pdf"

      const filename = `${exportId}.${format}`
      const blobResult = await this.storeInBlob(exportData, filename, contentType)

      // Store metadata in Redis
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      await this.redis.setex(
        `export:${exportId}`,
        86400,
        JSON.stringify({
          blobUrl: blobResult.url,
          format,
          reportCount: validReports.length,
          createdAt: new Date().toISOString(),
        }),
      )

      return {
        exportId,
        downloadUrl: blobResult.url,
        expiresAt: expiresAt.toISOString(),
      }
    } catch (error) {
      console.error("Error creating export:", error)
      throw new Error("Failed to create export")
    }
  }

  async validateReports(reports: BeakerReport[]): Promise<{
    validReports: BeakerReport[]
    invalidReports: { report: BeakerReport; errors: string[] }[]
    summary: {
      total: number
      valid: number
      invalid: number
      completeness: number
    }
  }> {
    const validReports: BeakerReport[] = []
    const invalidReports: { report: BeakerReport; errors: string[] }[] = []

    for (const report of reports) {
      const errors = this.validateReport(report)

      if (errors.length === 0) {
        validReports.push(report)
      } else {
        invalidReports.push({ report, errors })
      }
    }

    const completeness = (validReports.length / reports.length) * 100

    return {
      validReports,
      invalidReports,
      summary: {
        total: reports.length,
        valid: validReports.length,
        invalid: invalidReports.length,
        completeness,
      },
    }
  }

  private validateReport(report: BeakerReport): string[] {
    const errors: string[] = []

    if (!report.id) errors.push("Missing report ID")
    if (!report.patientId) errors.push("Missing patient ID")
    if (!report.reportType) errors.push("Missing report type")
    if (!report.orderDate) errors.push("Missing order date")

    // Validate date formats
    if (report.orderDate && isNaN(Date.parse(report.orderDate))) {
      errors.push("Invalid order date format")
    }

    if (report.resultDate && isNaN(Date.parse(report.resultDate))) {
      errors.push("Invalid result date format")
    }

    // Validate results
    if (!report.results || report.results.length === 0) {
      errors.push("No results found")
    } else {
      report.results.forEach((result, index) => {
        if (!result.testCode) errors.push(`Result ${index + 1}: Missing test code`)
        if (!result.testName) errors.push(`Result ${index + 1}: Missing test name`)
        if (result.value === undefined || result.value === null) {
          errors.push(`Result ${index + 1}: Missing value`)
        }
      })
    }

    return errors
  }

  private async generateExport(reports: BeakerReport[], format: string): Promise<any> {
    switch (format) {
      case "csv":
        return this.generateCSVExport(reports)
      case "excel":
        return this.generateExcelExport(reports)
      case "pdf":
        return this.generatePDFExport(reports)
      case "json":
        return JSON.stringify(reports)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  private generateCSVExport(reports: BeakerReport[]): string {
    const headers = [
      "Report ID",
      "Patient ID",
      "Report Type",
      "Order Date",
      "Result Date",
      "Status",
      "Provider",
      "Department",
      "Test Code",
      "Test Name",
      "Value",
      "Unit",
      "Reference Range",
      "Abnormal Flag",
      "Comments",
    ]

    const rows = [headers.join(",")]

    reports.forEach((report) => {
      report.results.forEach((result) => {
        const row = [
          report.id,
          report.patientId,
          report.reportType,
          report.orderDate,
          report.resultDate || "",
          report.status,
          report.provider,
          report.department,
          result.testCode,
          result.testName,
          result.value,
          result.unit || "",
          result.referenceRange || "",
          result.abnormalFlag || "",
          result.comments || "",
        ].map((field) => `"${String(field).replace(/"/g, '""')}"`)

        rows.push(row.join(","))
      })
    })

    return rows.join("\n")
  }

  private generateExcelExport(reports: BeakerReport[]): any {
    // In a real implementation, this would use a library like xlsx
    return {
      type: "excel",
      sheets: [
        {
          name: "Lab Results",
          data: reports.flatMap((report) =>
            report.results.map((result) => ({
              "Report ID": report.id,
              "Patient ID": report.patientId,
              "Report Type": report.reportType,
              "Order Date": report.orderDate,
              "Result Date": report.resultDate,
              Status: report.status,
              Provider: report.provider,
              Department: report.department,
              "Test Code": result.testCode,
              "Test Name": result.testName,
              Value: result.value,
              Unit: result.unit,
              "Reference Range": result.referenceRange,
              "Abnormal Flag": result.abnormalFlag,
              Comments: result.comments,
            })),
          ),
        },
      ],
    }
  }

  private generatePDFExport(reports: BeakerReport[]): any {
    // In a real implementation, this would use a PDF generation library
    return {
      type: "pdf",
      title: "Beaker Lab Reports",
      content: reports.map((report) => ({
        reportId: report.id,
        patientId: report.patientId,
        reportType: report.reportType,
        orderDate: report.orderDate,
        resultDate: report.resultDate,
        status: report.status,
        provider: report.provider,
        department: report.department,
        results: report.results,
      })),
    }
  }

  private convertFhirToBeakerReports(fhirBundle: any): BeakerReport[] {
    if (!fhirBundle.entry) return []

    return fhirBundle.entry.map((entry: any) => {
      const diagnosticReport = entry.resource

      return {
        id: diagnosticReport.id,
        patientId: diagnosticReport.subject?.reference?.split("/")[1] || "unknown",
        reportType: this.mapFhirCategoryToReportType(diagnosticReport.category),
        orderDate: diagnosticReport.effectiveDateTime || diagnosticReport.issued,
        resultDate: diagnosticReport.issued,
        status: this.mapFhirStatusToBeakerStatus(diagnosticReport.status),
        priority: "routine", // Default, could be mapped from FHIR if available
        provider: diagnosticReport.performer?.[0]?.display || "Unknown Provider",
        department: diagnosticReport.category?.[0]?.text || "Laboratory",
        results: this.extractResultsFromFhir(diagnosticReport),
        metadata: {
          accessionNumber: diagnosticReport.identifier?.[0]?.value || `ACC_${diagnosticReport.id}`,
          specimenType: diagnosticReport.specimen?.[0]?.display || "Unknown",
          collectionDate: diagnosticReport.effectiveDateTime,
          receivedDate: diagnosticReport.issued,
        },
      }
    })
  }

  private mapFhirCategoryToReportType(category: any[]): BeakerReport["reportType"] {
    if (!category || category.length === 0) return "laboratory"

    const categoryCode = category[0]?.coding?.[0]?.code?.toLowerCase()

    if (categoryCode?.includes("lab")) return "laboratory"
    if (categoryCode?.includes("rad") || categoryCode?.includes("imaging")) return "imaging"
    if (categoryCode?.includes("path")) return "pathology"

    return "laboratory"
  }

  private mapFhirStatusToBeakerStatus(fhirStatus: string): BeakerReport["status"] {
    switch (fhirStatus?.toLowerCase()) {
      case "final":
        return "final"
      case "preliminary":
        return "partial"
      case "corrected":
        return "corrected"
      case "registered":
      case "partial":
        return "pending"
      default:
        return "pending"
    }
  }

  private extractResultsFromFhir(diagnosticReport: any): BeakerResult[] {
    const results: BeakerResult[] = []

    // Extract from result references (Observations)
    if (diagnosticReport.result) {
      diagnosticReport.result.forEach((resultRef: any, index: number) => {
        results.push({
          testCode: `TEST_${index + 1}`,
          testName: resultRef.display || `Test ${index + 1}`,
          value: "See detailed report",
          status: "final",
          comments: `Reference: ${resultRef.reference}`,
        })
      })
    }

    // If no specific results, create a summary result
    if (results.length === 0) {
      results.push({
        testCode: "SUMMARY",
        testName: "Diagnostic Report Summary",
        value: diagnosticReport.conclusion || "Report available",
        status: "final",
        comments: diagnosticReport.presentedForm?.[0]?.title || "Full report available",
      })
    }

    return results
  }

  // Mock implementations for development
  private async mockFetchReports(query: BeakerQuery): Promise<BeakerReport[]> {
    const mockReports: BeakerReport[] = [
      {
        id: "RPT001",
        patientId: query.patientId || "P001",
        reportType: "laboratory",
        orderDate: "2024-01-15T08:00:00Z",
        resultDate: "2024-01-15T14:30:00Z",
        status: "final",
        priority: "routine",
        provider: "Dr. Smith",
        department: "Laboratory",
        results: [
          {
            testCode: "CBC",
            testName: "Complete Blood Count",
            value: 12.5,
            unit: "g/dL",
            referenceRange: "12.0-15.5",
            status: "final",
          },
          {
            testCode: "WBC",
            testName: "White Blood Cells",
            value: 7200,
            unit: "/μL",
            referenceRange: "4500-11000",
            status: "final",
          },
          {
            testCode: "PLT",
            testName: "Platelets",
            value: 250000,
            unit: "/μL",
            referenceRange: "150000-450000",
            status: "final",
          },
        ],
        metadata: {
          accessionNumber: "ACC001",
          specimenType: "Blood",
          collectionDate: "2024-01-15T07:30:00Z",
          receivedDate: "2024-01-15T08:15:00Z",
        },
      },
      {
        id: "RPT002",
        patientId: query.patientId || "P001",
        reportType: "laboratory",
        orderDate: "2024-01-14T10:00:00Z",
        resultDate: "2024-01-14T16:45:00Z",
        status: "final",
        priority: "routine",
        provider: "Dr. Johnson",
        department: "Chemistry",
        results: [
          {
            testCode: "BUN",
            testName: "Blood Urea Nitrogen",
            value: 18,
            unit: "mg/dL",
            referenceRange: "7-20",
            status: "final",
          },
          {
            testCode: "CREAT",
            testName: "Creatinine",
            value: 1.1,
            unit: "mg/dL",
            referenceRange: "0.6-1.2",
            status: "final",
          },
          {
            testCode: "GLUC",
            testName: "Glucose",
            value: 95,
            unit: "mg/dL",
            referenceRange: "70-100",
            status: "final",
          },
        ],
        metadata: {
          accessionNumber: "ACC002",
          specimenType: "Serum",
          collectionDate: "2024-01-14T09:30:00Z",
          receivedDate: "2024-01-14T10:15:00Z",
        },
      },
    ]

    // Apply filters
    let filteredReports = mockReports

    if (query.reportType && query.reportType.length > 0) {
      filteredReports = filteredReports.filter((report) => query.reportType!.includes(report.reportType))
    }

    if (query.status && query.status.length > 0) {
      filteredReports = filteredReports.filter((report) => query.status!.includes(report.status))
    }

    if (query.dateFrom) {
      filteredReports = filteredReports.filter((report) => new Date(report.orderDate) >= new Date(query.dateFrom!))
    }

    if (query.dateTo) {
      filteredReports = filteredReports.filter((report) => new Date(report.orderDate) <= new Date(query.dateTo!))
    }

    // Apply pagination
    const offset = query.offset || 0
    const limit = query.limit || 50

    return filteredReports.slice(offset, offset + limit)
  }

  private async mockGetReportById(reportId: string): Promise<BeakerReport | null> {
    const mockReports = await this.mockFetchReports({})
    return mockReports.find((report) => report.id === reportId) || null
  }
}
