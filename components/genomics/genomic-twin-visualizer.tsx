"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { RotateCcw, Download, Settings, Maximize, Target, BarChart3, Dna, Users, AlertTriangle } from "lucide-react"
import {
  GenomicVisualizationEngine,
  type GenomicTwinData,
  type VisualizationConfig,
  type GenomicVariant3D,
} from "@/lib/genomics/3d-visualization-engine"
import { Loading } from "@/components/ui/loading"

interface GenomicTwinVisualizerProps {
  twinData: GenomicTwinData[]
  onVariantSelect?: (variant: GenomicVariant3D) => void
  onRegionHighlight?: (chromosome: string, start: number, end: number) => void
  className?: string
}

export function GenomicTwinVisualizer({
  twinData,
  onVariantSelect,
  onRegionHighlight,
  className = "",
}: GenomicTwinVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GenomicVisualizationEngine | null>(null)

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState("visualization")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animationPlaying, setAnimationPlaying] = useState(false)

  // Configuration state
  const [config, setConfig] = useState<VisualizationConfig>({
    mode: "3d_chromosomes",
    colorScheme: "significance",
    showLabels: true,
    showConnections: true,
    animationSpeed: 1,
    filterCriteria: {
      minQuality: 20,
      maxFrequency: 1.0,
      significanceFilter: [],
      chromosomeFilter: [],
    },
  })

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    variantCount: 0,
    memoryUsage: 0,
    fps: 60,
  })

  // Initialize visualization engine
  useEffect(() => {
    if (!containerRef.current || isInitialized) return

    const initEngine = async () => {
      try {
        setIsLoading(true)

        const engine = new GenomicVisualizationEngine(containerRef.current!, config)
        engineRef.current = engine

        // Set up event listeners
        containerRef.current!.addEventListener("variantSelected", handleVariantSelection)

        setIsInitialized(true)

        // Load data if available
        if (twinData.length > 0) {
          await loadTwinData()
        }
      } catch (error) {
        console.error("Failed to initialize visualization engine:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initEngine()

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose()
      }
    }
  }, [])

  // Load twin data when it changes
  useEffect(() => {
    if (isInitialized && twinData.length > 0) {
      loadTwinData()
    }
  }, [twinData, isInitialized])

  // Update configuration
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateConfiguration(config)
    }
  }, [config])

  const loadTwinData = async () => {
    if (!engineRef.current) return

    try {
      setIsLoading(true)

      const startTime = performance.now()
      engineRef.current.loadTwinData(twinData)
      const loadTime = performance.now() - startTime

      // Update performance metrics
      setPerformanceMetrics((prev) => ({
        ...prev,
        renderTime: loadTime,
        variantCount: twinData.reduce((sum, twin) => sum + twin.variants.length, 0),
      }))
    } catch (error) {
      console.error("Failed to load twin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariantSelection = useCallback(
    (event: CustomEvent) => {
      const variant = event.detail.variant as GenomicVariant3D
      setSelectedVariants((prev) => new Set(prev).add(variant.id))
      onVariantSelect?.(variant)
    },
    [onVariantSelect],
  )

  const handleConfigChange = (key: keyof VisualizationConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleFilterChange = (key: keyof VisualizationConfig["filterCriteria"], value: any) => {
    setConfig((prev) => ({
      ...prev,
      filterCriteria: {
        ...prev.filterCriteria,
        [key]: value,
      },
    }))
  }

  const exportVisualization = async (format: "png" | "json" | "csv") => {
    if (!engineRef.current) return

    try {
      const exported = engineRef.current.exportVisualization(format)

      if (format === "png" && exported instanceof Blob) {
        const url = URL.createObjectURL(exported)
        const a = document.createElement("a")
        a.href = url
        a.download = `genomic-visualization-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      } else if (typeof exported === "string") {
        const blob = new Blob([exported], {
          type: format === "json" ? "application/json" : "text/csv",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `genomic-data-${Date.now()}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const highlightRegion = (chromosome: string, start: number, end: number) => {
    if (engineRef.current) {
      engineRef.current.highlightRegion(chromosome, start, end)
      onRegionHighlight?.(chromosome, start, end)
    }
  }

  const resetVisualization = () => {
    if (engineRef.current) {
      setSelectedVariants(new Set())
      loadTwinData()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Calculate summary statistics
  const summaryStats = {
    totalVariants: twinData.reduce((sum, twin) => sum + twin.variants.length, 0),
    pathogenicVariants: twinData.reduce(
      (sum, twin) => sum + twin.variants.filter((v) => v.significance === "pathogenic").length,
      0,
    ),
    sharedVariants: twinData.length > 1 ? calculateSharedVariants() : 0,
    uniqueVariants: twinData.length > 1 ? calculateUniqueVariants() : 0,
  }

  function calculateSharedVariants(): number {
    if (twinData.length < 2) return 0

    const [twin1, twin2] = twinData
    return twin1.variants.filter((v1) =>
      twin2.variants.some((v2) => v2.chromosome === v1.chromosome && Math.abs(v2.position - v1.position) < 1000),
    ).length
  }

  function calculateUniqueVariants(): number {
    if (twinData.length < 2) return 0

    const [twin1, twin2] = twinData
    const unique1 = twin1.variants.filter(
      (v1) =>
        !twin2.variants.some((v2) => v2.chromosome === v1.chromosome && Math.abs(v2.position - v1.position) < 1000),
    ).length

    const unique2 = twin2.variants.filter(
      (v2) =>
        !twin1.variants.some((v1) => v1.chromosome === v2.chromosome && Math.abs(v1.position - v2.position) < 1000),
    ).length

    return unique1 + unique2
  }

  return (
    <div className={`genomic-twin-visualizer ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="visualization" className="data-[state=active]:bg-blue-50">
              <Dna className="mr-2 h-4 w-4" />
              3D Visualization
            </TabsTrigger>
            <TabsTrigger value="controls" className="data-[state=active]:bg-blue-50">
              <Settings className="mr-2 h-4 w-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-50">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-50">
              <Users className="mr-2 h-4 w-4" />
              Twin Comparison
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            {/* Performance indicator */}
            <Badge variant="outline" className="text-xs">
              {performanceMetrics.variantCount.toLocaleString()} variants
            </Badge>

            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportVisualization("png")}>PNG Image</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportVisualization("json")}>JSON Data</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportVisualization("csv")}>CSV Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen toggle */}
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4" />
            </Button>

            {/* Reset button */}
            <Button variant="outline" size="sm" onClick={resetVisualization}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="visualization" className="space-y-4">
          {/* Summary statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Variants</p>
                    <p className="text-2xl font-bold">{summaryStats.totalVariants.toLocaleString()}</p>
                  </div>
                  <Dna className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pathogenic</p>
                    <p className="text-2xl font-bold text-red-600">{summaryStats.pathogenicVariants}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            {twinData.length > 1 && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Shared</p>
                        <p className="text-2xl font-bold text-green-600">{summaryStats.sharedVariants}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Unique</p>
                        <p className="text-2xl font-bold text-purple-600">{summaryStats.uniqueVariants}</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Main visualization container */}
          <Card className="relative">
            <CardContent className="p-0">
              <div
                ref={containerRef}
                className="w-full h-[600px] relative bg-black rounded-lg overflow-hidden"
                style={{ minHeight: "600px" }}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="text-center text-white">
                      <Loading size={48} className="mb-4" />
                      <p>Loading 3D visualization...</p>
                      <p className="text-sm text-gray-300 mt-2">
                        Processing {summaryStats.totalVariants.toLocaleString()} variants
                      </p>
                    </div>
                  </div>
                )}

                {/* Visualization controls overlay */}
                <div className="absolute top-4 left-4 z-20 space-y-2">
                  <div className="bg-black bg-opacity-70 rounded-lg p-2 text-white text-xs">
                    <div>Mode: {config.mode.replace("_", " ")}</div>
                    <div>Color: {config.colorScheme}</div>
                    <div>FPS: {performanceMetrics.fps}</div>
                  </div>
                </div>

                {/* Keyboard shortcuts help */}
                <div className="absolute bottom-4 right-4 z-20">
                  <div className="bg-black bg-opacity-70 rounded-lg p-2 text-white text-xs">
                    <div>R: Reset camera</div>
                    <div>F: Fit to data</div>
                    <div>H: Toggle highlights</div>
                    <div>L: Toggle labels</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visualization mode */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visualization Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Display Mode</label>
                  <Select value={config.mode} onValueChange={(value) => handleConfigChange("mode", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3d_chromosomes">3D Chromosomes</SelectItem>
                      <SelectItem value="heatmap">Heatmap</SelectItem>
                      <SelectItem value="scatter_plot">Scatter Plot</SelectItem>
                      <SelectItem value="comparison_view">Twin Comparison</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Color Scheme</label>
                  <Select
                    value={config.colorScheme}
                    onValueChange={(value) => handleConfigChange("colorScheme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="significance">Clinical Significance</SelectItem>
                      <SelectItem value="frequency">Allele Frequency</SelectItem>
                      <SelectItem value="quality">Quality Score</SelectItem>
                      <SelectItem value="zygosity">Zygosity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Labels</label>
                  <Switch
                    checked={config.showLabels}
                    onCheckedChange={(checked) => handleConfigChange("showLabels", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Connections</label>
                  <Switch
                    checked={config.showConnections}
                    onCheckedChange={(checked) => handleConfigChange("showConnections", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filtering controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Filtering</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Quality: {config.filterCriteria.minQuality}
                  </label>
                  <Slider
                    value={[config.filterCriteria.minQuality]}
                    onValueChange={([value]) => handleFilterChange("minQuality", value)}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Maximum Frequency: {(config.filterCriteria.maxFrequency * 100).toFixed(1)}%
                  </label>
                  <Slider
                    value={[config.filterCriteria.maxFrequency * 100]}
                    onValueChange={([value]) => handleFilterChange("maxFrequency", value / 100)}
                    max={100}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Clinical Significance</label>
                  <div className="space-y-2">
                    {["pathogenic", "likely_pathogenic", "vus", "likely_benign", "benign"].map((sig) => (
                      <div key={sig} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={sig}
                          checked={config.filterCriteria.significanceFilter.includes(sig)}
                          onChange={(e) => {
                            const current = config.filterCriteria.significanceFilter
                            const updated = e.target.checked ? [...current, sig] : current.filter((s) => s !== sig)
                            handleFilterChange("significanceFilter", updated)
                          }}
                        />
                        <label htmlFor={sig} className="text-sm capitalize">
                          {sig.replace("_", " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Render Time</p>
                  <p className="text-lg font-semibold">{performanceMetrics.renderTime.toFixed(2)}ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Variant Count</p>
                  <p className="text-lg font-semibold">{performanceMetrics.variantCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Memory Usage</p>
                  <p className="text-lg font-semibold">{performanceMetrics.memoryUsage.toFixed(1)}MB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Frame Rate</p>
                  <p className="text-lg font-semibold">{performanceMetrics.fps} FPS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Selected variants analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Variants Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVariants.size > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{selectedVariants.size} variant(s) selected for analysis</p>
                  {/* Add detailed analysis of selected variants */}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Click on variants in the 3D visualization to analyze them
                </p>
              )}
            </CardContent>
          </Card>

          {/* Region highlighting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Region Highlighting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chromosome" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 22 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </SelectItem>
                      ))}
                      <SelectItem value="X">X</SelectItem>
                      <SelectItem value="Y">Y</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="number" placeholder="Start position" className="px-3 py-2 border rounded-md" />
                  <input type="number" placeholder="End position" className="px-3 py-2 border rounded-md" />
                </div>
                <Button onClick={() => highlightRegion("1", 1000000, 2000000)} className="w-full">
                  Highlight Region
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {twinData.length > 1 ? (
            <div className="space-y-6">
              {/* Twin comparison summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Twin Comparison Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{summaryStats.sharedVariants}</p>
                      <p className="text-sm text-gray-600">Shared Variants</p>
                      <Progress
                        value={(summaryStats.sharedVariants / summaryStats.totalVariants) * 100}
                        className="mt-2"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{summaryStats.uniqueVariants}</p>
                      <p className="text-sm text-gray-600">Unique Variants</p>
                      <Progress
                        value={(summaryStats.uniqueVariants / summaryStats.totalVariants) * 100}
                        className="mt-2"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {((summaryStats.sharedVariants / summaryStats.totalVariants) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Similarity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed twin information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {twinData.map((twin, index) => (
                  <Card key={twin.twinId}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Twin {index + 1} - {twin.twinId}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Patient ID:</span>
                          <span className="font-medium">{twin.patientId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Variants:</span>
                          <span className="font-medium">{twin.variants.length.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sequencing Date:</span>
                          <span className="font-medium">{twin.metadata.sequencingDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform:</span>
                          <span className="font-medium">{twin.metadata.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coverage:</span>
                          <span className="font-medium">{twin.metadata.coverage}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <Badge
                            className={
                              twin.metadata.quality > 90
                                ? "bg-green-100 text-green-800"
                                : twin.metadata.quality > 70
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {twin.metadata.quality}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">Twin Comparison Unavailable</p>
                <p className="text-sm text-gray-500">Load data for multiple twins to enable comparison features</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
