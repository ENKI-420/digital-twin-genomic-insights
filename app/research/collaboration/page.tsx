"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Users, Globe2, Building2, MessageSquare, Calendar,
  FileText, GitBranch, Activity, TrendingUp, Award,
  Clock, CheckCircle, AlertCircle, Mail, Video,
  Shield, Star, ChevronRight, MoreHorizontal, Plus,
  Search, Filter, UserPlus, Settings, Link2
} from "lucide-react"

interface Collaborator {
  id: string
  name: string
  email: string
  institution: string
  role: string
  avatar?: string
  expertise: string[]
  h_index: number
  publications: number
  status: "active" | "pending" | "inactive"
}

interface Project {
  id: string
  title: string
  description: string
  lead: string
  collaborators: number
  progress: number
  deadline: string
  status: "active" | "planning" | "completed"
  funding?: string
}

interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: string
  type: "publication" | "data" | "meeting" | "milestone"
}

export default function ResearchCollaborationPage() {
  const [activeTab, setActiveTab] = useState("teams")
  const [searchTerm, setSearchTerm] = useState("")

  const collaborators: Collaborator[] = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@stanford.edu",
      institution: "Stanford University",
      role: "Co-Investigator",
      expertise: ["Cancer Genomics", "Machine Learning", "Bioinformatics"],
      h_index: 45,
      publications: 127,
      status: "active"
    },
    {
      id: "2",
      name: "Prof. Michael Johnson",
      email: "m.johnson@harvard.med",
      institution: "Harvard Medical School",
      role: "Principal Investigator",
      expertise: ["Clinical Genomics", "Precision Medicine"],
      h_index: 62,
      publications: 203,
      status: "active"
    },
    {
      id: "3",
      name: "Dr. Elena Rodriguez",
      email: "e.rodriguez@mit.edu",
      institution: "MIT",
      role: "Data Scientist",
      expertise: ["AI/ML", "Data Integration", "Cloud Computing"],
      h_index: 38,
      publications: 89,
      status: "pending"
    }
  ]

  const projects: Project[] = [
    {
      id: "1",
      title: "Multi-Cancer Early Detection Using Liquid Biopsy",
      description: "Developing AI models for early cancer detection from cell-free DNA",
      lead: "Dr. Sarah Chen",
      collaborators: 12,
      progress: 68,
      deadline: "Q2 2024",
      status: "active",
      funding: "NIH R01 - $2.5M"
    },
    {
      id: "2",
      title: "Population-Scale Pharmacogenomics Database",
      description: "Building comprehensive database of drug-gene interactions",
      lead: "Prof. Michael Johnson",
      collaborators: 8,
      progress: 45,
      deadline: "Q4 2024",
      status: "active",
      funding: "NHGRI U01 - $1.8M"
    },
    {
      id: "3",
      title: "AI-Powered Variant Interpretation Pipeline",
      description: "Automated clinical variant classification system",
      lead: "You",
      collaborators: 5,
      progress: 15,
      deadline: "Q3 2024",
      status: "planning"
    }
  ]

  const recentActivity: Activity[] = [
    {
      id: "1",
      user: "Dr. Sarah Chen",
      action: "published paper",
      target: "Nature Genetics - Liquid Biopsy ML",
      time: "2 hours ago",
      type: "publication"
    },
    {
      id: "2",
      user: "Prof. Michael Johnson",
      action: "shared dataset",
      target: "Pharmacogenomics Cohort v2.1",
      time: "5 hours ago",
      type: "data"
    },
    {
      id: "3",
      user: "Dr. Elena Rodriguez",
      action: "scheduled meeting",
      target: "Weekly AI Model Review",
      time: "1 day ago",
      type: "meeting"
    },
    {
      id: "4",
      user: "Team",
      action: "completed milestone",
      target: "Phase 1 Data Collection",
      time: "3 days ago",
      type: "milestone"
    }
  ]

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Collaboration</h1>
        <p className="text-gray-600">
          Manage research teams, projects, and collaborative efforts
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Collaborators</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-green-600 mt-1">3 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-gray-500 mt-1">Across 5 countries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
              <GitBranch className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-blue-600 mt-1">$8.2M total funding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Publications</CardTitle>
              <Award className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">47</p>
            <p className="text-xs text-green-600 mt-1">↑ 23% this year</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="mt-6">
          <div className="space-y-6">
            {/* Search and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search collaborators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Collaborator
              </Button>
            </div>

            {/* Collaborators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborators.map((collaborator) => (
                <Card key={collaborator.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{collaborator.name}</CardTitle>
                          <p className="text-sm text-gray-500">{collaborator.role}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          collaborator.status === "active" ? "secondary" :
                          collaborator.status === "pending" ? "outline" :
                          "secondary"
                        }
                      >
                        {collaborator.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-3 w-3 mr-2" />
                        {collaborator.institution}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        {collaborator.email}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {collaborator.expertise.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-4 text-sm">
                          <div>
                            <span className="font-medium">{collaborator.h_index}</span>
                            <span className="text-gray-500 ml-1">h-index</span>
                          </div>
                          <div>
                            <span className="font-medium">{collaborator.publications}</span>
                            <span className="text-gray-500 ml-1">papers</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="space-y-6">
            {/* Create New Project */}
            <Card className="border-dashed">
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium mb-2">Start a New Collaborative Project</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Bring together researchers to work on groundbreaking discoveries
                  </p>
                  <Button>Create Project</Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        project.status === "active" ? "default" :
                        project.status === "planning" ? "outline" :
                        "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Lead</p>
                        <p className="font-medium">{project.lead}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Team Size</p>
                        <p className="font-medium">{project.collaborators} members</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Deadline</p>
                        <p className="font-medium">{project.deadline}</p>
                      </div>
                      {project.funding && (
                        <div>
                          <p className="text-gray-500">Funding</p>
                          <p className="font-medium">{project.funding}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-white">
                            <AvatarFallback>U{i}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.collaborators > 4 && (
                          <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium">+{project.collaborators - 4}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          Documents
                        </Button>
                        <Button size="sm">
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Network Visualization */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Collaboration Network</CardTitle>
                  <CardDescription>
                    Visualize your research network connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Globe2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Interactive network visualization</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Connect with 127 researchers across 45 institutions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Network Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Direct Connections</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">2nd Degree</span>
                      <span className="font-medium">312</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Countries</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Institutions</span>
                      <span className="font-medium">45</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Suggested Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>DR</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Dr. Rachel Kim</p>
                          <p className="text-xs text-gray-500">UCSF - Cancer Genomics</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Link2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JL</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Prof. James Liu</p>
                          <p className="text-xs text-gray-500">Yale - Bioinformatics</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Link2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Stay updated with your team's progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === "publication" ? "bg-green-100" :
                      activity.type === "data" ? "bg-blue-100" :
                      activity.type === "meeting" ? "bg-yellow-100" :
                      "bg-purple-100"
                    }`}>
                      {activity.type === "publication" && <FileText className="h-4 w-4 text-green-600" />}
                      {activity.type === "data" && <GitBranch className="h-4 w-4 text-blue-600" />}
                      {activity.type === "meeting" && <Calendar className="h-4 w-4 text-yellow-600" />}
                      {activity.type === "milestone" && <CheckCircle className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {" "}{activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t text-center">
                <Button variant="outline">
                  View All Activity
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}