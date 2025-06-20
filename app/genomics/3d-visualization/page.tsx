"use client"

import { useState } from 'react'
import { ThreeDProteinViewer } from '@/components/genomics/3d-protein-viewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dna,
  Microscope,
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

export default function ThreeDVisualizationPage() {
  const [selectedGene, setSelectedGene] = useState('BRCA1')
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariants(prev =>
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    )
  }

  const analysisStats = {
    totalVariants: 3,
    highImpact: 1,
    moderateImpact: 1,
    lowImpact: 1,
    pathogenic: 2
  }

  const genes = [
    { id: 'BRCA1', name: 'BRCA1', description: 'Breast cancer susceptibility gene 1' },
    { id: 'BRCA2', name: 'BRCA2', description: 'Breast cancer susceptibility gene 2' },
    { id: 'TP53', name: 'TP53', description: 'Tumor protein p53' },
    { id: 'EGFR', name: 'EGFR', description: 'Epidermal growth factor receptor' }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Microscope className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">3D Genomic Visualization</h1>
            <p className="text-gray-600">Interactive 3D visualization of protein structures, mutations, and molecular interactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Dna className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Variants</p>
                  <p className="text-xl font-bold">{analysisStats.totalVariants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">High Impact</p>
                  <p className="text-xl font-bold">{analysisStats.highImpact}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Moderate Impact</p>
                  <p className="text-xl font-bold">{analysisStats.moderateImpact}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pathogenic</p>
                  <p className="text-xl font-bold">{analysisStats.pathogenic}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gene Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Gene Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {genes.map(gene => (
              <div
                key={gene.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedGene === gene.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedGene(gene.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{gene.name}</h3>
                  {selectedGene === gene.id && (
                    <Badge variant="default" className="text-xs">Selected</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{gene.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main 3D Visualization */}
      <ThreeDProteinViewer
        gene={selectedGene}
        selectedVariants={selectedVariants}
        onVariantSelect={handleVariantSelect}
                 onSettingsChange={(settings) => {
           // Settings updated
           void settings
         }}
      />

      {/* Analysis Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Structural Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">High Impact Variants</span>
                </div>
                <Badge variant="destructive">{analysisStats.highImpact}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm font-medium">Moderate Impact Variants</span>
                </div>
                <Badge variant="secondary">{analysisStats.moderateImpact}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium">Low Impact Variants</span>
                </div>
                <Badge variant="outline">{analysisStats.lowImpact}</Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Key Domains Affected</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>RING Domain</span>
                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>BRCT Domain</span>
                  <Badge variant="secondary" className="text-xs">Moderate</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Clinical Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Pathogenic Variant Detected</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      The c.68_69del frameshift variant in BRCA1 is associated with significantly increased breast cancer risk.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Structural Impact</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Variants affect critical protein domains involved in DNA repair and tumor suppression.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Treatment Options</h4>
                    <p className="text-sm text-green-700 mt-1">
                      PARP inhibitors may be effective for tumors with BRCA1 mutations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use the 3D Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="navigation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="navigation" className="space-y-3">
              <h4 className="font-medium">Mouse Controls</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Left Click + Drag:</strong> Rotate the structure</li>
                <li>• <strong>Right Click + Drag:</strong> Pan the view</li>
                <li>• <strong>Scroll Wheel:</strong> Zoom in/out</li>
                <li>• <strong>Click on Variant:</strong> Select/deselect variant</li>
                <li>• <strong>Hover:</strong> Highlight atoms and get information</li>
              </ul>
            </TabsContent>

            <TabsContent value="variants" className="space-y-3">
              <h4 className="font-medium">Variant Visualization</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Red Octahedrons:</strong> High impact variants</li>
                <li>• <strong>Orange Cones:</strong> Moderate impact variants</li>
                <li>• <strong>Blue Cubes:</strong> Low impact variants</li>
                <li>• <strong>Green Spheres:</strong> Benign variants</li>
                <li>• <strong>Click variants</strong> to see detailed information</li>
              </ul>
            </TabsContent>

            <TabsContent value="settings" className="space-y-3">
              <h4 className="font-medium">Display Options</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Color Scheme:</strong> Change atom coloring (CPK, chain, etc.)</li>
                <li>• <strong>Representation:</strong> Switch between cartoon, space-fill, stick models</li>
                <li>• <strong>Transparency:</strong> Adjust transparency for better visibility</li>
                <li>• <strong>Labels:</strong> Show/hide variant labels</li>
                <li>• <strong>Interactions:</strong> Display molecular interactions</li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}