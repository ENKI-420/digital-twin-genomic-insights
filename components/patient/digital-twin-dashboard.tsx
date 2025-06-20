"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dna,
  Activity,
  Pill,
  Shield,
  AlertTriangle,
  TrendingUp,
  Heart,
  Brain,
  Info,
  Download,
  Share2,
  Calendar,
  ChevronRight,
  Eye,
  Lock
} from "lucide-react"
import { DigitalTwin, DiseaseRisk, PharmacogenomicMarker, Variant } from "@/lib/agents/department/genomics-agent"

interface DigitalTwinDashboardProps {
  patientId: string
}

export default function DigitalTwinDashboard({ patientId }: DigitalTwinDashboardProps) {
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchDigitalTwin()
  }, [patientId])

  const fetchDigitalTwin = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/digital-twin`)
      if (response.ok) {
        const data = await response.json()
        setDigitalTwin(data)
      }
    } catch (error) {
      console.error("Failed to fetch digital twin:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk > 0.7) return "text-red-600 bg-red-50"
    if (risk > 0.4) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">
          <Dna className="h-12 w-12 text-blue-600" />
        </div>
      </div>
    )
  }

  if (!digitalTwin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          Your genomic digital twin is being created. Please check back later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Dna className="h-8 w-8 mr-3 text-blue-600" />
            Your Genomic Digital Twin
          </h1>
          <p className="text-gray-600 mt-2">
            Personalized health insights based on your genomic profile
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share with Doctor
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Variants Analyzed</p>
                <p className="text-2xl font-bold">{digitalTwin.genomicProfile.variants.length}</p>
              </div>
              <Dna className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {digitalTwin.predictions.diseaseRisk.filter(r => r.risk > 0.7).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drug Alerts</p>
                <p className="text-2xl font-bold text-orange-600">
                  {digitalTwin.genomicProfile.pharmacogenomics.filter(p => p.level === 'high').length}
                </p>
              </div>
              <Pill className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold">
                  {new Date(digitalTwin.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risks">Disease Risks</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Top Health Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Your Top Health Priorities
              </CardTitle>
              <CardDescription>
                Based on your genomic profile and family history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digitalTwin.predictions.diseaseRisk
                  .slice(0, 3)
                  .map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{risk.disease}</h4>
                        <Badge className={getRiskColor(risk.risk)}>
                          {formatPercentage(risk.risk)} risk
                        </Badge>
                      </div>
                      <Progress value={risk.risk * 100} className="mb-3" />
                      <div className="text-sm text-gray-600">
                        <p className="mb-2">Timeframe: {risk.timeframe}</p>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-green-600" />
                          <span>Prevention: {risk.modifiableFactors.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Pharmacogenomic Alerts */}
          {digitalTwin.genomicProfile.pharmacogenomics.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <Pill className="h-4 w-4 text-orange-600" />
              <AlertTitle>Important Medication Information</AlertTitle>
              <AlertDescription>
                Your genetic profile affects how you respond to certain medications.
                Always share this information with your healthcare providers.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="risks" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Disease Risk Assessment</CardTitle>
              <CardDescription>
                Lifetime risk predictions based on polygenic risk scores and pathogenic variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digitalTwin.predictions.diseaseRisk.map((risk, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {risk.disease.includes("Heart") && <Heart className="h-5 w-5 text-red-500" />}
                        {risk.disease.includes("Brain") && <Brain className="h-5 w-5 text-purple-500" />}
                        {!risk.disease.includes("Heart") && !risk.disease.includes("Brain") &&
                          <Activity className="h-5 w-5 text-blue-500" />}
                        <div>
                          <h4 className="font-medium">{risk.disease}</h4>
                          <p className="text-sm text-gray-600">
                            Confidence: {formatPercentage(risk.confidence)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getRiskColor(risk.risk)}>
                          {formatPercentage(risk.risk)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{risk.timeframe}</p>
                      </div>
                    </div>
                    <Progress value={risk.risk * 100} className="h-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails({ ...showDetails, [risk.disease]: !showDetails[risk.disease] })}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      {showDetails[risk.disease] ? "Hide" : "Show"} prevention strategies
                    </Button>
                    {showDetails[risk.disease] && (
                      <div className="bg-gray-50 rounded-lg p-4 text-sm">
                        <p className="font-medium mb-2">Modifiable Risk Factors:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {risk.modifiableFactors.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacogenomic Profile</CardTitle>
              <CardDescription>
                How your genetics affect medication response
              </CardDescription>
            </CardHeader>
            <CardContent>
              {digitalTwin.genomicProfile.pharmacogenomics.length === 0 ? (
                <p className="text-gray-500">No pharmacogenomic variants detected</p>
              ) : (
                <div className="space-y-4">
                  {digitalTwin.genomicProfile.pharmacogenomics.map((marker, index) => (
                    <Card key={index} className={marker.level === 'high' ? 'border-red-200' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{marker.drugName}</h4>
                              <Badge
                                variant={marker.level === 'high' ? 'destructive' : 'secondary'}
                              >
                                {marker.level} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Gene: {marker.gene} | Variant: {marker.variant}
                            </p>
                            <div className={`rounded-lg p-3 ${
                              marker.effect === 'increased_toxicity' ? 'bg-red-50' :
                              marker.effect === 'decreased_efficacy' ? 'bg-yellow-50' :
                              'bg-blue-50'
                            }`}>
                              <p className="text-sm font-medium mb-1">
                                Effect: {marker.effect.replace('_', ' ')}
                              </p>
                              <p className="text-sm">{marker.recommendation}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Genomic Variants</CardTitle>
              <CardDescription>
                Clinically significant variants in your genome
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {digitalTwin.genomicProfile.variants
                  .filter(v => v.clinicalSignificance)
                  .map((variant, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{variant.gene || `Chr${variant.chromosome}`}</h4>
                          <p className="text-sm text-gray-600">
                            {variant.chromosome}:{variant.position} {variant.reference}>{variant.alternative}
                          </p>
                        </div>
                        <Badge
                          variant={
                            variant.clinicalSignificance === 'Pathogenic' ? 'destructive' :
                            variant.clinicalSignificance === 'Uncertain' ? 'secondary' :
                            'default'
                          }
                        >
                          {variant.clinicalSignificance}
                        </Badge>
                      </div>
                      {variant.acmgClassification && (
                        <p className="text-sm">
                          ACMG Classification: {variant.acmgClassification}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Notice */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Your Privacy is Protected</AlertTitle>
        <AlertDescription>
          Your genomic data is encrypted and only accessible by you and healthcare providers you authorize.
          All analysis is performed using privacy-preserving techniques.
        </AlertDescription>
      </Alert>
    </div>
  )
}