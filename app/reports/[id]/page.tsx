"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  FileText, Download, Share2, Print, Calendar, User,
  AlertTriangle, CheckCircle, Info, Dna, Target,
  Activity, Brain, Shield, Pill, ChevronRight,
  MessageSquare, Clock, Edit, Lock
} from "lucide-react"

interface GeneVariant {
  gene: string
  variant: string
  classification: string
  zygosity: string
  alleleFrequency: number
  clinicalSignificance: string
  evidence: string[]
  recommendations: string[]
}

interface PharmacogenomicResult {
  drug: string
  gene: string
  phenotype: string
  recommendation: string
  level: "high" | "moderate" | "low"
}

interface RiskAssessment {
  condition: string
  risk: number
  relativeRisk: number
  genes: string[]
  preventionStrategies: string[]
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("summary")

  // Mock report data
  const report = {
    id: params.id,
    patientName: "John Doe",
    patientId: "P-123456",
    reportType: "Comprehensive Genomic Analysis",
    generatedDate: "October 20, 2024",
    orderedBy: "Dr. Sarah Chen",
    laboratory: "GenomeTech Labs",
    status: "Final",
    version: "2.0",
    accessionNumber: "GT-2024-10-20-001"
  }

  const keyFindings = [
    {
      type: "pathogenic",
      title: "BRCA2 Pathogenic Variant Detected",
      description: "Heterozygous pathogenic variant c.5946del identified in BRCA2 gene associated with hereditary breast and ovarian cancer syndrome",
      actionRequired: true
    },
    {
      type: "pharmacogenomic",
      title: "CYP2C19 Poor Metabolizer",
      description: "Homozygous for *2 allele indicating poor metabolizer phenotype for clopidogrel",
      actionRequired: true
    },
    {
      type: "risk",
      title: "Elevated Cardiovascular Risk",
      description: "Genetic risk score indicates 1.8x increased risk for coronary artery disease",
      actionRequired: false
    }
  ]

  const pathogenicVariants: GeneVariant[] = [
    {
      gene: "BRCA2",
      variant: "c.5946del",
      classification: "Pathogenic",
      zygosity: "Heterozygous",
      alleleFrequency: 0.5,
      clinicalSignificance: "Hereditary breast and ovarian cancer syndrome",
      evidence: [
        "Truncating variant",
        "Multiple case reports",
        "Functional studies confirm loss of function",
        "ClinVar pathogenic classification"
      ],
      recommendations: [
        "Enhanced breast cancer screening with annual MRI",
        "Consider risk-reducing bilateral mastectomy",
        "Discuss risk-reducing salpingo-oophorectomy",
        "Cascade testing for family members"
      ]
    },
    {
      gene: "MLH1",
      variant: "c.199G>A",
      classification: "VUS",
      zygosity: "Heterozygous",
      alleleFrequency: 0.5,
      clinicalSignificance: "Uncertain significance for Lynch syndrome",
      evidence: [
        "Missense variant",
        "Conflicting computational predictions",
        "Limited case data"
      ],
      recommendations: [
        "Continue standard colorectal cancer screening",
        "Re-evaluate variant classification annually",
        "Consider tumor screening for microsatellite instability"
      ]
    }
  ]

  const pharmacogenomicResults: PharmacogenomicResult[] = [
    {
      drug: "Clopidogrel",
      gene: "CYP2C19",
      phenotype: "Poor Metabolizer",
      recommendation: "Significantly reduced clopidogrel activation. Consider alternative antiplatelet therapy (prasugrel or ticagrelor)",
      level: "high"
    },
    {
      drug: "Warfarin",
      gene: "CYP2C9/VKORC1",
      phenotype: "Normal Metabolizer",
      recommendation: "Standard warfarin dosing with routine INR monitoring",
      level: "low"
    },
    {
      drug: "Simvastatin",
      gene: "SLCO1B1",
      phenotype: "Intermediate Function",
      recommendation: "Increased risk of myopathy at high doses. Limit simvastatin to 40mg daily",
      level: "moderate"
    }
  ]

  const riskAssessments: RiskAssessment[] = [
    {
      condition: "Breast Cancer",
      risk: 45,
      relativeRisk: 4.5,
      genes: ["BRCA2", "CHEK2", "ATM"],
      preventionStrategies: [
        "Enhanced screening starting at age 25",
        "Consider chemoprevention",
        "Lifestyle modifications",
        "Risk-reducing surgery options"
      ]
    },
    {
      condition: "Coronary Artery Disease",
      risk: 28,
      relativeRisk: 1.8,
      genes: ["APOE", "LDLR", "PCSK9"],
      preventionStrategies: [
        "Aggressive lipid management",
        "Regular cardiovascular screening",
        "Mediterranean diet",
        "Regular exercise program"
      ]
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Report Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold">{report.reportType}</h1>
              <Badge variant="secondary" className="text-green-600">
                {report.status}
              </Badge>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {report.patientName} ({report.patientId})
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {report.generatedDate}
              </span>
              <span className="flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                Accession: {report.accessionNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Print className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-500">Ordered By</p>
            <p className="text-sm font-medium">{report.orderedBy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Laboratory</p>
            <p className="text-sm font-medium">{report.laboratory}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Report Version</p>
            <p className="text-sm font-medium">v{report.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Turnaround Time</p>
            <p className="text-sm font-medium">14 days</p>
          </div>
        </div>
      </div>

      {/* Key Findings Alert */}
      <div className="space-y-4 mb-6">
        {keyFindings.filter(f => f.actionRequired).map((finding, index) => (
          <Alert key={index} className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Action Required: {finding.title}</AlertTitle>
            <AlertDescription className="text-orange-800">
              {finding.description}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="pharmacogenomics">Pharmacogenomics</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="technical">Technical Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <div className="space-y-6">
            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>
                  Key findings and clinical recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    This comprehensive genomic analysis identified several clinically significant findings that require
                    medical attention and may impact treatment decisions. The analysis included evaluation of 59 genes
                    associated with hereditary cancer syndromes, cardiovascular conditions, and pharmacogenomic variants.
                  </p>

                  <h4 className="font-semibold mt-4 mb-2">Key Findings:</h4>
                  <ul className="space-y-2">
                    {keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        {finding.type === "pathogenic" && <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />}
                        {finding.type === "pharmacogenomic" && <Pill className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />}
                        {finding.type === "risk" && <Activity className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />}
                        <div>
                          <span className="font-medium">{finding.title}:</span> {finding.description}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <h4 className="font-semibold mt-4 mb-2">Immediate Actions Recommended:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Schedule genetic counseling session to discuss BRCA2 findings</li>
                    <li>Review current antiplatelet therapy given CYP2C19 status</li>
                    <li>Implement enhanced cancer screening protocols</li>
                    <li>Consider cascade testing for at-risk family members</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">2,456</p>
                  <p className="text-xs text-gray-500">Identified variants</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pathogenic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">1</p>
                  <p className="text-xs text-gray-500">Action required</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">VUS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                  <p className="text-xs text-gray-500">Monitor updates</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pharmacogenomic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-xs text-gray-500">Drug interactions</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinically Significant Variants</CardTitle>
              <CardDescription>
                Pathogenic variants and variants of uncertain significance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pathogenicVariants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{variant.gene}</h3>
                        <p className="text-sm text-gray-600">{variant.variant} • {variant.zygosity}</p>
                      </div>
                      <Badge
                        variant={variant.classification === "Pathogenic" ? "destructive" : "outline"}
                      >
                        {variant.classification}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          Clinical Significance
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">{variant.clinicalSignificance}</p>

                        <h4 className="font-medium mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Evidence
                        </h4>
                        <ul className="space-y-1">
                          {variant.evidence.map((evidence, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Clinical Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {variant.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <ChevronRight className="h-3 w-3 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Allele Frequency: {(variant.alleleFrequency * 100).toFixed(0)}%</span>
                        <Button variant="outline" size="sm">
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pharmacogenomics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacogenomic Results</CardTitle>
              <CardDescription>
                Genetic variants affecting drug metabolism and response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmacogenomicResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{result.drug}</h4>
                        <p className="text-sm text-gray-600">{result.gene} • {result.phenotype}</p>
                      </div>
                      <Badge
                        variant={
                          result.level === "high" ? "destructive" :
                          result.level === "moderate" ? "outline" :
                          "secondary"
                        }
                      >
                        {result.level} impact
                      </Badge>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm flex items-start">
                        <Info className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                        {result.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <Pill className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  These pharmacogenomic results should be considered alongside other clinical factors when making
                  prescribing decisions. Consult current drug labels and clinical guidelines.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Risk Assessment</CardTitle>
              <CardDescription>
                Polygenic risk scores for common conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {riskAssessments.map((assessment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{assessment.condition}</h4>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{assessment.risk}%</p>
                        <p className="text-sm text-gray-500">{assessment.relativeRisk}x population average</p>
                      </div>
                    </div>

                    <Progress value={assessment.risk} className="h-3 mb-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Contributing Genes</p>
                        <div className="flex flex-wrap gap-1">
                          {assessment.genes.map((gene, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {gene}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Prevention Strategies</p>
                        <ul className="space-y-1">
                          {assessment.preventionStrategies.slice(0, 2).map((strategy, idx) => (
                            <li key={idx} className="text-xs text-gray-600">• {strategy}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
              <CardDescription>
                Sequencing methodology and quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Sequencing Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Platform</p>
                      <p className="font-medium">Illumina NovaSeq 6000</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Coverage</p>
                      <p className="font-medium">30x average</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Read Length</p>
                      <p className="font-medium">2x150bp</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Analysis Pipeline</p>
                      <p className="font-medium">GATK v4.2</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Quality Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Q30 Bases</p>
                      <p className="font-medium">92.5%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mapped Reads</p>
                      <p className="font-medium">99.2%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Target Coverage</p>
                      <p className="font-medium">99.8%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Uniformity</p>
                      <p className="font-medium">0.95</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Data Security</AlertTitle>
                  <AlertDescription>
                    All genomic data is encrypted and stored in HIPAA-compliant facilities.
                    Access is restricted to authorized healthcare providers only.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Request Amendment
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Report finalized on {report.generatedDate}</span>
        </div>
      </div>
    </div>
  )
}
