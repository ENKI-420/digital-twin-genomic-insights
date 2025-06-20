"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User, Calendar, MapPin, Phone, Mail, AlertTriangle,
  Activity, FileText, Dna, Target, Shield, Brain,
  Clock, TrendingUp, Download, Share2, Edit,
  Heart, Pill, Users, FlaskConical, ChevronRight, Filter
} from "lucide-react"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts"

interface Variant {
  id: string
  gene: string
  position: string
  type: string
  classification: string
  clinicalSignificance: string
  alleleFrequency: number
  zygosity: string
}

interface Medication {
  name: string
  gene: string
  recommendation: string
  level: "high" | "moderate" | "low"
}

interface RiskScore {
  condition: string
  risk: number
  category: "high" | "moderate" | "low"
  genes: string[]
}

export default function PatientDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock patient data
  const patient = {
    id: params.id,
    name: "John Doe",
    age: 45,
    gender: "Male",
    dob: "1979-03-15",
    mrn: "MRN-123456",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Boston, MA 02115",
    primaryPhysician: "Dr. Sarah Chen",
    lastVisit: "2024-10-15",
    genomicDataStatus: "Complete",
    riskCategory: "moderate"
  }

  const variants: Variant[] = [
    {
      id: "1",
      gene: "BRCA2",
      position: "c.5946del",
      type: "Deletion",
      classification: "Pathogenic",
      clinicalSignificance: "High cancer risk",
      alleleFrequency: 0.5,
      zygosity: "Heterozygous"
    },
    {
      id: "2",
      gene: "MTHFR",
      position: "c.677C>T",
      type: "SNV",
      classification: "Benign",
      clinicalSignificance: "Folate metabolism",
      alleleFrequency: 0.5,
      zygosity: "Heterozygous"
    },
    {
      id: "3",
      gene: "CYP2C19",
      position: "*2",
      type: "SNV",
      classification: "Pharmacogenomic",
      clinicalSignificance: "Drug metabolism",
      alleleFrequency: 1.0,
      zygosity: "Homozygous"
    }
  ]

  const medications: Medication[] = [
    {
      name: "Clopidogrel",
      gene: "CYP2C19",
      recommendation: "Consider alternative antiplatelet therapy",
      level: "high"
    },
    {
      name: "Warfarin",
      gene: "CYP2C9/VKORC1",
      recommendation: "Standard dosing with monitoring",
      level: "moderate"
    },
    {
      name: "Simvastatin",
      gene: "SLCO1B1",
      recommendation: "Normal risk of myopathy",
      level: "low"
    }
  ]

  const riskScores: RiskScore[] = [
    { condition: "Breast Cancer", risk: 45, category: "high", genes: ["BRCA2", "CHEK2"] },
    { condition: "Cardiovascular Disease", risk: 28, category: "moderate", genes: ["APOE", "LDLR"] },
    { condition: "Type 2 Diabetes", risk: 15, category: "low", genes: ["TCF7L2", "PPARG"] },
    { condition: "Alzheimer's Disease", risk: 22, category: "moderate", genes: ["APOE", "PSEN1"] }
  ]

  const timelineData = [
    { date: "Jan", visits: 2, tests: 3, medications: 1 },
    { date: "Feb", visits: 1, tests: 2, medications: 1 },
    { date: "Mar", visits: 3, tests: 5, medications: 2 },
    { date: "Apr", visits: 2, tests: 2, medications: 2 },
    { date: "May", visits: 1, tests: 1, medications: 1 },
    { date: "Jun", visits: 2, tests: 4, medications: 1 }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.name}`} />
              <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {patient.age} years, {patient.gender}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  DOB: {patient.dob}
                </span>
                <span className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  MRN: {patient.mrn}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={patient.riskCategory === "high" ? "destructive" : patient.riskCategory === "moderate" ? "outline" : "secondary"}>
                  {patient.riskCategory} risk
                </Badge>
                <Badge variant="secondary">
                  <Dna className="h-3 w-3 mr-1" />
                  {patient.genomicDataStatus}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-500">Contact</p>
            <p className="text-sm font-medium flex items-center mt-1">
              <Phone className="h-3 w-3 mr-2" />
              {patient.phone}
            </p>
            <p className="text-sm font-medium flex items-center mt-1">
              <Mail className="h-3 w-3 mr-2" />
              {patient.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-sm font-medium flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-2" />
              {patient.address}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Primary Physician</p>
            <p className="text-sm font-medium mt-1">{patient.primaryPhysician}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Visit</p>
            <p className="text-sm font-medium mt-1">{patient.lastVisit}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="genomics">Genomics</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Insights */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Clinical Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>High Priority</AlertTitle>
                      <AlertDescription>
                        BRCA2 pathogenic variant detected. Increased risk for breast and ovarian cancer. Consider enhanced screening and risk reduction strategies.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Pill className="h-4 w-4" />
                      <AlertTitle>Pharmacogenomic Alert</AlertTitle>
                      <AlertDescription>
                        CYP2C19 poor metabolizer. Clopidogrel may have reduced efficacy. Consider alternative antiplatelet therapy.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Patient interactions over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="visits" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                      <Area type="monotone" dataKey="tests" stackId="1" stroke="#10B981" fill="#10B981" />
                      <Area type="monotone" dataKey="medications" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genomic Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Variants</span>
                      <span className="font-semibold">2,456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Pathogenic</span>
                      <span className="font-semibold text-red-600">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Pharmacogenomic</span>
                      <span className="font-semibold text-yellow-600">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">VUS</span>
                      <span className="font-semibold">45</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      View Full Report
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Genetic Report Generated</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Risk Assessment Updated</p>
                        <p className="text-xs text-gray-500">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Pill className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Medication Review</p>
                        <p className="text-xs text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="genomics" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Genomic Variants</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {variants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{variant.gene}</h4>
                        <p className="text-sm text-gray-600">{variant.position} • {variant.type}</p>
                      </div>
                      <Badge
                        variant={
                          variant.classification === "Pathogenic" ? "destructive" :
                          variant.classification === "Benign" ? "secondary" :
                          "outline"
                        }
                      >
                        {variant.classification}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Clinical Significance</p>
                        <p className="font-medium">{variant.clinicalSignificance}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Allele Frequency</p>
                        <p className="font-medium">{(variant.alleleFrequency * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Zygosity</p>
                        <p className="font-medium">{variant.zygosity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacogenomic Recommendations</CardTitle>
                <CardDescription>
                  Medication guidance based on genetic profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{med.name}</h4>
                          <p className="text-sm text-gray-500">Gene: {med.gene}</p>
                        </div>
                        <Badge
                          variant={
                            med.level === "high" ? "destructive" :
                            med.level === "moderate" ? "outline" :
                            "secondary"
                          }
                        >
                          {med.level} impact
                        </Badge>
                      </div>
                      <p className="text-sm">{med.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drug-Gene Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Drug interaction visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Disease Risk Assessment</CardTitle>
                <CardDescription>
                  Genetic risk scores for common conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskScores.map((risk, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{risk.condition}</span>
                        <Badge
                          variant={
                            risk.category === "high" ? "destructive" :
                            risk.category === "moderate" ? "outline" :
                            "secondary"
                          }
                        >
                          {risk.category} risk
                        </Badge>
                      </div>
                      <Progress value={risk.risk} className="h-2 mb-1" />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Population average: 10%</span>
                        <span>Your risk: {risk.risk}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Factors Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={riskScores}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="condition" />
                    <PolarRadiusAxis angle={90} domain={[0, 50]} />
                    <Radar name="Risk Score" dataKey="risk" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient History Timeline</CardTitle>
              <CardDescription>
                Comprehensive medical and genomic history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 text-right">
                      <p className="text-xs text-gray-500">Oct 15</p>
                      <p className="text-xs text-gray-500">2024</p>
                    </div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow"></div>
                    <div className="flex-1 pb-6">
                      <h4 className="font-medium">Genetic Testing Completed</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Whole genome sequencing completed. 2,456 variants identified.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 text-right">
                      <p className="text-xs text-gray-500">Sep 28</p>
                      <p className="text-xs text-gray-500">2024</p>
                    </div>
                    <div className="w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow"></div>
                    <div className="flex-1 pb-6">
                      <h4 className="font-medium">Initial Consultation</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Genetic counseling session. Family history reviewed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <Badge>New</Badge>
                </div>
                <h3 className="font-medium mb-2">Comprehensive Genomic Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Full genetic analysis with clinical interpretations
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Generated: Oct 20, 2024</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Pill className="h-8 w-8 text-green-600" />
                  <Badge variant="secondary">Updated</Badge>
                </div>
                <h3 className="font-medium mb-2">Pharmacogenomic Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Medication recommendations based on genetic profile
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Updated: Oct 18, 2024</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                  <Badge variant="outline">Monthly</Badge>
                </div>
                <h3 className="font-medium mb-2">Risk Assessment Summary</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Disease risk scores and prevention strategies
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Updated: Oct 15, 2024</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
