import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, AlertCircle, CheckCircle, TrendingUp, Activity, Dna, Users } from 'lucide-react'

export async function generateStaticParams() {
  return [{ id: 'BH-0001' }]
}

async function fetchMockData(patientId: string) {
  // Comprehensive mock patient data for Baptist Health demo
  return {
    id: patientId,
    demographics: {
      name: "Sarah Johnson",
      age: 52,
      gender: "Female",
      mrn: "BH-0001",
      lastVisit: "2024-06-15",
      primaryCare: "Dr. Michael Chen",
      insuranceStatus: "Active - Baptist Health Plan"
    },
    genomics: [
      {
        gene: 'CYP2C19',
        variant: '*2/*17',
        impact: 'Altered metabolism',
        significance: 'Moderate',
        medications: ['Clopidogrel', 'Omeprazole'],
        recommendation: 'Consider alternative antiplatelet therapy'
      },
      {
        gene: 'TP53',
        variant: 'c.215C>G',
        impact: 'Loss of function',
        significance: 'High',
        cancerRisk: '45% lifetime risk',
        recommendation: 'Enhanced screening protocol recommended'
      },
      {
        gene: 'BRCA2',
        variant: 'c.5946delT',
        impact: 'Pathogenic',
        significance: 'High',
        cancerRisk: '69% breast, 17% ovarian',
        recommendation: 'Discuss prophylactic options'
      }
    ],
    trials: [
      {
        id: 'NCT-04123456',
        name: 'Precision Medicine Initiative for CYP2C19 Variants',
        phase: 'III',
        status: 'Enrolling',
        matchScore: 94,
        sponsor: 'Baptist Health Research Institute',
        pi: 'Dr. Jennifer Martinez',
        distance: '0.3 miles'
      },
      {
        id: 'NCT-05789012',
        name: 'BRCA2 Targeted Therapy Study',
        phase: 'II',
        status: 'Enrolling',
        matchScore: 88,
        sponsor: 'NCI',
        pi: 'Dr. Robert Kim',
        distance: '2.1 miles'
      },
      {
        id: 'NCT-06543210',
        name: 'TP53 Mutation Cancer Prevention Trial',
        phase: 'II',
        status: 'Pre-screening',
        matchScore: 76,
        sponsor: 'Baptist Health / University of Louisville',
        pi: 'Dr. Amanda Wilson',
        distance: '0.3 miles'
      }
    ],
    riskScores: {
      cardiovascular: { score: 72, trend: 'improving', lastUpdate: '2024-06-01' },
      oncology: { score: 85, trend: 'stable', lastUpdate: '2024-06-15' },
      diabetes: { score: 45, trend: 'worsening', lastUpdate: '2024-06-10' }
    },
    medications: [
      { name: 'Metformin', dose: '500mg BID', genomicImpact: 'None' },
      { name: 'Atorvastatin', dose: '20mg QD', genomicImpact: 'Monitor for myopathy' },
      { name: 'Lisinopril', dose: '10mg QD', genomicImpact: 'None' }
    ]
  }
}

export default async function DigitalTwinPage({ params }: { params: { id: string } }) {
  const data = await fetchMockData(params.id)
  if (!data) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Stakeholder Banner */}
      <Alert className="m-4 bg-baptist-blue/10 border-baptist-blue">
        <InfoIcon className="h-4 w-4 text-baptist-blue" />
        <AlertTitle className="text-baptist-blue">Demo Mode - Baptist Health Digital Twin</AlertTitle>
        <AlertDescription>
          This comprehensive view demonstrates how genomic data, clinical history, and research opportunities
          come together to enable precision medicine at the point of care.
        </AlertDescription>
      </Alert>

      {/* Patient Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.demographics.name}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span>MRN: {data.demographics.mrn}</span>
                <span>Age: {data.demographics.age}</span>
                <span>Last Visit: {data.demographics.lastVisit}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-1" />
                View EHR
              </Button>
              <Button className="bg-baptist-blue hover:bg-baptist-blue/90" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Care Team
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="genomics" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="genomics">Genomics</TabsTrigger>
            <TabsTrigger value="trials">Clinical Trials</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="genomics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="h-5 w-5 text-baptist-blue" />
                  Pharmacogenomic Profile
                </CardTitle>
                <CardDescription>
                  Actionable genetic variants affecting medication response and disease risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.genomics.map((variant, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{variant.gene}</h3>
                          <Badge variant={variant.significance === 'High' ? 'destructive' : 'secondary'}>
                            {variant.significance} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Variant: {variant.variant}</p>
                        <p className="text-sm mb-2">{variant.impact}</p>
                        {variant.cancerRisk && (
                          <p className="text-sm text-red-600 font-medium mb-2">
                            Cancer Risk: {variant.cancerRisk}
                          </p>
                        )}
                        {variant.medications && (
                          <div className="flex gap-2 mb-2">
                            {variant.medications.map((med, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Alert className="flex-1 max-w-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {variant.recommendation}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Matched Clinical Trials</CardTitle>
                <CardDescription>
                  Research opportunities based on genomic profile and clinical history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.trials.map((trial) => (
                  <div key={trial.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{trial.name}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            {trial.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <span>Phase {trial.phase} • {trial.status}</span>
                          <span>PI: {trial.pi}</span>
                          <span>{trial.sponsor}</span>
                          <span>📍 {trial.distance}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-baptist-blue hover:bg-baptist-blue/90">
                            Refer Patient
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(data.riskScores).map(([category, risk]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize">{category} Risk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold">{risk.score}</span>
                      <Badge variant={risk.trend === 'improving' ? 'default' : risk.trend === 'stable' ? 'secondary' : 'destructive'}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${risk.trend === 'worsening' ? 'rotate-180' : ''}`} />
                        {risk.trend}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">Updated: {risk.lastUpdate}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
                <CardDescription>
                  Medications with pharmacogenomic considerations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.medications.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dose}</p>
                      </div>
                      {med.genomicImpact !== 'None' && (
                        <Badge variant="outline" className="ml-2">
                          {med.genomicImpact}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}