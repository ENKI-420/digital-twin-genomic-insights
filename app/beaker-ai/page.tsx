"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BeakerAIChat } from "@/components/ai/beaker-ai-chat"
import { BeakerWorkflowPanel } from "@/components/ai/beaker-workflow-panel"
import { Bot, Workflow, BarChart3, Download, Activity } from "lucide-react"

export default function BeakerAIPage() {
  const [exportData, setExportData] = useState<any>(null)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)

  const handleExport = (data: any, format: string) => {
    console.log("Exporting data:", data, "Format:", format)
    setExportData({ data, format, timestamp: new Date() })
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId)
  }

  const handleWorkflowComplete = (stepId: string, results: any) => {
    console.log("Workflow step completed:", stepId, results)
  }

  const handleExportReady = (exportData: any) => {
    console.log("Export ready:", exportData)
    setExportData(exportData)
  }

  const stats = {
    totalQueries: 1247,
    successRate: 98.5,
    avgResponseTime: "1.2s",
    reportsProcessed: 3456,
    exportGenerated: 234,
    timeSaved: "45.2h",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beaker AI Assistant</h1>
          <p className="text-gray-600">
            Intelligent workflow automation for Beaker reports - fetch, analyze, and export with ease
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">AI Online</Badge>
          <Badge className="bg-blue-100 text-blue-800">Beaker Connected</Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalQueries}</div>
            <div className="text-sm text-gray-600">Total Queries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.reportsProcessed}</div>
            <div className="text-sm text-gray-600">Reports Processed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.exportGenerated}</div>
            <div className="text-sm text-gray-600">Exports Generated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.timeSaved}</div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BeakerAIChat userId="current-user" onExport={handleExport} onPatientSelect={handlePatientSelect} />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium text-sm">Fetch Recent Labs</div>
                      <div className="text-xs text-gray-600">Get last 30 days of lab reports</div>
                    </button>
                    <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium text-sm">Export Patient Data</div>
                      <div className="text-xs text-gray-600">Download comprehensive patient report</div>
                    </button>
                    <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium text-sm">Analyze Trends</div>
                      <div className="text-xs text-gray-600">Identify patterns in lab values</div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {selectedPatient && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Patient</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium">Patient ID: {selectedPatient}</div>
                      <div className="text-sm text-gray-600">Active in current session</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {exportData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Export</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium">Format: {exportData.format}</div>
                      <div className="text-sm text-gray-600">
                        Generated: {exportData.timestamp?.toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <BeakerWorkflowPanel onStepComplete={handleWorkflowComplete} onExportReady={handleExportReady} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Queries Today</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reports Fetched</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exports Generated</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Query Success Rate</span>
                      <span>98.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "98.5%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Accuracy</span>
                      <span>99.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "99.2%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Satisfaction</span>
                      <span>96.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "96.8%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    id: "exp001",
                    name: "Lab Results - Patient P001",
                    format: "CSV",
                    size: "2.3 MB",
                    created: "2024-01-15 14:30",
                    records: 450,
                  },
                  {
                    id: "exp002",
                    name: "Trend Analysis Report",
                    format: "Excel",
                    size: "1.8 MB",
                    created: "2024-01-15 13:15",
                    records: 234,
                  },
                  {
                    id: "exp003",
                    name: "Patient Summary - Multiple",
                    format: "PDF",
                    size: "5.2 MB",
                    created: "2024-01-15 11:45",
                    records: 156,
                  },
                ].map((export_) => (
                  <div key={export_.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{export_.name}</div>
                      <div className="text-sm text-gray-600">
                        {export_.format} • {export_.size} • {export_.records} records
                      </div>
                      <div className="text-xs text-gray-500">{export_.created}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{export_.format}</Badge>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <p className="text-gray-600">Comprehensive AI-powered Beaker workflow automation with clinical focus</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <Bot className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium">Natural Language Processing</h3>
              </div>
              <p className="text-sm text-gray-600">
                Understand complex queries about Beaker reports, patient data, and clinical workflows
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium">Automated Workflows</h3>
              </div>
              <p className="text-sm text-gray-600">
                Streamlined processes for fetching, validating, analyzing, and exporting clinical data
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium">Advanced Analytics</h3>
              </div>
              <p className="text-sm text-gray-600">
                Statistical analysis, trend detection, and correlation analysis for clinical insights
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="font-medium">Clinical Exports</h3>
              </div>
              <p className="text-sm text-gray-600">
                Generate CSV, Excel, and PDF exports optimized for clinical documentation and analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
