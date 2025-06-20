"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts"
import {
  TrendingUp, Award, FileText, Users, DollarSign,
  Activity, Calendar, Globe2, Building2, Star,
  Download, Share2, Filter, ArrowUp, ArrowDown,
  Target, Zap, BookOpen, GraduationCap
} from "lucide-react"

interface PublicationData {
  month: string
  publications: number
  citations: number
  impact: number
}

interface FundingData {
  year: string
  grants: number
  amount: number
  success_rate: number
}

interface ImpactMetric {
  metric: string
  value: number
  change: number
  trend: "up" | "down" | "stable"
}

interface ResearchArea {
  area: string
  publications: number
  funding: number
  collaborators: number
  impact: number
}

export default function ResearchMetricsPage() {
  const [timeRange, setTimeRange] = useState("year")
  const [metricView, setMetricView] = useState("overview")

  const publicationData: PublicationData[] = [
    { month: "Jan", publications: 12, citations: 245, impact: 4.2 },
    { month: "Feb", publications: 15, citations: 312, impact: 4.5 },
    { month: "Mar", publications: 18, citations: 428, impact: 4.8 },
    { month: "Apr", publications: 14, citations: 389, impact: 4.3 },
    { month: "May", publications: 22, citations: 567, impact: 5.2 },
    { month: "Jun", publications: 19, citations: 498, impact: 4.9 }
  ]

  const fundingData: FundingData[] = [
    { year: "2020", grants: 5, amount: 3.2, success_rate: 35 },
    { year: "2021", grants: 7, amount: 4.8, success_rate: 38 },
    { year: "2022", grants: 8, amount: 6.2, success_rate: 42 },
    { year: "2023", grants: 11, amount: 8.5, success_rate: 48 },
    { year: "2024", grants: 9, amount: 7.2, success_rate: 45 }
  ]

  const impactMetrics: ImpactMetric[] = [
    { metric: "h-index", value: 42, change: 8, trend: "up" },
    { metric: "i10-index", value: 156, change: 12, trend: "up" },
    { metric: "Total Citations", value: 8234, change: 15, trend: "up" },
    { metric: "Avg Impact Factor", value: 6.8, change: -2, trend: "down" }
  ]

  const researchAreas: ResearchArea[] = [
    { area: "Cancer Genomics", publications: 45, funding: 3.2, collaborators: 28, impact: 85 },
    { area: "AI/ML", publications: 38, funding: 2.8, collaborators: 22, impact: 78 },
    { area: "Pharmacogenomics", publications: 32, funding: 2.1, collaborators: 18, impact: 72 },
    { area: "Population Genetics", publications: 28, funding: 1.8, collaborators: 15, impact: 68 },
    { area: "Clinical Implementation", publications: 24, funding: 1.5, collaborators: 12, impact: 65 }
  ]

  const journalDistribution = [
    { name: "Nature", value: 15, color: "#3B82F6" },
    { name: "Science", value: 12, color: "#10B981" },
    { name: "Cell", value: 8, color: "#F59E0B" },
    { name: "NEJM", value: 6, color: "#8B5CF6" },
    { name: "Lancet", value: 5, color: "#EF4444" },
    { name: "Others", value: 54, color: "#6B7280" }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Research Metrics</h1>
            <p className="text-gray-600">
              Track research performance, impact, and productivity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {impactMetrics.map((metric) => (
          <Card key={metric.metric}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {metric.metric === "Avg Impact Factor"
                      ? metric.value.toFixed(1)
                      : metric.value.toLocaleString()
                    }
                  </p>
                  <p className={`text-xs mt-1 flex items-center ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {metric.trend === "up" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(metric.change)}% from last year
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  metric.trend === "up" ? "bg-green-100" : "bg-red-100"
                }`}>
                  <TrendingUp className={`h-6 w-6 ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={metricView} onValueChange={setMetricView}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Publication Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Publication Trend</CardTitle>
                <CardDescription>
                  Monthly publications and citations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={publicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="publications"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Publications"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="citations"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Citations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Research Areas Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Research Areas Performance</CardTitle>
                <CardDescription>
                  Comparative analysis across research domains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={researchAreas}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="area" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Impact Score" dataKey="impact" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-8 w-8 text-blue-600" />
                    <Badge variant="secondary">New</Badge>
                  </div>
                  <h4 className="font-medium">Best Paper Award</h4>
                  <p className="text-sm text-gray-600 mt-1">Nature Genetics - AI in Genomics</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <h4 className="font-medium">NIH R01 Grant</h4>
                  <p className="text-sm text-gray-600 mt-1">$2.5M for precision medicine</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-8 w-8 text-purple-600" />
                    <Badge variant="secondary">Growing</Badge>
                  </div>
                  <h4 className="font-medium">Research Network</h4>
                  <p className="text-sm text-gray-600 mt-1">127 collaborators worldwide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Publication Stats */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Publication Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={publicationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="publications" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                      <Area type="monotone" dataKey="impact" stackId="2" stroke="#10B981" fill="#10B981" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Journal Distribution */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Journal Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={journalDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {journalDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Publication Metrics */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publication Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Publications</span>
                        <span className="font-semibold">247</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Peer Reviewed</span>
                        <span className="font-semibold">198</span>
                      </div>
                      <Progress value={80} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">First Author</span>
                        <span className="font-semibold">67</span>
                      </div>
                      <Progress value={27} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Corresponding Author</span>
                        <span className="font-semibold">89</span>
                      </div>
                      <Progress value={36} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Cited Papers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">
                          AI-driven variant interpretation in precision oncology
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Nature Medicine, 2023</p>
                      </div>
                      <Badge variant="secondary">1,234</Badge>
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">
                          Population-scale genomics reveals genetic architecture
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Science, 2023</p>
                      </div>
                      <Badge variant="secondary">892</Badge>
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">
                          Machine learning for pharmacogenomic prediction
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Cell, 2022</p>
                      </div>
                      <Badge variant="secondary">756</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="funding" className="mt-6">
          <div className="space-y-6">
            {/* Funding Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Trend</CardTitle>
                  <CardDescription>
                    Annual funding amount and success rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fundingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="amount" fill="#3B82F6" name="Amount ($M)" />
                      <Line yAxisId="right" type="monotone" dataKey="success_rate" stroke="#10B981" name="Success Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Funding Sources</CardTitle>
                  <CardDescription>
                    Distribution by funding agency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">NIH</p>
                          <p className="text-sm text-gray-500">8 grants</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$12.3M</p>
                        <p className="text-xs text-gray-500">68%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">NSF</p>
                          <p className="text-sm text-gray-500">3 grants</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$3.2M</p>
                        <p className="text-xs text-gray-500">18%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Industry</p>
                          <p className="text-sm text-gray-500">5 contracts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$2.5M</p>
                        <p className="text-xs text-gray-500">14%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Grants */}
            <Card>
              <CardHeader>
                <CardTitle>Active Grants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">AI-Powered Genomic Medicine Platform</h4>
                        <p className="text-sm text-gray-500">NIH R01 - 2022-2027</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Total Budget</p>
                        <p className="font-medium">$2.5M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Spent</p>
                        <p className="font-medium">$1.2M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Progress</p>
                        <Progress value={48} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">Population Genomics Initiative</h4>
                        <p className="text-sm text-gray-500">NHGRI U01 - 2023-2026</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Total Budget</p>
                        <p className="font-medium">$1.8M</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Spent</p>
                        <p className="font-medium">$450K</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Progress</p>
                        <Progress value={25} className="mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Citation Impact</CardTitle>
                <CardDescription>
                  Citation trends and h-index growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={publicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="citations" fill="#3B82F6" stroke="#3B82F6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research Impact Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Field-Weighted Citation Impact</span>
                      <span className="text-2xl font-bold">2.34</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your publications are cited 134% more than the world average
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Outputs in Top 10% Journals</span>
                      <span className="text-2xl font-bold">68%</span>
                    </div>
                    <Progress value={68} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">International Collaboration</span>
                      <span className="text-2xl font-bold">45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Network Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Globe2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-sm text-gray-600">Countries</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Building2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold">45</p>
                  <p className="text-sm text-gray-600">Institutions</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold">127</p>
                  <p className="text-sm text-gray-600">Collaborators</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}