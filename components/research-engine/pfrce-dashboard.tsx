"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Radar,
  Target,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Eye,
  Settings,
  Bell,
} from "lucide-react"
import { PFRCECore, type FederalOpportunity, type ResearchCoordination } from "@/lib/research-engine/pfrce-core"

export function PFRCEDashboard() {
  const [pfrceCore] = useState(() => new PFRCECore())
  const [opportunities, setOpportunities] = useState<FederalOpportunity[]>([])
  const [coordinations, setCoordinations] = useState<ResearchCoordination[]>([])
  const [watchtowerActive, setWatchtowerActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    highPriorityOpportunities: 0,
    activeCoordinations: 0,
    totalFundingPotential: 0,
    averageMatchScore: 0,
  })

  useEffect(() => {
    initializePFRCE()
  }, [])

  const initializePFRCE = async () => {
    setIsLoading(true)
    try {
      // Initialize watchtower
      await pfrceCore.initializeWatchtower()
      setWatchtowerActive(true)

      // Load initial data
      await loadOpportunities()
      await loadCoordinations()

      console.log("🚀 PFRCE Dashboard initialized")
    } catch (error) {
      console.error("Failed to initialize PFRCE:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOpportunities = async () => {
    try {
      // Mock loading opportunities - in real implementation, this would call the core
      const mockOpportunities: FederalOpportunity[] = [
        {
          id: "NIH_R01_CA_2024_001",
          source: "NIH",
          type: "R01",
          title: "Precision Oncology Implementation in Clinical Practice",
          agency: "NIH",
          institute: "NCI",
          program: "Cancer Prevention and Control Research Program",
          announcementNumber: "RFA-CA-24-015",
          dueDate: "2024-03-15",
          budgetCap: 500000,
          duration: 60,
          description: "Support implementation of precision oncology approaches in clinical practice settings",
          keyWords: ["precision oncology", "genomics", "clinical implementation", "CPIC"],
          eligibilityCriteria: ["Academic medical centers", "Healthcare systems", "Research institutions"],
          strategicPriorities: ["Cancer Moonshot", "Precision Medicine Initiative", "All of Us Research Program"],
          cpicAlignment: {
            genes: ["CYP2D6", "CYP2C19", "DPYD", "TPMT"],
            drugs: ["tamoxifen", "clopidogrel", "fluorouracil", "mercaptopurine"],
            guidelines: ["CPIC", "PharmGKB", "FDA"],
            evidenceLevel: "A",
            implementationScore: 95,
            reimbursementPotential: "high",
          },
          matchScore: 0.92,
          status: "active",
          submissionHistory: [],
        },
        {
          id: "SBIR_HHS_2024_001",
          source: "SBIR",
          type: "SBIR_I",
          title: "AI-Driven Clinical Trial Matching Platform",
          agency: "HHS",
          institute: "ONC",
          program: "Health IT Innovation",
          announcementNumber: "SBIR-24-HHS-001",
          dueDate: "2024-02-28",
          budgetCap: 300000,
          duration: 12,
          description: "Develop AI-powered platforms for automated clinical trial patient matching",
          keyWords: ["AI", "clinical trials", "patient matching", "automation"],
          eligibilityCriteria: ["Small businesses", "Startups", "Technology companies"],
          strategicPriorities: ["Health IT", "AI Innovation", "Clinical Research"],
          cpicAlignment: {
            genes: ["CYP2D6", "CYP2C19"],
            drugs: ["warfarin", "clopidogrel"],
            guidelines: ["CPIC"],
            evidenceLevel: "B",
            implementationScore: 75,
            reimbursementPotential: "medium",
          },
          matchScore: 0.88,
          status: "active",
          submissionHistory: [],
        },
        {
          id: "DOD_BAA_2024_001",
          source: "DOD",
          type: "BAA",
          title: "Advanced Medical Technologies for Military Healthcare",
          agency: "DOD",
          institute: "DARPA",
          program: "Biological Technologies Office",
          announcementNumber: "HR001124S0001",
          dueDate: "2024-06-30",
          budgetCap: 2000000,
          duration: 36,
          description: "Develop advanced medical technologies for military and veteran healthcare",
          keyWords: ["military medicine", "precision medicine", "genomics", "AI"],
          eligibilityCriteria: ["Defense contractors", "Research institutions", "Technology companies"],
          strategicPriorities: ["Military Medicine", "Precision Medicine", "AI/ML"],
          cpicAlignment: {
            genes: ["CYP2D6", "CYP2C19", "COMT", "OPRM1"],
            drugs: ["morphine", "codeine", "tramadol"],
            guidelines: ["CPIC", "VA/DoD"],
            evidenceLevel: "A",
            implementationScore: 92,
            reimbursementPotential: "high",
          },
          matchScore: 0.85,
          status: "active",
          submissionHistory: [],
        },
      ]

      setOpportunities(mockOpportunities)

      // Calculate stats
      const totalFunding = mockOpportunities.reduce((sum, opp) => sum + opp.budgetCap, 0)
      const highPriority = mockOpportunities.filter((opp) => opp.matchScore > 0.8).length
      const avgMatch = mockOpportunities.reduce((sum, opp) => sum + opp.matchScore, 0) / mockOpportunities.length

      setStats((prev) => ({
        ...prev,
        totalOpportunities: mockOpportunities.length,
        highPriorityOpportunities: highPriority,
        totalFundingPotential: totalFunding,
        averageMatchScore: avgMatch,
      }))
    } catch (error) {
      console.error("Failed to load opportunities:", error)
    }
  }

  const loadCoordinations = async () => {
    try {
      const coordinations = await pfrceCore.getResearchCoordinations()
      setCoordinations(coordinations)

      setStats((prev) => ({
        ...prev,
        activeCoordinations: coordinations.length,
      }))
    } catch (error) {
      console.error("Failed to load coordinations:", error)
    }
  }

  const handleCreateCoordination = async () => {
    try {
      const newCoordination = await pfrceCore.createResearchCoordination({
        title: "New AGENT Implementation Study",
        type: "trial_registration",
      })

      setCoordinations((prev) => [...prev, newCoordination])
      console.log("Created new research coordination:", newCoordination.id)
    } catch (error) {
      console.error("Failed to create coordination:", error)
    }
  }

  const handleGenerateProposal = async (opportunity: FederalOpportunity) => {
    try {
      const proposal = await pfrceCore.generateGrantProposal(opportunity)
      console.log("Generated proposal:", proposal.id)
      // In real implementation, would update UI to show proposal
    } catch (error) {
      console.error("Failed to generate proposal:", error)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getMatchScoreBadge = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800"
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing PFRCE Watchtower...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Radar className="mr-3 h-8 w-8 text-blue-600" />
            PFRCE Command Center
          </h1>
          <p className="text-gray-600">Perpetual Federal Research Coordination Engine</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={watchtowerActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            <Eye className="mr-1 h-3 w-3" />
            Watchtower {watchtowerActive ? "Active" : "Inactive"}
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <Zap className="mr-1 h-3 w-3" />
            Auto-Coordination
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold">{stats.totalOpportunities}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-green-600">{stats.highPriorityOpportunities}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Coordinations</p>
                <p className="text-2xl font-bold">{stats.activeCoordinations}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Funding Potential</p>
                <p className="text-2xl font-bold">${(stats.totalFundingPotential / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Match Score</p>
                <p className={`text-2xl font-bold ${getMatchScoreColor(stats.averageMatchScore)}`}>
                  {(stats.averageMatchScore * 100).toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Federal Opportunities</TabsTrigger>
          <TabsTrigger value="coordinations">Research Coordinations</TabsTrigger>
          <TabsTrigger value="automation">Automation Engine</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Federal Funding Opportunities</h2>
            <Button onClick={loadOpportunities} variant="outline">
              <Radar className="mr-2 h-4 w-4" />
              Refresh Scan
            </Button>
          </div>

          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {opportunity.agency} • {opportunity.institute} • {opportunity.announcementNumber}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getMatchScoreBadge(opportunity.matchScore)}>
                        {(opportunity.matchScore * 100).toFixed(0)}% Match
                      </Badge>
                      <Badge variant="outline">{opportunity.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">{opportunity.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Budget Cap:</span>
                        <p className="text-gray-600">${opportunity.budgetCap.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p className="text-gray-600">{opportunity.duration} months</p>
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span>
                        <p className="text-gray-600">{new Date(opportunity.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">CPIC Alignment:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opportunity.cpicAlignment.genes.map((gene) => (
                            <Badge key={gene} variant="outline" className="text-xs">
                              {gene}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Strategic Priorities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opportunity.strategicPriorities.map((priority) => (
                            <Badge key={priority} variant="outline" className="text-xs">
                              {priority}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          Implementation Score: {opportunity.cpicAlignment.implementationScore}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleGenerateProposal(opportunity)}>
                          <Zap className="mr-1 h-3 w-3" />
                          Generate Proposal
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coordinations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Research Coordinations</h2>
            <Button onClick={handleCreateCoordination}>
              <Users className="mr-2 h-4 w-4" />
              New Coordination
            </Button>
          </div>

          {coordinations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Coordinations</h3>
                <p className="text-gray-600 mb-4">Create your first research coordination to get started.</p>
                <Button onClick={handleCreateCoordination}>
                  <Users className="mr-2 h-4 w-4" />
                  Create Coordination
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {coordinations.map((coordination) => (
                <Card key={coordination.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{coordination.title}</span>
                      <Badge variant="outline">{coordination.type.replace("_", " ")}</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      PI: {coordination.principalInvestigator} • {coordination.institution}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium">Compliance Status:</span>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center text-xs">
                            {coordination.compliance.irbApproval ? (
                              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                            )}
                            IRB Approval
                          </div>
                          <div className="flex items-center text-xs">
                            {coordination.compliance.cpicCompliance ? (
                              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                            )}
                            CPIC Compliance
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Funding Status:</span>
                        <div className="mt-1">
                          <p className="text-xs text-gray-600">
                            Secured: ${coordination.funding.securedFunding.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            Total Budget: ${coordination.funding.totalBudget.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Automation:</span>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center text-xs">
                            {coordination.automation.autoRegistration ? (
                              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            )}
                            Auto Registration
                          </div>
                          <div className="flex items-center text-xs">
                            {coordination.automation.autoMatching ? (
                              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            )}
                            Auto Matching
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Automation Engine Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Watchtower Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Federal Opportunity Scanning</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-Matching Engine</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Document Generation</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High-Priority Alerts</span>
                      <Badge className="bg-blue-100 text-blue-800">Email + Dashboard</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daily Digest</span>
                      <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compliance Monitoring</span>
                      <Badge className="bg-blue-100 text-blue-800">Real-time</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Scanned 47 new federal opportunities</span>
                  <span className="text-gray-500">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Generated proposal for NIH R01 opportunity</span>
                  <span className="text-gray-500">15 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Updated compliance status for 3 coordinations</span>
                  <span className="text-gray-500">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span>High-priority opportunity alert sent to stakeholders</span>
                  <span className="text-gray-500">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Match Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NIH Opportunities</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SBIR Opportunities</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={72} className="w-20" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DOD Opportunities</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={68} className="w-20" />
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPIC Implementation Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Level A Evidence</span>
                    <Badge className="bg-green-100 text-green-800">95% Coverage</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reimbursement Eligible</span>
                    <Badge className="bg-blue-100 text-blue-800">78% of Opportunities</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Implementation Ready</span>
                    <Badge className="bg-purple-100 text-purple-800">12 Guidelines</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Funding Pipeline Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$2.8M</div>
                  <div className="text-sm text-gray-600">Total Pipeline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$1.2M</div>
                  <div className="text-sm text-gray-600">High Probability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">$900K</div>
                  <div className="text-sm text-gray-600">Medium Probability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">$700K</div>
                  <div className="text-sm text-gray-600">Low Probability</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
