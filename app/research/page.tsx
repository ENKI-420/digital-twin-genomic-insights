"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, FileText, Users, DollarSign, Zap, Target, Database, Shield } from "lucide-react"
import { ResearchOpportunityCard } from "@/components/research/research-opportunity-card"
import { PatientMatchingPanel } from "@/components/research/patient-matching-panel"
import { DocumentGenerator } from "@/components/research/document-generator"
import { TrialRegistrationPanel } from "@/components/research/trial-registration-panel"
import { ComplianceMonitor } from "@/components/research/compliance-monitor"

export default function ResearchCoordinationCenter() {
  const [opportunities, setOpportunities] = useState([])
  const [patientMatches, setPatientMatches] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    totalOpportunities: 0,
    activeCoordinations: 0,
    matchedPatients: 0,
    generatedDocuments: 0,
    fundingPipeline: 0,
    complianceScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [watchtowerActive, setWatchtowerActive] = useState(false)

  useEffect(() => {
    loadResearchData()
    initializeWatchtower()
  }, [])

  const loadResearchData = async () => {
    try {
      // Load federal opportunities
      const oppResponse = await fetch("/api/research/opportunities")
      const opportunities = await oppResponse.json()
      setOpportunities(opportunities)

      // Load patient matches
      const patientResponse = await fetch("/api/research/patient-matches")
      const patients = await patientResponse.json()
      setPatientMatches(patients)

      // Load system metrics
      const metricsResponse = await fetch("/api/research/metrics")
      const metrics = await metricsResponse.json()
      setSystemMetrics(metrics)

      setLoading(false)
    } catch (error) {
      console.error("Failed to load research data:", error)
      setLoading(false)
    }
  }

  const initializeWatchtower = async () => {
    try {
      const response = await fetch("/api/research/watchtower", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })

      if (response.ok) {
        setWatchtowerActive(true)
      }
    } catch (error) {
      console.error("Failed to initialize watchtower:", error)
    }
  }

  const generateProposal = async (opportunityId) => {
    try {
      const response = await fetch("/api/research/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `proposal-${opportunityId}.pdf`
        a.click()
      }
    } catch (error) {
      console.error("Failed to generate proposal:", error)
    }
  }

  const exportTrialRegistry = async (trialId) => {
    try {
      const response = await fetch("/api/research/export-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trialId }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `trial-registry-${trialId}.xml`
        a.click()
      }
    } catch (error) {
      console.error("Failed to export trial registry:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Initializing Research Coordination Engine...</p>
          <p className="text-sm text-gray-600">Scanning federal opportunities and matching capabilities</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AGENT Research Coordination Center</h1>
            <p className="text-lg text-gray-600 mt-2">
              Perpetual Federal Research Coordination Engine (PFRCE) - Command & Control
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={watchtowerActive ? "default" : "secondary"} className="px-3 py-1">
              <Zap className="w-4 h-4 mr-1" />
              {watchtowerActive ? "Watchtower Active" : "Watchtower Inactive"}
            </Badge>
            <Button onClick={() => window.open("/api/research/export-dashboard", "_blank")}>
              <Download className="w-4 h-4 mr-2" />
              Export Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Federal Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalOpportunities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matched Patients</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.matchedPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Funding Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(systemMetrics.fundingPipeline / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Generated Docs</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.generatedDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Coordinations</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeCoordinations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics.complianceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="opportunities">Federal Opportunities</TabsTrigger>
          <TabsTrigger value="patients">Patient Matching</TabsTrigger>
          <TabsTrigger value="documents">Document Generation</TabsTrigger>
          <TabsTrigger value="trials">Trial Registration</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Federal Research Opportunities</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={loadResearchData}>
                <Search className="w-4 h-4 mr-2" />
                Refresh Scan
              </Button>
              <Button onClick={() => generateProposal("all")}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Batch Proposals
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <ResearchOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onGenerateProposal={generateProposal}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <PatientMatchingPanel patients={patientMatches} opportunities={opportunities} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentGenerator opportunities={opportunities} patients={patientMatches} />
        </TabsContent>

        <TabsContent value="trials" className="space-y-6">
          <TrialRegistrationPanel opportunities={opportunities} onExportRegistry={exportTrialRegistry} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceMonitor complianceScore={systemMetrics.complianceScore} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
