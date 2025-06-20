"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Users,
  DollarSign,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Microscope,
  Globe,
  Settings,
  HelpCircle,
} from "lucide-react"

interface DashboardMetrics {
  opportunities: {
    total: number
    highPriority: number
    newToday: number
    averageMatch: number
  }
  patients: {
    total: number
    eligible: number
    enrolled: number
    genomicProfiles: number
  }
  funding: {
    pipeline: number
    secured: number
    pending: number
    probability: number
  }
  compliance: {
    score: number
    violations: number
    expiring: number
    lastAudit: string
  }
  automation: {
    documentsGenerated: number
    proposalsSubmitted: number
    alertsSent: number
    uptime: number
  }
}

export function EnhancedDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    opportunities: { total: 47, highPriority: 8, newToday: 3, averageMatch: 0.78 },
    patients: { total: 156, eligible: 89, enrolled: 34, genomicProfiles: 142 },
    funding: { pipeline: 2800000, secured: 500000, pending: 1200000, probability: 0.65 },
    compliance: { score: 95, violations: 0, expiring: 2, lastAudit: "2024-01-15" },
    automation: { documentsGenerated: 23, proposalsSubmitted: 5, alertsSent: 12, uptime: 99.8 },
  })

  const [activeView, setActiveView] = useState("overview")
  const [userRole, setUserRole] = useState<"researcher" | "admin" | "clinician">("researcher")

  // Adaptive UI based on user role and expertise
  const getViewConfig = () => {
    switch (userRole) {
      case "clinician":
        return {
          primaryTabs: ["patients", "trials", "compliance"],
          complexityLevel: "simplified",
          defaultView: "patients",
        }
      case "admin":
        return {
          primaryTabs: ["overview", "funding", "compliance", "system"],
          complexityLevel: "advanced",
          defaultView: "overview",
        }
      default:
        return {
          primaryTabs: ["overview", "opportunities", "documents"],
          complexityLevel: "standard",
          defaultView: "overview",
        }
    }
  }

  const config = getViewConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header with Context-Aware Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AGENT Research Engine</h1>
                  <p className="text-sm text-gray-600">Federal Research Coordination Platform</p>
                </div>
              </div>

              {/* Role Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View as:</span>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="researcher">Researcher</option>
                  <option value="clinician">Clinician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Operational</span>
              </div>

              {/* Quick Actions */}
              <Button size="sm" variant="outline">
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
              <Button size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Smart Metrics Grid - Adapts to User Role */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Opportunities Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Federal Opportunities</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{metrics.opportunities.total}</p>
                    <Badge variant="secondary" className="text-xs">
                      +{metrics.opportunities.newToday} today
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">{metrics.opportunities.highPriority} high priority</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patient Matches</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{metrics.patients.eligible}</p>
                    <span className="text-sm text-gray-500">of {metrics.patients.total}</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={(metrics.patients.eligible / metrics.patients.total) * 100} className="h-2" />
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Funding Pipeline</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      ${(metrics.funding.pipeline / 1000000).toFixed(1)}M
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {(metrics.funding.probability * 100).toFixed(0)}% prob
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600">
                        ${(metrics.funding.secured / 1000).toFixed(0)}K secured
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{metrics.compliance.score}%</p>
                    {metrics.compliance.violations === 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{metrics.compliance.expiring} items expiring soon</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Adaptive Content Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Insights Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI Insights</span>
                  </CardTitle>
                  <CardDescription>Intelligent recommendations based on current data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-medium text-blue-900">High-Priority Opportunity</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        NIH R01 precision oncology grant has 92% match score. Deadline in 15 days.
                      </p>
                      <Button size="sm" className="mt-2">
                        Review Opportunity
                      </Button>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-medium text-green-900">Patient Enrollment Ready</h4>
                      <p className="text-sm text-green-800 mt-1">
                        23 patients match CPIC criteria for active trials. Auto-enrollment available.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        View Patients
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>System Performance</span>
                  </CardTitle>
                  <CardDescription>Real-time system metrics and automation status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-green-600">{metrics.automation.uptime}%</span>
                    </div>
                    <Progress value={metrics.automation.uptime} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-lg font-bold">{metrics.automation.documentsGenerated}</p>
                        <p className="text-xs text-gray-600">Docs Generated</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-lg font-bold">{metrics.automation.alertsSent}</p>
                        <p className="text-xs text-gray-600">Alerts Sent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            {/* Enhanced Opportunities View */}
            <Card>
              <CardHeader>
                <CardTitle>Federal Research Opportunities</CardTitle>
                <CardDescription>AI-matched opportunities with automated proposal generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Microscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Opportunities panel will be loaded here</p>
                  <Button className="mt-4">View All Opportunities</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            {/* Enhanced Patient Matching */}
            <Card>
              <CardHeader>
                <CardTitle>Patient-Trial Matching</CardTitle>
                <CardDescription>FHIR-integrated patient eligibility and genomic matching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Patient matching panel will be loaded here</p>
                  <Button className="mt-4">View Patient Matches</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            {/* Automation Control Center */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Control Center</CardTitle>
                <CardDescription>Configure and monitor automated research coordination tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Automation controls will be loaded here</p>
                  <Button className="mt-4">Configure Automation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
