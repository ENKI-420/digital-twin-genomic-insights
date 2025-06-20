"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText, Upload, Brain, Search, Filter, TrendingUp,
  AlertTriangle, CheckCircle, XCircle, Clock, Download,
  Share2, RefreshCw, Info, ChevronRight, Activity,
  BarChart3, Dna, Target, Shield, Microscope, Sparkles
} from "lucide-react"

interface AnalysisJob {
  id: string
  name: string
  status: "running" | "completed" | "failed" | "queued"
  progress: number
  startTime: string
  gene: string
  variantCount: number
}

interface AnalysisResult {
  gene: string
  classification: string
  confidence: number
  evidence: string[]
  recommendations: string[]
}

export default function GenomicsAnalysisPage() {
  const [activeTab, setActiveTab] = useState("new")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState("comprehensive")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const activeJobs: AnalysisJob[] = [
    {
      id: "1",
      name: "Patient_001_WGS",
      status: "running",
      progress: 67,
      startTime: "10 minutes ago",
      gene: "Multiple",
      variantCount: 1245
    },
    {
      id: "2",
      name: "BRCA_Panel_002",
      status: "completed",
      progress: 100,
      startTime: "2 hours ago",
      gene: "BRCA1/2",
      variantCount: 23
    },
    {
      id: "3",
      name: "Pharmacogenomics_003",
      status: "queued",
      progress: 0,
      startTime: "Queued",
      gene: "CYP2D6",
      variantCount: 0
    }
  ]

  const recentResults: AnalysisResult[] = [
    {
      gene: "BRCA1",
      classification: "Pathogenic",
      confidence: 98.5,
      evidence: ["Loss of function", "Multiple case reports", "Functional studies"],
      recommendations: ["Consider prophylactic measures", "Cascade testing recommended"]
    },
    {
      gene: "TP53",
      classification: "VUS",
      confidence: 62.3,
      evidence: ["Novel variant", "In silico predictions conflicting"],
      recommendations: ["Additional testing needed", "Monitor literature"]
    }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setActiveTab("jobs")
    }, 2000)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Genomic Analysis</h1>
        <p className="text-gray-600">
          AI-powered variant analysis, classification, and clinical interpretation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">New Analysis</TabsTrigger>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Genomic Data</CardTitle>
                <CardDescription>
                  Upload VCF, FASTQ, or BAM files for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".vcf,.fastq,.bam,.txt"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      VCF, FASTQ, BAM up to 5GB
                    </p>
                  </div>

                  {selectedFile && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertTitle>File Selected</AlertTitle>
                      <AlertDescription>
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label>Analysis Type</Label>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">
                          <div>
                            <p className="font-medium">Comprehensive Analysis</p>
                            <p className="text-xs text-gray-500">Full variant calling and annotation</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="targeted">
                          <div>
                            <p className="font-medium">Targeted Panel</p>
                            <p className="text-xs text-gray-500">Specific gene panel analysis</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="pharmacogenomics">
                          <div>
                            <p className="font-medium">Pharmacogenomics</p>
                            <p className="text-xs text-gray-500">Drug response prediction</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="somatic">
                          <div>
                            <p className="font-medium">Somatic Mutations</p>
                            <p className="text-xs text-gray-500">Tumor-specific variants</p>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Clinical Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add patient history, clinical context, or specific concerns..."
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={startAnalysis}
                    disabled={!selectedFile || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Starting Analysis...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Start AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Features */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Microscope className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Advanced Variant Calling</p>
                        <p className="text-sm text-gray-600">
                          Deep learning models for accurate variant detection
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">ACMG Classification</p>
                        <p className="text-sm text-gray-600">
                          Automated classification following ACMG guidelines
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Clinical Interpretation</p>
                        <p className="text-sm text-gray-600">
                          Evidence-based clinical significance assessment
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Treatment Recommendations</p>
                        <p className="text-sm text-gray-600">
                          AI-suggested therapeutic options and trials
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Analysis</CardTitle>
                  <CardDescription>
                    Analyze a single variant quickly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Gene</Label>
                        <Input placeholder="e.g., BRCA1" />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input placeholder="e.g., c.68_69del" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Quick Lookup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Analysis Jobs</CardTitle>
              <CardDescription>
                Monitor ongoing and queued analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          job.status === "running" ? "bg-blue-500 animate-pulse" :
                          job.status === "completed" ? "bg-green-500" :
                          job.status === "failed" ? "bg-red-500" :
                          "bg-gray-400"
                        }`} />
                        <div>
                          <p className="font-medium">{job.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {job.startTime}
                            </span>
                            <span className="flex items-center">
                              <Dna className="h-3 w-3 mr-1" />
                              {job.gene}
                            </span>
                            {job.variantCount > 0 && (
                              <span>{job.variantCount} variants</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          job.status === "running" ? "default" :
                          job.status === "completed" ? "secondary" :
                          job.status === "failed" ? "destructive" :
                          "outline"
                        }>
                          {job.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {job.status === "running" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input placeholder="Search results..." className="w-64" />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>

            {recentResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        result.classification === "Pathogenic" ? "bg-red-500" :
                        result.classification === "VUS" ? "bg-yellow-500" :
                        "bg-green-500"
                      }`} />
                      <CardTitle>{result.gene}</CardTitle>
                      <Badge variant={
                        result.classification === "Pathogenic" ? "destructive" :
                        result.classification === "VUS" ? "outline" :
                        "secondary"
                      }>
                        {result.classification}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">AI Confidence</p>
                        <p className="text-lg font-semibold">{result.confidence}%</p>
                      </div>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        Evidence
                      </h4>
                      <ul className="space-y-1">
                        {result.evidence.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {result.recommendations.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <Info className="h-3 w-3 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}