"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckCircle, XCircle, AlertCircle, FileText, Calendar,
  MapPin, Users, Building2, Phone, Mail, Globe2,
  Activity, Target, Flask, Shield, Clock, TrendingUp,
  Download, Share2, ChevronRight, ExternalLink, Info
} from "lucide-react"

interface EligibilityCriteria {
  id: string
  category: string
  criteria: string
  status: "met" | "not_met" | "pending"
  patientValue?: string
  reason?: string
}

interface TrialSite {
  name: string
  location: string
  distance: string
  contactPerson: string
  phone: string
  email: string
  status: "enrolling" | "active" | "completed"
}

export default function TrialMatchingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const patient = {
    id: params.patientId,
    name: "John Doe",
    age: 45,
    gender: "Male",
    diagnosis: "Non-Small Cell Lung Cancer",
    stage: "IIIB",
    mutations: ["EGFR L858R", "TP53", "KRAS G12C"],
    priorTherapies: 2
  }

  const trial = {
    id: params.trialId,
    nctId: "NCT12345678",
    title: "Phase III Study of Novel EGFR Inhibitor in Advanced NSCLC",
    sponsor: "Pharma Corp",
    phase: "Phase 3",
    status: "Recruiting",
    enrollmentTarget: 450,
    currentEnrollment: 287,
    primaryOutcome: "Progression-free survival",
    estimatedCompletion: "December 2025",
    description: "A randomized, double-blind, placebo-controlled study evaluating the efficacy and safety of a novel EGFR inhibitor in patients with advanced non-small cell lung cancer harboring EGFR mutations."
  }

  const matchScore = 92

  const eligibilityCriteria: EligibilityCriteria[] = [
    {
      id: "1",
      category: "Diagnosis",
      criteria: "Confirmed diagnosis of NSCLC",
      status: "met",
      patientValue: "NSCLC Stage IIIB"
    },
    {
      id: "2",
      category: "Genetic",
      criteria: "EGFR mutation positive",
      status: "met",
      patientValue: "EGFR L858R positive"
    },
    {
      id: "3",
      category: "Age",
      criteria: "Age 18-75 years",
      status: "met",
      patientValue: "45 years"
    },
    {
      id: "4",
      category: "Prior Therapy",
      criteria: "No more than 2 prior lines of therapy",
      status: "met",
      patientValue: "2 prior therapies"
    },
    {
      id: "5",
      category: "Performance",
      criteria: "ECOG performance status 0-1",
      status: "pending",
      reason: "Requires clinical assessment"
    },
    {
      id: "6",
      category: "Laboratory",
      criteria: "Adequate organ function",
      status: "pending",
      reason: "Recent labs needed"
    }
  ]

  const trialSites: TrialSite[] = [
    {
      name: "Massachusetts General Hospital",
      location: "Boston, MA",
      distance: "2.5 miles",
      contactPerson: "Dr. Sarah Chen",
      phone: "(617) 555-1234",
      email: "trials@mgh.org",
      status: "enrolling"
    },
    {
      name: "Dana-Farber Cancer Institute",
      location: "Boston, MA",
      distance: "3.8 miles",
      contactPerson: "Dr. Michael Johnson",
      phone: "(617) 555-5678",
      email: "clinicaltrials@dfci.org",
      status: "enrolling"
    },
    {
      name: "Beth Israel Deaconess Medical Center",
      location: "Boston, MA",
      distance: "4.2 miles",
      contactPerson: "Dr. Emily Rodriguez",
      phone: "(617) 555-9012",
      email: "research@bidmc.org",
      status: "active"
    }
  ]

  const metCriteria = eligibilityCriteria.filter(c => c.status === "met").length
  const totalCriteria = eligibilityCriteria.length
  const eligibilityPercentage = (metCriteria / totalCriteria) * 100

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back to Trial Matching
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trial Match Analysis</h1>
            <p className="text-gray-600">
              Detailed matching analysis for {patient.name} and trial {trial.nctId}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{matchScore}%</div>
            <p className="text-sm text-gray-500">Match Score</p>
          </div>
        </div>
      </div>

      {/* Match Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Eligibility Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{metCriteria}/{totalCriteria}</span>
              <Badge variant="secondary">
                {eligibilityPercentage.toFixed(0)}% Met
              </Badge>
            </div>
            <Progress value={eligibilityPercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nearest Site</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{trialSites[0].name}</p>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {trialSites[0].distance} away
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Trial Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-green-600">
                {trial.status}
              </Badge>
              <span className="text-sm">
                {trial.currentEnrollment}/{trial.enrollmentTarget} enrolled
              </span>
            </div>
            <Progress value={(trial.currentEnrollment / trial.enrollmentTarget) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="sites">Trial Sites</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.name}`} />
                      <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {patient.age} years, {patient.gender}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Diagnosis</p>
                      <p className="font-medium">{patient.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stage</p>
                      <p className="font-medium">{patient.stage}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prior Therapies</p>
                      <p className="font-medium">{patient.priorTherapies}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Key Mutations</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.mutations.map((mutation, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {mutation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Trial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{trial.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {trial.nctId}
                      </span>
                      <Badge variant="outline">{trial.phase}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{trial.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Sponsor</p>
                      <p className="font-medium">{trial.sponsor}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Primary Outcome</p>
                      <p className="font-medium">{trial.primaryOutcome}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Enrollment</p>
                      <p className="font-medium">{trial.currentEnrollment}/{trial.enrollmentTarget}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Est. Completion</p>
                      <p className="font-medium">{trial.estimatedCompletion}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Match Factors */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Key Match Factors</CardTitle>
              <CardDescription>
                Why this trial is a good match for the patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-8 w-8 text-green-600" />
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Perfect Match</Badge>
                  </div>
                  <h4 className="font-medium mb-1">EGFR Mutation Match</h4>
                  <p className="text-sm text-gray-600">
                    Patient's EGFR L858R mutation is specifically targeted by this trial
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">Good Fit</Badge>
                  </div>
                  <h4 className="font-medium mb-1">Disease Stage Match</h4>
                  <p className="text-sm text-gray-600">
                    Stage IIIB NSCLC meets trial inclusion criteria
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="h-8 w-8 text-purple-600" />
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">Convenient</Badge>
                  </div>
                  <h4 className="font-medium mb-1">Location Proximity</h4>
                  <p className="text-sm text-gray-600">
                    Multiple trial sites within 5 miles of patient location
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Criteria Assessment</CardTitle>
              <CardDescription>
                Detailed analysis of how the patient meets trial requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibilityCriteria.map((criterion) => (
                  <div key={criterion.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {criterion.status === "met" && (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                          {criterion.status === "not_met" && (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          )}
                          {criterion.status === "pending" && (
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">{criterion.criteria}</p>
                            <p className="text-sm text-gray-500">{criterion.category}</p>
                          </div>
                        </div>

                        {criterion.patientValue && (
                          <div className="ml-8 text-sm">
                            <span className="text-gray-500">Patient value: </span>
                            <span className="font-medium">{criterion.patientValue}</span>
                          </div>
                        )}

                        {criterion.reason && (
                          <div className="ml-8 text-sm text-yellow-600 mt-1">
                            <Info className="h-3 w-3 inline mr-1" />
                            {criterion.reason}
                          </div>
                        )}
                      </div>

                      <Badge
                        variant={
                          criterion.status === "met" ? "secondary" :
                          criterion.status === "not_met" ? "destructive" :
                          "outline"
                        }
                      >
                        {criterion.status === "met" ? "Met" :
                         criterion.status === "not_met" ? "Not Met" :
                         "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {eligibilityCriteria.some(c => c.status === "pending") && (
                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Additional Information Needed</AlertTitle>
                  <AlertDescription>
                    Some eligibility criteria require additional clinical assessments or laboratory tests.
                    Contact the trial coordinator to schedule these evaluations.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participating Sites</CardTitle>
                <CardDescription>
                  Trial sites near the patient's location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trialSites.map((site, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{site.name}</h4>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {site.location} • {site.distance}
                          </p>
                        </div>
                        <Badge
                          variant={site.status === "enrolling" ? "secondary" : "outline"}
                          className={site.status === "enrolling" ? "text-green-600" : ""}
                        >
                          {site.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Contact Person</p>
                          <p className="font-medium">{site.contactPerson}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {site.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {site.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Site
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Site Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Globe2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Interactive map showing trial sites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="next-steps" className="mt-6">
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Strong Match Identified</AlertTitle>
              <AlertDescription>
                Based on the analysis, this patient appears to be an excellent candidate for this trial.
                We recommend proceeding with the enrollment process.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
                <CardDescription>
                  Actions to take to enroll the patient in this trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Schedule Pre-Screening Appointment</h4>
                      <p className="text-sm text-gray-600">
                        Contact the nearest enrolling site to schedule an initial screening visit
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Complete Required Assessments</h4>
                      <p className="text-sm text-gray-600">
                        ECOG performance status evaluation and laboratory tests for organ function
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Review Informed Consent</h4>
                      <p className="text-sm text-gray-600">
                        Discuss trial details, risks, and benefits with the patient
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Consent Form
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">4</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Submit Enrollment Request</h4>
                      <p className="text-sm text-gray-600">
                        Complete enrollment paperwork and submit to trial coordinator
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Analysis
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Team
                </Button>
                <Button>
                  Proceed with Enrollment
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
