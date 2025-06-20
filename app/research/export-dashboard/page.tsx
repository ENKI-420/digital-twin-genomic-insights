"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Progress } from "@/components/ui/progress"
import {
  Download, FileText, FileSpreadsheet, FileCode, Package,
  Calendar, Filter, Settings, Clock, CheckCircle, AlertCircle,
  Database, Cloud, HardDrive, Share2, Mail, Link2,
  BarChart3, PieChart, LineChart, Table
} from "lucide-react"

interface ExportTemplate {
  id: string
  name: string
  description: string
  format: string
  fields: string[]
  lastUsed: string
  icon: React.ReactNode
}

interface ScheduledExport {
  id: string
  name: string
  frequency: string
  format: string
  lastRun: string
  nextRun: string
  status: "active" | "paused" | "error"
  recipients: string[]
}

interface ExportHistory {
  id: string
  name: string
  date: string
  size: string
  format: string
  status: "completed" | "failed" | "processing"
  downloadUrl?: string
}

export default function ResearchExportDashboardPage() {
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("csv")
  const [isExporting, setIsExporting] = useState(false)

  const exportTemplates: ExportTemplate[] = [
    {
      id: "1",
      name: "Research Metrics Report",
      description: "Comprehensive research performance metrics",
      format: "PDF",
      fields: ["publications", "citations", "h-index", "funding"],
      lastUsed: "2 days ago",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: "2",
      name: "Publication List",
      description: "Complete list of publications with metadata",
      format: "CSV",
      fields: ["title", "authors", "journal", "year", "citations", "doi"],
      lastUsed: "1 week ago",
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: "3",
      name: "Genomic Data Export",
      description: "Patient genomic data with annotations",
      format: "JSON",
      fields: ["patient_id", "variants", "genes", "classifications", "clinical_significance"],
      lastUsed: "3 days ago",
      icon: <FileCode className="h-5 w-5" />
    },
    {
      id: "4",
      name: "Collaboration Network",
      description: "Network data of research collaborations",
      format: "GraphML",
      fields: ["collaborators", "institutions", "projects", "connections"],
      lastUsed: "2 weeks ago",
      icon: <Share2 className="h-5 w-5" />
    }
  ]

  const scheduledExports: ScheduledExport[] = [
    {
      id: "1",
      name: "Monthly Research Report",
      frequency: "Monthly",
      format: "PDF",
      lastRun: "Oct 1, 2024",
      nextRun: "Nov 1, 2024",
      status: "active",
      recipients: ["admin@lab.com", "pi@university.edu"]
    },
    {
      id: "2",
      name: "Weekly Genomic Updates",
      frequency: "Weekly",
      format: "CSV",
      lastRun: "Oct 21, 2024",
      nextRun: "Oct 28, 2024",
      status: "active",
      recipients: ["data@lab.com"]
    },
    {
      id: "3",
      name: "Quarterly Funding Report",
      frequency: "Quarterly",
      format: "Excel",
      lastRun: "Jul 1, 2024",
      nextRun: "Jan 1, 2025",
      status: "paused",
      recipients: ["finance@university.edu"]
    }
  ]

  const exportHistory: ExportHistory[] = [
    {
      id: "1",
      name: "Full_Research_Export_2024",
      date: "Oct 22, 2024 14:30",
      size: "128 MB",
      format: "ZIP",
      status: "completed",
      downloadUrl: "#"
    },
    {
      id: "2",
      name: "Genomic_Analysis_Q3_2024",
      date: "Oct 20, 2024 09:15",
      size: "456 MB",
      format: "JSON",
      status: "completed",
      downloadUrl: "#"
    },
    {
      id: "3",
      name: "Publication_Metrics_2024",
      date: "Oct 19, 2024 16:45",
      size: "12 MB",
      format: "PDF",
      status: "processing"
    }
  ]

  const dataCategories = [
    { id: "genomics", label: "Genomic Data", count: 12456 },
    { id: "publications", label: "Publications", count: 247 },
    { id: "clinical", label: "Clinical Data", count: 8923 },
    { id: "research", label: "Research Projects", count: 45 },
    { id: "collaborations", label: "Collaborations", count: 127 },
    { id: "funding", label: "Funding Data", count: 23 }
  ]

  const handleExport = () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
    }, 3000)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Export Dashboard</h1>
        <p className="text-gray-600">
          Export research data, generate reports, and manage data sharing
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Exports</CardTitle>
              <Download className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-xs text-gray-500 mt-1">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Data Volume</CardTitle>
              <Database className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2.4 TB</p>
            <p className="text-xs text-gray-500 mt-1">Exported data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-green-600 mt-1">Active schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Recipients</CardTitle>
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">45</p>
            <p className="text-xs text-gray-500 mt-1">Active recipients</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Export</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{template.format}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Included Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-sm text-gray-500">Last used: {template.lastUsed}</span>
                      <Button size="sm">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Configuration */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configure Export</CardTitle>
                  <CardDescription>
                    Select data types and configure export options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Data Selection */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Select Data Categories</Label>
                      <div className="space-y-3">
                        {dataCategories.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedDataTypes.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedDataTypes([...selectedDataTypes, category.id])
                                  } else {
                                    setSelectedDataTypes(selectedDataTypes.filter(t => t !== category.id))
                                  }
                                }}
                              />
                              <div>
                                <p className="font-medium">{category.label}</p>
                                <p className="text-sm text-gray-500">{category.count.toLocaleString()} records</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Date Range</Label>
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <Input type="date" className="flex-1" />
                        <span>to</span>
                        <Input type="date" className="flex-1" />
                      </div>
                    </div>

                    {/* Export Format */}
                    <div>
                      <Label className="text-base font-medium mb-3 block">Export Format</Label>
                      <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv" className="flex items-center cursor-pointer">
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              CSV
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="json" id="json" />
                            <Label htmlFor="json" className="flex items-center cursor-pointer">
                              <FileCode className="h-4 w-4 mr-2" />
                              JSON
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="excel" id="excel" />
                            <Label htmlFor="excel" className="flex items-center cursor-pointer">
                              <Table className="h-4 w-4 mr-2" />
                              Excel
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="pdf" id="pdf" />
                            <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                              <FileText className="h-4 w-4 mr-2" />
                              PDF Report
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compress">Compress files</Label>
                      <Checkbox id="compress" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="encrypt">Encrypt export</Label>
                      <Checkbox id="encrypt" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="anonymize">Anonymize data</Label>
                      <Checkbox id="anonymize" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-metadata">Include metadata</Label>
                      <Checkbox id="include-metadata" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="download">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="download" id="download" />
                        <Label htmlFor="download" className="flex items-center">
                          <Download className="h-4 w-4 mr-2" />
                          Direct Download
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Link
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cloud" id="cloud" />
                        <Label htmlFor="cloud" className="flex items-center">
                          <Cloud className="h-4 w-4 mr-2" />
                          Cloud Storage
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                size="lg"
                onClick={handleExport}
                disabled={selectedDataTypes.length === 0 || isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Preparing Export...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Scheduled Exports</h3>
              <Button>
                <Clock className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>

            {scheduledExports.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{schedule.name}</h4>
                        <Badge
                          variant={
                            schedule.status === "active" ? "secondary" :
                            schedule.status === "paused" ? "outline" :
                            "destructive"
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Frequency</p>
                          <p className="font-medium">{schedule.frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Format</p>
                          <p className="font-medium">{schedule.format}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Run</p>
                          <p className="font-medium">{schedule.lastRun}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Next Run</p>
                          <p className="font-medium">{schedule.nextRun}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Recipients:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {schedule.recipients.map((recipient, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {recipient}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Export History</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.status === "completed" ? "bg-green-100" :
                        item.status === "processing" ? "bg-blue-100" :
                        "bg-red-100"
                      }`}>
                        {item.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {item.status === "processing" && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
                        {item.status === "failed" && <AlertCircle className="h-5 w-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{item.format}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === "completed" && item.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {item.status === "processing" && (
                        <div className="flex items-center space-x-2">
                          <Progress value={65} className="w-24" />
                          <span className="text-sm font-medium">65%</span>
                        </div>
                      )}
                      <Button variant="ghost" size="icon">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}