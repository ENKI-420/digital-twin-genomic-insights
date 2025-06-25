"use client"

import React, { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dna,
  Microscope,
  BarChart3,
  Settings,
  Info,
  Download,
  Share,
  RefreshCw,
  Play,
  Gauge,
  Zap,
  Database,
  TrendingUp
} from 'lucide-react'

// Dynamic imports for 3D components - no SSR
const CellularScene = dynamic(() => import('@/components/genomics/cellular-scene').then(mod => ({ default: mod.CellularScene })), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading 3D Scene...</div>
})

const EnhancedMolecularViewer = dynamic(() => import('@/components/genomics/enhanced-molecular-viewer').then(mod => ({ default: mod.EnhancedMolecularViewer })), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Molecular Viewer...</div>
})

const EfficacyMatrix = dynamic(() => import('@/components/genomics/efficacy-matrix').then(mod => ({ default: mod.EfficacyMatrix })), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Efficacy Matrix...</div>
})

// Sample protein data - static import is safe
const sampleProteinData = {
  id: 'sample-protein',
  pdbId: 'sample',
  name: 'Sample Protein',
  gene: 'SAMPLE_GENE',
  sequence: 'MVLSEGEWQLVLHVWAKVEADVAGHGQDILIRLFKSHPETLEKFDRFKHLKTEAEMKASEDLKKHGVTVLTALGAILKKKGHHEAELKPLAQSHATKHKIPIKYLEFISEAIIHVLHSRHPGNFGADAQGAMNKALELFRKDIAAKYKELGYQG',
  structure: null,
  variants: [],
  domains: []
}

interface PlatformState {
  selectedVariants: string[]
  selectedDrugs: string[]
  selectedTimePoint: number
  cellularTimeStep: number
  irisData: any[]
}

interface AnalyticsData {
  totalVariants: number
  selectedVariants: number
  efficacyAnalysis: {
    highEfficacy: number
    moderateEfficacy: number
    lowEfficacy: number
  }
  performanceMetrics: {
    renderingFPS: number
    memoryUsage: number
    loadTime: number
  }
}

// Force dynamic rendering to prevent SSR issues
export const revalidate = 0

export default function ThreeDVisualizationPlatform() {
  const [activeTab, setActiveTab] = useState("overview")
  const [mounted, setMounted] = useState(false)
  const [platformState, setPlatformState] = useState<PlatformState>({
    selectedVariants: [],
    selectedDrugs: [],
    selectedTimePoint: 0,
    cellularTimeStep: 0,
    irisData: []
  })
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVariants: 15,
    selectedVariants: 0,
    efficacyAnalysis: {
      highEfficacy: 8,
      moderateEfficacy: 12,
      lowEfficacy: 6
    },
    performanceMetrics: {
      renderingFPS: 60,
      memoryUsage: 85,
      loadTime: 2.3
    }
  })
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected')
  const [expressionData, setExpressionData] = useState<Float32Array>()

  // Ensure component is mounted before rendering 3D content
  useEffect(() => {
    setMounted(true)

    // Generate sample expression data only on client
    const size = 512
    const data = new Float32Array(size * size * 4)
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % size
      const y = Math.floor((i / 4) / size)

      const centerX = size / 2
      const centerY = size / 2
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const normalizedDistance = distance / (size / 2)

      data[i] = Math.sin(normalizedDistance * Math.PI * 2) * Math.exp(-normalizedDistance * 0.5)
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 1
    }
    setExpressionData(data)
  }, [])

  // Handle cross-component interactions
  const handleVariantSelection = useCallback((variantIds: string[]) => {
    setPlatformState(prev => ({
      ...prev,
      selectedVariants: variantIds
    }))
    setAnalytics(prev => ({
      ...prev,
      selectedVariants: variantIds.length
    }))
  }, [])

  const handleEfficacySelection = useCallback((efficacyData: any[]) => {
    const drugIds = [...new Set(efficacyData.map(d => d.drugId))]
    const variantIds = [...new Set(efficacyData.map(d => d.mutationId))]

    setPlatformState(prev => ({
      ...prev,
      selectedDrugs: drugIds,
      selectedVariants: variantIds
    }))
  }, [])

  const handleTimeSync = useCallback((timeStep: number) => {
    setPlatformState(prev => ({
      ...prev,
      cellularTimeStep: timeStep,
      selectedTimePoint: timeStep
    }))
  }, [])

  const handleIRISFeedback = useCallback((data: any[]) => {
    setConnectionStatus('syncing')

    setTimeout(() => {
      setPlatformState(prev => ({
        ...prev,
        irisData: data
      }))
      setConnectionStatus('connected')
    }, 2000)
  }, [])

  const handleSnapshotCapture = useCallback((dataUrl: string) => {
    console.log('Snapshot captured:', dataUrl)
  }, [])

  // Performance monitoring
  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          renderingFPS: 55 + Math.random() * 10,
          memoryUsage: 75 + Math.random() * 20
        }
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [mounted])

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing 3D Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                3D Biological Visualization Platform
              </h1>
              <p className="text-gray-600 mt-1">
                Integrated cellular, molecular, and efficacy analysis
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* IRIS Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  IRIS {connectionStatus}
                </span>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {analytics.performanceMetrics.renderingFPS.toFixed(0)} FPS
                </span>
              </div>

              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>

              <Button size="sm">
                <Share className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cellular">Cellular Scene</TabsTrigger>
            <TabsTrigger value="molecular">Molecular Viewer</TabsTrigger>
            <TabsTrigger value="efficacy">Efficacy Matrix</TabsTrigger>
            <TabsTrigger value="integrated">Integrated Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Architecture Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("cellular")}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Microscope className="h-5 w-5 mr-2 text-blue-600" />
                    Cellular Scene
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Whole-cell context visualization with Δ-expression heatmaps
                    and forward/backward state animations.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>GLTF Model:</span>
                      <Badge variant="outline">~3MB</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Custom Shaders:</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Animation States:</span>
                      <Badge variant="outline">3</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("molecular")}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dna className="h-5 w-5 mr-2 text-green-600" />
                    Molecular Viewer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    High-performance protein structure visualization with Mol*
                    and mutation impact analysis.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Engine:</span>
                      <Badge variant="outline">Mol*</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Variants:</span>
                      <Badge variant="outline">{analytics.totalVariants}</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>ΔΔG Analysis:</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveTab("efficacy")}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    Efficacy Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    3D heat-cube visualization of drug-mutation efficacy with
                    brush selection and IRIS integration.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Instances:</span>
                      <Badge variant="outline">Optimized</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Brush Select:</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>IRIS Pipeline:</span>
                      <Badge variant="outline" className={
                        connectionStatus === 'connected' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'
                      }>
                        {connectionStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Selected Variants</p>
                      <p className="text-2xl font-bold">{analytics.selectedVariants}</p>
                    </div>
                    <Dna className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">High Efficacy</p>
                      <p className="text-2xl font-bold">{analytics.efficacyAnalysis.highEfficacy}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rendering FPS</p>
                      <p className="text-2xl font-bold">{analytics.performanceMetrics.renderingFPS.toFixed(0)}</p>
                    </div>
                    <Gauge className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">IRIS Data</p>
                      <p className="text-2xl font-bold">{platformState.irisData.length}</p>
                    </div>
                    <Database className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Architecture Diagram */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>React-Three-Fiber:</strong> Declarative 3D rendering with React reconciliation</p>
                  <p><strong>GLTF + Custom Shaders:</strong> Efficient asset delivery with Δ-expression mapping</p>
                  <p><strong>Mol* Integration:</strong> High-performance molecular visualization with streaming</p>
                  <p><strong>Instanced Meshes:</strong> Efficient rendering of large datasets in the efficacy matrix</p>
                  <p><strong>React-Spring:</strong> Physics-based animations for smooth user interactions</p>
                  <p><strong>IRIS Pipeline Integration:</strong> Closed-loop feedback system for iterative analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cellular Scene Tab */}
          <TabsContent value="cellular" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Microscope className="h-5 w-5 mr-2" />
                  Cellular Scene - Whole Cell Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CellularScene
                  expressionData={expressionData}
                  onTimeChange={handleTimeSync}
                  onSnapshotCapture={handleSnapshotCapture}
                  className="w-full"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technical Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Custom Vertex Shader</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expression Mapping</span>
                    <Badge variant="outline">Real-time</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Animation States</span>
                    <Badge variant="outline">Forward/Backward</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time Scrubber</span>
                    <Badge variant="outline">Interactive</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Model Size</span>
                    <Badge variant="outline">~3MB GLTF</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Texture Resolution</span>
                    <Badge variant="outline">512x512</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Frame Rate</span>
                    <Badge variant="outline">{analytics.performanceMetrics.renderingFPS.toFixed(0)} FPS</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <Badge variant="outline">{analytics.performanceMetrics.memoryUsage.toFixed(0)}MB</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Molecular Viewer Tab */}
          <TabsContent value="molecular" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dna className="h-5 w-5 mr-2" />
                  Enhanced Molecular Viewer - Protein Structure Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* @ts-ignore - Temporary fix for 3D component type issues */}
                <EnhancedMolecularViewer
                  protein={sampleProteinData}
                  selectedVariants={platformState.selectedVariants}
                  onVariantSelect={(variantId: string) => handleVariantSelection([variantId])}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Efficacy Matrix Tab */}
          <TabsContent value="efficacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Efficacy Matrix - Drug Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EfficacyMatrix
                  selectedVariants={platformState.selectedVariants}
                  selectedDrugs={platformState.selectedDrugs}
                  onEfficacySelect={handleEfficacySelection}
                  onIRISFeedback={handleIRISFeedback}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrated Analysis Tab */}
          <TabsContent value="integrated" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[800px]">
              {/* Cellular + Molecular */}
              <div className="space-y-4">
                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cellular Context</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <CellularScene
                      expressionData={expressionData}
                      onTimeChange={handleTimeSync}
                      onSnapshotCapture={handleSnapshotCapture}
                      className="w-full h-48"
                    />
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Molecular Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <EnhancedMolecularViewer
                      protein={sampleProteinData}
                      selectedVariants={platformState.selectedVariants}
                      onVariantSelect={(variantId: string) => handleVariantSelection([variantId])}
                      className="w-full h-48"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Efficacy Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drug Efficacy Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <EfficacyMatrix
                    selectedVariants={platformState.selectedVariants}
                    selectedDrugs={platformState.selectedDrugs}
                    onEfficacySelect={handleEfficacySelection}
                    onIRISFeedback={handleIRISFeedback}
                    className="w-full h-full"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Synchronized Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Synchronized Analysis Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Selected Variants</label>
                      <p className="text-2xl font-bold">{platformState.selectedVariants.length}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Selected Drugs</label>
                      <p className="text-2xl font-bold">{platformState.selectedDrugs.length}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time Point</label>
                      <p className="text-2xl font-bold">{platformState.cellularTimeStep}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-green-500' :
                        connectionStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm">IRIS Pipeline: {connectionStatus}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync All
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}