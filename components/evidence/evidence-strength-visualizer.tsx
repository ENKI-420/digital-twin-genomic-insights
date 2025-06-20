"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  AlertTriangle,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Microscope,
  Users,
  Database,
  Activity,
  Dna,
} from "lucide-react"

// Types for evidence strength
export interface EvidenceItem {
  id: string
  type: EvidenceType
  description: string
  strength: EvidenceStrength
  source: string
  sourceUrl?: string
  date: string
}

export type EvidenceType =
  | "functional"
  | "population"
  | "computational"
  | "segregation"
  | "de_novo"
  | "allelic"
  | "other_database"
  | "case_control"
  | "expression"
  | "literature"

export type EvidenceStrength = "very_strong" | "strong" | "moderate" | "supporting" | "contradictory" | "neutral"

export interface EvidenceCategory {
  type: EvidenceType
  label: string
  description: string
  icon: React.ReactNode
}

export interface VariantClassificationEvidence {
  variantId: string
  gene: string
  variant: string
  classification: string
  evidenceItems: EvidenceItem[]
  overallStrength: number // 0-100 scale
  lastUpdated: string
}

interface EvidenceStrengthVisualizerProps {
  variantEvidence: VariantClassificationEvidence[]
}

export function EvidenceStrengthVisualizer({ variantEvidence }: EvidenceStrengthVisualizerProps) {
  const [expandedVariants, setExpandedVariants] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    variantEvidence.length > 0 ? variantEvidence[0].variantId : null,
  )

  // Toggle expanded state for a variant
  const toggleVariantExpanded = (variantId: string) => {
    setExpandedVariants((prev) => ({
      ...prev,
      [variantId]: !prev[variantId],
    }))
  }

  // Get color for classification badge
  const getClassificationColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case "pathogenic":
        return "bg-red-100 text-red-800"
      case "likely pathogenic":
        return "bg-orange-100 text-orange-800"
      case "uncertain significance":
      case "vus":
        return "bg-yellow-100 text-yellow-800"
      case "likely benign":
        return "bg-blue-100 text-blue-800"
      case "benign":
        return "bg-green-100 text-green-800"
      case "conflicting":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get color for evidence strength
  const getEvidenceStrengthColor = (strength: EvidenceStrength) => {
    switch (strength) {
      case "very_strong":
        return "bg-indigo-100 text-indigo-800"
      case "strong":
        return "bg-blue-100 text-blue-800"
      case "moderate":
        return "bg-teal-100 text-teal-800"
      case "supporting":
        return "bg-green-100 text-green-800"
      case "contradictory":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format evidence strength for display
  const formatEvidenceStrength = (strength: EvidenceStrength) => {
    return strength
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get icon for evidence type
  const getEvidenceTypeIcon = (type: EvidenceType) => {
    switch (type) {
      case "functional":
        return <Microscope className="h-4 w-4" />
      case "population":
        return <Users className="h-4 w-4" />
      case "computational":
        return <Activity className="h-4 w-4" />
      case "segregation":
        return <Users className="h-4 w-4" />
      case "de_novo":
        return <Dna className="h-4 w-4" />
      case "allelic":
        return <Dna className="h-4 w-4" />
      case "other_database":
        return <Database className="h-4 w-4" />
      case "case_control":
        return <Users className="h-4 w-4" />
      case "expression":
        return <Activity className="h-4 w-4" />
      case "literature":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Format evidence type for display
  const formatEvidenceType = (type: EvidenceType) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get evidence categories
  const evidenceCategories: EvidenceCategory[] = [
    {
      type: "functional",
      label: "Functional Studies",
      description: "Laboratory experiments that assess the impact of a variant on protein function",
      icon: <Microscope className="h-4 w-4" />,
    },
    {
      type: "population",
      label: "Population Data",
      description: "Frequency of the variant in various population databases",
      icon: <Users className="h-4 w-4" />,
    },
    {
      type: "computational",
      label: "Computational Predictions",
      description: "In silico algorithms that predict the impact of a variant",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      type: "segregation",
      label: "Segregation Data",
      description: "How the variant segregates with disease in families",
      icon: <Users className="h-4 w-4" />,
    },
    {
      type: "de_novo",
      label: "De Novo Occurrence",
      description: "Evidence that the variant occurred de novo (new) in the proband",
      icon: <Dna className="h-4 w-4" />,
    },
    {
      type: "allelic",
      label: "Allelic Data",
      description: "Information about variants in the same gene or allele",
      icon: <Dna className="h-4 w-4" />,
    },
    {
      type: "other_database",
      label: "Other Database",
      description: "Classifications from other variant databases",
      icon: <Database className="h-4 w-4" />,
    },
    {
      type: "case_control",
      label: "Case-Control Studies",
      description: "Statistical studies comparing variant frequency in cases vs controls",
      icon: <Users className="h-4 w-4" />,
    },
    {
      type: "expression",
      label: "Expression Studies",
      description: "Studies examining the impact of a variant on gene/protein expression",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      type: "literature",
      label: "Literature",
      description: "Published research and case reports",
      icon: <BookOpen className="h-4 w-4" />,
    },
  ]

  // Get evidence strength score (0-100)
  const getEvidenceStrengthScore = (strength: EvidenceStrength) => {
    switch (strength) {
      case "very_strong":
        return 100
      case "strong":
        return 80
      case "moderate":
        return 60
      case "supporting":
        return 40
      case "neutral":
        return 20
      case "contradictory":
        return 0
      default:
        return 0
    }
  }

  // Prepare data for radar chart
  const prepareRadarChartData = (variant: VariantClassificationEvidence) => {
    const evidenceByType: Record<EvidenceType, { count: number; averageStrength: number }> = {
      functional: { count: 0, averageStrength: 0 },
      population: { count: 0, averageStrength: 0 },
      computational: { count: 0, averageStrength: 0 },
      segregation: { count: 0, averageStrength: 0 },
      de_novo: { count: 0, averageStrength: 0 },
      allelic: { count: 0, averageStrength: 0 },
      other_database: { count: 0, averageStrength: 0 },
      case_control: { count: 0, averageStrength: 0 },
      expression: { count: 0, averageStrength: 0 },
      literature: { count: 0, averageStrength: 0 },
    }

    // Calculate total strength for each evidence type
    variant.evidenceItems.forEach((item) => {
      evidenceByType[item.type].count += 1
      evidenceByType[item.type].averageStrength += getEvidenceStrengthScore(item.strength)
    })

    // Calculate average strength for each evidence type
    Object.keys(evidenceByType).forEach((type) => {
      const evidenceType = type as EvidenceType
      if (evidenceByType[evidenceType].count > 0) {
        evidenceByType[evidenceType].averageStrength /= evidenceByType[evidenceType].count
      }
    })

    // Convert to array format for radar chart
    return Object.keys(evidenceByType)
      .filter((type) => evidenceByType[type as EvidenceType].count > 0)
      .map((type) => ({
        type: formatEvidenceType(type as EvidenceType),
        value: evidenceByType[type as EvidenceType].averageStrength,
        fullMark: 100,
      }))
  }

  // Prepare data for bar chart
  const prepareBarChartData = (variant: VariantClassificationEvidence) => {
    const strengthCounts: Record<EvidenceStrength, number> = {
      very_strong: 0,
      strong: 0,
      moderate: 0,
      supporting: 0,
      neutral: 0,
      contradictory: 0,
    }

    // Count evidence items by strength
    variant.evidenceItems.forEach((item) => {
      strengthCounts[item.strength] += 1
    })

    // Convert to array format for bar chart
    return Object.keys(strengthCounts).map((strength) => ({
      name: formatEvidenceStrength(strength as EvidenceStrength),
      count: strengthCounts[strength as EvidenceStrength],
    }))
  }

  // Prepare data for radial bar chart
  const prepareRadialBarChartData = (variant: VariantClassificationEvidence) => {
    return [
      {
        name: "Overall Strength",
        value: variant.overallStrength,
        fill: getOverallStrengthColor(variant.overallStrength),
      },
    ]
  }

  // Get color for overall strength
  const getOverallStrengthColor = (strength: number) => {
    if (strength >= 80) return "#4f46e5" // indigo-600
    if (strength >= 60) return "#0284c7" // sky-600
    if (strength >= 40) return "#0d9488" // teal-600
    if (strength >= 20) return "#65a30d" // lime-600
    return "#d97706" // amber-600
  }

  // Get label for overall strength
  const getOverallStrengthLabel = (strength: number) => {
    if (strength >= 80) return "Very Strong"
    if (strength >= 60) return "Strong"
    if (strength >= 40) return "Moderate"
    if (strength >= 20) return "Supporting"
    return "Limited"
  }

  // Get selected variant
  const selectedVariantData = variantEvidence.find((v) => v.variantId === selectedVariant)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Evidence Strength Analysis</CardTitle>
          <p className="text-sm text-gray-500">
            Visualize the strength of evidence supporting each variant classification
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Detailed Analysis
            </TabsTrigger>
            <TabsTrigger value="acmg" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              ACMG Criteria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {variantEvidence.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No evidence data available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There is no evidence strength data available for variant classifications.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {variantEvidence.map((variant) => (
                    <Card
                      key={variant.variantId}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedVariant === variant.variantId ? "border-blue-500 ring-2 ring-blue-200" : ""
                      }`}
                      onClick={() => setSelectedVariant(variant.variantId)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              {variant.gene} - {variant.variant}
                            </div>
                            <Badge className={getClassificationColor(variant.classification)}>
                              {variant.classification}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 flex-1 rounded-full bg-gray-200"
                              role="progressbar"
                              aria-valuenow={variant.overallStrength}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${variant.overallStrength}%`,
                                  backgroundColor: getOverallStrengthColor(variant.overallStrength),
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{variant.overallStrength}%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {variant.evidenceItems.length} evidence items • Updated{" "}
                            {new Date(variant.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedVariantData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Overall Evidence Strength</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex h-[200px] items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="80%"
                                barSize={20}
                                data={prepareRadialBarChartData(selectedVariantData)}
                                startAngle={90}
                                endAngle={-270}
                              >
                                <RadialBar
                                  background
                                  dataKey="value"
                                  cornerRadius={10}
                                  label={{
                                    position: "center",
                                    fill: "#374151",
                                    fontSize: 24,
                                    fontWeight: "bold",
                                    formatter: (value: number) => `${value}%`,
                                  }}
                                />
                              </RadialBarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-2 text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {getOverallStrengthLabel(selectedVariantData.overallStrength)} Evidence
                            </div>
                            <div className="text-xs text-gray-500">
                              Based on {selectedVariantData.evidenceItems.length} evidence items
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Evidence by Strength</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareBarChartData(selectedVariantData)}
                                margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 10 }}
                                  tickLine={false}
                                  axisLine={false}
                                  angle={-45}
                                  textAnchor="end"
                                  height={50}
                                />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Bar
                                  dataKey="count"
                                  fill="#3b82f6"
                                  radius={[4, 4, 0, 0]}
                                  label={{
                                    position: "top",
                                    fontSize: 10,
                                    fill: "#6b7280",
                                  }}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Evidence by Type</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart
                                cx="50%"
                                cy="50%"
                                outerRadius="70%"
                                data={prepareRadarChartData(selectedVariantData)}
                              >
                                <PolarGrid />
                                <PolarAngleAxis dataKey="type" tick={{ fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Radar
                                  name="Evidence Strength"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.6}
                                />
                                <Legend />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Evidence Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {evidenceCategories
                            .filter((category) =>
                              selectedVariantData.evidenceItems.some((item) => item.type === category.type),
                            )
                            .map((category) => {
                              const categoryItems = selectedVariantData.evidenceItems.filter(
                                (item) => item.type === category.type,
                              )
                              const totalStrength = categoryItems.reduce(
                                (sum, item) => sum + getEvidenceStrengthScore(item.strength),
                                0,
                              )
                              const averageStrength = totalStrength / categoryItems.length

                              return (
                                <div key={category.type} className="rounded-lg border border-gray-200 p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                      <div className="rounded-full bg-blue-100 p-2">{category.icon}</div>
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <h4 className="font-medium">{category.label}</h4>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div>
                                                  <HelpCircle className="h-3 w-3 text-gray-400" />
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="max-w-xs text-xs">{category.description}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          {categoryItems.length} evidence item{categoryItems.length !== 1 ? "s" : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className="h-2 w-24 rounded-full bg-gray-200"
                                        role="progressbar"
                                        aria-valuenow={averageStrength}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                      >
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${averageStrength}%`,
                                            backgroundColor: getOverallStrengthColor(averageStrength),
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-medium">{Math.round(averageStrength)}%</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {selectedVariantData ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {selectedVariantData.gene} - {selectedVariantData.variant}
                      </CardTitle>
                      <Badge className={getClassificationColor(selectedVariantData.classification)}>
                        {selectedVariantData.classification}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {evidenceCategories
                        .filter((category) =>
                          selectedVariantData.evidenceItems.some((item) => item.type === category.type),
                        )
                        .map((category) => {
                          const categoryItems = selectedVariantData.evidenceItems.filter(
                            (item) => item.type === category.type,
                          )

                          return (
                            <div key={category.type} className="rounded-lg border border-gray-200">
                              <div className="border-b border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-center space-x-2">
                                  <div className="rounded-full bg-blue-100 p-1.5">{category.icon}</div>
                                  <h4 className="font-medium">{category.label}</h4>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <HelpCircle className="h-3 w-3 text-gray-400" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs text-xs">{category.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <div className="divide-y divide-gray-100">
                                {categoryItems.map((item) => (
                                  <div key={item.id} className="p-3">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <p className="text-sm">{item.description}</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                          <span>Source: {item.source}</span>
                                          <span>•</span>
                                          <span>{new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                      <Badge className={getEvidenceStrengthColor(item.strength)}>
                                        {formatEvidenceStrength(item.strength)}
                                      </Badge>
                                    </div>
                                    {item.sourceUrl && (
                                      <div className="mt-2 flex justify-end">
                                        <Button variant="outline" size="sm" asChild>
                                          <a
                                            href={item.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-xs"
                                          >
                                            <FileText className="mr-1 h-3 w-3" />
                                            View Source
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                          </a>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <Info className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No variant selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Please select a variant to view detailed evidence.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="acmg" className="space-y-6">
            {selectedVariantData ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">ACMG/AMP Criteria Analysis</CardTitle>
                      <Badge className={getClassificationColor(selectedVariantData.classification)}>
                        {selectedVariantData.classification}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-start">
                        <div className="mr-3 rounded-full bg-amber-100 p-2">
                          <Info className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-amber-800">ACMG/AMP Classification Framework</h3>
                          <p className="mt-1 text-xs text-amber-700">
                            The American College of Medical Genetics and Genomics (ACMG) and the Association for
                            Molecular Pathology (AMP) have developed guidelines for the interpretation of sequence
                            variants. This framework uses specific evidence criteria to classify variants as pathogenic,
                            likely pathogenic, uncertain significance, likely benign, or benign.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 p-3">
                          <h4 className="font-medium">Pathogenic Evidence</h4>
                          <div className="mt-2 space-y-2">
                            <div className="rounded-lg border border-red-100 bg-red-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-red-100 text-red-800">PVS1</Badge>
                                  <span className="text-xs">Null variant in a gene where LOF is a known mechanism</span>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800">Not Met</Badge>
                              </div>
                            </div>
                            <div className="rounded-lg border border-red-100 bg-red-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-red-100 text-red-800">PS1</Badge>
                                  <span className="text-xs">
                                    Same amino acid change as established pathogenic variant
                                  </span>
                                </div>
                                <Badge className="bg-red-100 text-red-800">Met</Badge>
                              </div>
                            </div>
                            <div className="rounded-lg border border-red-100 bg-red-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-red-100 text-red-800">PM1</Badge>
                                  <span className="text-xs">Located in mutational hot spot or functional domain</span>
                                </div>
                                <Badge className="bg-red-100 text-red-800">Met</Badge>
                              </div>
                            </div>
                            <div className="rounded-lg border border-red-100 bg-red-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-red-100 text-red-800">PP3</Badge>
                                  <span className="text-xs">
                                    Multiple computational evidence supports deleterious effect
                                  </span>
                                </div>
                                <Badge className="bg-red-100 text-red-800">Met</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-3">
                          <h4 className="font-medium">Benign Evidence</h4>
                          <div className="mt-2 space-y-2">
                            <div className="rounded-lg border border-green-100 bg-green-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-green-100 text-green-800">BA1</Badge>
                                  <span className="text-xs">Allele frequency is greater than 5%</span>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800">Not Met</Badge>
                              </div>
                            </div>
                            <div className="rounded-lg border border-green-100 bg-green-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-green-100 text-green-800">BS1</Badge>
                                  <span className="text-xs">Allele frequency greater than expected for disorder</span>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800">Not Met</Badge>
                              </div>
                            </div>
                            <div className="rounded-lg border border-green-100 bg-green-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-green-100 text-green-800">BP4</Badge>
                                  <span className="text-xs">Multiple computational evidence suggests no impact</span>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800">Not Met</Badge>
                              </div>
                            </div>
                            <div className="rounded-lg border border-green-100 bg-green-50 p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-green-100 text-green-800">BP7</Badge>
                                  <span className="text-xs">Silent variant with no predicted splice impact</span>
                                </div>
                                <Badge className="bg-gray-100 text-gray-800">Not Met</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-3">
                        <h4 className="font-medium">Classification Summary</h4>
                        <div className="mt-2">
                          <p className="text-sm">
                            Based on the ACMG/AMP criteria, this variant meets 1 strong pathogenic (PS1), 1 moderate
                            pathogenic (PM1), and 1 supporting pathogenic (PP3) criteria, which is consistent with a{" "}
                            <span className="font-medium text-red-700">Likely Pathogenic</span> classification.
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <span className="text-sm font-medium">Classification Rule Applied:</span>
                            <Badge className="bg-blue-100 text-blue-800">
                              1 Strong + 1-2 Moderate = Likely Pathogenic
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <Info className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No variant selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Please select a variant to view ACMG criteria analysis.</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
