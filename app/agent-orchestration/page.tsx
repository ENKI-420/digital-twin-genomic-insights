"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Activity,
  Brain,
  Building2,
  MessageSquare,
  Network,
  Shield,
  Stethoscope,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react"

interface Agent {
  id: string
  name: string
  department: string
  status: 'active' | 'inactive' | 'maintenance'
  capabilities: string[]
  messagesProcessed: number
  avgResponseTime: number
  healthScore: number
}

interface Message {
  id: string
  from: string
  to: string
  type: string
  priority: string
  timestamp: string
  action?: string
}

export default function AgentOrchestrationPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [systemHealth, setSystemHealth] = useState(95)

  useEffect(() => {
    // Mock data
    setAgents([
      {
        id: 'radiology-agent-001',
        name: 'Radiology AI Assistant',
        department: 'Radiology',
        status: 'active',
        capabilities: ['dicom_triage', 'anomaly_detection', 'report_generation'],
        messagesProcessed: 1247,
        avgResponseTime: 850,
        healthScore: 98
      },
      {
        id: 'genomics-agent-001',
        name: 'Genomics AI Assistant',
        department: 'Genomics',
        status: 'active',
        capabilities: ['variant_classification', 'acmg_tagging', 'digital_twin_creation'],
        messagesProcessed: 892,
        avgResponseTime: 1200,
        healthScore: 96
      },
      {
        id: 'oncology-agent-001',
        name: 'Oncology AI Assistant',
        department: 'Oncology',
        status: 'active',
        capabilities: ['treatment_planning', 'nccn_guidelines', 'clinical_trials'],
        messagesProcessed: 673,
        avgResponseTime: 950,
        healthScore: 94
      },
      {
        id: 'admin-agent-001',
        name: 'Administrative Assistant',
        department: 'Administration',
        status: 'active',
        capabilities: ['scheduling', 'billing', 'preauthorization'],
        messagesProcessed: 2184,
        avgResponseTime: 450,
        healthScore: 99
      },
      {
        id: 'research-agent-001',
        name: 'Research AI Assistant',
        department: 'Research',
        status: 'active',
        capabilities: ['trial_matching', 'cohort_generation', 'grant_writing'],
        messagesProcessed: 421,
        avgResponseTime: 2100,
        healthScore: 91
      }
    ])

    setMessages([
      {
        id: 'msg-001',
        from: 'radiology-agent-001',
        to: 'oncology-agent-001',
        type: 'request',
        priority: 'critical',
        timestamp: new Date().toISOString(),
        action: 'urgent_review'
      },
      {
        id: 'msg-002',
        from: 'genomics-agent-001',
        to: 'oncology-agent-001',
        type: 'event',
        priority: 'high',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        action: 'pathogenic_variant_detected'
      },
      {
        id: 'msg-003',
        from: 'admin-agent-001',
        to: '*',
        type: 'broadcast',
        priority: 'normal',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        action: 'system_maintenance_scheduled'
      }
    ])
  }, [])

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, any> = {
      'Radiology': Stethoscope,
      'Genomics': Brain,
      'Oncology': Activity,
      'Administration': Building2,
      'Research': Users
    }
    const Icon = icons[department] || Building2
    return <Icon className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Network className="h-8 w-8 mr-3 text-blue-600" />
            Agent Orchestration Hub
          </h1>
          <p className="text-gray-600 mt-2">
            Federated AI agents working together for healthcare excellence
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">System Health</p>
            <p className="text-2xl font-bold text-green-600">{systemHealth}%</p>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages/Hour</p>
                <p className="text-2xl font-bold">847</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">950ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Saved</p>
                <p className="text-2xl font-bold">$124K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Active Agents</TabsTrigger>
          <TabsTrigger value="messages">Message Flow</TabsTrigger>
          <TabsTrigger value="security">Security & Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedAgent?.id === agent.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      {getDepartmentIcon(agent.department)}
                      <span className="ml-2">{agent.name}</span>
                    </CardTitle>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Messages Processed</span>
                      <span className="font-medium">{agent.messagesProcessed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="font-medium">{agent.avgResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Health Score</span>
                      <span className={`font-medium ${
                        agent.healthScore > 95 ? 'text-green-600' :
                        agent.healthScore > 85 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {agent.healthScore}%
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-2">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Message Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                        <span className="text-sm font-medium">
                          {message.action?.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">
                        {agents.find(a => a.id === message.from)?.name || message.from}
                      </span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">
                        {message.to === '*' ? 'All Agents' :
                         agents.find(a => a.id === message.to)?.name || message.to}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>PHI-Grade Security Active</AlertTitle>
            <AlertDescription>
              All agent communications are encrypted end-to-end with field-level tokenization for PHI data.
              ABAC and RBAC policies are enforced in real-time.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>RBAC Policies</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ABAC Rules</span>
                    <Badge variant="outline">247 Rules</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Zero Trust</span>
                    <Badge variant="outline">Enforced</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>GDPR Ready</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>FedRAMP Authorized</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Messages Logged</span>
                    <span className="font-medium">12.4K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PHI Access Logs</span>
                    <span className="font-medium">3,891</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retention</span>
                    <span className="font-medium">7 Years</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDepartmentIcon(agent.department)}
                        <span className="text-sm">{agent.department}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Efficiency</p>
                          <p className="text-sm font-medium">
                            {Math.round((agent.healthScore / agent.avgResponseTime) * 1000)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Clinical Decisions Supported</span>
                      <span className="text-sm font-medium">2,847</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Time Saved (Hours)</span>
                      <span className="text-sm font-medium">412</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Errors Prevented</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
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