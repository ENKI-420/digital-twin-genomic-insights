"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, User, FileText, Dna } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"

interface TrialMatchDetailsProps {
  patientId: string
  trialId: string
}

export function TrialMatchDetails({ patientId, trialId }: TrialMatchDetailsProps) {
  const [matchDetails, setMatchDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatchDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/trials/match-details?patientId=${patientId}&trialId=${trialId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch match details")
        }

        const data = await response.json()
        setMatchDetails(data)
      } catch (err) {
        setError("Failed to load match details")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatchDetails()
  }, [patientId, trialId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading match details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !matchDetails) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-4 text-gray-500">{error || "Failed to load match details"}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { match, patient, trial } = matchDetails

  // Helper function to get eligibility badge
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Dna className="h-5 w-5" />
          AI-Powered Match Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Match Summary */}
          <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium">
                  {patient.first_name} {patient.last_name}
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                {patient.gender}, {patient.age} years • {patient.condition}
              </p>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium">{trial.title}</h3>
              </div>
              <p className="text-sm text-gray-500">
                Phase {trial.phase} • {trial.sponsor}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              {getEligibilityBadge(match.eligibilityStatus)}
              <div className="mt-2 text-center">
                <div className="text-2xl font-bold">{Math.round(match.matchScore * 100)}%</div>
                <div className="text-xs text-gray-500">Match Score</div>
              </div>
            </div>
          </div>

          {/* Match Score Breakdown */}
          <div>
            <h3 className="font-medium mb-3">Match Score Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Genomic Match</span>
                  <span className="text-sm font-medium">
                    {match.genomicMatch ? (
                      <span className="text-green-600">Compatible</span>
                    ) : (
                      <span className="text-red-600">Incompatible</span>
                    )}
                  </span>
                </div>
                <Progress value={match.genomicMatch ? 100 : 40} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Clinical Match</span>
                  <span className="text-sm font-medium">
                    {match.clinicalMatch ? (
                      <span className="text-green-600">Compatible</span>
                    ) : (
                      <span className="text-red-600">Incompatible</span>
                    )}
                  </span>
                </div>
                <Progress value={match.clinicalMatch ? 100 : 40} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Overall Match</span>
                  <span className="text-sm font-medium">{Math.round(match.matchScore * 100)}%</span>
                </div>
                <Progress value={match.matchScore * 100} className="h-2" />
              </div>
            </div>
          </div>

          {/* Genomic Criteria */}
          <div>
            <h3 className="font-medium mb-3">Genomic Criteria Analysis</h3>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="matched">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Matched Criteria ({match.matchDetails.matchedCriteria.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {match.matchDetails.matchedCriteria.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No matched criteria</p>
                  ) : (
                    <ul className="space-y-2 py-2">
                      {match.matchDetails.matchedCriteria.map((criterion: string) => (
                        <li key={criterion} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="unmatched">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Unmatched Criteria ({match.matchDetails.unmatchedCriteria.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {match.matchDetails.unmatchedCriteria.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No unmatched criteria</p>
                  ) : (
                    <ul className="space-y-2 py-2">
                      {match.matchDetails.unmatchedCriteria.map((criterion: string) => (
                        <li key={criterion} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="notes">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span>AI Analysis Notes ({match.matchDetails.notes.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {match.matchDetails.notes.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No analysis notes</p>
                  ) : (
                    <ul className="space-y-2 py-2">
                      {match.matchDetails.notes.map((note: string, index: number) => (
                        <li key={index} className="text-sm border-l-2 border-blue-200 pl-3 py-1">
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline">View Patient Profile</Button>
            <Button variant="outline">View Trial Details</Button>
            <Button>Contact Research Coordinator</Button>
          </div>

          {/* AI Explanation */}
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              How This Match Was Calculated
            </h4>
            <p className="text-sm text-blue-800">
              Our AI algorithm analyzed {patient.first_name}'s genomic profile against the trial's
              {trial.trial_genomic_criteria?.length || 0} genomic criteria. The algorithm evaluates gene matches,
              variant compatibility, expression levels, and biomarkers, with special weighting for required criteria.
              Clinical eligibility is determined by condition compatibility and other inclusion/exclusion criteria.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
