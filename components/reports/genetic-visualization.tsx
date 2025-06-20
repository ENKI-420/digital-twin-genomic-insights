"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { Download, ZoomIn, ZoomOut, RotateCw, Info } from "lucide-react"
import type { DiagnosticReportResult } from "@/lib/api/fhir-service"

interface GeneticVisualizationProps {
  reports: DiagnosticReportResult[]
  patientId: string
}

// Color palette for charts
const COLORS = ["#0066cc", "#00c1c1", "#ffc107", "#dc3545", "#6f42c1", "#28a745", "#fd7e14", "#20c997"]

export function GeneticVisualization({ reports, patientId }: GeneticVisualizationProps) {
  const [activeTab, setActiveTab] = useState("distribution")
  const [zoomLevel, setZoomLevel] = useState(1)

  // Early return if no reports
  if (!reports || reports.length === 0) {
    return null
  }

  // Prepare data for mutation distribution chart
  const prepareMutationData = () => {
    const mutationCounts: Record<string, number> = {}

    reports.forEach((report) => {
      if (!mutationCounts[report.mutation]) {
        mutationCounts[report.mutation] = 0
      }
      mutationCounts[report.mutation]++
    })

    return Object.entries(mutationCounts).map(([mutation, count]) => ({
      mutation,
      count,
    }))
  }

  // Prepare data for zygosity breakdown
  const prepareZygosityData = () => {
    const zygosityCounts: Record<string, number> = {}

    reports.forEach((report) => {
      if (!zygosityCounts[report.zygosity]) {
        zygosityCounts[report.zygosity] = 0
      }
      zygosityCounts[report.zygosity]++
    })

    return Object.entries(zygosityCounts).map(([zygosity, count]) => ({
      name: zygosity,
      value: count,
    }))
  }

  // Prepare data for interpretation classification
  const prepareInterpretationData = () => {
    const interpretationCounts: Record<string, number> = {}

    reports.forEach((report) => {
      // Extract the main classification (e.g., "Pathogenic" from "Pathogenic - Associated with...")
      const mainClassification = report.interpretation.split(" - ")[0]

      if (!interpretationCounts[mainClassification]) {
        interpretationCounts[mainClassification] = 0
      }
      interpretationCounts[mainClassification]++
    })

    return Object.entries(interpretationCounts).map(([interpretation, count]) => ({
      interpretation,
      count,
    }))
  }

  // Prepare historical data (simulated for demo)
  const prepareHistoricalData = () => {
    // For demo purposes, we'll create simulated historical data
    const dates = [
      "2023-01",
      "2023-02",
      "2023-03",
      "2023-04",
      "2023-05",
      "2023-06",
      "2023-07",
      "2023-08",
      "2023-09",
      "2023-10",
      "2023-11",
      "2023-12",
      "2024-01",
      "2024-02",
      "2024-03",
      "2024-04",
      "2024-05",
    ]

    // Simulate data for pathogenic variants over time
    return dates.map((date) => {
      // Generate a random value between 1-5 for demo
      const value = Math.floor(Math.random() * 5) + 1
      return {
        date,
        value,
      }
    })
  }

  // Prepare cancer risk data (simulated for demo)
  const prepareCancerRiskData = () => {
    return [
      { subject: "Breast Cancer", risk: 0.65, average: 0.12 },
      { subject: "Ovarian Cancer", risk: 0.45, average: 0.014 },
      { subject: "Colorectal Cancer", risk: 0.12, average: 0.04 },
      { subject: "Pancreatic Cancer", risk: 0.07, average: 0.016 },
      { subject: "Prostate Cancer", risk: 0.2, average: 0.13 },
      { subject: "Melanoma", risk: 0.03, average: 0.023 },
    ]
  }

  const mutationData = prepareMutationData()
  const zygosityData = prepareZygosityData()
  const interpretationData = prepareInterpretationData()
  const historicalData = prepareHistoricalData()
  const cancerRiskData = prepareCancerRiskData()

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.2, 0.6))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Genetic Data Visualization</CardTitle>
          <p className="text-sm text-gray-500">Interactive visualization of genetic test results</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetZoom}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" onValueChange={setActiveTab} value={activeTab} className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger
              value="distribution"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700"
            >
              Mutation Distribution
            </TabsTrigger>
            <TabsTrigger value="zygosity" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Zygosity Breakdown
            </TabsTrigger>
            <TabsTrigger
              value="interpretation"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700"
            >
              Interpretation Classification
            </TabsTrigger>
            <TabsTrigger value="historical" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Historical Trends
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Cancer Risk Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This chart shows the distribution of different mutations found in the genetic test results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mutationData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                      dataKey="mutation"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      tick={{ fill: "#495057" }}
                    />
                    <YAxis label={{ value: "Count", angle: -90, position: "insideLeft", fill: "#495057" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="count" name="Frequency" fill="#0066cc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {mutationData.map((item, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800">
                    {item.mutation}: {item.count}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zygosity">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This chart shows the breakdown of zygosity status (Homozygous vs. Heterozygous) in the genetic
                      variants.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={zygosityData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {zygosityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} variant(s)`, "Count"]}
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {zygosityData.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <CardContent className="p-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-sm text-gray-500">
                        {((item.value / reports.length) * 100).toFixed(1)}% of variants
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interpretation">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This chart shows the classification of genetic variants based on their clinical interpretation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={interpretationData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis type="number" tick={{ fill: "#495057" }} />
                    <YAxis
                      dataKey="interpretation"
                      type="category"
                      width={150}
                      tick={{ fontSize: 12, fill: "#495057" }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar
                      dataKey="count"
                      name="Frequency"
                      fill="#00c1c1"
                      radius={[0, 4, 4, 0]}
                      label={{ position: "right", fill: "#495057" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                {interpretationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}
                      ></div>
                      <span className="ml-2 font-medium">{item.interpretation}</span>
                    </div>
                    <Badge
                      className={
                        item.interpretation.includes("Pathogenic")
                          ? "bg-red-100 text-red-800"
                          : item.interpretation.includes("Uncertain")
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      {item.count} variant{item.count !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="historical">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This chart shows the historical trend of pathogenic variants detected over time (simulated data
                      for demonstration).
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      tick={{ fill: "#495057" }}
                    />
                    <YAxis
                      label={{ value: "Pathogenic Variants", angle: -90, position: "insideLeft", fill: "#495057" }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Pathogenic Variants"
                      stroke="#6f42c1"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-md border">
                <div className="bg-gray-50 p-3 font-medium">Recent Trend Analysis</div>
                <div className="p-4">
                  <p className="text-sm text-gray-700">
                    The trend analysis shows a gradual increase in the detection of pathogenic variants over the past 6
                    months. This could be attributed to improved sequencing technology and expanded gene panels. The
                    spike in March 2024 corresponds to the introduction of a new comprehensive cancer gene panel.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This radar chart shows the estimated lifetime cancer risk based on the detected genetic variants,
                      compared to the average population risk.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} width={730} height={250} data={cancerRiskData}>
                    <PolarGrid stroke="#e9ecef" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#495057" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 0.7]} tickFormatter={(value) => `${value * 100}%`} />
                    <Radar name="Patient Risk" dataKey="risk" stroke="#dc3545" fill="#dc3545" fillOpacity={0.5} />
                    <Radar
                      name="Average Population Risk"
                      dataKey="average"
                      stroke="#0066cc"
                      fill="#0066cc"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, ""]}
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-md border">
                <div className="bg-gray-50 p-3 font-medium">Risk Assessment</div>
                <div className="divide-y">
                  {cancerRiskData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div>
                        <div className="font-medium">{item.subject}</div>
                        <div className="text-sm text-gray-500">
                          {(item.risk * 100).toFixed(1)}% vs. avg {(item.average * 100).toFixed(1)}%
                        </div>
                      </div>
                      <Badge
                        className={
                          item.risk / item.average > 3
                            ? "bg-red-100 text-red-800"
                            : item.risk / item.average > 1.5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {(item.risk / item.average).toFixed(1)}x average risk
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
