"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts"
import {
  Globe2, Users, Dna, Map, BarChart3, TrendingUp,
  AlertCircle, Info, Filter, Download, Share2,
  Layers, Target, Activity, ChevronRight, MapPin
} from "lucide-react"

interface PopulationData {
  ancestry: string
  percentage: number
  count: number
  color: string
}

interface VariantFrequency {
  variant: string
  gene: string
  population: string
  frequency: number
  clinical: string
}

interface AncestryMarker {
  chromosome: string
  position: number
  ancestralAllele: string
  derivedAllele: string
  populations: { [key: string]: number }
}

export default function PopulationGenomicsPage() {
  const [selectedPopulation, setSelectedPopulation] = useState("all")
  const [viewMode, setViewMode] = useState("overview")

  const populationData: PopulationData[] = [
    { ancestry: "European", percentage: 45, count: 4523, color: "#3B82F6" },
    { ancestry: "African", percentage: 25, count: 2512, color: "#10B981" },
    { ancestry: "East Asian", percentage: 15, count: 1507, color: "#F59E0B" },
    { ancestry: "South Asian", percentage: 10, count: 1005, color: "#8B5CF6" },
    { ancestry: "Native American", percentage: 3, count: 301, color: "#EF4444" },
    { ancestry: "Middle Eastern", percentage: 2, count: 201, color: "#EC4899" }
  ]

  const variantFrequencies: VariantFrequency[] = [
    { variant: "rs1801133", gene: "MTHFR", population: "European", frequency: 0.35, clinical: "Folate metabolism" },
    { variant: "rs9939609", gene: "FTO", population: "African", frequency: 0.12, clinical: "Obesity risk" },
    { variant: "rs4988235", gene: "LCT", population: "East Asian", frequency: 0.05, clinical: "Lactose tolerance" },
    { variant: "rs7903146", gene: "TCF7L2", population: "South Asian", frequency: 0.28, clinical: "Type 2 diabetes" }
  ]

  const alleleFrequencyData = [
    { population: "European", commonVariants: 65, rareVariants: 35, pathogenic: 12 },
    { population: "African", commonVariants: 78, rareVariants: 22, pathogenic: 8 },
    { population: "East Asian", commonVariants: 62, rareVariants: 38, pathogenic: 10 },
    { population: "South Asian", commonVariants: 68, rareVariants: 32, pathogenic: 11 }
  ]

  const diversityMetrics = [
    { metric: "Heterozygosity", European: 0.72, African: 0.85, EastAsian: 0.68, SouthAsian: 0.74 },
    { metric: "Tajima's D", European: -0.5, African: 0.2, EastAsian: -0.3, SouthAsian: -0.1 },
    { metric: "Fst", European: 0.12, African: 0.18, EastAsian: 0.15, SouthAsian: 0.13 },
    { metric: "Pi", European: 0.0008, African: 0.0011, EastAsian: 0.0007, SouthAsian: 0.0009 }
  ]

  const radarData = [
    { population: "European", diversity: 72, uniqueVariants: 45, clinicalVariants: 65, coverage: 95 },
    { population: "African", diversity: 85, uniqueVariants: 78, clinicalVariants: 52, coverage: 88 },
    { population: "East Asian", diversity: 68, uniqueVariants: 38, clinicalVariants: 58, coverage: 92 },
    { population: "South Asian", diversity: 74, uniqueVariants: 42, clinicalVariants: 61, coverage: 90 }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Population Genomics</h1>
        <p className="text-gray-600">
          Analyze genetic diversity, ancestry, and population-specific variants
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Samples</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">10,049</p>
            <p className="text-xs text-green-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Populations</CardTitle>
              <Globe2 className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">6</p>
            <p className="text-xs text-gray-500 mt-1">Major ancestry groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Unique Variants</CardTitle>
              <Dna className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2.4M</p>
            <p className="text-xs text-blue-600 mt-1">Across all populations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Heterozygosity</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0.75</p>
            <p className="text-xs text-gray-500 mt-1">Population diversity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ancestry">Ancestry Analysis</TabsTrigger>
          <TabsTrigger value="variants">Variant Frequencies</TabsTrigger>
          <TabsTrigger value="diversity">Diversity Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Population Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Population Distribution</CardTitle>
                <CardDescription>
                  Breakdown of samples by ancestry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={populationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ancestry, percentage }) => `${ancestry} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {populationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {populationData.map((pop) => (
                    <div key={pop.ancestry} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: pop.color }} />
                        <span className="text-sm">{pop.ancestry}</span>
                      </div>
                      <span className="text-sm font-medium">{pop.count} samples</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Allele Frequency Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Allele Frequency Distribution</CardTitle>
                <CardDescription>
                  Variant categories by population
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alleleFrequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="population" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="commonVariants" fill="#3B82F6" stackId="a" />
                    <Bar dataKey="rareVariants" fill="#10B981" stackId="a" />
                    <Bar dataKey="pathogenic" fill="#EF4444" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Discoveries */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Population-Specific Discoveries</CardTitle>
              <CardDescription>
                Newly identified variants with population-specific effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">East Asian-specific ALDH2 variant</p>
                      <p className="text-sm text-gray-500">Associated with alcohol metabolism</p>
                    </div>
                  </div>
                  <Badge>New</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">African-specific G6PD variants</p>
                      <p className="text-sm text-gray-500">Malaria resistance markers</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Updated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ancestry" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ancestry Composition */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Population Structure Analysis</CardTitle>
                    <Select value={selectedPopulation} onValueChange={setSelectedPopulation}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Populations</SelectItem>
                        <SelectItem value="european">European</SelectItem>
                        <SelectItem value="african">African</SelectItem>
                        <SelectItem value="eastasian">East Asian</SelectItem>
                        <SelectItem value="southasian">South Asian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" label={{ value: "PC1 (23.4%)", position: "insideBottom", offset: -5 }} />
                      <YAxis dataKey="y" label={{ value: "PC2 (18.2%)", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Scatter name="European" data={[
                        { x: 2.3, y: 1.5 }, { x: 2.1, y: 1.8 }, { x: 2.5, y: 1.3 },
                        { x: 2.2, y: 1.6 }, { x: 2.4, y: 1.4 }
                      ]} fill="#3B82F6" />
                      <Scatter name="African" data={[
                        { x: -2.5, y: 0.5 }, { x: -2.3, y: 0.8 }, { x: -2.7, y: 0.3 },
                        { x: -2.4, y: 0.6 }, { x: -2.6, y: 0.4 }
                      ]} fill="#10B981" />
                      <Scatter name="East Asian" data={[
                        { x: 0.5, y: -2.3 }, { x: 0.3, y: -2.5 }, { x: 0.7, y: -2.1 },
                        { x: 0.4, y: -2.4 }, { x: 0.6, y: -2.2 }
                      ]} fill="#F59E0B" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Ancestry Markers */}
            <Card>
              <CardHeader>
                <CardTitle>Ancestry Informative Markers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">rs1426654 (SLC24A5)</span>
                      <Badge variant="outline">Skin pigmentation</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>European: 98%</span>
                        <Progress value={98} className="w-20 h-1" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>African: 2%</span>
                        <Progress value={2} className="w-20 h-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">rs3827760 (EDAR)</span>
                      <Badge variant="outline">Hair thickness</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>East Asian: 85%</span>
                        <Progress value={85} className="w-20 h-1" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>European: 5%</span>
                        <Progress value={5} className="w-20 h-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">rs12913832 (HERC2)</span>
                      <Badge variant="outline">Eye color</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>European: 78%</span>
                        <Progress value={78} className="w-20 h-1" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>South Asian: 45%</span>
                        <Progress value={45} className="w-20 h-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Info className="h-4 w-4 mr-2" />
                  View All Markers
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Population-Specific Variant Frequencies</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {variantFrequencies.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{variant.variant} ({variant.gene})</p>
                        <p className="text-sm text-gray-500">{variant.clinical}</p>
                      </div>
                      <Badge>{variant.population}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Global Frequency</p>
                        <p className="text-lg font-semibold">{(variant.frequency * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clinical Impact</p>
                        <Badge variant="outline" className="mt-1">Moderate</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Evidence Level</p>
                        <div className="flex items-center mt-1">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4].map((star) => (
                              <div
                                key={star}
                                className={`w-3 h-3 rounded-full ${
                                  star <= 3 ? "bg-yellow-400" : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="sm">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diversity" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diversity Metrics Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Population Diversity Metrics</CardTitle>
                <CardDescription>
                  Comparative genetic diversity across populations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="population" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Diversity Score" dataKey="diversity" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Radar name="Unique Variants" dataKey="uniqueVariants" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Radar name="Clinical Variants" dataKey="clinicalVariants" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Diversity Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistical Measures</CardTitle>
                <CardDescription>
                  Population genetics statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diversityMetrics.map((metric) => (
                    <div key={metric.metric} className="space-y-2">
                      <p className="font-medium text-sm">{metric.metric}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">European</span>
                          <span className="text-xs font-medium">{metric.European}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">African</span>
                          <span className="text-xs font-medium">{metric.African}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">East Asian</span>
                          <span className="text-xs font-medium">{metric.EastAsian}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">South Asian</span>
                          <span className="text-xs font-medium">{metric.SouthAsian}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Population Genetics Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Higher Diversity in African Populations</p>
                      <p className="text-sm text-blue-700 mt-1">
                        African populations show 20-30% higher genetic diversity, consistent with Out-of-Africa theory
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Population-Specific Drug Response</p>
                      <p className="text-sm text-green-700 mt-1">
                        Identified 12 variants affecting drug metabolism with >10% frequency differences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}