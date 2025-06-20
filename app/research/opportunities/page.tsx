"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Search, Filter, Calendar, DollarSign, Users, Target,
  TrendingUp, Clock, AlertCircle, CheckCircle, XCircle,
  FileText, Download, Share2, Star, Bookmark, ChevronRight,
  Building2, MapPin, Microscope, Brain, Dna, Activity
} from "lucide-react"

interface FundingOpportunity {
  id: string
  title: string
  agency: string
  type: "grant" | "contract" | "fellowship" | "award"
  amount: string
  deadline: string
  status: "open" | "closing_soon" | "closed"
  relevanceScore: number
  saved: boolean
  tags: string[]
  description: string
}

interface SavedGrant {
  id: string
  title: string
  progress: number
  deadline: string
  collaborators: number
  status: "draft" | "in_review" | "submitted"
}

export default function ResearchOpportunitiesPage() {
  const [activeTab, setActiveTab] = useState("discover")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAgency, setFilterAgency] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const opportunities: FundingOpportunity[] = [
    {
      id: "1",
      title: "Precision Medicine Initiative - Genomic Data Analysis",
      agency: "NIH",
      type: "grant",
      amount: "$2.5M",
      deadline: "2024-03-15",
      status: "open",
      relevanceScore: 98,
      saved: true,
      tags: ["genomics", "AI", "precision medicine"],
      description: "Supporting innovative approaches to analyze large-scale genomic datasets using AI"
    },
    {
      id: "2",
      title: "Cancer Genomics Cloud Pilots",
      agency: "NCI",
      type: "contract",
      amount: "$1.8M",
      deadline: "2024-02-28",
      status: "closing_soon",
      relevanceScore: 95,
      saved: false,
      tags: ["cancer", "cloud computing", "genomics"],
      description: "Develop cloud-based platforms for cancer genomics research"
    },
    {
      id: "3",
      title: "AI/ML for Rare Disease Diagnosis",
      agency: "NCATS",
      type: "grant",
      amount: "$500K",
      deadline: "2024-04-01",
      status: "open",
      relevanceScore: 92,
      saved: true,
      tags: ["AI", "rare diseases", "diagnostics"],
      description: "Apply machine learning to improve rare disease diagnosis from genomic data"
    },
    {
      id: "4",
      title: "Pharmacogenomics Implementation Network",
      agency: "NHGRI",
      type: "fellowship",
      amount: "$150K/year",
      deadline: "2024-05-15",
      status: "open",
      relevanceScore: 88,
      saved: false,
      tags: ["pharmacogenomics", "clinical implementation"],
      description: "Support clinical implementation of pharmacogenomic testing"
    }
  ]

  const savedGrants: SavedGrant[] = [
    {
      id: "1",
      title: "AI-Powered Genomic Variant Interpretation",
      progress: 75,
      deadline: "10 days",
      collaborators: 4,
      status: "draft"
    },
    {
      id: "2",
      title: "Population-Scale Genomics Platform",
      progress: 100,
      deadline: "Submitted",
      collaborators: 6,
      status: "submitted"
    },
    {
      id: "3",
      title: "Real-time Clinical Decision Support",
      progress: 45,
      deadline: "3 weeks",
      collaborators: 3,
      status: "draft"
    }
  ]

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesAgency = filterAgency === "all" || opp.agency === filterAgency
    const matchesType = filterType === "all" || opp.type === filterType
    return matchesSearch && matchesAgency && matchesType
  })

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Opportunities</h1>
        <p className="text-gray-600">
          Discover funding opportunities and manage grant applications
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Opportunities</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">127</p>
            <p className="text-xs text-green-600 mt-1">23 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Funding</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$45.2M</p>
            <p className="text-xs text-gray-500 mt-1">Available this quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-blue-600 mt-1">3 in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">42%</p>
            <p className="text-xs text-green-600 mt-1">↑ 8% from last year</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterAgency} onValueChange={setFilterAgency}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                <SelectItem value="NIH">NIH</SelectItem>
                <SelectItem value="NSF">NSF</SelectItem>
                <SelectItem value="DOD">DOD</SelectItem>
                <SelectItem value="NCI">NCI</SelectItem>
                <SelectItem value="NCATS">NCATS</SelectItem>
                <SelectItem value="NHGRI">NHGRI</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="grant">Grant</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="fellowship">Fellowship</SelectItem>
                <SelectItem value="award">Award</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* AI Recommendations */}
          <Alert className="mb-6">
            <Brain className="h-4 w-4" />
            <AlertTitle>AI Recommendations</AlertTitle>
            <AlertDescription>
              Based on your research profile and past applications, we've identified 5 highly relevant opportunities with a combined funding potential of $8.2M
            </AlertDescription>
          </Alert>

          {/* Opportunities List */}
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                        <Badge
                          variant={
                            opportunity.status === "open" ? "secondary" :
                            opportunity.status === "closing_soon" ? "destructive" :
                            "outline"
                          }
                        >
                          {opportunity.status === "closing_soon" ? "Closing Soon" : opportunity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {opportunity.agency}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {opportunity.amount}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Deadline: {opportunity.deadline}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={opportunity.saved ? "text-yellow-500" : ""}
                        >
                          <Bookmark className={`h-4 w-4 ${opportunity.saved ? "fill-current" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Relevance Score</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-green-600">{opportunity.relevanceScore}%</span>
                          <Microscope className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {opportunity.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button>
                      Apply Now
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedGrants.map((grant) => (
              <Card key={grant.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{grant.title}</CardTitle>
                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant={
                        grant.status === "submitted" ? "secondary" :
                        grant.status === "in_review" ? "outline" :
                        "default"
                      }
                    >
                      {grant.status}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {grant.collaborators} collaborators
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">{grant.progress}%</span>
                      </div>
                      <Progress value={grant.progress} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Deadline</span>
                      <span className={`font-medium ${
                        grant.deadline === "Submitted" ? "text-green-600" :
                        grant.deadline.includes("days") ? "text-orange-600" :
                        ""
                      }`}>
                        {grant.deadline}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-full min-h-[250px]">
                <Button variant="ghost" className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">Start New Application</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>
                Track your grant applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Genomic Data Integration Platform</h4>
                      <p className="text-sm text-gray-500">NIH R01 - $2.5M over 5 years</p>
                    </div>
                    <Badge variant="secondary" className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Funded
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Submitted: Jan 15, 2024</span>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">AI-Powered Variant Classification</h4>
                      <p className="text-sm text-gray-500">NSF CAREER Award - $500K</p>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Under Review
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Submitted: Dec 1, 2023</span>
                    <Button variant="ghost" size="sm">
                      Track Status
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">Population Genomics Database</h4>
                      <p className="text-sm text-gray-500">NHGRI U01 - $1.8M</p>
                    </div>
                    <Badge variant="destructive" className="flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Funded
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Submitted: Oct 15, 2023</span>
                    <Button variant="ghost" size="sm">
                      View Feedback
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Funding Trends</CardTitle>
                <CardDescription>
                  Analysis of funding patterns in genomics research
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">AI/ML in Genomics</p>
                        <p className="text-sm text-gray-600">45% increase in funding</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-semibold">↑ 45%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Clinical Implementation</p>
                        <p className="text-sm text-gray-600">Steady growth</p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-semibold">↑ 22%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Dna className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Population Genomics</p>
                        <p className="text-sm text-gray-600">Emerging priority</p>
                      </div>
                    </div>
                    <span className="text-yellow-600 font-semibold">↑ 18%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Factors</CardTitle>
                <CardDescription>
                  Key elements of successful applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Multi-institutional Collaboration</p>
                      <Progress value={85} className="h-2 mt-1" />
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">AI/ML Components</p>
                      <Progress value={78} className="h-2 mt-1" />
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Clinical Translation Focus</p>
                      <Progress value={72} className="h-2 mt-1" />
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Preliminary Data</p>
                      <Progress value={90} className="h-2 mt-1" />
                    </div>
                    <span className="text-sm font-medium">90%</span>
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