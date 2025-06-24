"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Brain,
  FileText,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
  Download,
  Loader2,
  CheckCircle,
  BookOpen,
  Users,
  Target
} from 'lucide-react'
import { aiConfig } from '@/lib/config/environment'

interface AnalysisResult {
  type: 'summary' | 'mutation-detail' | 'treatment' | 'risk-flags' | 'consultation' | 'trials'
  title: string
  content: string
  confidence: number
  sources?: string[]
  actionable_items?: string[]
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
}

interface GenomicData {
  patient_id: string
  mutations: Array<{
    gene: string
    variant: string
    classification: string
    hgvs: string
    clinical_significance: string
  }>
  report_summary: string
  lab_values: any[]
  patient_demographics: {
    age: number
    gender: string
    ethnicity?: string
  }
}

interface EnhancedAnalysisPanelProps {
  genomicData: GenomicData
  reportId: string
  onAnalysisComplete?: (result: AnalysisResult) => void
}

export default function EnhancedAnalysisPanel({
  genomicData,
  reportId,
  onAnalysisComplete
}: EnhancedAnalysisPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, AnalysisResult>>({})
  const [expandedResult, setExpandedResult] = useState<string | null>(null)

  const analysisOptions = [
    {
      id: 'summarize',
      title: 'Summarize Report',
      description: 'AI-powered comprehensive report summary',
      icon: <FileText className="h-4 w-4" />,
      color: 'blue',
      implemented: true
    },
    {
      id: 'mutation-detail',
      title: 'Elaborate on Specific Mutation',
      description: 'Deep dive into mutation pathogenicity and mechanism',
      icon: <Brain className="h-4 w-4" />,
      color: 'purple',
      implemented: true
    },
    {
      id: 'treatment-options',
      title: 'Suggest Treatment Options',
      description: 'NCCN Guidelines-based treatment recommendations',
      icon: <Stethoscope className="h-4 w-4" />,
      color: 'green',
      implemented: true
    },
    {
      id: 'risk-flags',
      title: 'Flag High-Risk Mutations',
      description: 'AI-driven risk stratification and alerts',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'red',
      implemented: true
    },
    {
      id: 'consultation-summary',
      title: 'Create Draft Consultation Summary',
      description: 'Markdown → PDF consultation note generator',
      icon: <Download className="h-4 w-4" />,
      color: 'orange',
      implemented: true
    },
    {
      id: 'clinical-trials',
      title: 'Suggest Clinical Trials',
      description: 'Match patient to relevant precision medicine trials',
      icon: <FlaskConical className="h-4 w-4" />,
      color: 'indigo',
      implemented: true
    }
  ]

  const runAnalysis = async (analysisType: string) => {
    setLoading(analysisType)

    try {
      const response = await fetch('/api/ai/enhanced-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType,
          genomicData,
          reportId,
          patientSafety: analysisType === 'patient-facing' // For patient-safe summaries
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result: AnalysisResult = await response.json()

      setResults(prev => ({
        ...prev,
        [analysisType]: result
      }))

      onAnalysisComplete?.(result)

      // Auto-expand the result
      setExpandedResult(analysisType)

    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setLoading(null)
    }
  }

  const downloadConsultationPDF = async (result: AnalysisResult) => {
    try {
      const response = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: result.content,
          title: result.title,
          patientId: genomicData.patient_id,
          reportId
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `consultation-summary-${genomicData.patient_id}-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
      }
    } catch (error) {
      console.error('PDF generation error:', error)
    }
  }

  const getRiskBadgeColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisOptions.map((option) => (
          <Card
            key={option.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              results[option.id] ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                  {option.icon}
                </div>
                {results[option.id] && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <CardTitle className="text-sm">{option.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">{option.description}</p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => runAnalysis(option.id)}
                disabled={loading === option.id || !option.implemented}
              >
                {loading === option.id ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  option.icon
                )}
                {loading === option.id ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Results */}
      {Object.entries(results).map(([type, result]) => (
        <Card key={type} className="overflow-hidden">
          <CardHeader className="cursor-pointer" onClick={() =>
            setExpandedResult(expandedResult === type ? null : type)
          }>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {analysisOptions.find(opt => opt.id === type)?.icon}
                {result.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {result.risk_level && (
                  <Badge variant={getRiskBadgeColor(result.risk_level)}>
                    {result.risk_level.toUpperCase()} RISK
                  </Badge>
                )}
                <Badge variant="outline">
                  {result.confidence}% confidence
                </Badge>
                {type === 'consultation-summary' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadConsultationPDF(result)
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {expandedResult === type && (
            <CardContent>
              <ScrollArea className="h-96">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{result.content}</div>

                  {result.actionable_items && result.actionable_items.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Actionable Items:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.actionable_items.map((item, index) => (
                          <li key={index} className="text-sm">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.sources && result.sources.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Sources:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.sources.map((source, index) => (
                          <li key={index} className="text-xs text-gray-600">{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Patient-Safe Summary Option */}
      <Card className="border-dashed border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Users className="h-5 w-5" />
            Patient-Facing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Generate a 9th-grade reading level summary for patient education
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => runAnalysis('patient-facing')}
            disabled={loading === 'patient-facing'}
          >
            {loading === 'patient-facing' ? (
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
            ) : (
              <BookOpen className="h-3 w-3 mr-2" />
            )}
            Generate Patient Summary
          </Button>
        </CardContent>
      </Card>

      {/* HIPAA Compliance Notice */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        🔒 All AI analyses are HIPAA-compliant with end-to-end encryption.
        Analysis results are logged for audit purposes and quality improvement.
      </div>
    </div>
  )
}