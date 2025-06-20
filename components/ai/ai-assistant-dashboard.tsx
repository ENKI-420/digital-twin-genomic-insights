"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts"
import {
  Brain,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Zap,
  Shield,
  Heart,
  BarChart3,
  RefreshCw,
  Download,
} from "lucide-react"

// Mock data for AI assistant metrics
const aiMetrics = {
  predictiveAccuracy: 94.2,
  timeSaved: 847, // minutes per day
  patientsMonitored: 156,
  alertsGenerated: 23,
  workflowsAutomated: 89,
  outcomeImprovement: 18.5, // percentage
  costReduction: 12.3, // percentage
  userSatisfaction: 4.7, // out of 5
}

const riskPredictions = [
  { category: "High Risk", count: 12, color: "#ef4444" },
  { category: "Moderate Risk", count: 34, color: "#f97316" },
  { category: "Low Risk", count: 89, color: "#22c55e" },
  { category: "Critical", count: 3, color: "#dc2626" },
]

const outcomeMetrics = [
  { month: "Jan", improvement: 12.5, baseline: 0 },
  { month: "Feb", improvement: 14.2, baseline: 0 },
  { month: "Mar", improvement: 16.8, baseline: 0 },
  { month: "Apr", improvement: 18.1, baseline: 0 },
  { month: "May", improvement: 18.5, baseline: 0 },
]

const workflowEfficiency = [
  { task: "Documentation", timeSaved: 45, automationRate: 85 },
  { task: "Scheduling", timeSaved: 32, automationRate: 78 },
  { task: "Lab Orders", timeSaved: 28, automationRate: 92 },
  { task: "Medication Reconciliation", timeSaved: 38, automationRate: 88 },
  { task: "Discharge Planning", timeSaved: 52, automationRate: 76 },
]

const aiCapabilities = [
  { capability: "Predictive Analytics", score: 94, maxScore: 100 },
  { capability: "Treatment Optimization", score: 91, maxScore: 100 },
  { capability: "Workflow Automation", score: 88, maxScore: 100 },
  { capability: "Real-time Monitoring", score: 96, maxScore: 100 },
  { capability: "Outcome Prediction", score: 89, maxScore: 100 },
  { capability: "Risk Assessment", score: 93, maxScore: 100 },
]

const COLORS = ["#0066cc", "#00c1c1", "#ffc107", "#dc3545", "#6f42c1", "#28a745"]

export function AIAssistantDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdate(new Date())
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant Dashboard</h1>
          <p className="text-gray-500">Intelligent healthcare automation and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predictive Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{aiMetrics.predictiveAccuracy}%</p>
                <p className="text-xs text-gray-500">+2.3% from last month</p>
              </div>
              <Brain className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved Daily</p>
                <p className="text-2xl font-bold text-blue-600">{aiMetrics.timeSaved} min</p>
                <p className="text-xs text-gray-500">14.2 hours equivalent</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patients Monitored</p>
                <p className="text-2xl font-bold text-purple-600">{aiMetrics.patientsMonitored}</p>
                <p className="text-xs text-gray-500">Real-time monitoring</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outcome Improvement</p>
                <p className="text-2xl font-bold text-orange-600">{aiMetrics.outcomeImprovement}%</p>
                <p className="text-xs text-gray-500">Patient outcomes</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskPredictions}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {riskPredictions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Predictive Accuracy</span>
                    <span>{aiMetrics.predictiveAccuracy}%</span>
                  </div>
                  <Progress value={aiMetrics.predictiveAccuracy} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Workflow Automation</span>
                    <span>{aiMetrics.workflowsAutomated}%</span>
                  </div>
                  <Progress value={aiMetrics.workflowsAutomated} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>User Satisfaction</span>
                    <span>{aiMetrics.userSatisfaction}/5.0</span>
                  </div>
                  <Progress value={(aiMetrics.userSatisfaction / 5) * 100} className="h-2" />
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">AI System Operating Optimally</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Patient Outcome Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={outcomeMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: "Improvement %", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value}%`, "Improvement"]} />
                    <Area type="monotone" dataKey="improvement" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  High-Risk Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "P001", name: "John Smith", risk: 92, condition: "Post-surgical complications" },
                    { id: "P002", name: "Mary Johnson", risk: 88, condition: "Cardiac event risk" },
                    { id: "P003", name: "Robert Davis", risk: 85, condition: "Infection risk" },
                  ].map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.condition}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">{patient.risk}% risk</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Predicted Interventions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { intervention: "Early mobilization protocol", urgency: "24h", impact: "High" },
                    { intervention: "Medication adjustment", urgency: "12h", impact: "Medium" },
                    { intervention: "Additional monitoring", urgency: "6h", impact: "High" },
                  ].map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{item.intervention}</p>
                      <div className="flex justify-between mt-2">
                        <Badge variant="outline">Within {item.urgency}</Badge>
                        <Badge
                          className={
                            item.impact === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {item.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  Resource Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ICU Capacity (24h)</span>
                      <span>14/20 beds</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>OR Schedule</span>
                      <span>8/12 slots</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Nursing Staff</span>
                      <span>45/50 required</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Workflow Automation Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workflowEfficiency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="task" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" label={{ value: "Time Saved (min)", angle: -90, position: "insideLeft" }} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{ value: "Automation %", angle: 90, position: "insideRight" }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="timeSaved" fill="#3b82f6" name="Time Saved (min)" />
                    <Bar yAxisId="right" dataKey="automationRate" fill="#10b981" name="Automation Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Automations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Critical Lab Alerts", status: "Active", executions: 156 },
                    { name: "Medication Reconciliation", status: "Active", executions: 89 },
                    { name: "Discharge Planning", status: "Active", executions: 67 },
                    { name: "Appointment Scheduling", status: "Active", executions: 234 },
                  ].map((automation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{automation.name}</p>
                        <p className="text-sm text-gray-500">{automation.executions} executions today</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{automation.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">$47,250</p>
                    <p className="text-sm text-gray-500">Monthly savings from automation</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Labor cost reduction</span>
                      <span className="text-sm font-medium">$32,100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Error prevention</span>
                      <span className="text-sm font-medium">$8,900</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Efficiency gains</span>
                      <span className="text-sm font-medium">$6,250</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Outcomes Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={outcomeMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: "Improvement %", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`${value}%`, "Improvement"]} />
                      <Line type="monotone" dataKey="improvement" stroke="#10b981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Readmission Rate", current: "8.2%", target: "< 10%", trend: "down" },
                    { metric: "Length of Stay", current: "4.1 days", target: "< 4.5 days", trend: "down" },
                    { metric: "Patient Satisfaction", current: "4.7/5", target: "> 4.5", trend: "up" },
                    { metric: "Mortality Rate", current: "1.8%", target: "< 2.5%", trend: "down" },
                  ].map((kpi, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{kpi.metric}</p>
                        <p className="text-sm text-gray-500">Target: {kpi.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{kpi.current}</p>
                        <div className="flex items-center">
                          {kpi.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-600 rotate-180" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evidence-Based Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">23%</p>
                  <p className="text-sm text-gray-600">Reduction in adverse events</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">31%</p>
                  <p className="text-sm text-gray-600">Faster diagnosis time</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">42%</p>
                  <p className="text-sm text-gray-600">Improved treatment adherence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                AI Capability Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={aiCapabilities}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="capability" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="AI Performance" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Advantages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { feature: "Real-time Risk Prediction", advantage: "3x faster than traditional methods" },
                    { feature: "Genomic Integration", advantage: "Personalized treatment plans" },
                    { feature: "Workflow Automation", advantage: "89% task automation rate" },
                    { feature: "Outcome Prediction", advantage: "94% accuracy in 24h predictions" },
                  ].map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{item.feature}</p>
                      <p className="text-sm text-gray-600">{item.advantage}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Continuous Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Model Training Progress</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Integration</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Algorithm Optimization</span>
                      <span>91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      AI models updated with latest clinical research and patient outcomes
                    </p>
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
