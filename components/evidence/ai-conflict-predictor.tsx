"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, TrendingDownIcon, TrendingUpIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

// Mock data for AI predictions
const variantPredictions = [
  {
    id: "BRCA1:c.5266dupC",
    name: "BRCA1 c.5266dupC",
    currentClass: "Pathogenic",
    predictedClass: "Pathogenic",
    confidence: 0.98,
    stabilityScore: 9.7,
  },
  {
    id: "BRCA2:c.6275_6276delTT",
    name: "BRCA2 c.6275_6276delTT",
    currentClass: "Pathogenic",
    predictedClass: "Pathogenic",
    confidence: 0.97,
    stabilityScore: 9.5,
  },
  {
    id: "TP53:c.844C>T",
    name: "TP53 c.844C>T",
    currentClass: "Likely Pathogenic",
    predictedClass: "Pathogenic",
    confidence: 0.89,
    stabilityScore: 7.2,
  },
  {
    id: "PTEN:c.388C>T",
    name: "PTEN c.388C>T",
    currentClass: "Likely Pathogenic",
    predictedClass: "Likely Pathogenic",
    confidence: 0.82,
    stabilityScore: 8.1,
  },
  {
    id: "MLH1:c.1852_1854delAAG",
    name: "MLH1 c.1852_1854delAAG",
    currentClass: "Likely Pathogenic",
    predictedClass: "Likely Pathogenic",
    confidence: 0.78,
    stabilityScore: 7.8,
  },
  {
    id: "APC:c.3920T>A",
    name: "APC c.3920T>A",
    currentClass: "VUS",
    predictedClass: "Likely Pathogenic",
    confidence: 0.76,
    stabilityScore: 5.4,
  },
  {
    id: "CHEK2:c.470T>C",
    name: "CHEK2 c.470T>C",
    currentClass: "VUS",
    predictedClass: "Likely Benign",
    confidence: 0.72,
    stabilityScore: 6.1,
  },
  {
    id: "ATM:c.7271T>G",
    name: "ATM c.7271T>G",
    currentClass: "VUS",
    predictedClass: "VUS",
    confidence: 0.65,
    stabilityScore: 4.3,
  },
  {
    id: "BRCA2:c.9976A>T",
    name: "BRCA2 c.9976A>T",
    currentClass: "VUS",
    predictedClass: "VUS",
    confidence: 0.61,
    stabilityScore: 3.9,
  },
  {
    id: "PALB2:c.2816T>G",
    name: "PALB2 c.2816T>G",
    currentClass: "Likely Benign",
    predictedClass: "Likely Benign",
    confidence: 0.88,
    stabilityScore: 8.5,
  },
]

// Trend prediction data
const trendPredictionData = [
  { year: 2024, vus: 30, likelyBenign: 25, benign: 20, likelyPathogenic: 15, pathogenic: 10 },
  { year: 2025, vus: 27, likelyBenign: 26, benign: 21, likelyPathogenic: 16, pathogenic: 10 },
  { year: 2026, vus: 24, likelyBenign: 27, benign: 22, likelyPathogenic: 17, pathogenic: 10 },
  { year: 2027, vus: 21, likelyBenign: 28, benign: 23, likelyPathogenic: 18, pathogenic: 10 },
  { year: 2028, vus: 18, likelyBenign: 29, benign: 24, likelyPathogenic: 19, pathogenic: 10 },
  { year: 2029, vus: 15, likelyBenign: 30, benign: 25, likelyPathogenic: 20, pathogenic: 10 },
]

// Methodology adoption prediction data
const methodologyPredictionData = [
  { year: 2024, expertConsensus: 15, acmgAmp: 45, bayesian: 25, aiAssisted: 15 },
  { year: 2025, expertConsensus: 12, acmgAmp: 43, bayesian: 28, aiAssisted: 17 },
  { year: 2026, expertConsensus: 10, acmgAmp: 40, bayesian: 30, aiAssisted: 20 },
  { year: 2027, expertConsensus: 8, acmgAmp: 37, bayesian: 32, aiAssisted: 23 },
  { year: 2028, expertConsensus: 5, acmgAmp: 35, bayesian: 33, aiAssisted: 27 },
  { year: 2029, expertConsensus: 3, acmgAmp: 32, bayesian: 35, aiAssisted: 30 },
]

// Evidence type influence prediction data
const evidenceInfluencePredictionData = [
  { year: 2024, functional: 35, population: 25, computational: 20, clinical: 20 },
  { year: 2025, functional: 37, population: 26, computational: 18, clinical: 19 },
  { year: 2026, functional: 39, population: 27, computational: 16, clinical: 18 },
  { year: 2027, functional: 41, population: 28, computational: 14, clinical: 17 },
  { year: 2028, functional: 43, population: 29, computational: 12, clinical: 16 },
  { year: 2029, functional: 45, population: 30, computational: 10, clinical: 15 },
]

// Conflict resolution effectiveness prediction data
const effectivenessPredictionData = [
  { year: 2024, conflictScore: 27, reclassRate: 12, labConcordance: 78 },
  { year: 2025, conflictScore: 25, reclassRate: 11, labConcordance: 80 },
  { year: 2026, conflictScore: 22, reclassRate: 10, labConcordance: 83 },
  { year: 2027, conflictScore: 19, reclassRate: 9, labConcordance: 85 },
  { year: 2028, conflictScore: 16, reclassRate: 8, labConcordance: 88 },
  { year: 2029, conflictScore: 13, reclassRate: 7, labConcordance: 90 },
]

// Emerging evidence types prediction
const emergingEvidenceData = [
  { name: "Multi-omics Integration", current: 15, predicted2029: 45 },
  { name: "Real-world Outcomes", current: 10, predicted2029: 40 },
  { name: "AI-derived Patterns", current: 5, predicted2029: 35 },
  { name: "Functional Assays", current: 30, predicted2029: 60 },
  { name: "Population Databases", current: 40, predicted2029: 50 },
]

// Radar chart data for AI model confidence
const aiModelConfidenceData = [
  {
    subject: "Pathogenic Variants",
    confidence: 92,
    fullMark: 100,
  },
  {
    subject: "Likely Pathogenic",
    confidence: 85,
    fullMark: 100,
  },
  {
    subject: "VUS",
    confidence: 70,
    fullMark: 100,
  },
  {
    subject: "Likely Benign",
    confidence: 83,
    fullMark: 100,
  },
  {
    subject: "Benign Variants",
    confidence: 90,
    fullMark: 100,
  },
]

// Scatter plot data for variant stability vs. confidence
const stabilityConfidenceData = variantPredictions.map((variant) => ({
  name: variant.name,
  stability: variant.stabilityScore,
  confidence: variant.confidence * 10,
  currentClass: variant.currentClass,
}))

export function AIConflictPredictor() {
  const [selectedVariant, setSelectedVariant] = useState(variantPredictions[0].id)
  const [predictionTimeframe, setPredictionTimeframe] = useState("5")

  const variant = variantPredictions.find((v) => v.id === selectedVariant)

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

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge className="bg-green-500">Very High</Badge>
    if (confidence >= 0.8) return <Badge className="bg-green-400">High</Badge>
    if (confidence >= 0.7) return <Badge className="bg-yellow-400">Moderate</Badge>
    if (confidence >= 0.6) return <Badge className="bg-orange-400">Fair</Badge>
    return <Badge className="bg-red-400">Low</Badge>
  }

  const getStabilityBadge = (score: number) => {
    if (score >= 9) return <Badge className="bg-green-500">Very Stable</Badge>
    if (score >= 7) return <Badge className="bg-green-400">Stable</Badge>
    if (score >= 5) return <Badge className="bg-yellow-400">Moderate</Badge>
    if (score >= 3) return <Badge className="bg-orange-400">Unstable</Badge>
    return <Badge className="bg-red-400">Very Unstable</Badge>
  }

  const getClassificationChange = (current: string, predicted: string) => {
    if (current === predicted) {
      return (
        <div className="flex items-center text-green-500">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          <span>Stable classification predicted</span>
        </div>
      )
    }

    return (
      <div className="flex items-center text-amber-500">
        <AlertTriangleIcon className="w-4 h-4 mr-1" />
        <span>Potential reclassification predicted</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>AI-Powered Prediction System</AlertTitle>
        <AlertDescription>
          This system uses machine learning to predict future trends in variant classification and conflict resolution
          based on historical data patterns, emerging evidence, and methodological advances.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="variant-predictions">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="variant-predictions">Variant Predictions</TabsTrigger>
          <TabsTrigger value="classification-trends">Classification Trends</TabsTrigger>
          <TabsTrigger value="methodology-evolution">Methodology Evolution</TabsTrigger>
          <TabsTrigger value="evidence-influence">Evidence Influence</TabsTrigger>
          <TabsTrigger value="model-performance">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="variant-predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variant Classification Prediction</CardTitle>
              <CardDescription>
                AI-powered predictions for how specific variant classifications may change over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Variant</label>
                    <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {variantPredictions.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Prediction Timeframe (Years)</label>
                    <Select value={predictionTimeframe} onValueChange={setPredictionTimeframe}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="10">10 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {variant && (
                    <div className="p-4 border rounded-lg space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Current Classification:</span>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getClassificationColor(variant.currentClass) }}
                          />
                          <span className="font-medium">{variant.currentClass}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-500">Predicted Classification:</span>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getClassificationColor(variant.predictedClass) }}
                          />
                          <span className="font-medium">{variant.predictedClass}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-500">Prediction Confidence:</span>
                        <div className="flex items-center">
                          {getConfidenceBadge(variant.confidence)}
                          <span className="ml-2">{(variant.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-500">Classification Stability:</span>
                        <div className="flex items-center">
                          {getStabilityBadge(variant.stabilityScore)}
                          <span className="ml-2">{variant.stabilityScore}/10</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-500">Prediction Summary:</span>
                        <div className="mt-1">
                          {getClassificationChange(variant.currentClass, variant.predictedClass)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis
                          type="number"
                          dataKey="stability"
                          name="Stability Score"
                          domain={[0, 10]}
                          label={{ value: "Classification Stability Score", position: "bottom" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="confidence"
                          name="Confidence"
                          domain={[0, 10]}
                          label={{ value: "Prediction Confidence", angle: -90, position: "left" }}
                        />
                        <ZAxis range={[60, 400]} />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-2 border rounded shadow-sm">
                                  <p className="font-medium">{data.name}</p>
                                  <p>Stability: {data.stability}/10</p>
                                  <p>Confidence: {((data.confidence / 10) * 100).toFixed(1)}%</p>
                                  <p>Current: {data.currentClass}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                        {["Pathogenic", "Likely Pathogenic", "VUS", "Likely Benign", "Benign"].map((classification) => (
                          <Scatter
                            key={classification}
                            name={classification}
                            data={stabilityConfidenceData.filter((d) => d.currentClass === classification)}
                            fill={getClassificationColor(classification)}
                          />
                        ))}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-center mt-2 text-gray-500">
                    Variant Classification Stability vs. Prediction Confidence
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              Predictions are based on historical classification patterns, emerging evidence, and methodological trends.
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="classification-trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classification Distribution Trends</CardTitle>
              <CardDescription>
                Predicted evolution of variant classification distributions over the next 5 years
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendPredictionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: "Percentage of Variants", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="vus" stackId="1" stroke="#eab308" fill="#fef3c7" name="VUS" />
                    <Area
                      type="monotone"
                      dataKey="likelyBenign"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#dcfce7"
                      name="Likely Benign"
                    />
                    <Area type="monotone" dataKey="benign" stackId="1" stroke="#10b981" fill="#d1fae5" name="Benign" />
                    <Area
                      type="monotone"
                      dataKey="likelyPathogenic"
                      stackId="1"
                      stroke="#f97316"
                      fill="#ffedd5"
                      name="Likely Pathogenic"
                    />
                    <Area
                      type="monotone"
                      dataKey="pathogenic"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#fee2e2"
                      name="Pathogenic"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Key Predictions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <TrendingDownIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">VUS Reduction</h5>
                      <p className="text-sm text-gray-600">
                        Variants of uncertain significance are predicted to decrease by 50% over the next 5 years due to
                        improved classification methodologies and expanded evidence databases.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <TrendingUpIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">Definitive Classifications</h5>
                      <p className="text-sm text-gray-600">
                        Benign and pathogenic classifications are predicted to increase as more evidence becomes
                        available and conflict resolution methodologies improve.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">Reclassification Risk</h5>
                      <p className="text-sm text-gray-600">
                        Approximately 15% of current VUS variants are predicted to be reclassified as likely pathogenic
                        or likely benign within the next 3 years.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">Classification Stability</h5>
                      <p className="text-sm text-gray-600">
                        Pathogenic and benign classifications show the highest stability, with over 95% predicted to
                        remain unchanged over the next 5 years.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology-evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Resolution Methodology Evolution</CardTitle>
              <CardDescription>Predicted adoption rates of different conflict resolution methodologies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={methodologyPredictionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: "Adoption Percentage", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="expertConsensus"
                      stackId="1"
                      stroke="#6b7280"
                      fill="#f3f4f6"
                      name="Expert Consensus"
                    />
                    <Area
                      type="monotone"
                      dataKey="acmgAmp"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#dbeafe"
                      name="ACMG/AMP Guidelines"
                    />
                    <Area
                      type="monotone"
                      dataKey="bayesian"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#ede9fe"
                      name="Bayesian Framework"
                    />
                    <Area
                      type="monotone"
                      dataKey="aiAssisted"
                      stackId="1"
                      stroke="#ec4899"
                      fill="#fce7f3"
                      name="AI-Assisted Methods"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-4">Emerging Resolution Methodologies:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium text-pink-600 mb-2">AI-Assisted Classification</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Machine learning models trained on historical classification data and evidence patterns to predict
                      optimal resolutions for conflicting evidence.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Adoption:</span>
                      <span className="text-sm">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm font-medium">Predicted 2029:</span>
                      <span className="text-sm">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium text-purple-600 mb-2">Bayesian Framework</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Probabilistic approach that quantifies the strength of evidence and calculates likelihood ratios
                      for pathogenicity based on multiple evidence types.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Adoption:</span>
                      <span className="text-sm">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm font-medium">Predicted 2029:</span>
                      <span className="text-sm">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence-influence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Type Influence Prediction</CardTitle>
              <CardDescription>
                How different evidence types will influence conflict resolution in the future
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Evidence Type Influence Evolution</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={evidenceInfluencePredictionData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: "Influence Percentage", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="functional"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#dbeafe"
                          name="Functional Studies"
                        />
                        <Area
                          type="monotone"
                          dataKey="population"
                          stackId="1"
                          stroke="#10b981"
                          fill="#d1fae5"
                          name="Population Data"
                        />
                        <Area
                          type="monotone"
                          dataKey="computational"
                          stackId="1"
                          stroke="#8b5cf6"
                          fill="#ede9fe"
                          name="Computational"
                        />
                        <Area
                          type="monotone"
                          dataKey="clinical"
                          stackId="1"
                          stroke="#f97316"
                          fill="#ffedd5"
                          name="Clinical Data"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Emerging Evidence Types</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={emergingEvidenceData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current" fill="#94a3b8" name="Current Influence %" />
                        <Bar dataKey="predicted2029" fill="#0ea5e9" name="Predicted 2029 %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Key Evidence Trends:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <TrendingUpIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">Functional Studies</h5>
                      <p className="text-sm text-gray-600">
                        High-throughput functional assays are predicted to become the dominant evidence type, increasing
                        from 35% to 45% influence by 2029.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <TrendingDownIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">Computational Predictions</h5>
                      <p className="text-sm text-gray-600">
                        In silico predictions are expected to decrease in influence from 20% to 10% as more direct
                        evidence becomes available.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <TrendingUpIcon className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">Multi-omics Integration</h5>
                      <p className="text-sm text-gray-600">
                        Integration of genomic, transcriptomic, and proteomic data is predicted to increase from 15% to
                        45% influence by 2029.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <TrendingUpIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h5 className="font-medium">Population Databases</h5>
                      <p className="text-sm text-gray-600">
                        Population frequency data will maintain strong influence but with more diverse representation
                        and larger cohorts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance Metrics</CardTitle>
              <CardDescription>
                Performance evaluation of the AI prediction system across different variant types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Prediction Confidence by Variant Class</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={aiModelConfidenceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Model Confidence"
                          dataKey="confidence"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Conflict Resolution Effectiveness</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={effectivenessPredictionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="conflictScore"
                          stroke="#ef4444"
                          name="Conflict Score"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="reclassRate"
                          stroke="#f97316"
                          name="Reclassification Rate"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="labConcordance"
                          stroke="#10b981"
                          name="Lab Concordance"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Model Training & Validation:</h4>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Training Data</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Variants Analyzed</p>
                        <p className="font-medium">125,000+</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Historical Classifications</p>
                        <p className="font-medium">250,000+</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Evidence Data Points</p>
                        <p className="font-medium">3.2 million+</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time Period</p>
                        <p className="font-medium">2010-2024</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Laboratories</p>
                        <p className="font-medium">42 clinical labs</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Genes Covered</p>
                        <p className="font-medium">5,200+</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Model Performance</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Overall Accuracy</p>
                        <p className="font-medium">87.3%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Precision</p>
                        <p className="font-medium">89.1%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Recall</p>
                        <p className="font-medium">85.7%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">F1 Score</p>
                        <p className="font-medium">87.4%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Validation Method</p>
                        <p className="font-medium">5-fold cross-validation</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Confidence Calibration</p>
                        <p className="font-medium">Platt scaling</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Model Limitations</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Lower accuracy for rare variants with limited historical data</li>
                      <li>Reduced performance for genes with high rates of novel variants</li>
                      <li>Potential bias toward well-studied populations and genes</li>
                      <li>Limited ability to incorporate very recent methodological advances</li>
                      <li>Predictions should be used as guidance only and not replace expert review</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              Model performance metrics are updated quarterly as new validation data becomes available.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
