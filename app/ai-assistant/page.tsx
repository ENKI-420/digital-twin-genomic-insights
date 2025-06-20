"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain, MessageSquare, Zap, Shield, Target, TrendingUp,
  FileText, Users, Activity, CheckCircle, AlertTriangle,
  Clock, ArrowRight, Lightbulb, BarChart3, Microscope
} from "lucide-react"

interface AIFeature {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  badge?: string
  status: "active" | "beta" | "coming_soon"
}

interface AIInsight {
  id: string
  type: "recommendation" | "alert" | "insight" | "prediction"
  title: string
  description: string
  confidence: number
  priority: "high" | "medium" | "low"
  timestamp: string
  actionRequired: boolean
}

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const aiFeatures: AIFeature[] = [
    {
      title: "AI Chat Assistant",
      description: "Natural language interface for genomic queries and clinical support",
      href: "/chat",
      icon: <MessageSquare className="h-6 w-6" />,
      badge: "Enhanced",
      status: "active"
    },
    {
      title: "Predictive Analytics",
      description: "AI-powered predictions for patient outcomes and variant classifications",
      href: "/ai-predictions",
      icon: <Zap className="h-6 w-6" />,
      badge: "New",
      status: "active"
    },
    {
      title: "Evidence Strength Analysis",
      description: "Automated assessment of genetic evidence strength and reliability",
      href: "/evidence-strength",
      icon: <Shield className="h-6 w-6" />,
      status: "active"
    },
    {
      title: "Conflict Resolution",
      description: "AI-assisted resolution of variant classification conflicts",
      href: "/conflict-resolution",
      icon: <Target className="h-6 w-6" />,
      status: "active"
    },
    {
      title: "Clinical Decision Support",
      description: "Real-time AI recommendations for clinical decision making",
      href: "/ai-assistant/cds",
      icon: <Lightbulb className="h-6 w-6" />,
      badge: "Epic Ready",
      status: "beta"
    },
    {
      title: "Drug Interaction Alerts",
      description: "Pharmacogenomic-based medication safety recommendations",
      href: "/ai-assistant/pharma",
      icon: <AlertTriangle className="h-6 w-6" />,
      badge: "Critical",
      status: "active"
    }
  ]

  const recentInsights: AIInsight[] = [
    {
      id: "1",
      type: "alert",
      title: "High-Risk Variant Detected",
      description: "BRCA1 pathogenic variant identified in patient PAT-001 requires immediate clinical review",
      confidence: 98,
      priority: "high",
      timestamp: "2024-01-15 09:30",
      actionRequired: true
    },
    {
      id: "2",
      type: "recommendation",
      title: "Clinical Trial Match",
      description: "Patient PAT-002 matches criteria for 3 active oncology trials",
      confidence: 89,
      priority: "medium",
      timestamp: "2024-01-15 08:45",
      actionRequired: true
    },
    {
      id: "3",
      type: "prediction",
      title: "Variant Reclassification Likely",
      description: "MLH1 variant has 85% probability of being reclassified within 6 months",
      confidence: 85,
      priority: "medium",
      timestamp: "2024-01-15 07:20",
      actionRequired: false
    },
    {
      id: "4",
      type: "insight",
      title: "Population Frequency Update",
      description: "New population data suggests updated allele frequency for APC variant",
      confidence: 92,
      priority: "low",
      timestamp: "2024-01-14 16:15",
      actionRequired: false
    }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-blue-500" />
      case "prediction":
        return <TrendingUp className="h-5 w-5 text-purple-500" />
      case "insight":
        return <Brain className="h-5 w-5 text-green-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200 text-red-800"
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "beta":
        return <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
      case "coming_soon":
        return <Badge className="bg-gray-100 text-gray-800">Coming Soon</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Brain className="h-8 w-8 mr-3 text-blue-600" />
              AI Assistant
            </h1>
            <p className="text-gray-600 mt-2">
              Intelligent clinical decision support powered by advanced AI and machine learning
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/ai-assistant/settings">
                <Shield className="h-4 w-4 mr-2" />
                AI Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* AI Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">94.5%</p>
                    <p className="text-sm text-green-600">Above target</p>
                  </div>
                  <Brain className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Insights</p>
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-sm text-blue-600">Generated today</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                    <p className="text-2xl font-bold text-red-600">12</p>
                    <p className="text-sm text-red-600">Require attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chat Sessions</p>
                    <p className="text-2xl font-bold">1,456</p>
                    <p className="text-sm text-purple-600">This month</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-gray-600">Frequently used AI-powered tools</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                  <Link href="/chat">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-6 w-6 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Ask AI Assistant</div>
                        <div className="text-sm text-gray-500">Get instant answers to genomic questions</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                  <Link href="/ai-predictions">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-6 w-6 text-purple-500" />
                      <div className="text-left">
                        <div className="font-medium">Run Predictions</div>
                        <div className="text-sm text-gray-500">Analyze patient outcomes and risks</div>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                  <Link href="/evidence-strength">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-6 w-6 text-green-500" />
                      <div className="text-left">
                        <div className="font-medium">Analyze Evidence</div>
                        <div className="text-sm text-gray-500">Assess genetic evidence strength</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent AI Insights
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ai-assistant/insights">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{insight.confidence}% confidence</span>
                            <span>{insight.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      {insight.actionRequired && (
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(feature.status)}
                          {feature.badge && (
                            <Badge variant={feature.badge === "Critical" ? "destructive" : "secondary"}>
                              {feature.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                    disabled={feature.status === "coming_soon"}
                  >
                    <Link href={feature.href}>
                      {feature.status === "coming_soon" ? "Coming Soon" : "Launch Feature"}
                      {feature.status !== "coming_soon" && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">All AI Insights</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Filter</Button>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </div>

            <div className="grid gap-4">
              {recentInsights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${getPriorityColor(insight.priority)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{insight.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {insight.confidence}% confidence
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {insight.timestamp}
                            </span>
                            <Badge variant="outline" className={`text-xs ${
                              insight.priority === "high" ? "border-red-300 text-red-700" :
                              insight.priority === "medium" ? "border-yellow-300 text-yellow-700" :
                              "border-blue-300 text-blue-700"
                            }`}>
                              {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {insight.actionRequired && (
                          <Button size="sm">
                            Take Action
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  AI Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accuracy Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "94.5%" }}></div>
                      </div>
                      <span className="text-sm font-medium">94.5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "88%" }}></div>
                      </div>
                      <span className="text-sm font-medium">1.2s avg</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Satisfaction</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "96%" }}></div>
                      </div>
                      <span className="text-sm font-medium">4.8/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Chat Sessions</span>
                    <span className="text-lg font-bold text-blue-600">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Predictions Generated</span>
                    <span className="text-lg font-bold text-purple-600">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evidence Analyses</span>
                    <span className="text-lg font-bold text-green-600">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical Alerts</span>
                    <span className="text-lg font-bold text-red-600">12</span>
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
