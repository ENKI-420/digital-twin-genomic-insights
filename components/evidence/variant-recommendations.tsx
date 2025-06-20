"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangleIcon,
  ClipboardIcon,
  FileTextIcon,
  BeakerIcon,
  UserIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from "lucide-react"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Mock data for high-risk variants
const highRiskVariants = [
  {
    id: "APC:c.3920T>A",
    name: "APC c.3920T>A",
    gene: "APC",
    transcript: "NM_000038.6",
    hgvs: "c.3920T>A",
    protein: "p.Ile1307Lys",
    currentClass: "VUS",
    predictedClass: "Likely Pathogenic",
    reclassRisk: 0.76,
    timeframe: "12-18 months",
    clinicalContext: "Colorectal cancer predisposition",
    conflictingEvidence: [
      {
        type: "Population",
        description: "Present in 6% of Ashkenazi Jewish population",
        direction: "Benign",
        strength: "Moderate",
      },
      {
        type: "Functional",
        description: "Increases microsatellite instability in cell models",
        direction: "Pathogenic",
        strength: "Strong",
      },
      {
        type: "Clinical",
        description: "Associated with 1.5-2x increased colorectal cancer risk",
        direction: "Pathogenic",
        strength: "Moderate",
      },
      {
        type: "Computational",
        description: "4/5 in silico algorithms predict damaging effect",
        direction: "Pathogenic",
        strength: "Supporting",
      },
    ],
    pendingEvidence: [
      {
        type: "Functional",
        description: "Large-scale functional assay results expected in 6 months",
        impact: "High",
        source: "Kitzman Lab",
      },
      {
        type: "Clinical",
        description: "Case-control study with 5,000 participants completing in 9 months",
        impact: "High",
        source: "MultiCenter CRC Consortium",
      },
    ],
    recommendations: {
      laboratory: [
        {
          action: "Prioritize for functional studies",
          rationale: "Current functional evidence is strong but limited in scope",
          timeframe: "3-6 months",
          impact: "High",
        },
        {
          action: "Collect additional segregation data",
          rationale: "Limited co-segregation data available",
          timeframe: "6-12 months",
          impact: "Medium",
        },
        {
          action: "Perform RNA splicing analysis",
          rationale: "Potential impact on splicing not fully assessed",
          timeframe: "1-3 months",
          impact: "Medium",
        },
      ],
      clinical: [
        {
          action: "Consider increased screening",
          rationale: "Emerging evidence suggests increased cancer risk",
          timeframe: "Immediate",
          impact: "High",
        },
        {
          action: "Refer for genetic counseling",
          rationale: "Discuss implications of potential reclassification",
          timeframe: "Immediate",
          impact: "High",
        },
        {
          action: "Document family history in detail",
          rationale: "May provide additional segregation evidence",
          timeframe: "Next visit",
          impact: "Medium",
        },
      ],
      research: [
        {
          action: "Include in functional multiplexed assays",
          rationale: "Would provide definitive functional evidence",
          timeframe: "6-12 months",
          impact: "High",
        },
        {
          action: "Analyze in population-specific context",
          rationale: "Frequency differs significantly between populations",
          timeframe: "3-6 months",
          impact: "Medium",
        },
      ],
    },
  },
  {
    id: "TP53:c.844C>T",
    name: "TP53 c.844C>T",
    gene: "TP53",
    transcript: "NM_000546.5",
    hgvs: "c.844C>T",
    protein: "p.Arg282Trp",
    currentClass: "Likely Pathogenic",
    predictedClass: "Pathogenic",
    reclassRisk: 0.89,
    timeframe: "6-12 months",
    clinicalContext: "Li-Fraumeni syndrome",
    conflictingEvidence: [
      {
        type: "Functional",
        description: "Partial loss of transactivation activity in functional assays",
        direction: "Pathogenic",
        strength: "Strong",
      },
      {
        type: "Population",
        description: "Absent from population databases",
        direction: "Pathogenic",
        strength: "Moderate",
      },
      {
        type: "Clinical",
        description: "Observed in multiple families with Li-Fraumeni syndrome",
        direction: "Pathogenic",
        strength: "Strong",
      },
      {
        type: "Computational",
        description: "Unanimously predicted deleterious by computational methods",
        direction: "Pathogenic",
        strength: "Supporting",
      },
    ],
    pendingEvidence: [
      {
        type: "Functional",
        description: "Comprehensive functional characterization in progress",
        impact: "High",
        source: "Giacomelli Lab",
      },
      {
        type: "Clinical",
        description: "Additional segregation data from 3 families expected",
        impact: "High",
        source: "International TP53 Consortium",
      },
    ],
    recommendations: {
      laboratory: [
        {
          action: "Apply PS3 criterion based on functional data",
          rationale: "Current functional evidence meets threshold for PS3",
          timeframe: "Immediate",
          impact: "High",
        },
        {
          action: "Review co-occurrence data",
          rationale: "Check for co-occurrence with other pathogenic variants",
          timeframe: "1-2 months",
          impact: "Medium",
        },
      ],
      clinical: [
        {
          action: "Implement full Li-Fraumeni management",
          rationale: "Evidence strongly supports pathogenicity",
          timeframe: "Immediate",
          impact: "High",
        },
        {
          action: "Test at-risk family members",
          rationale: "Cascade testing indicated given high likelihood of pathogenicity",
          timeframe: "1-3 months",
          impact: "High",
        },
      ],
      research: [
        {
          action: "Include in TP53 functional domain studies",
          rationale: "Located in DNA-binding domain with specific functional impact",
          timeframe: "6-12 months",
          impact: "Medium",
        },
      ],
    },
  },
  {
    id: "CHEK2:c.470T>C",
    name: "CHEK2 c.470T>C",
    gene: "CHEK2",
    transcript: "NM_007194.3",
    hgvs: "c.470T>C",
    protein: "p.Ile157Thr",
    currentClass: "VUS",
    predictedClass: "Likely Benign",
    reclassRisk: 0.72,
    timeframe: "12-24 months",
    clinicalContext: "Breast and colorectal cancer risk",
    conflictingEvidence: [
      {
        type: "Population",
        description: "Present in 1.5% of European population",
        direction: "Benign",
        strength: "Moderate",
      },
      {
        type: "Functional",
        description: "Partial reduction in kinase activity in vitro",
        direction: "Pathogenic",
        strength: "Moderate",
      },
      {
        type: "Clinical",
        description: "Modest association with breast cancer (OR 1.4)",
        direction: "Pathogenic",
        strength: "Supporting",
      },
      {
        type: "Computational",
        description: "Mixed predictions from in silico algorithms",
        direction: "Uncertain",
        strength: "Supporting",
      },
    ],
    pendingEvidence: [
      {
        type: "Population",
        description: "Expanded population data from gnomAD v4",
        impact: "High",
        source: "gnomAD Consortium",
      },
      {
        type: "Clinical",
        description: "Large case-control study results expected",
        impact: "High",
        source: "BRIDGES Consortium",
      },
    ],
    recommendations: {
      laboratory: [
        {
          action: "Apply BA1 criterion when new population data available",
          rationale: "Frequency approaching threshold for benign classification",
          timeframe: "6-12 months",
          impact: "High",
        },
        {
          action: "Review case-control data when published",
          rationale: "Will provide definitive risk estimates",
          timeframe: "12-18 months",
          impact: "High",
        },
      ],
      clinical: [
        {
          action: "Consider as low penetrance risk allele",
          rationale: "Evidence suggests modest risk increase if any",
          timeframe: "Immediate",
          impact: "Medium",
        },
        {
          action: "Base management on other risk factors",
          rationale: "Clinical decisions should not rely heavily on this variant",
          timeframe: "Immediate",
          impact: "Medium",
        },
      ],
      research: [
        {
          action: "Include in modifier gene studies",
          rationale: "May interact with other genetic factors",
          timeframe: "12-24 months",
          impact: "Medium",
        },
      ],
    },
  },
]

// Impact color mapping
const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High":
      return "bg-red-100 text-red-800"
    case "Medium":
      return "bg-yellow-100 text-yellow-800"
    case "Low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Evidence direction color mapping
const getEvidenceDirectionColor = (direction: string) => {
  switch (direction) {
    case "Pathogenic":
      return "bg-red-100 text-red-800"
    case "Benign":
      return "bg-green-100 text-green-800"
    case "Uncertain":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Evidence strength color mapping
const getEvidenceStrengthColor = (strength: string) => {
  switch (strength) {
    case "Very Strong":
      return "bg-purple-900 text-white"
    case "Strong":
      return "bg-purple-700 text-white"
    case "Moderate":
      return "bg-purple-500 text-white"
    case "Supporting":
      return "bg-purple-300 text-purple-900"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Classification color mapping
const getClassificationColor = (classification: string) => {
  switch (classification) {
    case "Pathogenic":
      return "#ef4444"
    case "Likely Pathogenic":
      return "#f97316"
    case "VUS":
      return "#eab308"
    case "Likely Benign":
      return "#22c55e"
    case "Benign":
      return "#10b981"
    default:
      return "#6b7280"
  }
}

// Reclassification risk color mapping
const getReclassRiskColor = (risk: number) => {
  if (risk >= 0.8) return "bg-red-500 text-white"
  if (risk >= 0.6) return "bg-orange-500 text-white"
  if (risk >= 0.4) return "bg-yellow-500 text-yellow-900"
  if (risk >= 0.2) return "bg-green-500 text-white"
  return "bg-green-700 text-white"
}

// Evidence type distribution for pie chart
const getEvidenceDistribution = (variant: any) => {
  const distribution: Record<string, number> = {
    Population: 0,
    Functional: 0,
    Clinical: 0,
    Computational: 0,
  }

  variant.conflictingEvidence.forEach((evidence: any) => {
    distribution[evidence.type] = (distribution[evidence.type] || 0) + 1
  })

  return Object.keys(distribution).map((key) => ({
    name: key,
    value: distribution[key],
  }))
}

// Evidence direction distribution for pie chart
const getEvidenceDirectionDistribution = (variant: any) => {
  const distribution: Record<string, number> = {
    Pathogenic: 0,
    Benign: 0,
    Uncertain: 0,
  }

  variant.conflictingEvidence.forEach((evidence: any) => {
    distribution[evidence.direction] = (distribution[evidence.direction] || 0) + 1
  })

  return Object.keys(distribution).map((key) => ({
    name: key,
    value: distribution[key],
  }))
}

// Colors for pie charts
const EVIDENCE_TYPE_COLORS = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6"]
const EVIDENCE_DIRECTION_COLORS = ["#ef4444", "#10b981", "#eab308"]

export function VariantRecommendations() {
  const [selectedVariant, setSelectedVariant] = useState(highRiskVariants[0].id)
  const variant = highRiskVariants.find((v) => v.id === selectedVariant)

  if (!variant) return null

  const evidenceTypeData = getEvidenceDistribution(variant)
  const evidenceDirectionData = getEvidenceDirectionDistribution(variant)

  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">High Reclassification Risk Variants</AlertTitle>
        <AlertDescription className="text-amber-700">
          These variants have been identified as having a high probability of reclassification based on AI prediction
          models and emerging evidence patterns.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Select Variant</label>
          <Select value={selectedVariant} onValueChange={setSelectedVariant}>
            <SelectTrigger className="w-full md:w-[350px]">
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {highRiskVariants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name} ({variant.currentClass} → {variant.predictedClass})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{variant.name}</CardTitle>
                <CardDescription>
                  {variant.gene} | {variant.transcript} | {variant.protein}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500">Reclassification Risk:</div>
                <Badge className={getReclassRiskColor(variant.reclassRisk)}>
                  {(variant.reclassRisk * 100).toFixed(0)}%
                </Badge>
                <div className="text-sm text-gray-500">Timeframe:</div>
                <Badge variant="outline">{variant.timeframe}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium">Current Classification:</div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getClassificationColor(variant.currentClass) }}
                  />
                  <span>{variant.currentClass}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium">Predicted Classification:</div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getClassificationColor(variant.predictedClass) }}
                  />
                  <span>{variant.predictedClass}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium">Clinical Context:</div>
                <span>{variant.clinicalContext}</span>
              </div>
            </div>

            <Tabs defaultValue="evidence">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="evidence">Conflicting Evidence</TabsTrigger>
                <TabsTrigger value="pending">Pending Evidence</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="analysis">Evidence Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="evidence" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {variant.conflictingEvidence.map((evidence, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{evidence.type}</Badge>
                        <Badge className={getEvidenceDirectionColor(evidence.direction)}>{evidence.direction}</Badge>
                        <Badge className={getEvidenceStrengthColor(evidence.strength)}>{evidence.strength}</Badge>
                      </div>
                      <p className="text-sm">{evidence.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 pt-4">
                <div className="space-y-4">
                  {variant.pendingEvidence.map((evidence, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{evidence.type}</Badge>
                        <Badge className={getImpactColor(evidence.impact)}>Impact: {evidence.impact}</Badge>
                      </div>
                      <p className="text-sm">{evidence.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Source: {evidence.source}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="pt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <BeakerIcon className="h-5 w-5 mr-2 text-purple-500" />
                      Laboratory Recommendations
                    </h3>
                    <div className="space-y-3">
                      {variant.recommendations.laboratory.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{rec.action}</div>
                            <Badge className={getImpactColor(rec.impact)}>Impact: {rec.impact}</Badge>
                          </div>
                          <p className="text-sm mb-2">{rec.rationale}</p>
                          <div className="text-xs text-gray-500">Timeframe: {rec.timeframe}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Clinical Recommendations
                    </h3>
                    <div className="space-y-3">
                      {variant.recommendations.clinical.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{rec.action}</div>
                            <Badge className={getImpactColor(rec.impact)}>Impact: {rec.impact}</Badge>
                          </div>
                          <p className="text-sm mb-2">{rec.rationale}</p>
                          <div className="text-xs text-gray-500">Timeframe: {rec.timeframe}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium flex items-center mb-3">
                      <BookOpenIcon className="h-5 w-5 mr-2 text-green-500" />
                      Research Recommendations
                    </h3>
                    <div className="space-y-3">
                      {variant.recommendations.research.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{rec.action}</div>
                            <Badge className={getImpactColor(rec.impact)}>Impact: {rec.impact}</Badge>
                          </div>
                          <p className="text-sm mb-2">{rec.rationale}</p>
                          <div className="text-xs text-gray-500">Timeframe: {rec.timeframe}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Evidence Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={evidenceTypeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {evidenceTypeData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={EVIDENCE_TYPE_COLORS[index % EVIDENCE_TYPE_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Evidence Direction Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={evidenceDirectionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {evidenceDirectionData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={EVIDENCE_DIRECTION_COLORS[index % EVIDENCE_DIRECTION_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Reclassification Risk Analysis</h3>
                  <div className="border rounded-lg p-4">
                    <p className="mb-3">
                      This variant has a <span className="font-medium">{(variant.reclassRisk * 100).toFixed(0)}%</span>{" "}
                      probability of reclassification from{" "}
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: getClassificationColor(variant.currentClass) + "33",
                          color: getClassificationColor(variant.currentClass),
                        }}
                      >
                        {variant.currentClass}
                      </span>{" "}
                      to{" "}
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: getClassificationColor(variant.predictedClass) + "33",
                          color: getClassificationColor(variant.predictedClass),
                        }}
                      >
                        {variant.predictedClass}
                      </span>{" "}
                      within {variant.timeframe}.
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <ArrowRightIcon className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm">
                          <span className="font-medium">Primary driver:</span> Emerging functional evidence
                          demonstrating clear impact on protein function
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ArrowRightIcon className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm">
                          <span className="font-medium">Key pending evidence:</span> Results from large-scale functional
                          assays expected within 6 months
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ArrowRightIcon className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm">
                          <span className="font-medium">Confidence level:</span> High (based on consistent pattern
                          across multiple evidence types)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" className="flex items-center">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <ClipboardIcon className="h-4 w-4 mr-2" />
              Copy Recommendations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
