"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Info,
  Microscope,
  Scale,
  Users,
  Zap,
} from "lucide-react"

// Types for evidence conflict resolution
export type EvidenceDirection = "supporting" | "contradictory" | "neutral"
export type EvidenceSource = "functional" | "population" | "computational" | "clinical" | "literature"
export type EvidenceWeight = "very_strong" | "strong" | "moderate" | "supporting" | "weak"
export type ClassificationType =
  | "pathogenic"
  | "likely_pathogenic"
  | "uncertain_significance"
  | "likely_benign"
  | "benign"

export interface ConflictingEvidence {
  id: string
  source: EvidenceSource
  direction: EvidenceDirection
  weight: EvidenceWeight
  description: string
  reference: string
  referenceUrl?: string
}

export interface EvidenceConflict {
  id: string
  variantId: string
  gene: string
  variant: string
  conflictingEvidence: ConflictingEvidence[]
  resolutionMethod: string
  resolutionJustification: string
  finalClassification: ClassificationType
  confidenceScore: number // 0-100
  dateResolved: string
}

interface ConflictResolutionVisualizerProps {
  conflicts: EvidenceConflict[]
}

export function ConflictResolutionVisualizer({ conflicts }: ConflictResolutionVisualizerProps) {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(conflicts.length > 0 ? conflicts[0].id : null)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Toggle expanded state for a section
  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  // Get color for classification
  const getClassificationColor = (classification: ClassificationType) => {
    switch (classification) {
      case "pathogenic":
        return "bg-red-100 text-red-800"
      case "likely_pathogenic":
        return "bg-orange-100 text-orange-800"
      case "uncertain_significance":
        return "bg-yellow-100 text-yellow-800"
      case "likely_benign":
        return "bg-blue-100 text-blue-800"
      case "benign":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format classification for display
  const formatClassification = (classification: ClassificationType) => {
    return classification
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get color for evidence direction
  const getEvidenceDirectionColor = (direction: EvidenceDirection) => {
    switch (direction) {
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

  // Get icon for evidence direction
  const getEvidenceDirectionIcon = (direction: EvidenceDirection) => {
    switch (direction) {
      case "supporting":
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case "contradictory":
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case "neutral":
        return <ArrowRight className="h-4 w-4 text-gray-600" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Get color for evidence weight
  const getEvidenceWeightColor = (weight: EvidenceWeight) => {
    switch (weight) {
      case "very_strong":
        return "bg-indigo-100 text-indigo-800"
      case "strong":
        return "bg-blue-100 text-blue-800"
      case "moderate":
        return "bg-teal-100 text-teal-800"
      case "supporting":
        return "bg-green-100 text-green-800"
      case "weak":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format evidence weight for display
  const formatEvidenceWeight = (weight: EvidenceWeight) => {
    return weight
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get icon for evidence source
  const getEvidenceSourceIcon = (source: EvidenceSource) => {
    switch (source) {
      case "functional":
        return <Microscope className="h-4 w-4" />
      case "population":
        return <Users className="h-4 w-4" />
      case "computational":
        return <Zap className="h-4 w-4" />
      case "clinical":
        return <FileText className="h-4 w-4" />
      case "literature":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Format evidence source for display
  const formatEvidenceSource = (source: EvidenceSource) => {
    return source.charAt(0).toUpperCase() + source.slice(1)
  }

  // Get selected conflict
  const selectedConflictData = conflicts.find((c) => c.id === selectedConflict)

  // Prepare data for evidence direction pie chart
  const prepareDirectionPieChartData = (conflict: EvidenceConflict) => {
    const directionCounts: Record<EvidenceDirection, number> = {
      supporting: 0,
      contradictory: 0,
      neutral: 0,
    }

    // Count evidence items by direction
    conflict.conflictingEvidence.forEach((item) => {
      directionCounts[item.direction] += 1
    })

    // Convert to array format for pie chart
    return Object.keys(directionCounts).map((direction) => ({
      name: direction.charAt(0).toUpperCase() + direction.slice(1),
      value: directionCounts[direction as EvidenceDirection],
    }))
  }

  // Prepare data for evidence weight bar chart
  const prepareWeightBarChartData = (conflict: EvidenceConflict) => {
    const supportingWeights: Record<EvidenceWeight, number> = {
      very_strong: 0,
      strong: 0,
      moderate: 0,
      supporting: 0,
      weak: 0,
    }

    const contradictoryWeights: Record<EvidenceWeight, number> = {
      very_strong: 0,
      strong: 0,
      moderate: 0,
      supporting: 0,
      weak: 0,
    }

    // Count evidence items by weight and direction
    conflict.conflictingEvidence.forEach((item) => {
      if (item.direction === "supporting") {
        supportingWeights[item.weight] += 1
      } else if (item.direction === "contradictory") {
        contradictoryWeights[item.weight] += 1
      }
    })

    // Convert to array format for bar chart
    return [
      {
        name: "Very Strong",
        supporting: supportingWeights.very_strong,
        contradictory: contradictoryWeights.very_strong,
      },
      {
        name: "Strong",
        supporting: supportingWeights.strong,
        contradictory: contradictoryWeights.strong,
      },
      {
        name: "Moderate",
        supporting: supportingWeights.moderate,
        contradictory: contradictoryWeights.moderate,
      },
      {
        name: "Supporting",
        supporting: supportingWeights.supporting,
        contradictory: contradictoryWeights.supporting,
      },
      {
        name: "Weak",
        supporting: supportingWeights.weak,
        contradictory: contradictoryWeights.weak,
      },
    ]
  }

  // Prepare data for evidence source bar chart
  const prepareSourceBarChartData = (conflict: EvidenceConflict) => {
    const sourceCounts: Record<EvidenceSource, { supporting: number; contradictory: number }> = {
      functional: { supporting: 0, contradictory: 0 },
      population: { supporting: 0, contradictory: 0 },
      computational: { supporting: 0, contradictory: 0 },
      clinical: { supporting: 0, contradictory: 0 },
      literature: { supporting: 0, contradictory: 0 },
    }

    // Count evidence items by source and direction
    conflict.conflictingEvidence.forEach((item) => {
      if (item.direction === "supporting") {
        sourceCounts[item.source].supporting += 1
      } else if (item.direction === "contradictory") {
        sourceCounts[item.source].contradictory += 1
      }
    })

    // Convert to array format for bar chart
    return Object.keys(sourceCounts).map((source) => ({
      name: formatEvidenceSource(source as EvidenceSource),
      supporting: sourceCounts[source as EvidenceSource].supporting,
      contradictory: sourceCounts[source as EvidenceSource].contradictory,
    }))
  }

  // Colors for pie chart
  const DIRECTION_COLORS = {
    Supporting: "#10b981", // green-500
    Contradictory: "#ef4444", // red-500
    Neutral: "#6b7280", // gray-500
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Evidence Conflict Resolution</CardTitle>
          <p className="text-sm text-gray-500">
            Visualize how conflicting evidence is resolved in variant classification decisions
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
            <TabsTrigger value="resolution" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Resolution Process
            </TabsTrigger>
            <TabsTrigger value="methodology" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Methodology
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {conflicts.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conflicts available</h3>
                  <p className="mt-1 text-sm text-gray-500">There are no evidence conflicts available for analysis.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {conflicts.map((conflict) => (
                    <Card
                      key={conflict.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedConflict === conflict.id ? "border-blue-500 ring-2 ring-blue-200" : ""
                      }`}
                      onClick={() => setSelectedConflict(conflict.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              {conflict.gene} - {conflict.variant}
                            </div>
                            <Badge className={getClassificationColor(conflict.finalClassification)}>
                              {formatClassification(conflict.finalClassification)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-2 flex-1 rounded-full bg-gray-200"
                              role="progressbar"
                              aria-valuenow={conflict.confidenceScore}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${conflict.confidenceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{conflict.confidenceScore}%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {conflict.conflictingEvidence.length} evidence items • Resolved{" "}
                            {new Date(conflict.dateResolved).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedConflictData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Evidence Direction</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={prepareDirectionPieChartData(selectedConflictData)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {prepareDirectionPieChartData(selectedConflictData).map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={DIRECTION_COLORS[entry.name as keyof typeof DIRECTION_COLORS]}
                                    />
                                  ))}
                                </Pie>
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Evidence Weight</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareWeightBarChartData(selectedConflictData)}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="supporting" name="Supporting" fill="#10b981" />
                                <Bar dataKey="contradictory" name="Contradictory" fill="#ef4444" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Evidence Source</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareSourceBarChartData(selectedConflictData)}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="supporting" name="Supporting" fill="#10b981" />
                                <Bar dataKey="contradictory" name="Contradictory" fill="#ef4444" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Resolution Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start space-x-3">
                              <div className="rounded-full bg-blue-100 p-2">
                                <Scale className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">Resolution Method</h4>
                                <p className="mt-1 text-sm text-gray-700">{selectedConflictData.resolutionMethod}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start space-x-3">
                              <div className="rounded-full bg-blue-100 p-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">Justification</h4>
                                <p className="mt-1 text-sm text-gray-700">
                                  {selectedConflictData.resolutionJustification}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start space-x-3">
                              <div className="rounded-full bg-blue-100 p-2">
                                <Info className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">Final Classification</h4>
                                <div className="mt-2 flex items-center space-x-2">
                                  <Badge className={getClassificationColor(selectedConflictData.finalClassification)}>
                                    {formatClassification(selectedConflictData.finalClassification)}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    with {selectedConflictData.confidenceScore}% confidence
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolution" className="space-y-6">
            {selectedConflictData ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {selectedConflictData.gene} - {selectedConflictData.variant}
                      </CardTitle>
                      <Badge className={getClassificationColor(selectedConflictData.finalClassification)}>
                        {formatClassification(selectedConflictData.finalClassification)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-start">
                          <div className="mr-3 rounded-full bg-blue-100 p-2">
                            <Info className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-blue-800">Resolution Process</h3>
                            <p className="mt-1 text-xs text-blue-700">
                              This section shows the step-by-step process used to resolve conflicting evidence for this
                              variant. Each step represents a key decision point in the classification process.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

                          {/* Step 1: Evidence Collection */}
                          <div className="relative mb-8 ml-4 rounded-lg border border-gray-200 bg-white p-4 pl-6">
                            <div className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white">
                              1
                            </div>
                            <h4 className="font-medium">Evidence Collection</h4>
                            <p className="mt-1 text-sm text-gray-700">
                              All available evidence for the variant was collected from multiple sources, including
                              functional studies, population databases, computational predictions, and literature.
                            </p>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSectionExpanded("evidence")}
                                className="text-xs"
                              >
                                {expandedSections["evidence"] ? "Hide Details" : "Show Details"}
                                {expandedSections["evidence"] ? (
                                  <ChevronUp className="ml-1 h-3 w-3" />
                                ) : (
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {expandedSections["evidence"] && (
                              <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                <h5 className="text-xs font-medium">
                                  Evidence Items ({selectedConflictData.conflictingEvidence.length})
                                </h5>
                                <div className="max-h-60 overflow-y-auto">
                                  <div className="space-y-2">
                                    {selectedConflictData.conflictingEvidence.map((item) => (
                                      <div key={item.id} className="rounded-md border border-gray-200 bg-white p-2">
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-start space-x-2">
                                            <div className="mt-0.5">{getEvidenceDirectionIcon(item.direction)}</div>
                                            <div>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs font-medium">
                                                  {formatEvidenceSource(item.source)}
                                                </span>
                                                <Badge className={getEvidenceWeightColor(item.weight)}>
                                                  {formatEvidenceWeight(item.weight)}
                                                </Badge>
                                                <Badge className={getEvidenceDirectionColor(item.direction)}>
                                                  {item.direction.charAt(0).toUpperCase() + item.direction.slice(1)}
                                                </Badge>
                                              </div>
                                              <p className="mt-1 text-xs">{item.description}</p>
                                              <div className="mt-1 text-xs text-gray-500">
                                                Source: {item.reference}
                                                {item.referenceUrl && (
                                                  <a
                                                    href={item.referenceUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-1 inline-flex items-center text-blue-600 hover:underline"
                                                  >
                                                    <ExternalLink className="ml-0.5 h-3 w-3" />
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Step 2: Evidence Evaluation */}
                          <div className="relative mb-8 ml-4 rounded-lg border border-gray-200 bg-white p-4 pl-6">
                            <div className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white">
                              2
                            </div>
                            <h4 className="font-medium">Evidence Evaluation</h4>
                            <p className="mt-1 text-sm text-gray-700">
                              Each piece of evidence was evaluated for quality, relevance, and strength. Evidence was
                              categorized as supporting, contradictory, or neutral with respect to pathogenicity.
                            </p>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSectionExpanded("evaluation")}
                                className="text-xs"
                              >
                                {expandedSections["evaluation"] ? "Hide Details" : "Show Details"}
                                {expandedSections["evaluation"] ? (
                                  <ChevronUp className="ml-1 h-3 w-3" />
                                ) : (
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {expandedSections["evaluation"] && (
                              <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                  <div>
                                    <h5 className="text-xs font-medium">Evidence Direction</h5>
                                    <div className="mt-2 h-[150px]">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                          <Pie
                                            data={prepareDirectionPieChartData(selectedConflictData)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                          >
                                            {prepareDirectionPieChartData(selectedConflictData).map((entry, index) => (
                                              <Cell
                                                key={`cell-${index}`}
                                                fill={DIRECTION_COLORS[entry.name as keyof typeof DIRECTION_COLORS]}
                                              />
                                            ))}
                                          </Pie>
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-medium">Evidence Quality Assessment</h5>
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2">
                                        <span className="text-xs">Functional Studies</span>
                                        <Badge className="bg-green-100 text-green-800">High Quality</Badge>
                                      </div>
                                      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2">
                                        <span className="text-xs">Population Data</span>
                                        <Badge className="bg-green-100 text-green-800">High Quality</Badge>
                                      </div>
                                      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2">
                                        <span className="text-xs">Computational Predictions</span>
                                        <Badge className="bg-yellow-100 text-yellow-800">Medium Quality</Badge>
                                      </div>
                                      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2">
                                        <span className="text-xs">Clinical Data</span>
                                        <Badge className="bg-yellow-100 text-yellow-800">Medium Quality</Badge>
                                      </div>
                                      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2">
                                        <span className="text-xs">Literature</span>
                                        <Badge className="bg-green-100 text-green-800">High Quality</Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Step 3: Conflict Identification */}
                          <div className="relative mb-8 ml-4 rounded-lg border border-gray-200 bg-white p-4 pl-6">
                            <div className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white">
                              3
                            </div>
                            <h4 className="font-medium">Conflict Identification</h4>
                            <p className="mt-1 text-sm text-gray-700">
                              Conflicts between different evidence sources were identified and characterized. The nature
                              and severity of each conflict was documented.
                            </p>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSectionExpanded("conflicts")}
                                className="text-xs"
                              >
                                {expandedSections["conflicts"] ? "Hide Details" : "Show Details"}
                                {expandedSections["conflicts"] ? (
                                  <ChevronUp className="ml-1 h-3 w-3" />
                                ) : (
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {expandedSections["conflicts"] && (
                              <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                <h5 className="text-xs font-medium">Key Conflicts Identified</h5>
                                <div className="space-y-2">
                                  <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                    <h6 className="text-xs font-medium text-red-800">
                                      Functional vs. Computational Evidence
                                    </h6>
                                    <p className="mt-1 text-xs text-red-700">
                                      Functional studies show loss of protein function, but some computational
                                      predictions suggest a benign effect.
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                      <div className="rounded-full bg-red-100 p-1">
                                        <AlertTriangle className="h-3 w-3 text-red-600" />
                                      </div>
                                      <span className="text-xs text-red-700">High Severity Conflict</span>
                                    </div>
                                  </div>

                                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                    <h6 className="text-xs font-medium text-amber-800">
                                      Population Data vs. Clinical Reports
                                    </h6>
                                    <p className="mt-1 text-xs text-amber-700">
                                      Variant is rare in population databases, but clinical significance is disputed in
                                      some case reports.
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                      <div className="rounded-full bg-amber-100 p-1">
                                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                                      </div>
                                      <span className="text-xs text-amber-700">Medium Severity Conflict</span>
                                    </div>
                                  </div>

                                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                    <h6 className="text-xs font-medium text-amber-800">
                                      Literature Interpretation Differences
                                    </h6>
                                    <p className="mt-1 text-xs text-amber-700">
                                      Different research groups have published conflicting interpretations of this
                                      variant's significance.
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                      <div className="rounded-full bg-amber-100 p-1">
                                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                                      </div>
                                      <span className="text-xs text-amber-700">Medium Severity Conflict</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Step 4: Evidence Weighting */}
                          <div className="relative mb-8 ml-4 rounded-lg border border-gray-200 bg-white p-4 pl-6">
                            <div className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white">
                              4
                            </div>
                            <h4 className="font-medium">Evidence Weighting</h4>
                            <p className="mt-1 text-sm text-gray-700">
                              Each piece of evidence was assigned a weight based on its strength, quality, and
                              relevance. Higher weights were given to stronger and more direct evidence.
                            </p>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSectionExpanded("weighting")}
                                className="text-xs"
                              >
                                {expandedSections["weighting"] ? "Hide Details" : "Show Details"}
                                {expandedSections["weighting"] ? (
                                  <ChevronUp className="ml-1 h-3 w-3" />
                                ) : (
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {expandedSections["weighting"] && (
                              <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                <h5 className="text-xs font-medium">Evidence Weighting Principles</h5>
                                <div className="space-y-2">
                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <div className="flex items-start space-x-2">
                                      <div className="rounded-full bg-blue-100 p-1">
                                        <Check className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-medium">Experimental Evidence Priority</h6>
                                        <p className="text-xs text-gray-600">
                                          Well-designed functional studies are given higher weight than computational
                                          predictions.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <div className="flex items-start space-x-2">
                                      <div className="rounded-full bg-blue-100 p-1">
                                        <Check className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-medium">Replication Consideration</h6>
                                        <p className="text-xs text-gray-600">
                                          Evidence replicated across multiple studies or sources is weighted more
                                          heavily.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <div className="flex items-start space-x-2">
                                      <div className="rounded-full bg-blue-100 p-1">
                                        <Check className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-medium">Methodological Quality</h6>
                                        <p className="text-xs text-gray-600">
                                          Evidence from studies with robust methodology receives higher weight.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <div className="flex items-start space-x-2">
                                      <div className="rounded-full bg-blue-100 p-1">
                                        <Check className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-medium">Relevance to Disease Mechanism</h6>
                                        <p className="text-xs text-gray-600">
                                          Evidence directly related to the disease mechanism is weighted more heavily.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <h5 className="text-xs font-medium">Evidence Weight Distribution</h5>
                                  <div className="mt-2 h-[150px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart
                                        data={prepareWeightBarChartData(selectedConflictData)}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={50} />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar dataKey="supporting" name="Supporting" fill="#10b981" />
                                        <Bar dataKey="contradictory" name="Contradictory" fill="#ef4444" />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Step 5: Conflict Resolution */}
                          <div className="relative mb-8 ml-4 rounded-lg border border-gray-200 bg-white p-4 pl-6">
                            <div className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white">
                              5
                            </div>
                            <h4 className="font-medium">Conflict Resolution</h4>
                            <p className="mt-1 text-sm text-gray-700">
                              Conflicts were resolved using a structured approach that considered the weight of
                              evidence, methodological quality, and relevance to the disease mechanism.
                            </p>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSectionExpanded("resolution")}
                                className="text-xs"
                              >
                                {expandedSections["resolution"] ? "Hide Details" : "Show Details"}
                                {expandedSections["resolution"] ? (
                                  <ChevronUp className="ml-1 h-3 w-3" />
                                ) : (
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {expandedSections["resolution"] && (
                              <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                <h5 className="text-xs font-medium">Resolution Method</h5>
                                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                                  <p className="text-xs text-blue-700">{selectedConflictData.resolutionMethod}</p>
                                </div>

                                <h5 className="text-xs font-medium">Conflict Resolution Details</h5>
                                <div className="space-y-2">
                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <h6 className="text-xs font-medium">Functional vs. Computational Evidence</h6>
                                    <p className="mt-1 text-xs text-gray-600">
                                      Resolution: Functional evidence was given priority due to direct experimental
                                      validation of protein dysfunction. Computational predictions were considered
                                      supportive but not definitive.
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                      <div className="rounded-full bg-green-100 p-1">
                                        <Check className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span className="text-xs text-green-600">Resolved</span>
                                    </div>
                                  </div>

                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <h6 className="text-xs font-medium">Population Data vs. Clinical Reports</h6>
                                    <p className="mt-1 text-xs text-gray-600">
                                      Resolution: The variant's rarity in population databases was considered consistent
                                      with pathogenicity. Clinical reports were evaluated for methodological quality,
                                      and higher weight was given to well-documented cases.
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                      <div className="rounded-full bg-green-100 p-1">
                                        <Check className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span className="text-xs text-green-600">Resolved</span>
                                    </div>
                                  </div>

                                  <div className="rounded-md border border-gray-200 bg-white p-2">
                                    <h6 className="text-xs font-medium">Literature Interpretation Differences</h6>
                                    <p className="mt-1 text-xs text-gray-600">
                                      Resolution: More recent publications with larger cohorts and improved methodology
                                      were given higher weight. Older studies with limited data were considered but
                                      given less weight in the final determination.
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                      <div className="rounded-full bg-green-100 p-1">
                                        <Check className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span className="text-xs text-green-600">Resolved</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Step 6: Final Classification */}
                          <div className="relative ml-4 rounded-lg border border-gray-200 bg-white p-4 pl-6">
                            <div className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white">
                              6
                            </div>
                            <h4 className="font-medium">Final Classification</h4>
                            <p className="mt-1 text-sm text-gray-700">
                              Based on the weighted evidence and resolution of conflicts, a final classification was
                              determined according to ACMG/AMP guidelines.
                            </p>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSectionExpanded("classification")}
                                className="text-xs"
                              >
                                {expandedSections["classification"] ? "Hide Details" : "Show Details"}
                                {expandedSections["classification"] ? (
                                  <ChevronUp className="ml-1 h-3 w-3" />
                                ) : (
                                  <ChevronDown className="ml-1 h-3 w-3" />
                                )}
                              </Button>
                            </div>

                            {expandedSections["classification"] && (
                              <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-medium">Final Classification</h5>
                                  <Badge className={getClassificationColor(selectedConflictData.finalClassification)}>
                                    {formatClassification(selectedConflictData.finalClassification)}
                                  </Badge>
                                </div>

                                <div className="rounded-md border border-gray-200 bg-white p-3">
                                  <h6 className="text-xs font-medium">Classification Justification</h6>
                                  <p className="mt-1 text-xs text-gray-600">
                                    {selectedConflictData.resolutionJustification}
                                  </p>
                                </div>

                                <div className="rounded-md border border-gray-200 bg-white p-3">
                                  <h6 className="text-xs font-medium">Confidence Level</h6>
                                  <div className="mt-2 flex items-center space-x-2">
                                    <div
                                      className="h-2 w-full rounded-full bg-gray-200"
                                      role="progressbar"
                                      aria-valuenow={selectedConflictData.confidenceScore}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    >
                                      <div
                                        className="h-full rounded-full bg-blue-500"
                                        style={{ width: `${selectedConflictData.confidenceScore}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-medium">{selectedConflictData.confidenceScore}%</span>
                                  </div>
                                  <p className="mt-2 text-xs text-gray-500">
                                    This confidence score reflects the overall strength of evidence supporting the final
                                    classification, taking into account the resolution of conflicting evidence.
                                  </p>
                                </div>

                                <div className="rounded-md border border-gray-200 bg-white p-3">
                                  <h6 className="text-xs font-medium">ACMG/AMP Criteria Applied</h6>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-red-100 text-red-800">PS3</Badge>
                                      <span className="text-xs">
                                        Well-established functional studies show a deleterious effect
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-red-100 text-red-800">PM2</Badge>
                                      <span className="text-xs">Absent from controls in population databases</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-red-100 text-red-800">PP3</Badge>
                                      <span className="text-xs">
                                        Multiple computational evidence supports a deleterious effect
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-green-100 text-green-800">BP5</Badge>
                                      <span className="text-xs">
                                        Variant found in a case with an alternate molecular basis for disease
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
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
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conflict selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Please select a conflict to view the resolution process.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="methodology" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Evidence Conflict Resolution Methodology</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start">
                      <div className="mr-3 rounded-full bg-blue-100 p-2">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">About This Methodology</h3>
                        <p className="mt-1 text-xs text-blue-700">
                          This section describes the standardized methodology used to resolve conflicts between
                          different types of evidence when classifying genetic variants. This approach ensures
                          consistency, transparency, and reproducibility in variant classification decisions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium">1. Evidence Hierarchy</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        Our methodology employs a hierarchical approach to evidence evaluation, with certain types of
                        evidence given priority over others based on their reliability and directness.
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <h5 className="text-xs font-medium">Evidence Hierarchy (Highest to Lowest)</h5>
                          <ol className="mt-2 space-y-2 pl-5 text-xs text-gray-600">
                            <li className="list-decimal">
                              <span className="font-medium">Experimental Functional Data:</span> Well-designed
                              experimental studies that directly assess the functional impact of a variant
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Clinical Genetic Evidence:</span> Segregation data, de novo
                              occurrence, and case-control studies
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Population Data:</span> Allele frequency in population
                              databases and control cohorts
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Computational Predictions:</span> In silico algorithms that
                              predict variant impact
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">General Disease Mechanism:</span> Knowledge about the gene's
                              function and role in disease
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium">2. Evidence Quality Assessment</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        Each piece of evidence is evaluated for its methodological quality, relevance, and reliability
                        before being considered in the classification process.
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <h5 className="text-xs font-medium">Quality Assessment Criteria</h5>
                          <ul className="mt-2 space-y-2 pl-5 text-xs text-gray-600">
                            <li className="list-disc">
                              <span className="font-medium">Methodological Rigor:</span> Was the study well-designed
                              with appropriate controls?
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Sample Size:</span> Was the study adequately powered?
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Replication:</span> Has the finding been replicated in
                              independent studies?
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Relevance:</span> How directly does the evidence relate to
                              the variant's effect?
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Recency:</span> Does the evidence reflect current knowledge
                              and methodologies?
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium">3. Conflict Resolution Principles</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        When evidence conflicts, we apply the following principles to resolve discrepancies and reach a
                        consistent classification.
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <h5 className="text-xs font-medium">Resolution Principles</h5>
                          <ul className="mt-2 space-y-2 pl-5 text-xs text-gray-600">
                            <li className="list-disc">
                              <span className="font-medium">Experimental Over Computational:</span> Direct experimental
                              evidence generally outweighs computational predictions
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Quality Over Quantity:</span> A few high-quality studies
                              outweigh multiple low-quality studies
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Specificity Principle:</span> Evidence specific to the exact
                              variant outweighs general gene-level evidence
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Mechanistic Consistency:</span> Evidence consistent with
                              known disease mechanisms is weighted more heavily
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Conservative Interpretation:</span> When conflicts cannot be
                              fully resolved, we err on the side of caution
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium">4. Quantitative Scoring System</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        We employ a quantitative scoring system to objectively weigh different types of evidence and
                        their strength.
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <h5 className="text-xs font-medium">Scoring Framework</h5>
                          <table className="mt-2 min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left font-medium text-gray-700">
                                  Evidence Type
                                </th>
                                <th scope="col" className="px-3 py-2 text-left font-medium text-gray-700">
                                  Very Strong
                                </th>
                                <th scope="col" className="px-3 py-2 text-left font-medium text-gray-700">
                                  Strong
                                </th>
                                <th scope="col" className="px-3 py-2 text-left font-medium text-gray-700">
                                  Moderate
                                </th>
                                <th scope="col" className="px-3 py-2 text-left font-medium text-gray-700">
                                  Supporting
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              <tr>
                                <td className="px-3 py-2 text-gray-600">Functional</td>
                                <td className="px-3 py-2 text-gray-600">10</td>
                                <td className="px-3 py-2 text-gray-600">8</td>
                                <td className="px-3 py-2 text-gray-600">5</td>
                                <td className="px-3 py-2 text-gray-600">2</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-gray-600">Population</td>
                                <td className="px-3 py-2 text-gray-600">8</td>
                                <td className="px-3 py-2 text-gray-600">6</td>
                                <td className="px-3 py-2 text-gray-600">4</td>
                                <td className="px-3 py-2 text-gray-600">1</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-gray-600">Clinical</td>
                                <td className="px-3 py-2 text-gray-600">9</td>
                                <td className="px-3 py-2 text-gray-600">7</td>
                                <td className="px-3 py-2 text-gray-600">4</td>
                                <td className="px-3 py-2 text-gray-600">2</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-gray-600">Computational</td>
                                <td className="px-3 py-2 text-gray-600">6</td>
                                <td className="px-3 py-2 text-gray-600">4</td>
                                <td className="px-3 py-2 text-gray-600">2</td>
                                <td className="px-3 py-2 text-gray-600">1</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-2 text-gray-600">Literature</td>
                                <td className="px-3 py-2 text-gray-600">7</td>
                                <td className="px-3 py-2 text-gray-600">5</td>
                                <td className="px-3 py-2 text-gray-600">3</td>
                                <td className="px-3 py-2 text-gray-600">1</td>
                              </tr>
                            </tbody>
                          </table>
                          <p className="mt-2 text-xs text-gray-500">
                            Note: Scores are applied in both supporting and contradictory directions. The final
                            classification is determined by the net score after weighing all evidence.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium">5. Expert Review Process</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        Complex conflicts undergo a structured expert review process to ensure thorough evaluation and
                        consensus.
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <h5 className="text-xs font-medium">Expert Review Workflow</h5>
                          <ol className="mt-2 space-y-2 pl-5 text-xs text-gray-600">
                            <li className="list-decimal">
                              <span className="font-medium">Initial Assessment:</span> Automated scoring and preliminary
                              classification
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Conflict Identification:</span> Automated detection of
                              significant evidence conflicts
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Primary Review:</span> Detailed review by a genetic variant
                              scientist
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Secondary Review:</span> Independent assessment by a second
                              scientist
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Consensus Discussion:</span> Resolution of any disagreements
                              between reviewers
                            </li>
                            <li className="list-decimal">
                              <span className="font-medium">Final Approval:</span> Sign-off by laboratory director for
                              complex cases
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium">6. Documentation and Transparency</h4>
                      <p className="mt-1 text-sm text-gray-700">
                        All conflict resolution decisions are thoroughly documented to ensure transparency and
                        reproducibility.
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <h5 className="text-xs font-medium">Documentation Requirements</h5>
                          <ul className="mt-2 space-y-2 pl-5 text-xs text-gray-600">
                            <li className="list-disc">
                              <span className="font-medium">Evidence Inventory:</span> Complete list of all evidence
                              considered
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Quality Assessment:</span> Evaluation of each evidence
                              item's quality
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Conflict Identification:</span> Clear description of
                              identified conflicts
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Resolution Rationale:</span> Detailed explanation of how
                              each conflict was resolved
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Classification Justification:</span> Comprehensive
                              justification for the final classification
                            </li>
                            <li className="list-disc">
                              <span className="font-medium">Confidence Assessment:</span> Evaluation of the confidence
                              level in the final classification
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
