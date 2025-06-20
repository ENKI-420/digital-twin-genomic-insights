"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Mail,
  Calendar,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Presentation,
  Building,
  Award,
  Rocket,
} from "lucide-react"
import { BaptistProposalGenerator, type BaptistProposal } from "@/lib/funding/baptist-proposal-generator"

export function NortonProposalDashboard() {
  const [proposalGenerator] = useState(() => new BaptistProposalGenerator())
  const [proposalData, setProposalData] = useState<BaptistProposal | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAssets, setGeneratedAssets] = useState<string[]>([])

  useEffect(() => {
    // Initialize proposal data
    setProposalData(proposalGenerator["proposalData"])
  }, [proposalGenerator])

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      const pdfBlob = await proposalGenerator.generatePDF()
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = "AGENT_Baptist_Proposal.pdf"
      a.click()
      URL.revokeObjectURL(url)

      setGeneratedAssets((prev) => [...prev, "Proposal PDF"])
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateEmails = () => {
    const emails = proposalGenerator.generateStakeholderEmails()
    console.log("Generated emails:", emails)
    setGeneratedAssets((prev) => [...prev, "Stakeholder Emails"])
  }

  const handleDeployMicrosite = () => {
    // Simulate microsite deployment
    console.log("Deploying microsite to baptist.agency.ads")
    setGeneratedAssets((prev) => [...prev, "Trial Matching Microsite"])
  }

  const handleGenerateNIHDocs = () => {
    const biosketch = proposalGenerator.generateNIHBiosketch()
    const budget = proposalGenerator.generateBudgetJustification()
    console.log("Generated NIH documents:", { biosketch, budget })
    setGeneratedAssets((prev) => [...prev, "NIH Submission Package"])
  }

  if (!proposalData) {
    return <div>Loading proposal data...</div>
  }

  const totalBudget = proposalData.budgetBreakdown.reduce((sum, item) => sum + item.total, 0)
  const completionPercentage = (generatedAssets.length / 4) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Baptist Health Partnership</h1>
          <p className="text-gray-600">AGENT Platform Funding & Deployment Strategy</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <Award className="mr-1 h-3 w-3" />
            NIH Ready
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <Building className="mr-1 h-3 w-3" />
            Epic Certified
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Funding Package Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Package Completion</span>
              <span className="text-sm text-gray-600">{completionPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${(totalBudget / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-gray-600">NIH R01 Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">36</div>
                <div className="text-sm text-gray-600">Month Timeline</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{proposalData.stakeholders.length}</div>
                <div className="text-sm text-gray-600">Key Stakeholders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">$2.3M</div>
                <div className="text-sm text-gray-600">Annual Savings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="h-20 flex flex-col items-center justify-center space-y-2"
        >
          <Presentation className="h-6 w-6" />
          <span>Generate Slide Deck</span>
        </Button>

        <Button
          onClick={handleDeployMicrosite}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2"
        >
          <Rocket className="h-6 w-6" />
          <span>Deploy Microsite</span>
        </Button>

        <Button
          onClick={handleGenerateNIHDocs}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2"
        >
          <FileText className="h-6 w-6" />
          <span>NIH Submission Kit</span>
        </Button>

        <Button
          onClick={handleGenerateEmails}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2"
        >
          <Mail className="h-6 w-6" />
          <span>Stakeholder Outreach</span>
        </Button>
      </div>

      {/* Generated Assets */}
      {generatedAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedAssets.map((asset, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{asset}</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="nih">NIH Alignment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{proposalData.executiveSummary}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposalData.technicalSpecs.map((spec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{spec.component}</h4>
                    <p className="text-sm text-gray-600 mb-3">{spec.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Epic Integration:</span>
                        <p className="text-gray-600">{spec.epicIntegration}</p>
                      </div>
                      <div>
                        <span className="font-medium">CPIC Alignment:</span>
                        <p className="text-gray-600">{spec.cpicAlignment}</p>
                      </div>
                      <div>
                        <span className="font-medium">Deliverable:</span>
                        <p className="text-gray-600">{spec.deliverable}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Budget Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Year 1</th>
                      <th className="text-right p-2">Year 2</th>
                      <th className="text-right p-2">Year 3</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalData.budgetBreakdown.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{item.category}</div>
                            <div className="text-xs text-gray-600">{item.description}</div>
                          </div>
                        </td>
                        <td className="text-right p-2">${item.year1.toLocaleString()}</td>
                        <td className="text-right p-2">${item.year2.toLocaleString()}</td>
                        <td className="text-right p-2">${item.year3.toLocaleString()}</td>
                        <td className="text-right p-2 font-medium">${item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="p-2">Total Project Cost</td>
                      <td className="text-right p-2">
                        ${proposalData.budgetBreakdown.reduce((sum, item) => sum + item.year1, 0).toLocaleString()}
                      </td>
                      <td className="text-right p-2">
                        ${proposalData.budgetBreakdown.reduce((sum, item) => sum + item.year2, 0).toLocaleString()}
                      </td>
                      <td className="text-right p-2">
                        ${proposalData.budgetBreakdown.reduce((sum, item) => sum + item.year3, 0).toLocaleString()}
                      </td>
                      <td className="text-right p-2">${totalBudget.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <div className="space-y-4">
            {proposalData.timeline.map((phase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    {phase.phase}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{phase.duration}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Milestones</h4>
                      <ul className="space-y-1 text-sm">
                        {phase.milestones.map((milestone, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                            {milestone}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Deliverables</h4>
                      <ul className="space-y-1 text-sm">
                        {phase.deliverables.map((deliverable, idx) => (
                          <li key={idx} className="flex items-center">
                            <FileText className="h-3 w-3 text-blue-600 mr-2" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Dependencies</h4>
                      <ul className="space-y-1 text-sm">
                        {phase.dependencies.map((dependency, idx) => (
                          <li key={idx} className="flex items-center">
                            <AlertCircle className="h-3 w-3 text-orange-600 mr-2" />
                            {dependency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stakeholders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposalData.stakeholders.map((stakeholder, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    {stakeholder.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {stakeholder.role} • {stakeholder.organization}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Email:</span>
                      <p className="text-sm text-gray-600">{stakeholder.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Key Responsibilities:</span>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {stakeholder.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nih" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                NIH Strategic Alignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Grant Mechanism</h4>
                    <p className="text-sm text-gray-600">{proposalData.nihAlignment.mechanism}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Institute</h4>
                    <p className="text-sm text-gray-600">{proposalData.nihAlignment.institute}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Program</h4>
                    <p className="text-sm text-gray-600">{proposalData.nihAlignment.program}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Strategic Priority</h4>
                    <p className="text-sm text-gray-600">{proposalData.nihAlignment.strategicPriority}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Innovation Criteria</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {proposalData.nihAlignment.innovationCriteria.map((criterion, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-3 w-3 text-green-600 mr-2 mt-0.5" />
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Impact Metrics</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {proposalData.nihAlignment.impactMetrics.map((metric, idx) => (
                        <li key={idx} className="flex items-start">
                          <Target className="h-3 w-3 text-blue-600 mr-2 mt-0.5" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
