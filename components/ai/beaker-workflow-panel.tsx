"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Clock, CheckCircle, AlertTriangle, RefreshCw, Activity } from "lucide-react"

interface WorkflowStep {
  id: string
  title: string
  status: "pending" | "in_progress" | "completed" | "error"
  progress: number
  description: string
  estimatedTime?: string
  results?: any
}

interface BeakerWorkflowPanelProps {
  onStepComplete?: (stepId: string, results: any) => void
  onExportReady?: (exportData: any) => void
}

export function BeakerWorkflowPanel({ onStepComplete, onExportReady }: BeakerWorkflowPanelProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const workflowTemplates = {
    "lab-analysis": {
      title: "Lab Report Analysis",
      description: "Fetch, analyze, and export lab reports",
      steps: [
        {
          id: "fetch",
          title: "Fetch Beaker Reports",
          description: "Retrieve lab reports from Beaker system",
          estimatedTime: "30s",
        },
        {
          id: "validate",
          title: "Validate Data",
          description: "Check data integrity and completeness",
          estimatedTime: "15s",
        },
        {
          id: "analyze",
          title: "Analyze Results",
          description: "Perform statistical analysis and trend detection",
          estimatedTime: "45s",
        },
        {
          id: "export",
          title: "Generate Export",
          description: "Create CSV/Excel export for clinical use",
          estimatedTime: "20s",
        },
      ],
    },
    "patient-summary": {
      title: "Patient Summary Report",
      description: "Comprehensive patient data compilation",
      steps: [
        {
          id: "collect",
          title: "Collect Patient Data",
          description: "Gather all relevant patient information",
          estimatedTime: "45s",
        },
        {
          id: "correlate",
          title: "Correlate Results",
          description: "Cross-reference lab values with clinical data",
          estimatedTime: "30s",
        },
        {
          id: "summarize",
          title: "Generate Summary",
          description: "Create clinical summary with insights",
          estimatedTime: "60s",
        },
        {
          id: "format",
          title: "Format for Export",
          description: "Prepare data for clinical documentation",
          estimatedTime: "25s",
        },
      ],
    },
    "trend-analysis": {
      title: "Trend Analysis",
      description: "Longitudinal data analysis and visualization",
      steps: [
        {
          id: "historical",
          title: "Fetch Historical Data",
          description: "Retrieve historical lab values and trends",
          estimatedTime: "40s",
        },
        {
          id: "calculate",
          title: "Calculate Trends",
          description: "Perform statistical trend analysis",
          estimatedTime: "35s",
        },
        {
          id: "visualize",
          title: "Create Visualizations",
          description: "Generate charts and trend graphs",
          estimatedTime: "50s",
        },
        {
          id: "report",
          title: "Generate Report",
          description: "Compile comprehensive trend report",
          estimatedTime: "30s",
        },
      ],
    },
  }

  const startWorkflow = async (workflowType: string) => {
    const template = workflowTemplates[workflowType as keyof typeof workflowTemplates]
    if (!template) return

    setActiveWorkflow(workflowType)
    setIsProcessing(true)

    const steps: WorkflowStep[] = template.steps.map((step) => ({
      ...step,
      status: "pending",
      progress: 0,
    }))

    setWorkflowSteps(steps)

    // Execute workflow steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]

      // Update step to in_progress
      setWorkflowSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, status: "in_progress" } : s)))

      // Simulate step execution with progress updates
      await executeStep(step, (progress) => {
        setWorkflowSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, progress } : s)))
      })

      // Mark step as completed
      const results = await getStepResults(step.id)
      setWorkflowSteps((prev) =>
        prev.map((s) => (s.id === step.id ? { ...s, status: "completed", progress: 100, results } : s)),
      )

      onStepComplete?.(step.id, results)
    }

    setIsProcessing(false)

    // Generate final export
    const exportData = await generateFinalExport(workflowType, steps)
    onExportReady?.(exportData)
  }

  const executeStep = async (step: WorkflowStep, onProgress: (progress: number) => void) => {
    const duration = 3000 // 3 seconds per step
    const interval = 100 // Update every 100ms

    return new Promise<void>((resolve) => {
      let progress = 0
      const timer = setInterval(() => {
        progress += (interval / duration) * 100
        onProgress(Math.min(progress, 100))

        if (progress >= 100) {
          clearInterval(timer)
          resolve()
        }
      }, interval)
    })
  }

  const getStepResults = async (stepId: string) => {
    // Mock results based on step type
    switch (stepId) {
      case "fetch":
        return { reportCount: 45, patientCount: 12, dateRange: "30 days" }
      case "validate":
        return { validRecords: 44, invalidRecords: 1, completeness: 97.8 }
      case "analyze":
        return { trends: 3, outliers: 2, correlations: 5 }
      case "export":
        return { format: "CSV", size: "2.3 MB", records: 450 }
      default:
        return { status: "completed" }
    }
  }

  const generateFinalExport = async (workflowType: string, steps: WorkflowStep[]) => {
    return {
      workflowType,
      completedAt: new Date().toISOString(),
      totalRecords: 450,
      exportUrl: `/api/exports/workflow_${Date.now()}.csv`,
      summary: "Workflow completed successfully with 450 records processed",
    }
  }

  const getStatusIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Beaker Workflow Automation
          </CardTitle>
          <p className="text-sm text-gray-600">
            Streamlined workflows for fetching, analyzing, and exporting Beaker reports
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
              <TabsTrigger value="active">Active Workflow</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(workflowTemplates).map(([key, template]) => (
                  <Card key={key} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium">{template.steps.length} steps</span>
                          <span className="text-gray-500 ml-2">
                            ~
                            {template.steps.reduce(
                              (total, step) => total + Number.parseInt(step.estimatedTime?.replace("s", "") || "0"),
                              0,
                            )}
                            s total
                          </span>
                        </div>

                        <Button onClick={() => startWorkflow(key)} disabled={isProcessing} className="w-full" size="sm">
                          {isProcessing && activeWorkflow === key ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Start Workflow
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeWorkflow && workflowSteps.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {workflowTemplates[activeWorkflow as keyof typeof workflowTemplates]?.title}
                    </h3>
                    <Badge className={isProcessing ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                      {isProcessing ? "Running" : "Completed"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                      <Card key={step.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(step.status)}
                              <div>
                                <h4 className="font-medium">{step.title}</h4>
                                <p className="text-sm text-gray-600">{step.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(step.status)}>{step.status.replace("_", " ")}</Badge>
                              {step.estimatedTime && <p className="text-xs text-gray-500 mt-1">{step.estimatedTime}</p>}
                            </div>
                          </div>

                          {step.status === "in_progress" && <Progress value={step.progress} className="h-2" />}

                          {step.results && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                              <pre>{JSON.stringify(step.results, null, 2)}</pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Workflow</h3>
                  <p className="text-gray-600">Start a workflow from the templates tab to see progress here.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    id: "w001",
                    type: "Lab Analysis",
                    completedAt: "2024-01-15 14:30",
                    records: 234,
                    status: "completed",
                  },
                  {
                    id: "w002",
                    type: "Patient Summary",
                    completedAt: "2024-01-15 13:15",
                    records: 156,
                    status: "completed",
                  },
                  {
                    id: "w003",
                    type: "Trend Analysis",
                    completedAt: "2024-01-15 11:45",
                    records: 89,
                    status: "completed",
                  },
                ].map((workflow) => (
                  <Card key={workflow.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{workflow.type}</h4>
                          <p className="text-sm text-gray-600">
                            Completed {workflow.completedAt} • {workflow.records} records
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
