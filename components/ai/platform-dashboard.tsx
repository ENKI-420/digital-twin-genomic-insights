"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Users,
  Activity,
  TrendingUp,
  Server,
  Database,
  Shield,
  Brain,
  Stethoscope,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'

interface PlatformMetrics {
  totalTenants: number
  activeUsers: number
  totalAPIRequests: number
  averageResponseTime: number
  successRate: number
  totalRevenue: number
  computeUnitsUsed: number
  dataProcessed: number
}

interface TenantInfo {
  id: string
  name: string
  tier: 'basic' | 'professional' | 'enterprise' | 'enterprise_plus'
  status: 'active' | 'suspended' | 'trial'
  apiUsage: number
  monthlySpend: number
  lastActive: string
}

interface ServiceHealth {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  uptime: number
  errorRate: number
}

export default function PlatformDashboard() {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({
    totalTenants: 247,
    activeUsers: 1834,
    totalAPIRequests: 2847593,
    averageResponseTime: 245,
    successRate: 99.7,
    totalRevenue: 847200,
    computeUnitsUsed: 5847293,
    dataProcessed: 2.4
  })

  const [tenants, setTenants] = useState<TenantInfo[]>([
    {
      id: 'tenant_001',
      name: 'Baptist Health Louisville',
      tier: 'enterprise_plus',
      status: 'active',
      apiUsage: 87450,
      monthlySpend: 45200,
      lastActive: '2024-01-15T10:30:00Z'
    },
    {
      id: 'tenant_002',
      name: 'Norton Healthcare',
      tier: 'enterprise',
      status: 'active',
      apiUsage: 62340,
      monthlySpend: 28900,
      lastActive: '2024-01-15T09:45:00Z'
    },
    {
      id: 'tenant_003',
      name: 'University of Louisville Hospital',
      tier: 'professional',
      status: 'active',
      apiUsage: 34120,
      monthlySpend: 12400,
      lastActive: '2024-01-15T08:20:00Z'
    }
  ])

  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([
    {
      service: 'Clinical Decision Support',
      status: 'healthy',
      responseTime: 185,
      uptime: 99.9,
      errorRate: 0.1
    },
    {
      service: 'Patient App Generator',
      status: 'healthy',
      responseTime: 2340,
      uptime: 99.8,
      errorRate: 0.2
    },
    {
      service: 'FHIR Interoperability',
      status: 'healthy',
      responseTime: 340,
      uptime: 99.7,
      errorRate: 0.3
    },
    {
      service: 'Mutation Analysis Pipeline',
      status: 'degraded',
      responseTime: 3840,
      uptime: 98.5,
      errorRate: 1.5
    }
  ])

  // Sample data for charts
  const usageData = [
    { time: '00:00', requests: 1200, computeUnits: 2400 },
    { time: '04:00', requests: 800, computeUnits: 1600 },
    { time: '08:00', requests: 3200, computeUnits: 6400 },
    { time: '12:00', requests: 4500, computeUnits: 9000 },
    { time: '16:00', requests: 3800, computeUnits: 7600 },
    { time: '20:00', requests: 2100, computeUnits: 4200 }
  ]

  const tierDistribution = [
    { name: 'Enterprise Plus', value: 12, color: '#8b5cf6' },
    { name: 'Enterprise', value: 34, color: '#3b82f6' },
    { name: 'Professional', value: 89, color: '#10b981' },
    { name: 'Basic', value: 112, color: '#f59e0b' }
  ]

  const revenueData = [
    { month: 'Jul', revenue: 624000, growth: 12.5 },
    { month: 'Aug', revenue: 687000, growth: 15.2 },
    { month: 'Sep', revenue: 742000, growth: 18.8 },
    { month: 'Oct', revenue: 798000, growth: 22.3 },
    { month: 'Nov', revenue: 847000, growth: 25.1 },
    { month: 'Dec', revenue: 912000, growth: 28.7 }
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise_plus': return 'bg-purple-500'
      case 'enterprise': return 'bg-blue-500'
      case 'professional': return 'bg-green-500'
      case 'basic': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'down': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'degraded': return <AlertCircle className="h-4 w-4" />
      case 'down': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI-Driven Personalized Medicine Platform
            </h1>
            <p className="text-gray-600 mt-2">
              Data-Centric PaaS Dashboard - Industry Standard Healthcare AI
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600">
              99.7% Uptime
            </Badge>
            <Badge variant="outline" className="text-blue-600">
              HIPAA Compliant
            </Badge>
            <Badge variant="outline" className="text-purple-600">
              FedRAMP Ready
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(platformMetrics.totalAPIRequests / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(platformMetrics.totalRevenue / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground">
                +28.7% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformMetrics.averageResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                -15ms from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="services">AI Services</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>API Usage Trends</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time API requests and compute unit consumption
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="API Requests"
                      />
                      <Line
                        type="monotone"
                        dataKey="computeUnits"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Compute Units"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Service Health</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time monitoring of AI services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceHealth.map((service) => (
                      <div key={service.service} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={getStatusColor(service.status)}>
                            {getStatusIcon(service.status)}
                          </div>
                          <div>
                            <div className="font-medium">{service.service}</div>
                            <div className="text-sm text-gray-500">
                              {service.responseTime}ms • {service.uptime}% uptime
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={service.status === 'healthy' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue and Tier Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Revenue Growth</span>
                  </CardTitle>
                  <CardDescription>
                    Monthly recurring revenue and growth rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${(value as number / 1000).toFixed(0)}K` : `${value}%`,
                          name === 'revenue' ? 'Revenue' : 'Growth Rate'
                        ]}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Subscription Tiers</span>
                  </CardTitle>
                  <CardDescription>
                    Distribution of tenants across subscription tiers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tierDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tierDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {tierDistribution.map((tier) => (
                      <div key={tier.name} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-sm">{tier.name}: {tier.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Management</CardTitle>
                <CardDescription>
                  Manage healthcare organizations using the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getTierColor(tenant.tier)}`} />
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-gray-500">
                            {tenant.tier.replace('_', ' ').toUpperCase()} • {tenant.apiUsage.toLocaleString()} API calls
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">${tenant.monthlySpend.toLocaleString()}/mo</div>
                          <div className="text-sm text-gray-500">
                            Last active: {new Date(tenant.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={tenant.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {tenant.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>Clinical Decision Support</span>
                  </CardTitle>
                  <CardDescription>
                    AI-powered diagnostic and therapeutic recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Accuracy Rate</span>
                      <span className="font-medium">94.7%</span>
                    </div>
                    <Progress value={94.7} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Daily Predictions</div>
                        <div className="font-medium">12,847</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Avg Response</div>
                        <div className="font-medium">185ms</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Patient App Generator</span>
                  </CardTitle>
                  <CardDescription>
                    Personalized treatment experiences with AI agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Engagement Rate</span>
                      <span className="font-medium">87.3%</span>
                    </div>
                    <Progress value={87.3} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Apps Generated</div>
                        <div className="font-medium">3,247</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Avg Generation</div>
                        <div className="font-medium">2.3s</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>FHIR Interoperability</span>
                  </CardTitle>
                  <CardDescription>
                    Seamless EHR integration and data exchange
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Integration Success</span>
                      <span className="font-medium">98.9%</span>
                    </div>
                    <Progress value={98.9} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Daily Syncs</div>
                        <div className="font-medium">8,923</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Avg Sync Time</div>
                        <div className="font-medium">340ms</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Mutation Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced genomic variant analysis pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Analysis Accuracy</span>
                      <span className="font-medium">96.2%</span>
                    </div>
                    <Progress value={96.2} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Daily Analyses</div>
                        <div className="font-medium">1,247</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Avg Processing</div>
                        <div className="font-medium">3.8s</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Platform Performance Metrics</CardTitle>
                  <CardDescription>
                    Real-time monitoring of key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">99.7%</div>
                      <div className="text-sm text-gray-500">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">245ms</div>
                      <div className="text-sm text-gray-500">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">5.8M</div>
                      <div className="text-sm text-gray-500">Compute Units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">2.4TB</div>
                      <div className="text-sm text-gray-500">Data Processed</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>68%</span>
                      </div>
                      <Progress value={68} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Usage</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest platform events and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <div className="text-sm font-medium">New tenant onboarded</div>
                        <div className="text-xs text-gray-500">Baptist Health Louisville</div>
                        <div className="text-xs text-gray-400">2 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <div className="text-sm font-medium">AI model updated</div>
                        <div className="text-xs text-gray-500">Clinical Decision Support v2.1.1</div>
                        <div className="text-xs text-gray-400">15 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div>
                        <div className="text-sm font-medium">FHIR sync completed</div>
                        <div className="text-xs text-gray-500">8,923 records processed</div>
                        <div className="text-xs text-gray-400">1 hour ago</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                      <div>
                        <div className="text-sm font-medium">Performance alert</div>
                        <div className="text-xs text-gray-500">High latency detected</div>
                        <div className="text-xs text-gray-400">2 hours ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Compliance Status</span>
                  </CardTitle>
                  <CardDescription>
                    Current compliance certifications and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>HIPAA Compliance</span>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>GDPR Compliance</span>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SOC 2 Type II</span>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ISO 27001</span>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Certified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>FedRAMP Authorization</span>
                      <Badge variant="outline" className="text-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Metrics</CardTitle>
                  <CardDescription>
                    Security events and threat monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Security Score</span>
                      <span className="font-medium text-green-600">98.5/100</span>
                    </div>
                    <Progress value={98.5} className="w-full" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Blocked Threats</div>
                        <div className="font-medium">247</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Failed Logins</div>
                        <div className="font-medium">12</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Data Encrypted</div>
                        <div className="font-medium">100%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Vulnerability Score</div>
                        <div className="font-medium text-green-600">Low</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  Recent compliance and security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      timestamp: '2024-01-15T10:30:00Z',
                      event: 'data_access',
                      user: 'system',
                      resource: 'patient_data',
                      status: 'success'
                    },
                    {
                      timestamp: '2024-01-15T10:25:00Z',
                      event: 'authentication',
                      user: 'admin@baptisthealth.com',
                      resource: 'platform_dashboard',
                      status: 'success'
                    },
                    {
                      timestamp: '2024-01-15T10:20:00Z',
                      event: 'data_export',
                      user: 'analyst@nortonhealthcare.org',
                      resource: 'clinical_reports',
                      status: 'success'
                    }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between text-sm border-b pb-2">
                      <div>
                        <div className="font-medium">{log.event.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-gray-500">{log.user} • {log.resource}</div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={log.status === 'success' ? 'default' : 'destructive'}
                          className="mb-1"
                        >
                          {log.status}
                        </Badge>
                        <div className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}