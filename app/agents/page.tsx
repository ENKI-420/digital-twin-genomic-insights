import React from 'react';
import SystemHealthDashboard from '@/components/agents/SystemHealthDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Activity,
  Shield,
  Users,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export default function AgentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Federated Agent System</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage the hybrid federated system with department-specific autonomous agents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Start All
          </Button>
          <Button variant="outline" size="sm">
            <Pause className="h-4 w-4 mr-2" />
            Pause All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted-foreground">Total Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Security Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Department Agents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Radiology */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Radiology</h3>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Active
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Agent:</span>
                  <span className="font-mono">radiology-agent</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>25%</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restart
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </Button>
              </div>
            </div>

            {/* Genomics */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Genomics</h3>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Agent:</span>
                  <span className="font-mono">genomics-agent</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>45%</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restart
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </Button>
              </div>
            </div>

            {/* Oncology */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Oncology</h3>
                <Badge variant="default" className="bg-purple-100 text-purple-800">
                  Active
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Agent:</span>
                  <span className="font-mono">oncology-agent</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>30%</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restart
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </Button>
              </div>
            </div>

            {/* Research */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Research</h3>
                <Badge variant="default" className="bg-orange-100 text-orange-800">
                  Active
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Agent:</span>
                  <span className="font-mono">research-agent</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Load:</span>
                  <span>60%</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restart
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Dashboard */}
      <SystemHealthDashboard />

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🔐 PHI-Grade Security</h4>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption, role-based access control, and audit logging for HIPAA compliance
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🔄 Fault Tolerance</h4>
              <p className="text-sm text-muted-foreground">
                Automatic failover, circuit breakers, and health monitoring for high availability
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📊 Real-time Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Live performance metrics, agent status monitoring, and system health dashboards
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🤖 AI-Powered Agents</h4>
              <p className="text-sm text-muted-foreground">
                Department-specific autonomous agents with specialized AI capabilities
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🔗 Federated Communication</h4>
              <p className="text-sm text-muted-foreground">
                Secure message bus with event-driven architecture for inter-agent communication
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">⚖️ Governance Engine</h4>
              <p className="text-sm text-muted-foreground">
                Unified policy enforcement with ABAC/RBAC via OPA for comprehensive access control
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}