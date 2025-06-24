'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, User, Stethoscope, Users, Shield, Clock, CheckCircle } from 'lucide-react';

interface HealthlinkGenomicTwinInterfaceProps {
  userRole?: string;
  userId?: string;
  patientId?: string;
}

interface QueryResult {
  success: boolean;
  data: {
    type: string;
    content: string;
    timestamp: string;
    [key: string]: any;
  };
  metadata: {
    agent: string;
    queryType: string;
    efficiencyGain?: string;
  };
}

export function HealthlinkGenomicTwinInterface({
  userRole = 'physician',
  userId = 'user-001',
  patientId
}: HealthlinkGenomicTwinInterfaceProps) {
  const [activeTab, setActiveTab] = useState('patient_care');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load system status on component mount
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/healthlink-genomic-twin');
      const data = await response.json();

      if (data.success) {
        setSystemStatus(data.data);
      } else {
        setError('System status check failed');
      }
    } catch (error) {
      setError('Unable to connect to Healthlink-Genomic-Twin AI system');
    }
  };

  const submitQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const context = {
        userId,
        userRole,
        patientId,
        sessionId: `session-${Date.now()}`,
        geographicArea: 'Jefferson County',
        dataType: getDataTypeForTab(activeTab),
        taskType: getTaskTypeForTab(activeTab)
      };

      const response = await fetch('/api/healthlink-genomic-twin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          agentType: activeTab,
          context
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResults(prev => [result, ...prev]);
        setQuery('');
      } else {
        setError(result.error || 'Query processing failed');
      }
    } catch (error) {
      setError('Failed to submit query');
    } finally {
      setIsLoading(false);
    }
  };

  const getDataTypeForTab = (tab: string) => {
    switch (tab) {
      case 'community_health':
        return 'population_health';
      default:
        return undefined;
    }
  };

  const getTaskTypeForTab = (tab: string) => {
    switch (tab) {
      case 'clinical_efficiency':
        return 'emr_navigation';
      default:
        return undefined;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'patient_care':
        return <User className="w-4 h-4" />;
      case 'clinical_efficiency':
        return <Stethoscope className="w-4 h-4" />;
      case 'community_health':
        return <Users className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'patient_care':
        return 'Personalized patient care support and navigation';
      case 'clinical_efficiency':
        return 'Streamline clinical workflows and reduce administrative burden';
      case 'community_health':
        return 'Population health analysis and community program support';
      default:
        return '';
    }
  };

  const renderResult = (result: QueryResult, index: number) => {
    const { data, metadata } = result;

    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{metadata.agent}</Badge>
              <Badge variant="secondary">{metadata.queryType}</Badge>
              {metadata.efficiencyGain && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {metadata.efficiencyGain}
                </Badge>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{data.content}</p>
          </div>

          {/* Render additional data based on response type */}
          {data.type === 'appointment_response' && data.availableSlots && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Available Appointments</h4>
              <div className="space-y-2">
                {data.availableSlots.map((slot: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{slot.date} at {slot.time}</span>
                    <span className="text-blue-600">{slot.provider}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.type === 'educational_response' && data.materials && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Educational Materials</h4>
              <div className="space-y-1">
                {data.materials.map((material: any, i: number) => (
                  <div key={i} className="text-sm text-green-800">
                    • {material.title} ({material.type})
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.type === 'lab_results_response' && data.alerts && data.alerts.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Lab Alerts</h4>
              <div className="space-y-1">
                {data.alerts.map((alert: any, i: number) => (
                  <div key={i} className="text-sm text-yellow-800">
                    ⚠️ {alert.alert} ({alert.priority} priority)
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Healthlink-Genomic-Twin AI
        </h1>
        <p className="text-lg text-gray-600">
          Baptist Health Louisville's Intelligent Healthcare Assistant
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            <span>Privacy-First Design</span>
          </div>
        </div>
      </div>

      {/* System Status */}
      {systemStatus && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            System Status: {systemStatus.status} | Organization: {systemStatus.organization}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patient_care" className="flex items-center gap-2">
            {getTabIcon('patient_care')}
            Patient Care
          </TabsTrigger>
          <TabsTrigger value="clinical_efficiency" className="flex items-center gap-2">
            {getTabIcon('clinical_efficiency')}
            Clinical Efficiency
          </TabsTrigger>
          <TabsTrigger value="community_health" className="flex items-center gap-2">
            {getTabIcon('community_health')}
            Community Health
          </TabsTrigger>
        </TabsList>

        {['patient_care', 'clinical_efficiency', 'community_health'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTabIcon(tab)}
                  {tab === 'patient_care' && 'Patient Care Navigator'}
                  {tab === 'clinical_efficiency' && 'Clinical Efficiency Assistant'}
                  {tab === 'community_health' && 'Community Health Coordinator'}
                </CardTitle>
                <CardDescription>
                  {getTabDescription(tab)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {tab === 'patient_care' && 'Patient Question or Care Request'}
                    {tab === 'clinical_efficiency' && 'Clinical Task or EMR Query'}
                    {tab === 'community_health' && 'Community Health Analysis Request'}
                  </label>
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      tab === 'patient_care'
                        ? "e.g., What should I do after my knee surgery? How do I manage my diabetes?"
                        : tab === 'clinical_efficiency'
                        ? "e.g., Show me the latest lab results for patient. Help me draft a SOAP note."
                        : "e.g., Analyze diabetes prevalence in Jefferson County. Evaluate our community programs."
                    }
                    className="min-h-[100px]"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {tab === 'patient_care' && 'Personalized, patient-centered care support'}
                    {tab === 'clinical_efficiency' && 'Streamline workflows and reduce burnout'}
                    {tab === 'community_health' && 'Data-driven community health insights'}
                  </div>
                  <Button
                    onClick={submitQuery}
                    disabled={isLoading || !query.trim()}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Submit Query
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Responses</h2>
          {results.map((result, index) => renderResult(result, index))}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>
          Healthlink-Genomic-Twin AI | Baptist Health Louisville |
          Powered by IRIS SDK Scaffold | Privacy-First Design
        </p>
      </div>
    </div>
  );
}