'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Server,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  agents: Map<string, any>;
  eventBus: {
    queueSize: number;
    retryCount: number;
    listenerCount: number;
  };
  governance: {
    totalRequests: number;
    allowedRequests: number;
    deniedRequests: number;
  };
  performance: {
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
  };
}

export default function SystemHealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents/health');
      const data = await response.json();

      if (data.status === 'success') {
        setHealth(data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch health data');
      }
    } catch (err) {
      setError('Network error while fetching health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
          <Button onClick={fetchHealth} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return null;
  }

  const agentArray = Array.from(health.agents.entries());
  const healthyAgents = agentArray.filter(([_, status]) => status.health === 'healthy').length;
  const totalAgents = agentArray.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Server className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Federated Agent System Health</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={health.overall === 'healthy' ? 'default' : 'destructive'}
            className="flex items-center space-x-1"
          >
            {getHealthIcon(health.overall)}
            <span className="capitalize">{health.overall}</span>
          </Badge>
          <Button onClick={fetchHealth} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            {getHealthIcon(health.overall)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{health.overall}</div>
            <p className="text-xs text-muted-foreground">
              System health status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyAgents}/{totalAgents}</div>
            <Progress value={(healthyAgents / totalAgents) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              Healthy agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health.performance.avgResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(health.performance.errorRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Bus Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Event Bus</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Queue Size</span>
              <Badge variant="outline">{health.eventBus.queueSize}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Retry Count</span>
              <Badge variant="outline">{health.eventBus.retryCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Listeners</span>
              <Badge variant="outline">{health.eventBus.listenerCount}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Governance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Governance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Requests</span>
              <Badge variant="outline">{health.governance.totalRequests}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Allowed Requests</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {health.governance.allowedRequests}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Denied Requests</span>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                {health.governance.deniedRequests}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Agent Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentArray.map(([agentId, status]) => (
              <div key={agentId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getHealthIcon(status.health)}
                  <div>
                    <p className="font-medium text-sm">{agentId}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {status.health} • Load: {(status.load * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Badge variant={status.health === 'healthy' ? 'default' : 'destructive'}>
                  {status.health}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Performance charts would be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}