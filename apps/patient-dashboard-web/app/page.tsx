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
  Pill
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
const InteractiveTour = dynamic(() => import("@/components/landing/interactive-tour"), { ssr: false })
import { Alert, AlertDescription } from '@/components/ui/alert'

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
    <main className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-baptist-blue/10 to-baptist-teal/10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-baptist-blue mb-3">
            Welcome to Baptist Health GenomicTwin Demo
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
            Experience the future of precision medicine, clinical decision support,
            and community health insights—all in one integrated platform.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link href="/baptist/microsite">
              <Button className="bg-baptist-blue hover:bg-baptist-blue/90">
                <Heart className="mr-2 h-4 w-4" />
                Community Health
              </Button>
            </Link>
            <Link href="/patients/BH-0001/digital-twin">
              <Button variant="outline">
                <Dna className="mr-2 h-4 w-4" />
                Digital Twin Demo
              </Button>
            </Link>
          </div>
        </header>

        {/* Demo Cards Grid */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Community Report Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-baptist-blue" />
                  Community Report
                </CardTitle>
              </div>
              <CardDescription>
                Interactive CHNA dashboard with population health insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• FY25-27 Louisville CHNA Report</li>
                <li>• Population health metrics</li>
                <li>• Community initiatives tracking</li>
              </ul>
              <Link href="/baptist/microsite">
                <Button className="w-full bg-baptist-blue hover:bg-baptist-blue/90">
                  View Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Digital Twin Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-baptist-teal" />
                Patient Digital Twin
              </CardTitle>
              <CardDescription>
                Comprehensive genomic and clinical data visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Pharmacogenomic profiles</li>
                <li>• Clinical trial matching</li>
                <li>• Risk assessment scores</li>
              </ul>
              <Link href="/patients/BH-0001/digital-twin">
                <Button className="w-full" variant="outline">
                  View Patient
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* CDS-Hooks Card */}
          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-green-600" />
                CDS-Hooks Demo
              </CardTitle>
              <CardDescription>
                Real-time clinical decision support at point of care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Medication prescribe alerts</li>
                <li>• Genomic-based dosing</li>
                <li>• Drug interaction warnings</li>
              </ul>
              <Link href="/cds-hooks-demo">
                <Button className="w-full" variant="outline">
                  Try CDS Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Platform Capabilities</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-baptist-blue/10 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-baptist-blue" />
              </div>
              <div>
                <h3 className="font-medium mb-1">EHR Integration</h3>
                <p className="text-sm text-gray-600">
                  Seamless Epic/FHIR integration with real-time data sync
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-baptist-teal/10 rounded-lg flex items-center justify-center">
                <Dna className="h-5 w-5 text-baptist-teal" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Genomic Intelligence</h3>
                <p className="text-sm text-gray-600">
                  Advanced pharmacogenomics and precision medicine insights
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Population Health</h3>
                <p className="text-sm text-gray-600">
                  Data-driven community health initiatives and outcomes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center">
          <Alert className="bg-gray-50 border-gray-200">
            <AlertDescription className="text-sm">
              <strong>Demo Mode:</strong> This is a demonstration environment with simulated patient data.
              Click "Log Out" in the header to return to the login screen.
            </AlertDescription>
          </Alert>
        </footer>
      </div>
    </main>
  )
}