"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Search } from "lucide-react"

interface PatientMatchingPanelProps {
  patients?: any[]
  opportunities?: any[]
}

export function PatientMatchingPanel({ patients = [], opportunities = [] }: PatientMatchingPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock patient data if none provided
  const patientData =
    patients.length > 0
      ? patients
      : [
          {
            id: "PAT001",
            name: "Sarah Johnson",
            age: 45,
            condition: "Breast Cancer",
            genomicProfile: ["HER2+", "CYP2D6*4/*4"],
            eligibilityScore: 0.94,
            trialMatches: ["NIH_R01_CA_2024_001"],
          },
          {
            id: "PAT002",
            name: "Michael Chen",
            age: 62,
            condition: "Lung Cancer",
            genomicProfile: ["EGFR L858R", "CYP2C19*2/*2"],
            eligibilityScore: 0.87,
            trialMatches: ["NIH_U01_HG_2024_002"],
          },
          {
            id: "PAT003",
            name: "Emily Rodriguez",
            age: 38,
            condition: "Colorectal Cancer",
            genomicProfile: ["KRAS G12C", "DPYD*2A"],
            eligibilityScore: 0.91,
            trialMatches: ["NIH_R01_CA_2024_001", "DOD_CDMRP_2024_001"],
          },
        ]

  const filteredPatients = patientData.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Patient Trial Matching
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search patients by name or condition..."
            className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{patient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {patient.age} years • {patient.condition}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {Math.round(patient.eligibilityScore * 100)}% Match
                </Badge>
              </div>

              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Genomic Profile</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {patient.genomicProfile.map((gene: string) => (
                    <Badge key={gene} variant="outline" className="text-xs">
                      {gene}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Trial Matches</p>
                <div className="flex flex-wrap gap-1">
                  {patient.trialMatches.map((trialId: string) => (
                    <Badge key={trialId} className="bg-blue-100 text-blue-800">
                      {trialId}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <Button size="sm">View Patient Details</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">AI-Powered Patient Matching</h4>
          <p className="text-sm text-blue-800">
            Patients are automatically matched to trials based on genomic profiles, clinical data, and CPIC guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
