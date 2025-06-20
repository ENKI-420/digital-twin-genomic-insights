"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Users, FileText, CheckCircle, XCircle, AlertCircle, Dna } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PatientMatch {
  patient_id: string
  patient_name: string
  matches: TrialMatch[]
}

interface TrialMatch {
  trial_id: string
  trial_title: string
  trial_phase: string
  match_score: number
  eligibility_status: "eligible" | "potentially_eligible" | "ineligible"
  genomic_match: boolean
  clinical_match: boolean
  matched_at: string
}

export function PatientTrialMatching() {
  const [patientMatches, setPatientMatches] = useState<PatientMatch[]>([])
  const [filteredMatches, setFilteredMatches] = useState<PatientMatch[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  // Fetch patient matches
  const fetchPatientMatches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/trials/patient-matching")
      if (!response.ok) throw new Error("Failed to fetch patient matches")

      const data = await response.json()
      setPatientMatches(data.matches || [])
      setFilteredMatches(data.matches || [])
    } catch (error) {
      console.error("Error fetching patient matches:", error)
      toast({
        title: "Error",
        description: "Failed to fetch patient matches",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Run matching algorithm
  const runMatching = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/trials/patient-matching", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to run matching algorithm")

      const result = await response.json()

      toast({
        title: "Matching Complete",
        description: `Successfully matched ${result.matchCount} patients to trials`,
      })

      // Refresh matches
      fetchPatientMatches()
    } catch (error) {
      console.error("Error running matching algorithm:", error)
      toast({
        title: "Error",
        description: "Failed to run matching algorithm",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter matches based on search term and active tab
  useEffect(() => {
    if (!patientMatches.length) return

    let filtered = [...patientMatches]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.matches.some((match) => match.trial_title.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered
        .map((patient) => ({
          ...patient,
          matches: patient.matches.filter((match) => {
            if (activeTab === "eligible") return match.eligibility_status === "eligible"
            if (activeTab === "potential") return match.eligibility_status === "potentially_eligible"
            if (activeTab === "genomic") return match.genomic_match
            return true
          }),
        }))
        .filter((patient) => patient.matches.length > 0)
    }

    setFilteredMatches(filtered)
  }, [searchTerm, activeTab, patientMatches])

  // Initial fetch
  useEffect(() => {
    fetchPatientMatches()
  }, [])

  // Get eligibility badge
  const getEligibilityBadge = (status: string) => {
    switch (status) {
      case "eligible":
        return <Badge className="bg-green-100 text-green-800">Eligible</Badge>
      case "potentially_eligible":
        return <Badge className="bg-yellow-100 text-yellow-800">Potentially Eligible</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Ineligible</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Dna className="h-5 w-5" />
            AI-Powered Patient Trial Matching
          </CardTitle>
          <Button onClick={runMatching} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Processing..." : "Run Matching Algorithm"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search patients or trials..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{patientMatches.length} Patients</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>{patientMatches.reduce((acc, patient) => acc + patient.matches.length, 0)} Matches</span>
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All Matches</TabsTrigger>
              <TabsTrigger value="eligible">Eligible</TabsTrigger>
              <TabsTrigger value="potential">Potentially Eligible</TabsTrigger>
              <TabsTrigger value="genomic">Genomic Matches</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No matches found</div>
              ) : (
                <div className="space-y-6">
                  {filteredMatches.map((patient) => (
                    <div key={patient.patient_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{patient.patient_name}</h3>
                        <Badge variant="outline">{patient.matches.length} Trial Matches</Badge>
                      </div>

                      <div className="space-y-3">
                        {patient.matches.map((match) => (
                          <div
                            key={`${patient.patient_id}-${match.trial_id}`}
                            className="border rounded p-3 bg-gray-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{match.trial_title}</h4>
                                <p className="text-sm text-gray-500">Phase {match.trial_phase}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {getEligibilityBadge(match.eligibility_status)}
                                <span className="text-sm font-medium">
                                  {Math.round(match.match_score * 100)}% Match
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-4 mt-2 text-sm">
                              <div className="flex items-center gap-1">
                                <span>Genomic:</span>
                                {match.genomic_match ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Clinical:</span>
                                {match.clinical_match ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end mt-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="bg-blue-50 p-4 rounded-lg mt-6">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              How AI-Powered Matching Works
            </h4>
            <p className="text-sm text-blue-800">
              Our AI algorithm analyzes patient genomic profiles and matches them to clinical trials based on genetic
              markers, expression levels, and biomarkers. The system considers both required and optional genomic
              criteria, calculates match scores, and categorizes patients by eligibility status.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
