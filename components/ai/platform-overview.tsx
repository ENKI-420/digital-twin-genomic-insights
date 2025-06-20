"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Brain,
  Stethoscope,
  Database,
  Users,
  Shield,
  TrendingUp,
  Activity,
  CheckCircle
} from 'lucide-react'

export default function PlatformOverview() {
  const coreFeatures = [
    {
      icon: <Stethoscope className="h-8 w-8" />,
      title: "Clinical Decision Support",
      description: "AI-powered diagnostic and therapeutic recommendations with explainable insights",
      metrics: "94.7% accuracy • 185ms response time",
      status: "healthy"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Patient App Generator",
      description: "Multi-modal AI agents create personalized treatment experiences",
      metrics: "87.3% engagement • 2.3s generation time",
      status: "healthy"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "FHIR Interoperability",
      description: "Seamless EHR integration with bi-directional data synchronization",
      metrics: "98.9% sync success • 340ms avg sync",
      status: "healthy"
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Mutation Analysis Pipeline",
      description: "Advanced genomic variant analysis with pharmacogenomic insights",
      metrics: "96.2% accuracy • 3.8s processing",
      status: "degraded"
    }
  ]

  const platformMetrics = {
    totalTenants: 247,
    apiRequests: "2.8M",
    uptime: "99.7%",
    revenue: "$847K"
  }

  const complianceStatus = [
    { name: "HIPAA", status: "certified" },
    { name: "GDPR", status: "certified" },
    { name: "SOC 2 Type II", status: "certified" },
    { name: "ISO 27001", status: "certified" },
    { name: "FedRAMP", status: "in_progress" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            AI-Driven Personalized Medicine Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-standard Data-Centric PaaS delivering transformative healthcare AI
            with multi-tenant architecture, recurring revenue models, and enterprise-grade security
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              99.7% Uptime
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              HIPAA Compliant
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              Enterprise Ready
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{platformMetrics.totalTenants}</div>
              <div className="text-sm text-gray-600">Healthcare Organizations</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Activity className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{platformMetrics.apiRequests}</div>
              <div className="text-sm text-gray-600">Monthly API Requests</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold">{platformMetrics.uptime}</div>
              <div className="text-sm text-gray-600">Platform Uptime</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold">{platformMetrics.revenue}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Core AI Services */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Core AI Services
            </h2>
            <p className="text-gray-600">
              Transformative AI capabilities built for healthcare scale and precision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={feature.status === 'healthy' ? 'default' : 'secondary'}
                          className={feature.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}
                        >
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-3">
                    {feature.description}
                  </CardDescription>
                  <div className="text-sm text-gray-600 font-medium">
                    {feature.metrics}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Business Model & Revenue Streams */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Value-Based Enterprise SaaS/AIaaS</CardTitle>
            <CardDescription className="text-center text-lg">
              Consumption-driven expansion with predictable recurring revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">Basic</div>
                <div className="text-sm text-gray-600">$1,000/month</div>
                <div className="text-xs text-gray-500">Small clinics</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">Professional</div>
                <div className="text-sm text-gray-600">$5,000/month</div>
                <div className="text-xs text-gray-500">Mid-size hospitals</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">Enterprise</div>
                <div className="text-sm text-gray-600">$15,000/month</div>
                <div className="text-xs text-gray-500">Large health systems</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">Enterprise Plus</div>
                <div className="text-sm text-gray-600">$50,000/month</div>
                <div className="text-xs text-gray-500">Academic medical centers</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Plus usage-based charges for AI inferences, data processing, and premium features
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <div>
                  <span className="font-medium">Per AI Analysis:</span>
                  <span className="text-gray-600 ml-1">$0.05-$0.30</span>
                </div>
                <div>
                  <span className="font-medium">Per GB Processed:</span>
                  <span className="text-gray-600 ml-1">$0.03-$0.10</span>
                </div>
                <div>
                  <span className="font-medium">Per Compute Unit:</span>
                  <span className="text-gray-600 ml-1">$0.02-$0.05</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Enterprise-Grade Compliance</CardTitle>
            <CardDescription className="text-center">
              Meeting the highest standards for healthcare data security and privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {complianceStatus.map((compliance, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="font-medium">{compliance.name}</div>
                  <Badge
                    variant={compliance.status === 'certified' ? 'default' : 'secondary'}
                    className={compliance.status === 'certified' ? 'bg-green-500' : 'bg-yellow-500'}
                  >
                    {compliance.status === 'certified' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Certified
                      </>
                    ) : (
                      'In Progress'
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">
                Ready to Transform Healthcare with AI?
              </h3>
              <p className="text-blue-100 max-w-2xl mx-auto">
                Join leading healthcare organizations leveraging our AI-driven platform
                to improve patient outcomes, reduce costs, and accelerate medical discoveries.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="secondary" size="lg">
                  Schedule Demo
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Documentation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}