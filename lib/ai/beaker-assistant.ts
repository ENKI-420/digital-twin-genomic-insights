import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface BeakerQuery {
  id: string
  userId: string
  query: string
  intent: "fetch_reports" | "analyze_data" | "export_data" | "search_patient" | "general_question"
  parameters: Record<string, any>
  timestamp: string
  status: "processing" | "completed" | "error"
  response?: AIResponse
}

export interface AIResponse {
  type: "text" | "data" | "chart" | "export" | "action"
  content: string
  data?: any[]
  actions?: AIAction[]
  suggestions?: string[]
  confidence: number
}

export interface AIAction {
  type: "fetch_reports" | "export_csv" | "schedule_followup" | "create_alert"
  label: string
  parameters: Record<string, any>
  icon?: string
}

export interface ConversationContext {
  sessionId: string
  userId: string
  currentPatient?: string
  recentQueries: BeakerQuery[]
  preferences: UserPreferences
  activeReports: string[]
}

export interface UserPreferences {
  exportFormat: "csv" | "excel" | "pdf"
  defaultDateRange: number // days
  autoRefresh: boolean
  notificationLevel: "all" | "critical" | "none"
}

export class BeakerAIAssistant {
  private redis: Redis
  private context: Map<string, ConversationContext> = new Map()

  constructor() {
    this.redis = redis
  }

  async processQuery(
    sessionId: string,
    userId: string,
    query: string,
  ): Promise<{ response: AIResponse; queryId: string }> {
    const queryId = this.generateQueryId()

    // Get or create conversation context
    const context = await this.getContext(sessionId, userId)

    // Parse the query and determine intent
    const parsedQuery = await this.parseQuery(query, context)

    // Store the query
    const beakerQuery: BeakerQuery = {
      id: queryId,
      userId,
      query,
      intent: parsedQuery.intent,
      parameters: parsedQuery.parameters,
      timestamp: new Date().toISOString(),
      status: "processing",
    }

    await this.storeQuery(beakerQuery)

    try {
      // Process the query based on intent
      const response = await this.generateResponse(beakerQuery, context)

      // Update query with response
      beakerQuery.response = response
      beakerQuery.status = "completed"
      await this.storeQuery(beakerQuery)

      // Update context
      await this.updateContext(sessionId, beakerQuery, response)

      return { response, queryId }
    } catch (error) {
      beakerQuery.status = "error"
      await this.storeQuery(beakerQuery)
      throw error
    }
  }

  private async parseQuery(
    query: string,
    context: ConversationContext,
  ): Promise<{
    intent: BeakerQuery["intent"]
    parameters: Record<string, any>
  }> {
    const lowerQuery = query.toLowerCase()

    // Intent detection patterns
    if (lowerQuery.includes("fetch") || lowerQuery.includes("get") || lowerQuery.includes("retrieve")) {
      if (lowerQuery.includes("report") || lowerQuery.includes("beaker")) {
        return {
          intent: "fetch_reports",
          parameters: this.extractReportParameters(query, context),
        }
      }
    }

    if (lowerQuery.includes("export") || lowerQuery.includes("download") || lowerQuery.includes("csv")) {
      return {
        intent: "export_data",
        parameters: this.extractExportParameters(query, context),
      }
    }

    if (lowerQuery.includes("analyze") || lowerQuery.includes("trend") || lowerQuery.includes("pattern")) {
      return {
        intent: "analyze_data",
        parameters: this.extractAnalysisParameters(query, context),
      }
    }

    if (lowerQuery.includes("patient") && (lowerQuery.includes("find") || lowerQuery.includes("search"))) {
      return {
        intent: "search_patient",
        parameters: this.extractPatientParameters(query),
      }
    }

    return {
      intent: "general_question",
      parameters: { query },
    }
  }

  private extractReportParameters(query: string, context: ConversationContext): Record<string, any> {
    const params: Record<string, any> = {}

    // Extract patient ID or name
    const patientMatch = query.match(/patient\s+(\w+)/i)
    if (patientMatch) {
      params.patientId = patientMatch[1]
    } else if (context.currentPatient) {
      params.patientId = context.currentPatient
    }

    // Extract date range
    const dateMatch = query.match(/last\s+(\d+)\s+(day|week|month)s?/i)
    if (dateMatch) {
      const value = Number.parseInt(dateMatch[1])
      const unit = dateMatch[2].toLowerCase()
      params.dateRange = this.convertToDays(value, unit)
    } else {
      params.dateRange = context.preferences.defaultDateRange
    }

    // Extract report type
    if (query.includes("lab")) params.reportType = "laboratory"
    if (query.includes("imaging")) params.reportType = "imaging"
    if (query.includes("pathology")) params.reportType = "pathology"

    return params
  }

  private extractExportParameters(query: string, context: ConversationContext): Record<string, any> {
    const params: Record<string, any> = {}

    // Extract format
    if (query.includes("csv")) params.format = "csv"
    else if (query.includes("excel")) params.format = "excel"
    else if (query.includes("pdf")) params.format = "pdf"
    else params.format = context.preferences.exportFormat

    // Extract data source
    if (context.activeReports.length > 0) {
      params.reportIds = context.activeReports
    }

    return params
  }

  private extractAnalysisParameters(query: string, context: ConversationContext): Record<string, any> {
    const params: Record<string, any> = {}

    // Extract analysis type
    if (query.includes("trend")) params.analysisType = "trend"
    if (query.includes("correlation")) params.analysisType = "correlation"
    if (query.includes("outlier")) params.analysisType = "outlier"
    if (query.includes("summary")) params.analysisType = "summary"

    // Extract time period
    const periodMatch = query.match(/over\s+(\d+)\s+(day|week|month)s?/i)
    if (periodMatch) {
      const value = Number.parseInt(periodMatch[1])
      const unit = periodMatch[2].toLowerCase()
      params.timePeriod = this.convertToDays(value, unit)
    }

    return params
  }

  private extractPatientParameters(query: string): Record<string, any> {
    const params: Record<string, any> = {}

    // Extract patient identifier
    const idMatch = query.match(/id\s+(\w+)/i)
    if (idMatch) {
      params.patientId = idMatch[1]
    }

    const nameMatch = query.match(/name\s+([a-zA-Z\s]+)/i)
    if (nameMatch) {
      params.patientName = nameMatch[1].trim()
    }

    return params
  }

  private async generateResponse(query: BeakerQuery, context: ConversationContext): Promise<AIResponse> {
    switch (query.intent) {
      case "fetch_reports":
        return this.handleFetchReports(query, context)
      case "export_data":
        return this.handleExportData(query, context)
      case "analyze_data":
        return this.handleAnalyzeData(query, context)
      case "search_patient":
        return this.handleSearchPatient(query, context)
      default:
        return this.handleGeneralQuestion(query, context)
    }
  }

  private async handleFetchReports(query: BeakerQuery, context: ConversationContext): Promise<AIResponse> {
    const { patientId, dateRange, reportType } = query.parameters

    if (!patientId) {
      return {
        type: "text",
        content: "I need a patient ID to fetch Beaker reports. Please specify which patient you'd like reports for.",
        suggestions: ["Show me reports for patient P001", "Get lab results for John Smith"],
        confidence: 0.9,
      }
    }

    // Simulate fetching reports
    const reports = await this.fetchBeakerReports(patientId, dateRange, reportType)

    const actions: AIAction[] = [
      {
        type: "export_csv",
        label: "Export to CSV",
        parameters: { reportIds: reports.map((r) => r.id), format: "csv" },
        icon: "Download",
      },
    ]

    if (reports.length > 0) {
      actions.push({
        type: "create_alert",
        label: "Set up monitoring",
        parameters: { patientId, reportType },
        icon: "Bell",
      })
    }

    return {
      type: "data",
      content: `Found ${reports.length} Beaker reports for patient ${patientId} from the last ${dateRange} days.`,
      data: reports,
      actions,
      suggestions: ["Analyze trends in these results", "Export all data to Excel", "Show critical values only"],
      confidence: 0.95,
    }
  }

  private async handleExportData(query: BeakerQuery, context: ConversationContext): Promise<AIResponse> {
    const { format, reportIds } = query.parameters

    if (!reportIds || reportIds.length === 0) {
      return {
        type: "text",
        content: "No data selected for export. Please fetch some reports first or specify which data to export.",
        suggestions: ["Fetch recent lab reports", "Show me available data"],
        confidence: 0.8,
      }
    }

    // Generate export
    const exportUrl = await this.generateExport(reportIds, format)

    return {
      type: "export",
      content: `Export ready! Your ${format.toUpperCase()} file contains ${reportIds.length} reports and is ready for download.`,
      data: [{ exportUrl, format, reportCount: reportIds.length }],
      actions: [
        {
          type: "export_csv",
          label: `Download ${format.toUpperCase()}`,
          parameters: { url: exportUrl },
          icon: "Download",
        },
      ],
      confidence: 0.98,
    }
  }

  private async handleAnalyzeData(query: BeakerQuery, context: ConversationContext): Promise<AIResponse> {
    const { analysisType, timePeriod } = query.parameters

    // Perform analysis on active reports
    const analysis = await this.performAnalysis(context.activeReports, analysisType, timePeriod)

    return {
      type: "chart",
      content: `Analysis complete. ${analysis.summary}`,
      data: analysis.chartData,
      actions: [
        {
          type: "export_csv",
          label: "Export Analysis",
          parameters: { data: analysis.chartData, format: "csv" },
          icon: "Download",
        },
      ],
      suggestions: ["Show detailed statistics", "Compare with normal ranges", "Generate report summary"],
      confidence: 0.92,
    }
  }

  private async handleSearchPatient(query: BeakerQuery, context: ConversationContext): Promise<AIResponse> {
    const { patientId, patientName } = query.parameters

    const patients = await this.searchPatients(patientId, patientName)

    if (patients.length === 0) {
      return {
        type: "text",
        content: "No patients found matching your search criteria. Please check the patient ID or name.",
        suggestions: ["Search by different criteria", "Browse all patients"],
        confidence: 0.7,
      }
    }

    return {
      type: "data",
      content: `Found ${patients.length} patient(s) matching your search.`,
      data: patients,
      actions: patients.map((patient) => ({
        type: "fetch_reports",
        label: `View ${patient.name}'s reports`,
        parameters: { patientId: patient.id },
        icon: "FileText",
      })),
      confidence: 0.9,
    }
  }

  private async handleGeneralQuestion(query: BeakerQuery, context: ConversationContext): Promise<AIResponse> {
    // Simple knowledge base responses
    const knowledgeBase = {
      "what is beaker":
        "Beaker is Epic's laboratory information system that manages lab orders, results, and reporting.",
      "how to export": "You can export data by saying 'export to CSV' or 'download as Excel' after fetching reports.",
      "report types": "Available report types include laboratory, imaging, pathology, and clinical notes.",
    }

    const lowerQuery = query.query.toLowerCase()
    for (const [key, answer] of Object.entries(knowledgeBase)) {
      if (lowerQuery.includes(key)) {
        return {
          type: "text",
          content: answer,
          suggestions: ["Fetch recent reports", "Search for a patient", "Export current data"],
          confidence: 0.8,
        }
      }
    }

    return {
      type: "text",
      content: "I can help you fetch Beaker reports, analyze data, and export results. What would you like to do?",
      suggestions: [
        "Fetch lab reports for a patient",
        "Export data to CSV",
        "Analyze recent trends",
        "Search for a patient",
      ],
      confidence: 0.6,
    }
  }

  // Helper methods
  private async fetchBeakerReports(patientId: string, dateRange: number, reportType?: string) {
    // Mock implementation - replace with actual Beaker API calls
    return [
      {
        id: "R001",
        patientId,
        type: reportType || "laboratory",
        date: new Date().toISOString(),
        status: "final",
        results: [
          { test: "Hemoglobin", value: 12.5, unit: "g/dL", reference: "12.0-15.5" },
          { test: "White Blood Cells", value: 7.2, unit: "K/μL", reference: "4.5-11.0" },
        ],
      },
    ]
  }

  private async generateExport(reportIds: string[], format: string): Promise<string> {
    // Mock implementation - generate actual export file
    const exportId = `export_${Date.now()}`
    return `/api/exports/${exportId}.${format}`
  }

  private async performAnalysis(reportIds: string[], analysisType: string, timePeriod?: number) {
    // Mock analysis implementation
    return {
      summary: `Trend analysis shows stable values over the last ${timePeriod || 30} days.`,
      chartData: [
        { date: "2024-01-01", value: 12.5 },
        { date: "2024-01-02", value: 12.8 },
        { date: "2024-01-03", value: 12.3 },
      ],
    }
  }

  private async searchPatients(patientId?: string, patientName?: string) {
    // Mock patient search
    return [
      { id: "P001", name: "John Smith", dob: "1980-01-01", mrn: "12345" },
      { id: "P002", name: "Jane Doe", dob: "1975-05-15", mrn: "67890" },
    ]
  }

  private convertTodays(value: number, unit: string): number {
    switch (unit) {
      case "week":
        return value * 7
      case "month":
        return value * 30
      default:
        return value
    }
  }

  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getContext(sessionId: string, userId: string): Promise<ConversationContext> {
    const cached = this.context.get(sessionId)
    if (cached) return cached

    const context: ConversationContext = {
      sessionId,
      userId,
      recentQueries: [],
      preferences: {
        exportFormat: "csv",
        defaultDateRange: 30,
        autoRefresh: false,
        notificationLevel: "critical",
      },
      activeReports: [],
    }

    this.context.set(sessionId, context)
    return context
  }

  private async updateContext(sessionId: string, query: BeakerQuery, response: AIResponse): Promise<void> {
    const context = this.context.get(sessionId)
    if (!context) return

    context.recentQueries.push(query)
    if (context.recentQueries.length > 10) {
      context.recentQueries = context.recentQueries.slice(-10)
    }

    if (query.intent === "fetch_reports" && response.data) {
      context.activeReports = response.data.map((r: any) => r.id)
    }

    if (query.parameters.patientId) {
      context.currentPatient = query.parameters.patientId
    }
  }

  private async storeQuery(query: BeakerQuery): Promise<void> {
    await this.redis.setex(`query:${query.id}`, 86400, JSON.stringify(query))
  }
}
