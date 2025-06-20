"use client"

import type React from "react"
import { useState } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertCircle, TrendingUp, TrendingDown, Calendar, FileText, CheckCircle, ArrowRight } from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"

// Mock data for timeline of variant classifications
const variantEvolutionData = [
  {
    id: "BRCA1-c.5266dupC",
    name: "BRCA1 c.5266dupC (p.Gln1756Profs*74)",
    timeline: [
      {
        date: "2010-03-15",
        classification: "VUS",
        conflictScore: 0.78,
        evidenceCount: { supporting: 3, contradictory: 4, neutral: 2 },
        resolutionMethod: "Expert consensus",
        keyFactors: [
          "Limited functional data",
          "Computational predictions conflicting",
          "Rare in population databases",
        ],
      },
      {
        date: "2013-07-22",
        classification: "Likely Pathogenic",
        conflictScore: 0.45,
        evidenceCount: { supporting: 7, contradictory: 3, neutral: 2 },
        resolutionMethod: "Weighted evidence scoring",
        keyFactors: ["New functional studies", "Additional affected families", "Segregation data"],
      },
      {
        date: "2016-11-05",
        classification: "Pathogenic",
        conflictScore: 0.22,
        evidenceCount: { supporting: 12, contradictory: 2, neutral: 3 },
        resolutionMethod: "ACMG/AMP criteria",
        keyFactors: ["Strong functional evidence", "Multiple case-control studies", "Consistent segregation"],
      },
      {
        date: "2020-04-18",
        classification: "Pathogenic",
        conflictScore: 0.08,
        evidenceCount: { supporting: 18, contradictory: 1, neutral: 4 },
        resolutionMethod: "Bayesian framework",
        keyFactors: ["Extensive functional validation", "Large cohort studies", "Mechanism established"],
      },
    ],
  },
  {
    id: "TP53-c.844C>T",
    name: "TP53 c.844C>T (p.Arg282Trp)",
    timeline: [
      {
        date: "2011-05-20",
        classification: "Likely Pathogenic",
        conflictScore: 0.62,
        evidenceCount: { supporting: 5, contradictory: 3, neutral: 1 },
        resolutionMethod: "Expert consensus",
        keyFactors: ["Known hotspot region", "Some functional impact", "Computational predictions supportive"],
      },
      {
        date: "2014-09-12",
        classification: "VUS",
        classification: "VUS",
        conflictScore: 0.71,
        evidenceCount: { supporting: 5, contradictory: 6, neutral: 2 },
        resolutionMethod: "Point-based classification",
        keyFactors: [
          "Conflicting functional studies",
          "Found in unaffected individuals",
          "Segregation data inconsistent",
        ],
      },
      {
        date: "2017-03-28",
        classification: "Likely Pathogenic",
        conflictScore: 0.38,
        evidenceCount: { supporting: 9, contradictory: 4, neutral: 3 },
        resolutionMethod: "ACMG/AMP criteria",
        keyFactors: ["New functional evidence", "Refined population data", "Tissue-specific effects recognized"],
      },
      {
        date: "2021-01-15",
        classification: "Pathogenic",
        conflictScore: 0.15,
        evidenceCount: { supporting: 14, contradictory: 2, neutral: 3 },
        resolutionMethod: "Quantitative framework",
        keyFactors: [
          "Multiple lines of functional evidence",
          "Large case-control studies",
          "Mechanism well-established",
        ],
      },
    ],
  },
  {
    id: "PTEN-c.388C>T",
    name: "PTEN c.388C>T (p.Arg130*)",
    timeline: [
      {
        date: "2009-11-03",
        classification: "Pathogenic",
        conflictScore: 0.25,
        evidenceCount: { supporting: 8, contradictory: 1, neutral: 2 },
        resolutionMethod: "Expert consensus",
        keyFactors: ["Nonsense mutation", "Multiple affected families", "Clear loss of function"],
      },
      {
        date: "2013-02-17",
        classification: "Pathogenic",
        conflictScore: 0.18,
        evidenceCount: { supporting: 12, contradictory: 1, neutral: 3 },
        resolutionMethod: "Point-based classification",
        keyFactors: ["Functional studies confirming LOF", "Absent in controls", "Strong segregation data"],
      },
      {
        date: "2016-08-22",
        classification: "Pathogenic",
        conflictScore: 0.12,
        evidenceCount: { supporting: 15, contradictory: 1, neutral: 2 },
        resolutionMethod: "ACMG/AMP criteria",
        keyFactors: ["PVS1 criterion met", "Multiple supporting criteria", "No valid contradictory evidence"],
      },
      {
        date: "2019-12-05",
        classification: "Pathogenic",
        conflictScore: 0.05,
        evidenceCount: { supporting: 19, contradictory: 0, neutral: 3 },
        resolutionMethod: "Bayesian framework",
        keyFactors: ["Overwhelming functional evidence", "Large patient cohorts", "Mechanism fully established"],
      },
    ],
  },
]

// Data for resolution methodology evolution
const methodologyEvolutionData = [
  { year: 2010, expertConsensus: 85, pointBased: 10, acmgAmp: 0, bayesian: 0, aiAssisted: 0, quantitative: 5 },
  { year: 2012, expertConsensus: 65, pointBased: 25, acmgAmp: 0, bayesian: 5, aiAssisted: 0, quantitative: 5 },
  { year: 2014, expertConsensus: 45, pointBased: 35, acmgAmp: 10, bayesian: 5, aiAssisted: 0, quantitative: 5 },
  { year: 2016, expertConsensus: 25, pointBased: 20, acmgAmp: 40, bayesian: 10, aiAssisted: 0, quantitative: 5 },
  { year: 2018, expertConsensus: 15, pointBased: 10, acmgAmp: 50, bayesian: 15, aiAssisted: 5, quantitative: 5 },
  { year: 2020, expertConsensus: 10, pointBased: 5, acmgAmp: 45, bayesian: 20, aiAssisted: 10, quantitative: 10 },
  { year: 2022, expertConsensus: 5, pointBased: 5, acmgAmp: 40, bayesian: 25, aiAssisted: 15, quantitative: 10 },
  { year: 2024, expertConsensus: 5, pointBased: 0, acmgAmp: 35, bayesian: 30, aiAssisted: 20, quantitative: 10 },
]

// Data for conflict resolution effectiveness over time
const resolutionEffectivenessData = [
  { year: 2010, conflictScore: 0.68, reclassificationRate: 0.22, concordance: 0.58 },
  { year: 2012, conflictScore: 0.62, reclassificationRate: 0.2, concordance: 0.63 },
  { year: 2014, conflictScore: 0.55, reclassificationRate: 0.18, concordance: 0.69 },
  { year: 2016, conflictScore: 0.42, reclassificationRate: 0.15, concordance: 0.76 },
  { year: 2018, conflictScore: 0.35, reclassificationRate: 0.12, concordance: 0.82 },
  { year: 2020, conflictScore: 0.28, reclassificationRate: 0.09, concordance: 0.87 },
  { year: 2022, conflictScore: 0.22, reclassificationRate: 0.07, concordance: 0.91 },
  { year: 2024, conflictScore: 0.18, reclassificationRate: 0.05, concordance: 0.94 },
]

// Data for evidence type influence over time
const evidenceInfluenceData = [
  { year: 2010, functional: 20, population: 15, computational: 30, clinical: 35 },
  { year: 2012, functional: 25, population: 20, computational: 25, clinical: 30 },
  { year: 2014, functional: 30, population: 25, computational: 20, clinical: 25 },
  { year: 2016, functional: 35, population: 30, computational: 15, clinical: 20 },
  { year: 2018, functional: 40, population: 30, computational: 10, clinical: 20 },
  { year: 2020, functional: 45, population: 35, computational: 5, clinical: 15 },
  { year: 2022, functional: 50, population: 35, computational: 5, clinical: 10 },
  { year: 2024, functional: 55, population: 35, computational: 5, clinical: 5 },
]

// Colors for classification types
const classificationColors = {
  Pathogenic: "#ef4444",
  "Likely Pathogenic": "#f97316",
  VUS: "#eab308",
  "Likely Benign": "#22c55e",
  Benign: "#10b981",
}

// Colors for methodology types
const methodologyColors = {
  expertConsensus: "#94a3b8",
  pointBased: "#64748b",
  acmgAmp: "#3b82f6",
  bayesian: "#8b5cf6",
  aiAssisted: "#ec4899",
  quantitative: "#14b8a6",
}

// Colors for evidence types
const evidenceColors = {
  functional: "#3b82f6",
  population: "#8b5cf6",
  computational: "#ec4899",
  clinical: "#14b8a6",
}

export function ConflictEvolutionTracker() {
  const [selectedVariant, setSelectedVariant] = useState(variantEvolutionData[0].id)
  const [activeTab, setActiveTab] = useState("variant")

  const variant = variantEvolutionData.find((v) => v.id === selectedVariant)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Conflict Resolution Evolution Tracker</CardTitle>
          <CardDescription>
            Track how variant classification and conflict resolution have evolved over time as new evidence emerges and
            methodologies improve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="variant">Variant Timeline</TabsTrigger>
              <TabsTrigger value="methodology">Methodology Evolution</TabsTrigger>
              <TabsTrigger value="effectiveness">Resolution Effectiveness</TabsTrigger>
              <TabsTrigger value="evidence">Evidence Influence</TabsTrigger>
            </TabsList>

            <TabsContent value="variant" className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                  <SelectTrigger className="w-[350px]">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variantEvolutionData.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {variant && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Classification Timeline</h3>
                    <div className="relative">
                      <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200"></div>
                      {variant.timeline.map((event, index) => (
                        <div key={index} className="relative pl-14 pb-8">
                          <div className="absolute left-0 top-1 w-12 flex items-center justify-center">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  classificationColors[event.classification as keyof typeof classificationColors] ||
                                  "#94a3b8",
                              }}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" /> {formatDate(event.date)}
                                </span>
                              </div>
                              <Badge
                                style={{
                                  backgroundColor:
                                    classificationColors[event.classification as keyof typeof classificationColors] ||
                                    "#94a3b8",
                                  color: "white",
                                }}
                              >
                                {event.classification}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center">
                                  <FileText className="h-3.5 w-3.5 mr-1" /> Resolution Method
                                </h4>
                                <p className="text-sm">{event.resolutionMethod}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center">
                                  <AlertCircle className="h-3.5 w-3.5 mr-1" /> Conflict Score
                                </h4>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                      width: `${(1 - event.conflictScore) * 100}%`,
                                      backgroundColor:
                                        event.conflictScore > 0.5
                                          ? "#ef4444"
                                          : event.conflictScore > 0.3
                                            ? "#f97316"
                                            : event.conflictScore > 0.1
                                              ? "#eab308"
                                              : "#22c55e",
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {event.conflictScore < 0.2
                                    ? "Low conflict"
                                    : event.conflictScore < 0.5
                                      ? "Moderate conflict"
                                      : "High conflict"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Evidence Distribution</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                                  <span className="text-xs">Supporting: {event.evidenceCount.supporting}</span>
                                </div>
                                <div className="flex-1 flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                                  <span className="text-xs">Contradictory: {event.evidenceCount.contradictory}</span>
                                </div>
                                <div className="flex-1 flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
                                  <span className="text-xs">Neutral: {event.evidenceCount.neutral}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Key Factors in Decision</h4>
                              <ul className="text-sm list-disc pl-5 space-y-1">
                                {event.keyFactors.map((factor, idx) => (
                                  <li key={idx}>{factor}</li>
                                ))}
                              </ul>
                            </div>

                            {index < variant.timeline.length - 1 && (
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="flex items-center text-sm text-blue-600">
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                  <span>
                                    {variant.timeline[index + 1].classification !== event.classification
                                      ? `Reclassified to ${variant.timeline[index + 1].classification}`
                                      : "Classification maintained with new evidence"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Conflict Score Evolution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            conflictScore: {
                              label: "Conflict Score",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-[200px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={variant.timeline.map((t) => ({
                                date: formatDate(t.date),
                                conflictScore: t.conflictScore,
                              }))}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={[0, 1]} />
                              <Tooltip />
                              <ReferenceLine y={0.5} stroke="#f97316" strokeDasharray="3 3" />
                              <ReferenceLine y={0.3} stroke="#eab308" strokeDasharray="3 3" />
                              <ReferenceLine y={0.1} stroke="#22c55e" strokeDasharray="3 3" />
                              <Line
                                type="monotone"
                                dataKey="conflictScore"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Evidence Evolution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            supporting: {
                              label: "Supporting",
                              color: "hsl(var(--chart-1))",
                            },
                            contradictory: {
                              label: "Contradictory",
                              color: "hsl(var(--chart-2))",
                            },
                            neutral: {
                              label: "Neutral",
                              color: "hsl(var(--chart-3))",
                            },
                          }}
                          className="h-[200px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={variant.timeline.map((t) => ({
                                date: formatDate(t.date),
                                supporting: t.evidenceCount.supporting,
                                contradictory: t.evidenceCount.contradictory,
                                neutral: t.evidenceCount.neutral,
                              }))}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Area type="monotone" dataKey="supporting" stackId="1" stroke="#22c55e" fill="#22c55e" />
                              <Area
                                type="monotone"
                                dataKey="contradictory"
                                stackId="1"
                                stroke="#ef4444"
                                fill="#ef4444"
                              />
                              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" fill="#94a3b8" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="methodology" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Resolution Methodology Evolution</CardTitle>
                  <CardDescription>How variant classification methodologies have evolved over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      expertConsensus: {
                        label: "Expert Consensus",
                        color: methodologyColors.expertConsensus,
                      },
                      pointBased: {
                        label: "Point-Based",
                        color: methodologyColors.pointBased,
                      },
                      acmgAmp: {
                        label: "ACMG/AMP Criteria",
                        color: methodologyColors.acmgAmp,
                      },
                      bayesian: {
                        label: "Bayesian Framework",
                        color: methodologyColors.bayesian,
                      },
                      aiAssisted: {
                        label: "AI-Assisted",
                        color: methodologyColors.aiAssisted,
                      },
                      quantitative: {
                        label: "Quantitative Framework",
                        color: methodologyColors.quantitative,
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={methodologyEvolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="expertConsensus"
                          stackId="1"
                          stroke={methodologyColors.expertConsensus}
                          fill={methodologyColors.expertConsensus}
                          name="Expert Consensus"
                        />
                        <Area
                          type="monotone"
                          dataKey="pointBased"
                          stackId="1"
                          stroke={methodologyColors.pointBased}
                          fill={methodologyColors.pointBased}
                          name="Point-Based"
                        />
                        <Area
                          type="monotone"
                          dataKey="acmgAmp"
                          stackId="1"
                          stroke={methodologyColors.acmgAmp}
                          fill={methodologyColors.acmgAmp}
                          name="ACMG/AMP Criteria"
                        />
                        <Area
                          type="monotone"
                          dataKey="bayesian"
                          stackId="1"
                          stroke={methodologyColors.bayesian}
                          fill={methodologyColors.bayesian}
                          name="Bayesian Framework"
                        />
                        <Area
                          type="monotone"
                          dataKey="aiAssisted"
                          stackId="1"
                          stroke={methodologyColors.aiAssisted}
                          fill={methodologyColors.aiAssisted}
                          name="AI-Assisted"
                        />
                        <Area
                          type="monotone"
                          dataKey="quantitative"
                          stackId="1"
                          stroke={methodologyColors.quantitative}
                          fill={methodologyColors.quantitative}
                          name="Quantitative Framework"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    title: "Expert Consensus",
                    color: methodologyColors.expertConsensus,
                    description: "Subjective approach relying on expert opinion to resolve conflicts",
                    trend: "Declining",
                    icon: <TrendingDown className="h-4 w-4" />,
                    trendColor: "text-red-500",
                  },
                  {
                    title: "ACMG/AMP Criteria",
                    color: methodologyColors.acmgAmp,
                    description: "Standardized guidelines with specific criteria for classification",
                    trend: "Stable",
                    icon: <ArrowRight className="h-4 w-4" />,
                    trendColor: "text-blue-500",
                  },
                  {
                    title: "Bayesian Framework",
                    color: methodologyColors.bayesian,
                    description: "Probabilistic approach using prior knowledge and new evidence",
                    trend: "Increasing",
                    icon: <TrendingUp className="h-4 w-4" />,
                    trendColor: "text-green-500",
                  },
                  {
                    title: "AI-Assisted",
                    color: methodologyColors.aiAssisted,
                    description: "Machine learning models to predict pathogenicity and resolve conflicts",
                    trend: "Rapidly increasing",
                    icon: <TrendingUp className="h-4 w-4" />,
                    trendColor: "text-green-500",
                  },
                  {
                    title: "Point-Based",
                    color: methodologyColors.pointBased,
                    description: "Numerical scoring system for different evidence types",
                    trend: "Declining",
                    icon: <TrendingDown className="h-4 w-4" />,
                    trendColor: "text-red-500",
                  },
                  {
                    title: "Quantitative Framework",
                    color: methodologyColors.quantitative,
                    description: "Mathematical models to quantify evidence strength and conflicts",
                    trend: "Stable",
                    icon: <ArrowRight className="h-4 w-4" />,
                    trendColor: "text-blue-500",
                  },
                ].map((method, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-1" style={{ backgroundColor: method.color }}></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{method.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                      <div className="flex items-center text-sm">
                        <span className="font-medium mr-1">Trend:</span>
                        <span className={`flex items-center ${method.trendColor}`}>
                          {method.icon}
                          <span className="ml-1">{method.trend}</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Methodology Evolution</AlertTitle>
                <AlertDescription>
                  The field has shifted from subjective expert consensus to more structured, quantitative, and
                  data-driven approaches. The introduction of ACMG/AMP guidelines in 2015 marked a significant
                  standardization, while recent years have seen the rise of AI-assisted and Bayesian frameworks for more
                  objective conflict resolution.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="effectiveness" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Resolution Effectiveness Over Time</CardTitle>
                  <CardDescription>Measuring how conflict resolution has improved</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      conflictScore: {
                        label: "Conflict Score",
                        color: "hsl(var(--chart-1))",
                      },
                      reclassificationRate: {
                        label: "Reclassification Rate",
                        color: "hsl(var(--chart-2))",
                      },
                      concordance: {
                        label: "Lab Concordance",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resolutionEffectivenessData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="conflictScore"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="Conflict Score"
                        />
                        <Line
                          type="monotone"
                          dataKey="reclassificationRate"
                          stroke="#f97316"
                          strokeWidth={2}
                          name="Reclassification Rate"
                        />
                        <Line
                          type="monotone"
                          dataKey="concordance"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="Lab Concordance"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Conflict Score</CardTitle>
                      <TrendingDown className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">-73.5%</div>
                    <p className="text-sm text-gray-600">
                      Decrease in average conflict score from 2010 to 2024, indicating more consistent evidence
                      interpretation
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Reclassification Rate</CardTitle>
                      <TrendingDown className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">-77.3%</div>
                    <p className="text-sm text-gray-600">
                      Reduction in variant reclassification rate, showing more stable and reliable initial
                      classifications
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Lab Concordance</CardTitle>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">+62.1%</div>
                    <p className="text-sm text-gray-600">
                      Increase in inter-laboratory concordance, demonstrating more standardized conflict resolution
                      approaches
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Significant Improvements</AlertTitle>
                <AlertDescription>
                  The data shows substantial improvements in conflict resolution effectiveness over the past decade.
                  Lower conflict scores and reclassification rates, combined with higher inter-laboratory concordance,
                  indicate more reliable and consistent variant classifications. This translates to more accurate
                  genetic test results and better clinical decision-making.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Evidence Type Influence Over Time</CardTitle>
                  <CardDescription>How different evidence types have influenced conflict resolution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      functional: {
                        label: "Functional",
                        color: evidenceColors.functional,
                      },
                      population: {
                        label: "Population",
                        color: evidenceColors.population,
                      },
                      computational: {
                        label: "Computational",
                        color: evidenceColors.computational,
                      },
                      clinical: {
                        label: "Clinical",
                        color: evidenceColors.clinical,
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evidenceInfluenceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="functional"
                          stackId="1"
                          stroke={evidenceColors.functional}
                          fill={evidenceColors.functional}
                          name="Functional Studies"
                        />
                        <Area
                          type="monotone"
                          dataKey="population"
                          stackId="1"
                          stroke={evidenceColors.population}
                          fill={evidenceColors.population}
                          name="Population Data"
                        />
                        <Area
                          type="monotone"
                          dataKey="computational"
                          stackId="1"
                          stroke={evidenceColors.computational}
                          fill={evidenceColors.computational}
                          name="Computational Predictions"
                        />
                        <Area
                          type="monotone"
                          dataKey="clinical"
                          stackId="1"
                          stroke={evidenceColors.clinical}
                          fill={evidenceColors.clinical}
                          name="Clinical Observations"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Evidence Type Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Functional Studies",
                          color: evidenceColors.functional,
                          trend: "Increasing",
                          icon: <TrendingUp className="h-4 w-4" />,
                          trendColor: "text-green-500",
                          description: "Direct experimental evidence of variant effect on protein function",
                        },
                        {
                          name: "Population Data",
                          color: evidenceColors.population,
                          trend: "Increasing",
                          icon: <TrendingUp className="h-4 w-4" />,
                          trendColor: "text-green-500",
                          description: "Allele frequencies in large population databases",
                        },
                        {
                          name: "Computational Predictions",
                          color: evidenceColors.computational,
                          trend: "Decreasing",
                          icon: <TrendingDown className="h-4 w-4" />,
                          trendColor: "text-red-500",
                          description: "In silico algorithms predicting variant impact",
                        },
                        {
                          name: "Clinical Observations",
                          color: evidenceColors.clinical,
                          trend: "Decreasing",
                          icon: <TrendingDown className="h-4 w-4" />,
                          trendColor: "text-red-500",
                          description: "Case reports and phenotype correlations",
                        },
                      ].map((evidence, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: evidence.color }}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{evidence.name}</span>
                              <span className={`flex items-center ${evidence.trendColor}`}>
                                {evidence.icon}
                                <span className="ml-1 text-xs">{evidence.trend}</span>
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{evidence.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Evidence Hierarchy Evolution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">2010 Hierarchy</h4>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gray-400">
                                Lowest
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-blue-600">
                                Highest
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: "20%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            ></div>
                            <div
                              style={{ width: "15%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            ></div>
                            <div
                              style={{ width: "30%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                            ></div>
                            <div
                              style={{ width: "35%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                            ></div>
                          </div>
                          <div className="flex text-xs justify-between">
                            <span style={{ color: evidenceColors.functional }}>Functional</span>
                            <span style={{ color: evidenceColors.population }}>Population</span>
                            <span style={{ color: evidenceColors.computational }}>Computational</span>
                            <span style={{ color: evidenceColors.clinical }}>Clinical</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">2024 Hierarchy</h4>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-gray-400">
                                Lowest
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-blue-600">
                                Highest
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: "55%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            ></div>
                            <div
                              style={{ width: "35%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            ></div>
                            <div
                              style={{ width: "5%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                            ></div>
                            <div
                              style={{ width: "5%" }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                            ></div>
                          </div>
                          <div className="flex text-xs justify-between">
                            <span style={{ color: evidenceColors.functional }}>Functional</span>
                            <span style={{ color: evidenceColors.population }}>Population</span>
                            <span style={{ color: evidenceColors.computational }}>Computational</span>
                            <span style={{ color: evidenceColors.clinical }}>Clinical</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Evidence Type Evolution</AlertTitle>
                <AlertDescription>
                  There has been a significant shift in the types of evidence used to resolve conflicts in variant
                  classification. Functional studies and large population databases now carry substantially more weight
                  than computational predictions and individual clinical observations. This shift reflects the increased
                  availability of high-quality experimental data and large-scale genomic databases, leading to more
                  objective and reproducible classifications.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-gray-500">
            Data sources: ClinVar, ENIGMA Consortium, and internal laboratory records. Last updated: May 2024.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

// Helper component for arrow icon
function ArrowDown(props: React.ComponentProps<typeof ArrowRight>) {
  return <ArrowRight {...props} className="transform rotate-90" />
}
