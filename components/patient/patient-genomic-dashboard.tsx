"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, FileText, Download, Activity, AlertCircle, Dna, Pill, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PatientData {
  id: string
  name: string
  dateOfBirth: string
  mrn: string
  condition?: string
}

interface GenomicVariant {
  gene: string
  variant: string
  hgvs?: string
  clinicalSignificance: string
  confidence: number
  source: string
}

interface ClinicalReport {
  id: string
  type: string
  date: string
  status: string
  summary: string
  variants: GenomicVariant[]
}

interface TrialMatch {
  nctId: string
  title: string
  phase: string
  matchScore: number
  eligibilityStatus: string
  location: string
  contact: string
}

interface DrugRecommendation {
  drug: string
  indication: string
  evidenceLevel: string
  dosageGuidance: string
  warnings: string[]
}

export default function PatientGenomicDashboard({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [reports, setReports] = useState<ClinicalReport[]>([])
  const [variants, setVariants] = useState<GenomicVariant[]>([])
  const [trialMatches, setTrialMatches] = useState<TrialMatch[]>([])
  const [drugRecommendations, setDrugRecommendations] = useState<DrugRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    loadPatientData()
  }, [patientId])

  const loadPatientData = async () => {
    setIsLoading(true)
    try {
      // Load patient basic info
      const patientResponse = await fetch(`/api/patients/${patientId}`)
      const patientData = await patientResponse.json()
      setPatient(patientData)

      // Load clinical reports
      const reportsResponse = await fetch(`/api/patients/${patientId}/reports`)
      const reportsData = await reportsResponse.json()
      setReports(reportsData)

      // Load genomic variants
      const variantsResponse = await fetch(`/api/patients/${patientId}/variants`)
      const variantsData = await variantsResponse.json()
      setVariants(variantsData)

      // Load trial matches
      const trialsResponse = await fetch(`/api/patients/${patientId}/trial-matches`)
      const trialsData = await trialsResponse.json()
      setTrialMatches(trialsData)

      // Load drug recommendations
      const drugsResponse = await fetch(`/api/patients/${patientId}/drug-recommendations`)
      const drugsData = await drugsResponse.json()
      setDrugRecommendations(drugsData)
    } catch (error) {
      console.error("Error loading patient data:", error)
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format: "pdf" | "csv") => {
    try {
      const response = await fetch(`/api/patients/${patientId}/export?format=${format}`, {
        method: "POST",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `patient-${patientId}-report.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export Complete",
          description: `Report exported as ${format.toUpperCase()}`,
        })
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export report",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading patient data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Genomic Health Dashboard</h1>
          <p className="text-muted-foreground">
            {patient?.name} • MRN: {patient?.mrn}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <User className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="genomics">
            <Dna className="h-4 w-4 mr-2" />
            Genomic Insights
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Clinical Reports
          </TabsTrigger>
          <TabsTrigger value="trials">
            <Search className="h-4 w-4 mr-2" />
            Trial Matches
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Genomic Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{variants.length}</div>
                <p className="text-xs text-muted-foreground">
                  {variants.filter((v) => v.clinicalSignificance === "pathogenic").length} pathogenic
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clinical Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                  {reports.filter((r) => r.status === "final").length} finalized
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trial Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trialMatches.length}</div>
                <p className="text-xs text-muted-foreground">
                  {trialMatches.filter((t) => t.eligibilityStatus === "eligible").length} eligible
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{report.type}</p>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                    <Badge variant={report.status === "final" ? "default" : "secondary"}>{report.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genomics Tab */}
        <TabsContent value="genomics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Genomic Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {variants.map((variant, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{variant.gene}</span>
                          <Badge
                            variant={
                              variant.clinicalSignificance === "pathogenic"
                                ? "destructive"
                                : variant.clinicalSignificance === "benign"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {variant.clinicalSignificance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{variant.variant}</p>
                        {variant.hgvs && <p className="text-xs font-mono bg-muted p-1 rounded">{variant.hgvs}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {(variant.confidence * 100).toFixed(0)}%
                          </span>
                          <Progress value={variant.confidence * 100} className="w-16 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Drug Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Drug Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {drugRecommendations.map((drug, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{drug.drug}</span>
                          <Badge variant="outline">Level {drug.evidenceLevel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{drug.indication}</p>
                        <p className="text-sm mb-2">{drug.dosageGuidance}</p>
                        {drug.warnings.length > 0 && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{drug.warnings.join("; ")}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.type}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === "final" ? "default" : "secondary"}>{report.status}</Badge>
                      <span className="text-sm text-muted-foreground">{report.date}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{report.summary}</p>
                  {report.variants.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Detected Variants:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {report.variants.map((variant, index) => (
                          <div key={index} className="text-sm p-2 bg-muted rounded">
                            <span className="font-medium">{variant.gene}</span>: {variant.variant}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trials Tab */}
        <TabsContent value="trials" className="space-y-6">
          <div className="grid gap-4">
            {trialMatches.map((trial) => (
              <Card key={trial.nctId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trial.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{trial.phase}</Badge>
                      <Badge
                        variant={
                          trial.eligibilityStatus === "eligible"
                            ? "default"
                            : trial.eligibilityStatus === "potentially_eligible"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {trial.eligibilityStatus.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm">Match Score</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={trial.matchScore * 100} className="flex-1" />
                        <span className="text-sm">{(trial.matchScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Location</h4>
                      <p className="text-sm text-muted-foreground">{trial.location}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Contact</h4>
                      <p className="text-sm text-muted-foreground">{trial.contact}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
