"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users, Search, Filter, Plus, Download, Eye, Calendar,
  Dna, AlertTriangle, CheckCircle, Clock, FileText,
  UserPlus, Settings, BarChart3, Heart, Activity
} from "lucide-react"

interface Patient {
  id: string
  name: string
  mrn: string
  dateOfBirth: string
  gender: string
  diagnosis: string
  lastVisit: string
  status: "active" | "inactive" | "critical"
  genomicTests: number
  variants: {
    pathogenic: number
    uncertain: number
    benign: number
  }
  trials: number
  riskScore: number
}

export default function PatientsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDiagnosis, setFilterDiagnosis] = useState("all")

  const patients: Patient[] = [
    {
      id: "PAT-001",
      name: "Sarah Johnson",
      mrn: "MRN-789123",
      dateOfBirth: "1985-03-15",
      gender: "Female",
      diagnosis: "Breast Cancer",
      lastVisit: "2024-01-15",
      status: "critical",
      genomicTests: 3,
      variants: { pathogenic: 2, uncertain: 1, benign: 15 },
      trials: 3,
      riskScore: 87
    },
    {
      id: "PAT-002",
      name: "Michael Chen",
      mrn: "MRN-456789",
      dateOfBirth: "1978-11-22",
      gender: "Male",
      diagnosis: "Lung Cancer",
      lastVisit: "2024-01-14",
      status: "active",
      genomicTests: 2,
      variants: { pathogenic: 1, uncertain: 3, benign: 12 },
      trials: 1,
      riskScore: 65
    },
    {
      id: "PAT-003",
      name: "Emily Rodriguez",
      mrn: "MRN-234567",
      dateOfBirth: "1992-07-08",
      gender: "Female",
      diagnosis: "Ovarian Cancer",
      lastVisit: "2024-01-13",
      status: "active",
      genomicTests: 4,
      variants: { pathogenic: 3, uncertain: 2, benign: 18 },
      trials: 2,
      riskScore: 78
    },
    {
      id: "PAT-004",
      name: "Robert Wilson",
      mrn: "MRN-567890",
      dateOfBirth: "1965-12-03",
      gender: "Male",
      diagnosis: "Colorectal Cancer",
      lastVisit: "2024-01-10",
      status: "inactive",
      genomicTests: 1,
      variants: { pathogenic: 0, uncertain: 1, benign: 8 },
      trials: 0,
      riskScore: 42
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "inactive":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600"
    if (score >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || patient.status === filterStatus
    const matchesDiagnosis = filterDiagnosis === "all" || patient.diagnosis === filterDiagnosis

    return matchesSearch && matchesStatus && matchesDiagnosis
  })

  const patientStats = {
    total: patients.length,
    critical: patients.filter(p => p.status === "critical").length,
    active: patients.filter(p => p.status === "active").length,
    genomicTests: patients.reduce((sum, p) => sum + p.genomicTests, 0),
    totalTrials: patients.reduce((sum, p) => sum + p.trials, 0)
  }

  const diagnoses = Array.from(new Set(patients.map(p => p.diagnosis)))

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Patient Management
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive patient records with genomic data and clinical insights
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button asChild>
              <Link href="/patients/new">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold">{patientStats.total}</p>
                <p className="text-sm text-blue-600">Active records</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{patientStats.critical}</p>
                <p className="text-sm text-red-600">Need attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{patientStats.active}</p>
                <p className="text-sm text-green-600">Under care</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Genomic Tests</p>
                <p className="text-2xl font-bold">{patientStats.genomicTests}</p>
                <p className="text-sm text-purple-600">Completed</p>
              </div>
              <Dna className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial Matches</p>
                <p className="text-2xl font-bold">{patientStats.totalTrials}</p>
                <p className="text-sm text-orange-600">Available</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Patients</TabsTrigger>
          <TabsTrigger value="critical">Critical ({patientStats.critical})</TabsTrigger>
          <TabsTrigger value="active">Active ({patientStats.active})</TabsTrigger>
          <TabsTrigger value="genomics">Genomic Data</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, MRN, or diagnosis..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDiagnosis} onValueChange={setFilterDiagnosis}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by diagnosis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Diagnoses</SelectItem>
                    {diagnoses.map(diagnosis => (
                      <SelectItem key={diagnosis} value={diagnosis}>{diagnosis}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Patient List */}
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{patient.name}</h3>
                          <Badge className={getStatusColor(patient.status)}>
                            {getStatusIcon(patient.status)}
                            <span className="ml-1">{patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}</span>
                          </Badge>
                          <Badge variant="outline" className={getRiskScoreColor(patient.riskScore)}>
                            Risk: {patient.riskScore}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-500">MRN</p>
                            <p className="font-medium">{patient.mrn}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Age/Gender</p>
                            <p className="font-medium">
                              {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} / {patient.gender}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Diagnosis</p>
                            <p className="font-medium">{patient.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Last Visit</p>
                            <p className="font-medium">{patient.lastVisit}</p>
                          </div>
                        </div>

                        {/* Genomic Summary */}
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Dna className="h-4 w-4 text-purple-500" />
                            <span>{patient.genomicTests} tests</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-red-600">{patient.variants.pathogenic} pathogenic</span>
                            <span className="text-yellow-600">{patient.variants.uncertain} uncertain</span>
                            <span className="text-green-600">{patient.variants.benign} benign</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>{patient.trials} trial matches</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patients/${patient.id}/genomics`}>
                          <Dna className="h-4 w-4 mr-2" />
                          Genomics
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="critical" className="mt-6">
          <div className="space-y-4">
            {patients.filter(p => p.status === "critical").map((patient) => (
              <Card key={patient.id} className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">{patient.name}</h3>
                        <p className="text-red-700">{patient.diagnosis} - Risk Score: {patient.riskScore}%</p>
                        <p className="text-sm text-red-600">
                          {patient.variants.pathogenic} pathogenic variants require immediate review
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="destructive">
                        Urgent Review
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>
                          View Patient
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {patients.filter(p => p.status === "active").map((patient) => (
              <Card key={patient.id} className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="text-lg font-semibold">{patient.name}</h3>
                        <p className="text-gray-600">{patient.diagnosis}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Next appointment: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-blue-600">{patient.trials} trial opportunities</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Schedule Visit
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>
                          View Patient
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="genomics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dna className="h-5 w-5 mr-2" />
                  Variant Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["pathogenic", "uncertain", "benign"].map((type) => {
                    const total = patients.reduce((sum, p) => sum + p.variants[type as keyof typeof p.variants], 0)
                    const percentage = Math.round((total / patients.reduce((sum, p) => sum + p.variants.pathogenic + p.variants.uncertain + p.variants.benign, 0)) * 100)
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                type === "pathogenic" ? "bg-red-500" :
                                type === "uncertain" ? "bg-yellow-500" :
                                "bg-green-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12">{total}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "High Risk (>80%)", count: patients.filter(p => p.riskScore > 80).length, color: "bg-red-500" },
                    { label: "Medium Risk (60-80%)", count: patients.filter(p => p.riskScore >= 60 && p.riskScore <= 80).length, color: "bg-yellow-500" },
                    { label: "Low Risk (<60%)", count: patients.filter(p => p.riskScore < 60).length, color: "bg-green-500" }
                  ].map((risk) => (
                    <div key={risk.label} className="flex justify-between items-center">
                      <span className="text-sm">{risk.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${risk.color}`}
                            style={{ width: `${(risk.count / patients.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{risk.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Age</span>
                    <span className="text-lg font-bold">
                      {Math.round(patients.reduce((sum, p) => sum + (new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()), 0) / patients.length)} years
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Female</span>
                    <span className="text-lg font-bold text-pink-600">
                      {patients.filter(p => p.gender === "Female").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Male</span>
                    <span className="text-lg font-bold text-blue-600">
                      {patients.filter(p => p.gender === "Male").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Genomic Tests</span>
                    <span className="text-lg font-bold text-purple-600">
                      {(patients.reduce((sum, p) => sum + p.genomicTests, 0) / patients.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trial Eligible</span>
                    <span className="text-lg font-bold text-green-600">
                      {patients.filter(p => p.trials > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Risk Score</span>
                    <span className="text-lg font-bold text-orange-600">
                      {Math.round(patients.reduce((sum, p) => sum + p.riskScore, 0) / patients.length)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
