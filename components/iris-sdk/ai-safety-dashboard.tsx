"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts'
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Cpu,
  Clock,
  Lock,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Database,
  Globe,
  Refresh
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Types
interface SecurityMetrics {
  totalRequests: number
  blockedRequests: number
  securityViolations: number
  phiDetected: number
  promptInjections: number
  averageResponseTime: number
  systemHealth: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface SecurityEvent {
  id: string
  timestamp: string
  type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  description: string
  user_id?: string
  ip_address: string
  resolved: boolean
}

interface ModelMetrics {
  model_name: string
  total_calls: number
  success_rate: number
  avg_response_time: number
  fallback_rate: number
  cost_estimate: number
}

interface DashboardData {
  security: SecurityMetrics
  events: SecurityEvent[]
  models: ModelMetrics[]
  userActivity: any[]
  timeSeriesData: any[]
  alerts: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AISafetyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')
  const { toast } = useToast()

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/iris/monitoring?timeRange=${selectedTimeRange}`)
      if (!response.ok) throw new Error('Failed to fetch monitoring data')

      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch monitoring data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedTimeRange, toast])

  // Auto-refresh functionality
  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, autoRefresh, refreshInterval])

  // Handle security alert
  const handleSecurityAlert = async (eventId: string, action: 'acknowledge' | 'investigate' | 'resolve') => {
    try {
      const response = await fetch(`/api/iris/monitoring/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        await fetchData() // Refresh data
        toast({
          title: "Success",
          description: `Security event ${action}d successfully`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} security event`,
        variant: "destructive"
      })
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading AI Safety Dashboard...</p>
        </div>
      </div>
    )
  }

  const threatLevelColor = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Safety Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of IRIS SDK + ISIS MCP
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${threatLevelColor[data.security.threatLevel]}`} />
            Threat Level: {data.security.threatLevel.toUpperCase()}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Refresh className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>

          <Button onClick={fetchData} size="sm">
            <Refresh className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Security Alerts</AlertTitle>
          <AlertDescription>
            {data.alerts.length} critical security events require immediate attention.
            <Button variant="link" className="p-0 h-auto ml-2 text-destructive">
              View Details →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.security.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Violations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.security.securityViolations}</div>
            <p className="text-xs text-muted-foreground">
              {data.security.blockedRequests} requests blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PHI Detection</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.security.phiDetected}</div>
            <p className="text-xs text-muted-foreground">
              Protected health information detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.security.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall System Health</span>
              <Badge variant={data.security.systemHealth > 95 ? 'default' : 'destructive'}>
                {data.security.systemHealth}%
              </Badge>
            </div>
            <Progress value={data.security.systemHealth} className="w-full" />

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm">AI Models</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm">Security Layer</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm">Audit System</p>
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Request Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="requests" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="violations" stroke="#ff7300" fill="#ff7300" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Model Usage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Model Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.models}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ model_name, percent }) => `${model_name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_calls"
                    >
                      {data.models.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {data.events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {event.severity === 'critical' && <AlertCircle className="h-5 w-5 text-red-500" />}
                          {event.severity === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
                          {event.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          {event.severity === 'info' && <CheckCircle className="h-5 w-5 text-green-500" />}

                          <Badge variant="outline" className={
                            event.severity === 'critical' ? 'border-red-500 text-red-500' :
                            event.severity === 'error' ? 'border-red-400 text-red-400' :
                            event.severity === 'warning' ? 'border-yellow-500 text-yellow-500' :
                            'border-green-500 text-green-500'
                          }>
                            {event.severity}
                          </Badge>
                        </div>

                        <div>
                          <p className="font-medium">{event.type}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()} | IP: {event.ip_address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!event.resolved && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSecurityAlert(event.id, 'acknowledge')}
                            >
                              Acknowledge
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSecurityAlert(event.id, 'investigate')}
                            >
                              Investigate
                            </Button>
                          </>
                        )}
                        {event.resolved && (
                          <Badge variant="secondary">Resolved</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.models.map((model) => (
                  <div key={model.model_name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{model.model_name}</h4>
                      <Badge variant="outline">
                        {model.total_calls} calls
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium text-green-600">{model.success_rate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Response</p>
                        <p className="font-medium">{model.avg_response_time}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fallback Rate</p>
                        <p className="font-medium text-orange-600">{model.fallback_rate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost</p>
                        <p className="font-medium">${model.cost_estimate}</p>
                      </div>
                    </div>

                    <Progress value={model.success_rate} className="w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#8884d8" name="Total Requests" />
                  <Bar dataKey="violations" fill="#ff7300" name="Security Violations" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>PHI Protection</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit Logging</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Access Controls</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Encryption</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SOC 2 Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Security</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Availability</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Processing Integrity</span>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidentiality</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Last Audit</span>
                    <span className="text-sm">2024-01-15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next Audit</span>
                    <span className="text-sm">2024-07-15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compliance Score</span>
                    <Badge variant="default">98%</Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}