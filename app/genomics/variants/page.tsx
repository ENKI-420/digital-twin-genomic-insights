"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search, Filter, Download, AlertTriangle, CheckCircle, Clock,
  Microscope, Brain, TrendingUp, BarChart3, Database, FileText,
  ChevronRight, ArrowUpDown, Settings, Eye
} from "lucide-react"

interface Variant {
  id: string
  gene: string
  chromosome: string
  position: string
  ref: string
  alt: string
  hgvs: string
  classification: "Pathogenic" | "Likely Pathogenic" | "Uncertain Significance" | "Likely Benign" | "Benign"
  confidence: number
  alleleFrequency: number
  clinVarId?: string
  dbSNP?: string
  lastUpdated: string
  patientCount: number
  evidence: {
    computational: number
    functional: number
    population: number
    cosegregation: number
  }
}

export default function VariantAnalysisPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClassification, setFilterClassification] = useState("all")
  const [filterGene, setFilterGene] = useState("all")
  const [sortBy, setSortBy] = useState("confidence")
  const [activeTab, setActiveTab] = useState("variants")

  const variants: Variant[] = [
    {
      id: "1",
      gene: "BRCA1",
      chromosome: "17",
      position: "43057104",
      ref: "C",
      alt: "A",
      hgvs: "c.185delA",
      classification: "Pathogenic",
      confidence: 98,
      alleleFrequency: 0.0001,
      clinVarId: "ClinVar:123456",
      dbSNP: "rs80357914",
      lastUpdated: "2024-01-15",
      patientCount: 12,
      evidence: {
        computational: 95,
        functional: 92,
        population: 89,
        cosegregation: 96
      }
    },
    {
      id: "2",
      gene: "TP53",
      chromosome: "17",
      position: "7674220",
      ref: "G",
      alt: "A",
      hgvs: "c.743G>A",
      classification: "Likely Pathogenic",
      confidence: 85,
      alleleFrequency: 0.00005,
      clinVarId: "ClinVar:789012",
      dbSNP: "rs121913342",
      lastUpdated: "2024-01-14",
      patientCount: 8,
      evidence: {
        computational: 88,
        functional: 85,
        population: 92,
        cosegregation: 78
      }
    },
    {
      id: "3",
      gene: "MLH1",
      chromosome: "3",
      position: "37034946",
      ref: "ATAG",
      alt: "A",
      hgvs: "c.1852_1854del",
      classification: "Uncertain Significance",
      confidence: 67,
      alleleFrequency: 0.0002,
      lastUpdated: "2024-01-13",
      patientCount: 3,
      evidence: {
        computational: 75,
        functional: 65,
        population: 55,
        cosegregation: 70
      }
    },
    {
      id: "4",
      gene: "APC",
      chromosome: "5",
      position: "112839514",
      ref: "TCAGA",
      alt: "T",
      hgvs: "c.3183_3187del",
      classification: "Pathogenic",
      confidence: 95,
      alleleFrequency: 0.0003,
      clinVarId: "ClinVar:345678",
      lastUpdated: "2024-01-12",
      patientCount: 15,
      evidence: {
        computational: 93,
        functional: 96,
        population: 88,
        cosegregation: 94
      }
    }
  ]

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Pathogenic":
        return "bg-red-100 text-red-800 border-red-200"
      case "Likely Pathogenic":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Uncertain Significance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Likely Benign":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Benign":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case "Pathogenic":
      case "Likely Pathogenic":
        return <AlertTriangle className="h-4 w-4" />
      case "Uncertain Significance":
        return <Clock className="h-4 w-4" />
      case "Likely Benign":
      case "Benign":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const filteredVariants = variants.filter(variant => {
    const matchesSearch = searchTerm === "" ||
      variant.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.hgvs.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClassification = filterClassification === "all" ||
      variant.classification === filterClassification

    const matchesGene = filterGene === "all" || variant.gene === filterGene

    return matchesSearch && matchesClassification && matchesGene
  })

  const sortedVariants = [...filteredVariants].sort((a, b) => {
    switch (sortBy) {
      case "confidence":
        return b.confidence - a.confidence
      case "gene":
        return a.gene.localeCompare(b.gene)
      case "classification":
        return a.classification.localeCompare(b.classification)
      case "frequency":
        return b.alleleFrequency - a.alleleFrequency
      default:
        return 0
    }
  })

  const uniqueGenes = Array.from(new Set(variants.map(v => v.gene))).sort()

  const classificationStats = variants.reduce((acc, variant) => {
    acc[variant.classification] = (acc[variant.classification] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link href="/genomics" className="hover:text-blue-600">Genomics</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">Variant Analysis</span>
            </nav>
            <h1 className="text-3xl font-bold flex items-center">
              <Microscope className="h-8 w-8 mr-3 text-blue-600" />
              Variant Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered genomic variant classification with ACMG guidelines
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button asChild>
              <Link href="/genomics/variants/upload">
                <FileText className="h-4 w-4 mr-2" />
                Upload VCF
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="variants" className="mt-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Variants</p>
                    <p className="text-2xl font-bold">{variants.length}</p>
                    <p className="text-sm text-blue-600">Analyzed</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pathogenic</p>
                    <p className="text-2xl font-bold text-red-600">
                      {(classificationStats["Pathogenic"] || 0) + (classificationStats["Likely Pathogenic"] || 0)}
                    </p>
                    <p className="text-sm text-red-600">Require attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Confidence</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(variants.reduce((sum, v) => sum + v.confidence, 0) / variants.length)}%
                    </p>
                    <p className="text-sm text-green-600">Average</p>
                  </div>
                  <Brain className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patients</p>
                    <p className="text-2xl font-bold">
                      {variants.reduce((sum, v) => sum + v.patientCount, 0)}
                    </p>
                    <p className="text-sm text-purple-600">With variants</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by gene, variant, or HGVS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterClassification} onValueChange={setFilterClassification}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classifications</SelectItem>
                    <SelectItem value="Pathogenic">Pathogenic</SelectItem>
                    <SelectItem value="Likely Pathogenic">Likely Pathogenic</SelectItem>
                    <SelectItem value="Uncertain Significance">Uncertain Significance</SelectItem>
                    <SelectItem value="Likely Benign">Likely Benign</SelectItem>
                    <SelectItem value="Benign">Benign</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterGene} onValueChange={setFilterGene}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Filter by gene" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genes</SelectItem>
                    {uniqueGenes.map(gene => (
                      <SelectItem key={gene} value={gene}>{gene}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confidence">
                      <div className="flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Confidence
                      </div>
                    </SelectItem>
                    <SelectItem value="gene">Gene</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="frequency">Frequency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Variants Table */}
          <div className="space-y-4">
            {sortedVariants.map((variant) => (
              <Card key={variant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{variant.gene}</h3>
                          <Badge className={getClassificationColor(variant.classification)}>
                            {getClassificationIcon(variant.classification)}
                            <span className="ml-1">{variant.classification}</span>
                          </Badge>
                          <Badge variant="outline">
                            {variant.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{variant.hgvs}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Chr{variant.chromosome}:{variant.position}</span>
                          <span>{variant.ref} → {variant.alt}</span>
                          <span>AF: {variant.alleleFrequency.toFixed(6)}</span>
                          <span>{variant.patientCount} patients</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right text-sm">
                        <div className="text-gray-500">Last updated</div>
                        <div className="font-medium">{variant.lastUpdated}</div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/genomics/variants/${variant.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Evidence Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Computational</div>
                        <div className="text-sm font-medium">{variant.evidence.computational}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Functional</div>
                        <div className="text-sm font-medium">{variant.evidence.functional}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Population</div>
                        <div className="text-sm font-medium">{variant.evidence.population}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Cosegregation</div>
                        <div className="text-sm font-medium">{variant.evidence.cosegregation}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVariants.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No variants found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Classification Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(classificationStats).map(([classification, count]) => (
                    <div key={classification} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getClassificationIcon(classification)}
                        <span className="text-sm">{classification}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              classification.includes("Pathogenic") ? "bg-red-500" :
                              classification.includes("Uncertain") ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}
                            style={{ width: `${(count / variants.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Confidence Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Confidence</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round(variants.reduce((sum, v) => sum + v.confidence, 0) / variants.length)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Confidence (>90%)</span>
                    <span className="text-lg font-bold text-green-600">
                      {variants.filter(v => v.confidence > 90).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Confidence (70-90%)</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {variants.filter(v => v.confidence >= 70 && v.confidence <= 90).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Confidence (<70%)</span>
                    <span className="text-lg font-bold text-red-600">
                      {variants.filter(v => v.confidence < 70).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Assessment Framework</CardTitle>
              <p className="text-sm text-gray-600">
                ACMG/AMP guidelines-based evidence evaluation for variant classification
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-green-600">Benign Evidence</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>BA1 - High allele frequency</span>
                      <Badge variant="outline">Stand-alone</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>BS1 - Population frequency</span>
                      <Badge variant="outline">Strong</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>BS2 - Healthy adults</span>
                      <Badge variant="outline">Strong</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>BP1 - Missense variant</span>
                      <Badge variant="outline">Supporting</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-red-600">Pathogenic Evidence</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>PVS1 - Null variant</span>
                      <Badge variant="outline">Very Strong</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PS1 - Same amino acid</span>
                      <Badge variant="outline">Strong</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PM1 - Hotspot domain</span>
                      <Badge variant="outline">Moderate</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PP3 - Computational</span>
                      <Badge variant="outline">Supporting</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Variant Summary Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive summary of all variants with classifications and evidence
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  High-Risk Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Report focusing on pathogenic and likely pathogenic variants
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  AI Analysis Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed AI confidence scores and evidence assessment
                </p>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}