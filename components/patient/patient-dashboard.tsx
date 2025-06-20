"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dna, FileText, Activity, Cpu, MessageSquare, Database, Clock } from "lucide-react"

interface PatientDashboardProps {
  patient: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
  }
}

export function PatientDashboard({ patient }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-500">View and manage patient information across multiple categories</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="genomic" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Genomic Viewer
          </TabsTrigger>
          <TabsTrigger value="beaker" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Beaker Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Genomic Visualization Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Dna className="mr-2 h-5 w-5 text-blue-600" />
                  Genomic Visualization
                </CardTitle>
                <p className="text-sm text-gray-500">Interactive 3D genomic visualization</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold">3 Active Sessions</div>
                  <div className="text-sm text-gray-500">+1 from last week</div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/genomic-viewer">View Genomic Viewer</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Mutation Analysis Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Activity className="mr-2 h-5 w-5 text-purple-600" />
                  Mutation Analysis
                </CardTitle>
                <p className="text-sm text-gray-500">AI-powered mutation predictions</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold">12 Predictions</div>
                  <div className="text-sm text-gray-500">Updated 15 minutes ago</div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/mutation-analysis">View Mutation Analysis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Digital Twin Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Cpu className="mr-2 h-5 w-5 text-green-600" />
                  Digital Twin
                </CardTitle>
                <p className="text-sm text-gray-500">Patient-specific genomic digital twin</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold">1 Active Model</div>
                  <div className="text-sm text-gray-500">2 simulations in progress</div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/digital-twin">View Digital Twin</Link>
                </Button>
              </CardContent>
            </Card>

            {/* AIDEN Assistant Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                  AIDEN Assistant
                </CardTitle>
                <p className="text-sm text-gray-500">Advanced Intelligent Digital Entity for Nucleotide analysis</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold">8 Conversations</div>
                  <div className="text-sm text-gray-500">Last interaction: 5 minutes ago</div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/chat">Chat with AIDEN</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Epic FHIR Integration Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Epic FHIR Integration
                </CardTitle>
                <p className="text-sm text-gray-500">Connected to Epic's FHIR API</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold">4 Test Patients</div>
                  <div className="text-sm text-gray-500">Epic Sandbox Environment</div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/beaker-reports">View Epic FHIR</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Research Tools Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Database className="mr-2 h-5 w-5 text-purple-600" />
                  Research Tools
                </CardTitle>
                <p className="text-sm text-gray-500">Advanced analysis for researchers</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-2xl font-bold">3 Active Projects</div>
                  <div className="text-sm text-gray-500">Last updated: 2 hours ago</div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/research">Access Research Tools</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-medium">
                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <p className="text-sm text-gray-500">System and user activity log</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Database className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Batch Analysis #124</div>
                      <div className="text-sm text-gray-500">Completed 2 hours ago</div>
                      <div className="mt-1 text-sm">Samples: 48</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Duration: 1.2 hours</div>
                    <div className="text-sm">Mutations Found: 124</div>
                    <Badge className="mt-1 bg-green-100 text-green-800">Successful</Badge>
                  </div>
                </div>

                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Model Training #67</div>
                      <div className="text-sm text-gray-500">Completed 5 hours ago</div>
                      <div className="mt-1 text-sm">Training Samples: 1,248</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Duration: 3.5 hours</div>
                    <div className="text-sm">Accuracy: 94.2%</div>
                    <Badge className="mt-1 bg-green-100 text-green-800">Successful</Badge>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-gray-100 p-2">
                      <Cpu className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">System Update</div>
                      <div className="text-sm text-gray-500">Completed 1 day ago</div>
                      <div className="mt-1 text-sm">Version: 3.2.1</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Components: Core, UI, API</div>
                    <div className="text-sm">Duration: 15 minutes</div>
                    <Badge className="mt-1 bg-blue-100 text-blue-800">Info</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genomic">
          <Card>
            <CardHeader>
              <CardTitle>Genomic Viewer</CardTitle>
              <p className="text-sm text-gray-500">Interactive genomic data visualization</p>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <Dna className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No genomic data available</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading genomic data for this patient.</p>
                  <div className="mt-6">
                    <Button>Upload Genomic Data</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beaker">
          <Card>
            <CardHeader>
              <CardTitle>Beaker Reports</CardTitle>
              <p className="text-sm text-gray-500">Laboratory and diagnostic reports from Epic Beaker</p>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <FileText className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Connect to Epic FHIR to retrieve Beaker reports for this patient.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/beaker-reports">Access Beaker Reports</Link>
                    </Button>
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
