import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InfoIcon, FileText, Users, Heart, ChevronDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Baptist Health Community Report',
}

// Mock community health statistics
const healthMetrics = {
  chronicDisease: {
    diabetes: { rate: 12.3, trend: 'increasing', benchmark: 10.8 },
    hypertension: { rate: 32.1, trend: 'stable', benchmark: 30.5 },
    obesity: { rate: 35.7, trend: 'increasing', benchmark: 31.3 },
    mentalHealth: { rate: 18.5, trend: 'increasing', benchmark: 15.2 }
  },
  demographics: {
    population: 765_478,
    medianAge: 38.2,
    diversity: { white: 70, black: 22, hispanic: 4, asian: 2, other: 2 },
    insurance: { insured: 89, medicaid: 18, medicare: 21, uninsured: 11 }
  },
  initiatives: [
    { name: 'Diabetes Prevention Program', participants: 2_341, impact: '23% reduction in new cases' },
    { name: 'Mental Health First Aid', participants: 892, impact: '45% increase in early interventions' },
    { name: 'Food Pharmacy Initiative', participants: 1_567, impact: '18% improvement in A1C levels' }
  ]
}

export default function BaptistMicrosite() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image src="/baptist-logo.svg" alt="Baptist Health" width={160} height={40} priority />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-baptist-blue">Community Health Needs Assessment</h1>
                <p className="text-sm text-gray-600">FY 2025-2027 • Louisville Metro</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-baptist-blue to-baptist-teal text-white px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Building a Healthier Louisville Together</h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 opacity-90">
            Our comprehensive Community Health Needs Assessment identifies priority health issues
            and guides our investment in programs that make a real difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-baptist-blue hover:bg-gray-100">
              <FileText className="mr-2 h-5 w-5" />
              View Full Report
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Users className="mr-2 h-5 w-5" />
              Community Partners
            </Button>
          </div>
        </div>
      </section>

      {/* Stakeholder Alert */}
      <div className="px-4 sm:px-6 py-4 bg-baptist-blue/5">
        <Alert className="max-w-7xl mx-auto border-baptist-blue/20">
          <InfoIcon className="h-4 w-4 text-baptist-blue" />
          <AlertDescription>
            <strong className="text-baptist-blue">For Decision Makers:</strong> This interactive dashboard
            showcases how Baptist Health leverages data-driven insights to address community health priorities
            and demonstrates ROI on population health investments.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Key Data</TabsTrigger>
            <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
            <TabsTrigger value="report">Full Report</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Population Served</CardDescription>
                  <CardTitle className="text-2xl">{healthMetrics.demographics.population.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Uninsured Rate</CardDescription>
                  <CardTitle className="text-2xl">{healthMetrics.demographics.insurance.uninsured}%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Chronic Disease Burden</CardDescription>
                  <CardTitle className="text-2xl">35.7%</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Program Participants</CardDescription>
                  <CardTitle className="text-2xl">4,800+</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Priority Health Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Health Issues</CardTitle>
                <CardDescription>
                  Based on community data, stakeholder input, and health outcomes analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(healthMetrics.chronicDisease).map(([condition, data]) => (
                    <div key={condition} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{condition.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <p className="text-2xl font-bold text-baptist-blue">{data.rate}%</p>
                        <p className="text-sm text-gray-600">vs {data.benchmark}% national</p>
                      </div>
                      <Badge variant={data.trend === 'increasing' ? 'destructive' : 'secondary'}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${data.trend === 'increasing' ? '' : 'rotate-180'}`} />
                        {data.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Insurance Coverage</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Private Insurance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-baptist-blue h-2 rounded-full" style={{width: '50%'}}></div>
                        </div>
                        <span className="text-sm font-medium">50%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Medicare</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-baptist-teal h-2 rounded-full" style={{width: '21%'}}></div>
                        </div>
                        <span className="text-sm font-medium">21%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Medicaid</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '18%'}}></div>
                        </div>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Uninsured</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: '11%'}}></div>
                        </div>
                        <span className="text-sm font-medium">11%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="initiatives" className="space-y-4">
            {healthMetrics.initiatives.map((initiative, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{initiative.name}</CardTitle>
                      <CardDescription>{initiative.participants.toLocaleString()} participants</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-baptist-blue" />
                    <span className="font-medium">Impact:</span>
                    <span>{initiative.impact}</span>
                  </div>
                  <Button className="mt-4 bg-baptist-blue hover:bg-baptist-blue/90" size="sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>FY 2025-2027 CHNA Report</CardTitle>
                <CardDescription>
                  Complete Community Health Needs Assessment for Louisville Metro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-[8.5/11] w-full max-w-4xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  <object
                    data="/FY2527%20CHNA%20Louisville.pdf"
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">PDF viewer not supported in your browser.</p>
                      <Button asChild>
                        <a href="/FY2527%20CHNA%20Louisville.pdf" download>
                          Download Report
                        </a>
                      </Button>
                    </div>
                  </object>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}