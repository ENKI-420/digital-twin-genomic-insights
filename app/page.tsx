"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Database,
  Brain,
  Shield,
  Zap,
  FileText,
  Search,
  Dna,
  Stethoscope,
  Building2,
  ArrowRight,
  CheckCircle,
  Star,
  Network,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
const InteractiveTour = dynamic(() => import("@/components/landing/interactive-tour"), { ssr: false })

interface FeatureCard {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  badge?: string
}

interface StatsCard {
  label: string
  value: string
  change: string
  icon: React.ReactNode
}

export default function HomePage() {
  const [activeDemo, setActiveDemo] = useState("clinician")
  const [showTour,setShowTour]=useState(typeof window!=="undefined" && !localStorage.getItem("tourDone"))
  const dismissTour=()=>{localStorage.setItem("tourDone","1");setShowTour(false)}

  const features: FeatureCard[] = [
    {
      icon: <Dna className="h-6 w-6" />,
      title: "Genomic Analysis",
      description: "AI-powered genomic variant analysis with CPIC guidelines integration",
      href: "/genomics",
      badge: "AI-Powered",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Digital Twin",
      description: "Personalized genomic digital twins with ACMG variant classification",
      href: "/patients/demo-001/digital-twin",
      badge: "New",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Agent Orchestration",
      description: "Federated AI agents for radiology, genomics, and clinical workflows",
      href: "/agent-orchestration",
      badge: "Enterprise",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Patient Matching",
      description: "Intelligent patient-trial matching based on genomic profiles",
      href: "/trial-matching",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Epic Integration",
      description: "Seamless integration with Epic EHR and FHIR standards",
      href: "/epic-integration",
      badge: "Epic Certified",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Research Collaboration",
      description: "Real-time collaboration tools for genomic research teams",
      href: "/research",
    },
  ]

  const stats: StatsCard[] = [
    {
      label: "Active Patients",
      value: "2,847",
      change: "+12%",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Genomic Analyses",
      value: "15,234",
      change: "+23%",
      icon: <Dna className="h-4 w-4" />,
    },
    {
      label: "Trial Matches",
      value: "1,456",
      change: "+34%",
      icon: <Search className="h-4 w-4" />,
    },
    {
      label: "Research Projects",
      value: "89",
      change: "+8%",
      icon: <FileText className="h-4 w-4" />,
    },
  ]

  const userRoles = [
    {
      id: "clinician",
      title: "Clinicians",
      description: "Healthcare providers using genomic insights for patient care",
      features: [
        "Epic EHR integration",
        "Real-time genomic analysis",
        "CPIC drug recommendations",
        "Patient trial matching",
      ],
      cta: "Access Clinical Dashboard",
      href: "/dashboard",
    },
    {
      id: "patient",
      title: "Patients",
      description: "Individuals seeking personalized genomic healthcare insights",
      features: [
        "Personal genomic dashboard",
        "Treatment recommendations",
        "Clinical trial opportunities",
        "Secure data access",
      ],
      cta: "View My Health Data",
      href: "/patient-dashboard",
    },
    {
      id: "researcher",
      title: "Researchers",
      description: "Scientists advancing genomic medicine through collaboration",
      features: [
        "Research collaboration tools",
        "Grant opportunity discovery",
        "Data sharing platforms",
        "AI-powered insights",
      ],
      cta: "Start Research Project",
      href: "/research",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4" variant="outline">
            <Star className="h-3 w-3 mr-1" />
            Epic Marketplace Certified
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AGENT Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Adaptive Genomic Evidence Network for Trials - Revolutionizing precision medicine through AI-powered genomic
            analysis, real-time collaboration, and intelligent clinical decision support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signin">
                <Shield className="h-5 w-5 mr-2" />
                Sign In with Epic
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">
                <Zap className="h-5 w-5 mr-2" />
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change} from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Built for Every Healthcare Role</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AGENT adapts to your specific needs, whether you're a clinician, patient, or researcher.
          </p>
        </div>

        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            {userRoles.map((role) => (
              <TabsTrigger key={role.id} value={role.id} className="flex items-center gap-2">
                {role.id === "clinician" && <Stethoscope className="h-4 w-4" />}
                {role.id === "patient" && <Users className="h-4 w-4" />}
                {role.id === "researcher" && <Building2 className="h-4 w-4" />}
                {role.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {userRoles.map((role) => (
            <TabsContent key={role.id} value={role.id} className="mt-8">
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                  <p className="text-gray-600">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4">Key Features:</h4>
                      <ul className="space-y-3">
                        {role.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          {role.id === "clinician" && <Stethoscope className="h-16 w-16 text-blue-600" />}
                          {role.id === "patient" && <Users className="h-16 w-16 text-purple-600" />}
                          {role.id === "researcher" && <Building2 className="h-16 w-16 text-green-600" />}
                        </div>
                        <Button asChild>
                          <Link href={role.href}>
                            {role.cta}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Platform Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need for precision medicine, from genomic analysis to clinical trial matching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={feature.href}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join leading healthcare institutions using AGENT for precision medicine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact" className="flex items-center">
                  Schedule Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/documentation">View Documentation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {showTour && <InteractiveTour industry="default" onDismiss={dismissTour} />}
    </div>
  )
}
