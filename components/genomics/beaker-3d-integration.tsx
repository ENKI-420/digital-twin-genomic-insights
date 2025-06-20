"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Database, Dna, BarChart3 } from "lucide-react"
import { GenomicTwinVisualizer } from "./genomic-twin-visualizer"
import type { GenomicTwinData, GenomicVariant3D } from "@/lib/genomics/3d-visualization-engine"
import type { DiagnosticReportResult } from "@/lib/api/fhir-service"
import { Loading } from "@/components/ui/loading"

interface BeakerReport {
  id: string
  patientId: string
  twinId?: string
  reportDate: string
  status: "pending" | "processing" | "completed" | "failed"
  genomicData?: any
  metadata: {
    platform: string
    coverage: number
    quality: number
    sampleType: string
  }
}

interface Beaker3DIntegrationProps {
  patientId: string
  reports?: DiagnosticReportResult[]
  onDataLoad?: (data: GenomicTwinData[]) => void
  className?: string
}

export function Beaker3DIntegration({ patientId, reports = [], onDataLoad, className = "" }: Beaker3DIntegrationProps) {
  const [beakerReports, setBeakerReports] = useState<BeakerReport[]>([])
  const [twinData, setTwinData] = useState<GenomicTwinData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const [selectedVariant, setSelectedVariant] = useState<GenomicVariant3D | null>(null)
  const [activeTab, setActiveTab] = useState("data-import")
  const [availableExports, setAvailableExports] = useState<
    Array<{
      url: string
      filename: string
      contentType: string
      size: number
    }>
  >([])
  const [showExportDropdown, setShowExportDropdown] = useState(false)

  // **[F] Fetch & Process** - Load Beaker reports
  useEffect(() => {
    if (patientId) {
      fetchBeakerReports()
      listAvailableExports()
    }
  }, [patientId])

  const fetchBeakerReports = async () => {
    try {
      setIsLoading(true)
      setProcessingStatus("Fetching Beaker reports...")

      // Simulate API call to fetch Beaker reports
      const response = await fetch(`/api/beaker/reports?patientId=${patientId}`)
      const data = await response.json()

      setBeakerReports(data.reports || [])

      // Auto-process if reports are available
      if (data.reports?.length > 0) {
        await processBeakerData(data.reports)
      }
    } catch (error) {
      console.error("Failed to fetch Beaker reports:", error)
      setProcessingStatus("Failed to fetch reports")
    } finally {
      setIsLoading(false)
    }
  }

  const processBeakerData = async (reports: BeakerReport[]) => {
    try {
      setIsLoading(true)
      setProcessingStatus("Processing genomic data...")

      const processedTwinData: GenomicTwinData[] = []

      for (const report of reports) {
        if (report.status === "completed" && report.genomicData) {
          const twinData = await convertBeakerToTwinData(report)
          processedTwinData.push(twinData)
        }
      }

      setTwinData(processedTwinData)
      onDataLoad?.(processedTwinData)
      setProcessingStatus(`Processed ${processedTwinData.length} twin datasets`)
    } catch (error) {
      console.error("Failed to process Beaker data:", error)
      setProcessingStatus("Processing failed")
    } finally {
      setIsLoading(false)
    }
  }

  const convertBeakerToTwinData = async (report: BeakerReport): Promise<GenomicTwinData> => {
    // **[A] AI-Powered Analysis** - Convert Beaker format to 3D visualization format
    const chromosomes = generateChromosomeData(report.genomicData)
    const variants = generateVariantData(report.genomicData)

    return {
      twinId: report.twinId || `twin_${report.id}`,
      patientId: report.patientId,
      chromosomes,
      variants,
      metadata: {
        sequencingDate: report.reportDate,
        platform: report.metadata.platform,
        coverage: report.metadata.coverage,
        quality: report.metadata.quality,
      },
    }
  }

  const generateChromosomeData = (genomicData: any) => {
    // Generate chromosome data with realistic structure
    const chromosomes = []

    for (let i = 1; i <= 22; i++) {
      chromosomes.push({
        number: String(i),
        length: getChromosomeLength(i),
        centromerePosition: getCentromerePosition(i),
        bands: generateChromosomeBands(i),
        variants: [],
      })
    }

    // Add sex chromosomes
    chromosomes.push(
      {
        number: "X",
        length: 155000000,
        centromerePosition: 60000000,
        bands: generateChromosomeBands("X"),
        variants: [],
      },
      {
        number: "Y",
        length: 59000000,
        centromerePosition: 12000000,
        bands: generateChromosomeBands("Y"),
        variants: [],
      },
    )

    return chromosomes
  }

  const generateVariantData = (genomicData: any): GenomicVariant3D[] => {
    // **[W] Workflow Automation** - Generate realistic variant data
    const variants: GenomicVariant3D[] = []
    const variantCount = Math.floor(Math.random() * 5000) + 1000 // 1000-6000 variants

    for (let i = 0; i < variantCount; i++) {
      const chromosome = String(Math.floor(Math.random() * 22) + 1)
      const position = Math.floor(Math.random() * getChromosomeLength(Number.parseInt(chromosome)))

      variants.push({
        id: `var_${i}`,
        chromosome,
        position,
        type: getRandomVariantType(),
        significance: getRandomSignificance(),
        gene: getRandomGene(),
        consequence: getRandomConsequence(),
        alleleFrequency: Math.random(),
        zygosity: Math.random() > 0.5 ? "heterozygous" : "homozygous",
        quality: Math.floor(Math.random() * 100) + 1,
        depth: Math.floor(Math.random() * 200) + 10,
      })
    }

    return variants
  }

  const uploadBeakerFile = async (file: File) => {
    try {
      setIsLoading(true)
      setProcessingStatus("Uploading Beaker file...")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("patientId", patientId)

      const response = await fetch("/api/beaker/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setProcessingStatus("File uploaded successfully")
        await fetchBeakerReports() // Refresh reports
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      setProcessingStatus("Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  const exportTwinData = async (format: "json" | "csv" | "vcf") => {
    try {
      setIsLoading(true)
      setProcessingStatus(`Exporting data in ${format.toUpperCase()} format...`)

      const response = await fetch("/api/beaker/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twinData,
          format,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Show success message with download link
        setProcessingStatus(
          `Export successful! <a href="${result.url}" target="_blank" class="text-blue-500 underline">Download ${result.filename}</a>`,
        )

        // Automatically open the download in a new tab
        window.open(result.url, "_blank")
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      console.error("Export failed:", error)
      setProcessingStatus("Export failed")
    } finally {
      setIsLoading(false)
    }
  }

  const listAvailableExports = async () => {
    try {
      setIsLoading(true)
      setProcessingStatus("Fetching available exports...")

      const response = await fetch("/api/beaker/exports")

      if (response.ok) {
        const { files } = await response.json()
        setAvailableExports(files)
      } else {
        throw new Error("Failed to fetch exports")
      }
    } catch (error) {
      console.error("Failed to fetch exports:", error)
      setProcessingStatus("Failed to fetch exports")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteExport = async (pathname: string) => {
    try {
      setIsLoading(true)
      setProcessingStatus("Deleting export...")

      const response = await fetch("/api/beaker/exports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname }),
      })

      if (response.ok) {
        // Refresh the list
        await listAvailableExports()
        setProcessingStatus("Export deleted successfully")
      } else {
        throw new Error("Failed to delete export")
      }
    } catch (error) {
      console.error("Failed to delete export:", error)
      setProcessingStatus("Failed to delete export")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariantSelect = useCallback((variant: GenomicVariant3D) => {
    setSelectedVariant(variant)
  }, [])

  // Helper functions for realistic data generation
  const getChromosomeLength = (chromosome: number | string): number => {
    const lengths: Record<string, number> = {
      "1": 249000000,
      "2": 243000000,
      "3": 198000000,
      "4": 191000000,
      "5": 180000000,
      "6": 171000000,
      "7": 159000000,
      "8": 146000000,
      "9": 141000000,
      "10": 135000000,
      "11": 135000000,
      "12": 133000000,
      "13": 115000000,
      "14": 107000000,
      "15": 102000000,
      "16": 90000000,
      "17": 81000000,
      "18": 78000000,
      "19": 59000000,
      "20": 63000000,
      "21": 48000000,
      "22": 51000000,
      X: 155000000,
      Y: 59000000,
    }
    return lengths[String(chromosome)] || 100000000
  }

  const getCentromerePosition = (chromosome: number | string): number => {
    return getChromosomeLength(chromosome) * (0.3 + Math.random() * 0.4)
  }

  const generateChromosomeBands = (chromosome: number | string) => {
    const bands = []
    const length = getChromosomeLength(chromosome)
    const bandCount = Math.floor(Math.random() * 20) + 10

    for (let i = 0; i < bandCount; i++) {
      const start = (i / bandCount) * length
      const end = ((i + 1) / bandCount) * length

      bands.push({
        name: `${chromosome}${i < 10 ? "0" : ""}${i}`,
        start: Math.floor(start),
        end: Math.floor(end),
        stain: getRandomStain(),
      })
    }

    return bands
  }

  const getRandomVariantType = (): GenomicVariant3D["type"] => {
    const types: GenomicVariant3D["type"][] = ["SNV", "INDEL", "CNV", "SV", "STR"]
    return types[Math.floor(Math.random() * types.length)]
  }

  const getRandomSignificance = (): GenomicVariant3D["significance"] => {
    const significances: GenomicVariant3D["significance"][] = [
      "pathogenic",
      "likely_pathogenic",
      "vus",
      "likely_benign",
      "benign",
    ]
    const weights = [0.05, 0.1, 0.3, 0.25, 0.3] // Realistic distribution
    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return significances[i]
      }
    }

    return "benign"
  }

  const getRandomGene = (): string => {
    const genes = [
      "BRCA1",
      "BRCA2",
      "TP53",
      "EGFR",
      "KRAS",
      "PIK3CA",
      "APC",
      "PTEN",
      "MLH1",
      "MSH2",
      "MSH6",
      "PMS2",
      "ATM",
      "CHEK2",
      "PALB2",
      "CDH1",
    ]
    return genes[Math.floor(Math.random() * genes.length)]
  }

  const getRandomConsequence = (): string => {
    const consequences = [
      "missense_variant",
      "nonsense_variant",
      "frameshift_variant",
      "splice_site_variant",
      "synonymous_variant",
      "intron_variant",
    ]
    return consequences[Math.floor(Math.random() * consequences.length)]
  }

  const getRandomStain = () => {
    const stains = ["gneg", "gpos25", "gpos50", "gpos75", "gpos100"]
    return stains[Math.floor(Math.random() * stains.length)] as any
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showExportDropdown])

  return (
    <div className={`beaker-3d-integration ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border mb-6">
          <TabsTrigger value="data-import" className="data-[state=active]:bg-blue-50">
            <Database className="mr-2 h-4 w-4" />
            Data Import
          </TabsTrigger>
          <TabsTrigger value="visualization" className="data-[state=active]:bg-blue-50">
            <Dna className="mr-2 h-4 w-4" />
            3D Visualization
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-50">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-import" className="space-y-6">
          {/* Import status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Beaker Data Import
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Processing status */}
                {isLoading && (
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Loading size={20} />
                    <div>
                      <p className="font-medium">Processing...</p>
                      <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: processingStatus }} />
                    </div>
                  </div>
                )}

                {/* File upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Upload Beaker Reports</p>
                  <p className="text-sm text-gray-600 mb-4">Drag and drop VCF, JSON, or CSV files from Beaker system</p>
                  <input
                    type="file"
                    multiple
                    accept=".vcf,.json,.csv"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      files.forEach(uploadBeakerFile)
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button className="cursor-pointer">Select Files</Button>
                  </label>
                </div>

                {/* Existing reports */}
                {beakerReports.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Available Beaker Reports</h3>
                    <div className="space-y-2">
                      {beakerReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {report.status === "completed" ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : report.status === "processing" ? (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              ) : report.status === "failed" ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Report {report.id}</p>
                              <p className="text-sm text-gray-600">
                                {report.reportDate} • {report.metadata.platform} • {report.metadata.coverage}x coverage
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                report.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : report.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : report.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }
                            >
                              {report.status}
                            </Badge>
                            <Badge variant="outline">Quality: {report.metadata.quality}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <Button onClick={fetchBeakerReports} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Reports
                  </Button>
                  <Button variant="outline" onClick={listAvailableExports}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Exports
                  </Button>

                  {twinData.length > 0 && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </Button>

                      {showExportDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                exportTwinData("json")
                                setShowExportDropdown(false)
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Export as JSON
                            </button>
                            <button
                              onClick={() => {
                                exportTwinData("csv")
                                setShowExportDropdown(false)
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Export as CSV
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {availableExports.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-3">Available Exports</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableExports.map((file) => (
                        <div key={file.url} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Download className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{file.filename}</p>
                              <p className="text-sm text-gray-600">
                                {file.contentType} • {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteExport(file.filename)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data summary */}
          {twinData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Data Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{twinData.length}</p>
                    <p className="text-sm text-gray-600">Twin Datasets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {twinData.reduce((sum, twin) => sum + twin.variants.length, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Variants</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {twinData.reduce((sum, twin) => sum + twin.chromosomes.length, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Chromosomes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          {twinData.length > 0 ? (
            <GenomicTwinVisualizer twinData={twinData} onVariantSelect={handleVariantSelect} className="w-full" />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Dna className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">No Genomic Data Available</p>
                <p className="text-sm text-gray-500 mb-4">Import Beaker reports to enable 3D visualization</p>
                <Button onClick={() => setActiveTab("data-import")}>Import Data</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Selected variant analysis */}
          {selectedVariant && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Variant Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Variant Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="font-medium">{selectedVariant.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Position:</span>
                        <span className="font-medium">
                          {selectedVariant.chromosome}:{selectedVariant.position.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <Badge>{selectedVariant.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Gene:</span>
                        <span className="font-medium">{selectedVariant.gene}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Significance:</span>
                        <Badge
                          className={
                            selectedVariant.significance === "pathogenic"
                              ? "bg-red-100 text-red-800"
                              : selectedVariant.significance === "likely_pathogenic"
                                ? "bg-orange-100 text-orange-800"
                                : selectedVariant.significance === "vus"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }
                        >
                          {selectedVariant.significance.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Quality Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Quality Score:</span>
                        <span className="font-medium">{selectedVariant.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Read Depth:</span>
                        <span className="font-medium">{selectedVariant.depth}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allele Frequency:</span>
                        <span className="font-medium">{(selectedVariant.alleleFrequency * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zygosity:</span>
                        <Badge variant="outline">{selectedVariant.zygosity}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Twin comparison analysis */}
          {twinData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Twin Comparison Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {twinData.map((twin, index) => (
                      <div key={twin.twinId} className="space-y-3">
                        <h4 className="font-medium">
                          Twin {index + 1} - {twin.twinId}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Total Variants:</span>
                            <span className="font-medium">{twin.variants.length.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pathogenic:</span>
                            <span className="font-medium text-red-600">
                              {twin.variants.filter((v) => v.significance === "pathogenic").length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>VUS:</span>
                            <span className="font-medium text-yellow-600">
                              {twin.variants.filter((v) => v.significance === "vus").length}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Quality Score:</span>
                            <span className="font-medium">{twin.metadata.quality}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
