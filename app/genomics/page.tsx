"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dna, Microscope, Network, Activity, Target, Calendar,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  FileText, Users, Brain, Zap, Search, BarChart3
} from "lucide-react"

interface GenomicModule {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  badge?: string
  stats?: {
    value: string
    label: string
  }
}

interface PatientCase {
  id: string
  patientId: string
  variant: string
  classification: string
  confidence: number
  lastUpdated: string
  status: "critical" | "review" | "stable"
}

export default function GenomicsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const genomicModules: GenomicModule[] = [
    {
      title: "Variant Analysis",
      description: "AI-powered genomic variant classification with ACMG guidelines",
      href: "/genomics/variants",
      icon: <Microscope className="h-6 w-6" />,
      badge: "AI-Powered",
      stats: { value: "15,234", label: "Variants Analyzed" }
    },
    {
      title: "3D Visualization",
      description: "Interactive 3D molecular structures and protein folding analysis",
      href: "/genomics/3d-visualization",
      icon: <Network className="h-6 w-6" />,
      badge: "Epic Ready",
      stats: { value: "2,847", label: "Structures Rendered" }
    },
    {
      title: "Evolution Tracking",
      description: "Track variant classification changes over time",
      href: "/variant-evolution",
      icon: <Activity className="h-6 w-6" />,
      stats: { value: "1,456", label: "Tracked Changes" }
    },
    {
      title: "Recommendations",
      description: "High-risk variant recommendations and clinical actions",
      href: "/variant-recommendations",
      icon: <Target className="h-6 w-6" />,
      badge: "Critical",
      stats: { value: "89", label: "Active Alerts" }
    },
    {
      title: "Genetic Timeline",
      description: "Chronological view of genetic findings and reports",
      href: "/genetic-timeline",
      icon: <Calendar className="h-6 w-6" />,
      stats: { value: "567", label: "Timeline Events" }
    },
    {
      title: "Population Analysis",
      description: "Population genetics and allele frequency analysis",
      href: "/genomics/population",
      icon: <BarChart3 className="h-6 w-6" />,
      stats: { value: "125K", label: "Population Samples" }
    }
  ]

  const recentCases: PatientCase[] = [
    {
      id: "1",
      patientId: "PAT-001",
      variant: "BRCA1 c.185delA",
      classification: "Pathogenic",
      confidence: 98,
      lastUpdated: "2024-01-15",
      status: "critical"
    },
    {
      id: "2",
      patientId: "PAT-002",
      variant: "TP53 c.743G>A",
      classification: "Likely Pathogenic",
      confidence: 85,
      lastUpdated: "2024-01-14",
      status: "review"
    },
    {
      id: "3",
      patientId: "PAT-003",
      variant: "MLH1 c.1852_1854del",
      classification: "Uncertain Significance",
      confidence: 67,
      lastUpdated: "2024-01-13",
      status: "review"
    },
    {
      id: "4",
      patientId: "PAT-004",
      variant: "APC c.3183_3187del",
      classification: "Pathogenic",
      confidence: 95,
      lastUpdated: "2024-01-12",
      status: "stable"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "stable":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200"
      case "review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "stable":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Dna className="h-8 w-8 mr-3 text-purple-600" />
              Genomics Platform
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered genomic analysis with real-time insights and clinical decision support
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/genomics/upload">
                <FileText className="h-4 w-4 mr-2" />
                Upload VCF
              </Link>
            </Button>
            <Button asChild>
              <Link href="/genomics/analysis">
                <Brain className="h-4 w-4 mr-2" />
                New Analysis
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="cases">Recent Cases</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Variants</p>
                    <p className="text-2xl font-bold">15,234</p>
                    <p className="text-sm text-green-600">+12% this month</p>
                  </div>
                  <Dna className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pathogenic</p>
                    <p className="text-2xl font-bold">1,456</p>
                    <p className="text-sm text-red-600">89 high-risk</p>
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
                    <p className="text-2xl font-bold">94.5%</p>
                    <p className="text-sm text-green-600">Above threshold</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patients</p>
                    <p className="text-2xl font-bold">2,847</p>
                    <p className="text-sm text-blue-600">Active genomic profiles</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genomicModules.slice(0, 6).map((module, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={module.href}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        {module.icon}
                      </div>
                      {module.badge && (
                        <Badge variant={module.badge === "Critical" ? "destructive" : "secondary"}>
                          {module.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                    {module.stats && (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-600">{module.stats.value}</span>
                        <span className="text-xs text-gray-500">{module.stats.label}</span>
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {genomicModules.map((module, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        {module.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        {module.badge && (
                          <Badge variant={module.badge === "Critical" ? "destructive" : "secondary"} className="mt-1">
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" asChild>
                      <Link href={module.href}>
                        Launch Module
                      </Link>
                    </Button>
                    {module.stats && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-600">{module.stats.value}</div>
                        <div className="text-xs text-gray-500">{module.stats.label}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cases" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Genomic Cases</h3>
              <Button variant="outline" asChild>
                <Link href="/genomics/cases">
                  <Search className="h-4 w-4 mr-2" />
                  View All Cases
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {recentCases.map((case_) => (
                <Card key={case_.id} className={`border-l-4 ${getStatusColor(case_.status)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(case_.status)}
                        <div>
                          <div className="font-semibold">{case_.variant}</div>
                          <div className="text-sm text-gray-600">Patient ID: {case_.patientId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{case_.classification}</div>
                        <div className="text-sm text-gray-600">{case_.confidence}% confidence</div>
                        <div className="text-xs text-gray-500">Updated: {case_.lastUpdated}</div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/genomics/cases/${case_.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Classification Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pathogenic</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Likely Pathogenic</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uncertain Significance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Benign</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-500" />
                  AI Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accuracy</span>
                    <span className="text-lg font-bold text-green-600">94.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Precision</span>
                    <span className="text-lg font-bold text-blue-600">92.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recall</span>
                    <span className="text-lg font-bold text-purple-600">96.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">F1 Score</span>
                    <span className="text-lg font-bold text-orange-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}