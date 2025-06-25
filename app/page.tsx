"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  TrendingUp,
  Activity,
  Target,
  Calendar,
  Heart,
  Pill,
  Clock,
  Globe,
  Play
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
const InteractiveTour = dynamic(() => import("@/components/landing/interactive-tour"), { ssr: false })
import { Alert, AlertDescription } from '@/components/ui/alert'
import { agileConfig } from '@/lib/config/agile'

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-iris-500 to-iris-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-iris-600">AGILE Agent</h1>
              <p className="text-xs text-gray-600">ChatGPT for Clinical Trials</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/agent-demo">
              <Button variant="ghost" size="sm">Live Demo</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-iris-500 hover:bg-iris-700">
                Deploy to Epic
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-iris-50 text-iris-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>ChatGPT for Clinical Trials + Biomarker Insights</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Get Clinical Decision Support
            <span className="text-iris-600 block">in 30 seconds</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            HIPAA-ready AI for your patients, your pipeline, your peace of mind.
            Ask natural language questions, get instant trial matches, receive real-time CDS alerts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/agent-demo">
              <Button size="lg" className="bg-iris-500 hover:bg-iris-700 text-lg px-8 py-4">
                <Play className="mr-2 h-5 w-5" />
                Try Live Demo - No Login Required
              </Button>
            </Link>
            <Link href="#epic-deploy">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-iris-500 text-iris-600 hover:bg-iris-500 hover:text-white">
                Deploy to Epic in 5 Minutes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-gray-500 mb-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">SOC 2 Type II</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">Epic Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">99.97% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - ChatGPT Style */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Just Ask in Plain English
            </h2>
            <p className="text-xl text-gray-600">
              Get instant, evidence-based answers with citations and confidence scores
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* ChatGPT Interface Demo */}
            <Card className="p-6 border-2 border-iris-200">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-iris-100 rounded-full flex items-center justify-center">
                    <span className="text-iris-600 font-bold text-sm">Dr</span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-lg p-3">
                    <p className="text-sm">"Is this patient eligible for CAR-T trials based on their genomic profile?"</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-iris-500 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 bg-iris-50 rounded-lg p-3">
                    <p className="text-sm mb-2">
                      "Based on the genomic profile showing <strong>CD19+ B-cell malignancy markers</strong> and <strong>no prior CAR-T exposure</strong>, this patient has an <strong>87% match confidence</strong> for CAR-T trials."
                    </p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Response time:</strong> 2.3 seconds</p>
                      <p><strong>Sources:</strong> NCCN Guidelines, FDA approvals, 3 open studies within 50 miles</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Instant Results */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-iris-500" />
                <div>
                  <h3 className="font-semibold text-lg">2.1 Second Response Time</h3>
                  <p className="text-gray-600">Lightning-fast analysis of complex genomic data</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-lg">94% Match Accuracy</h3>
                  <p className="text-gray-600">AI-powered clinical trial discovery and eligibility</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-lg">HIPAA-Ready Integration</h3>
                  <p className="text-gray-600">Seamless Epic EHR integration with enterprise security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Viral Features */}
      <section className="px-6 py-16 bg-gradient-to-br from-iris-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Virality & Collaboration
            </h2>
            <p className="text-xl text-gray-600">
              Turn every clinical insight into a shareable moment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-iris-500" />
                  <span>Public Sandbox</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Cloneable, patient-anonymized demo environment for cross-org sharing
                </p>
                <Badge className="bg-iris-50 text-iris-600">
                  agent-demo.agiledefense.health
                </Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRight className="h-5 w-5 text-green-500" />
                  <span>ReportShare Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Secure patient summaries with trackable view/download alerts
                </p>
                <Badge className="bg-green-100 text-green-700">
                  HIPAA Compliant
                </Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-purple-500" />
                  <span>TrialMatch Widget</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Embeddable iframe for trial recommendations in any EHR
                </p>
                <Badge className="bg-purple-100 text-purple-700">
                  White-Label Ready
                </Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span>CDS Hook Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Epic-embedded alerts and mobile push notifications
                </p>
                <Badge className="bg-orange-100 text-orange-700">
                  Real-time
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Epic Deployment CTA */}
      <section id="epic-deploy" className="px-6 py-20 bg-iris-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Deploy to Epic in 5 Minutes
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Easier than installing an app. Zero IT overhead. Start your 30-day free trial.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">1</div>
              <h3 className="font-semibold mb-2">Authenticate</h3>
              <p className="text-sm opacity-90">Epic MyChart credentials</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">2</div>
              <h3 className="font-semibold mb-2">Configure</h3>
              <p className="text-sm opacity-90">Organization settings</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">3</div>
              <h3 className="font-semibold mb-2">Deploy</h3>
              <p className="text-sm opacity-90">Start receiving CDS alerts</p>
            </div>
          </div>

          <Button size="lg" className="bg-white text-iris-600 hover:bg-gray-100 text-lg px-8 py-4">
            Deploy to Epic - Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Company Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-iris-500 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold">AGILE Defense Systems</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-2">Credentials</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>SDVOSB Certified</p>
                <p>CAGE: 9HUP5</p>
                <p>Epic Connection Hub Certified</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Platform</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>IRIS SDK</p>
                <p>IRIS MCP</p>
                <p>Epic FHIR Gateway</p>
                <p>GenomicTwin UI</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>info@agiledefense.ai</p>
                <p>www.Oncology-AI.com</p>
                <p>Enterprise Sales: +1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-sm text-gray-400">
            <p>&copy; 2024 Agile Defense Systems. Advanced Genomic Insights for Laboratory Evaluation (AGILE). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
