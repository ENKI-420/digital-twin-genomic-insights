"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Upload } from "lucide-react"

interface TrialRegistrationPanelProps {
  opportunities?: any[]
  onExportRegistry?: (id: string) => void
}

export function TrialRegistrationPanel({
  opportunities = [],
  onExportRegistry = () => {},
}: TrialRegistrationPanelProps) {
  const [isRegistering, setIsRegistering] = useState<string | null>(null)

  // Mock trials data
  const trials = [
    {
      id: "trial1",
      title: "CPIC-Guided Precision Oncology Implementation",
      status: "draft",
      phase: "II",
      sponsor: "Baptist Health Medical Group Hematology & Oncology",
      opportunityId: "NIH_R01_CA_2024_001",
    },
    {
      id: "trial2",
      title: "AI-Powered Genomic Analysis for Cancer Treatment",
      status: "pending",
      phase: "I",
      sponsor: "ADS Research",
      opportunityId: "NIH_U01_HG_2024_002",
    },
  ]

  const handleRegisterTrial = async (trialId: string) => {
    setIsRegistering(trialId)

    // Simulate registration process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsRegistering(null)

    // In production, this would update the trial status
    alert(`Trial ${trialId} registered successfully`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "registered":
        return <Badge variant="default">Registered</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Trial Registration Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trials.map((trial) => (
            <div key={trial.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{trial.title}</h3>
                  <p className="text-sm text-gray-500">
                    Phase {trial.phase} • {trial.sponsor}
                  </p>
                </div>
                {getStatusBadge(trial.status)}
              </div>

              <div className="flex gap-2 mt-4">
                {trial.status === "draft" && (
                  <Button onClick={() => handleRegisterTrial(trial.id)} disabled={isRegistering === trial.id} size="sm">
                    {isRegistering === trial.id ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Register Trial
                      </span>
                    )}
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => onExportRegistry(trial.id)}>
                  Export Registry XML
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Automated Trial Registration</h4>
          <p className="text-sm text-green-800">
            Trial registrations are automatically populated with institutional data and CPIC guideline alignment for
            ClinicalTrials.gov submission.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
