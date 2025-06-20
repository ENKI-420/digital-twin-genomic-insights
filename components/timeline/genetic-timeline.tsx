"use client"

import { useState, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Dna,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types for genetic findings
interface GeneticFinding {
  id: string
  date: string
  gene: string
  mutation: string
  zygosity: string
  interpretation: string
  clinicalSignificance: "pathogenic" | "likely_pathogenic" | "uncertain" | "likely_benign" | "benign"
  source: string
  reportId: string
  notes?: string
  relatedFindings?: string[]
  followUpRecommended?: boolean
}

interface GeneticTimelineProps {
  patientId: string
  findings: GeneticFinding[]
}

export function GeneticTimeline({ patientId, findings }: GeneticTimelineProps) {
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [geneFilter, setGeneFilter] = useState<string | null>(null)
  const [significanceFilter, setSignificanceFilter] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("timeline")
  const [timelineView, setTimelineView] = useState<"compact" | "detailed">("detailed")

  // Sort findings by date (newest first)
  const sortedFindings = useMemo(() => {
    return [...findings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [findings])

  // Get unique genes for filter dropdown
  const uniqueGenes = useMemo(() => {
    return Array.from(new Set(findings.map((finding) => finding.gene))).sort()
  }, [findings])

  // Filter findings based on search term and filters
  const filteredFindings = useMemo(() => {
    return sortedFindings.filter((finding) => {
      // Search term filter
      if (
        searchTerm &&
        !finding.gene.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !finding.mutation.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !finding.interpretation.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Gene filter
      if (geneFilter && finding.gene !== geneFilter) {
        return false
      }

      // Significance filter
      if (significanceFilter && finding.clinicalSignificance !== significanceFilter) {
        return false
      }

      return true
    })
  }, [sortedFindings, searchTerm, geneFilter, significanceFilter])

  // Group findings by year and month for timeline view
  const findingsByDate = useMemo(() => {
    const grouped: Record<string, Record<string, GeneticFinding[]>> = {}

    filteredFindings.forEach((finding) => {
      const date = parseISO(finding.date)
      const year = date.getFullYear().toString()
      const month = format(date, "MMMM")

      if (!grouped[year]) {
        grouped[year] = {}
      }

      if (!grouped[year][month]) {
        grouped[year][month] = []
      }

      grouped[year][month].push(finding)
    })

    return grouped
  }, [filteredFindings])

  // Toggle expanded state for a finding
  const toggleExpanded = (findingId: string) => {
    setExpandedFindings((prev) => ({
      ...prev,
      [findingId]: !prev[findingId],
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setGeneFilter(null)
    setSignificanceFilter(null)
  }

  // Get badge color based on clinical significance
  const getSignificanceBadgeColor = (significance: string) => {
    switch (significance) {
      case "pathogenic":
        return "bg-red-100 text-red-800"
      case "likely_pathogenic":
        return "bg-orange-100 text-orange-800"
      case "uncertain":
        return "bg-yellow-100 text-yellow-800"
      case "likely_benign":
        return "bg-blue-100 text-blue-800"
      case "benign":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format clinical significance for display
  const formatSignificance = (significance: string) => {
    return significance.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Genetic Findings Timeline</CardTitle>
          <p className="text-sm text-gray-500">Chronological view of genetic test results and interpretations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="timeline" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Table View
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Summary
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search genes, mutations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={geneFilter || ""} onValueChange={(value) => setGeneFilter(value || null)} className="w-40">
                <option value="">All Genes</option>
                {uniqueGenes.map((gene) => (
                  <option key={gene} value={gene}>
                    {gene}
                  </option>
                ))}
              </Select>
              <Select
                value={significanceFilter || ""}
                onValueChange={(value) => setSignificanceFilter(value || null)}
                className="w-48"
              >
                <option value="">All Significances</option>
                <option value="pathogenic">Pathogenic</option>
                <option value="likely_pathogenic">Likely Pathogenic</option>
                <option value="uncertain">Uncertain Significance</option>
                <option value="likely_benign">Likely Benign</option>
                <option value="benign">Benign</option>
              </Select>
              {(searchTerm || geneFilter || significanceFilter) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
            {activeTab === "timeline" && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">View:</span>
                <Button
                  variant={timelineView === "detailed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimelineView("detailed")}
                >
                  Detailed
                </Button>
                <Button
                  variant={timelineView === "compact" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimelineView("compact")}
                >
                  Compact
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="timeline" className="space-y-6">
            {Object.keys(findingsByDate).length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <Dna className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No genetic findings</h3>
                  <p className="mt-1 text-sm text-gray-500">No genetic findings match your current filter criteria.</p>
                  {(searchTerm || geneFilter || significanceFilter) && (
                    <div className="mt-6">
                      <Button onClick={clearFilters}>Clear Filters</Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(findingsByDate).map(([year, months]) => (
                  <div key={year} className="space-y-6">
                    <div className="sticky top-0 z-10 flex items-center bg-white py-2">
                      <div className="flex h-8 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                        {year}
                      </div>
                      <div className="ml-4 h-px flex-grow bg-gray-200"></div>
                    </div>

                    <div className="space-y-6 pl-8">
                      {Object.entries(months).map(([month, monthFindings]) => (
                        <div key={`${year}-${month}`} className="space-y-4">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <h3 className="ml-2 text-sm font-medium text-gray-700">{month}</h3>
                          </div>

                          <div className="space-y-4">
                            {monthFindings.map((finding) => (
                              <div
                                key={finding.id}
                                className="relative rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                              >
                                <div
                                  className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${
                                    finding.clinicalSignificance === "pathogenic" ||
                                    finding.clinicalSignificance === "likely_pathogenic"
                                      ? "bg-red-500"
                                      : finding.clinicalSignificance === "uncertain"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                ></div>

                                <div
                                  className="flex cursor-pointer items-start justify-between p-4 pl-6"
                                  onClick={() => toggleExpanded(finding.id)}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center">
                                      <Dna className="h-4 w-4 text-blue-600" />
                                      <h4 className="ml-2 font-medium">
                                        {finding.gene} - {finding.mutation}
                                      </h4>
                                      <Badge
                                        className={`ml-2 ${getSignificanceBadgeColor(finding.clinicalSignificance)}`}
                                      >
                                        {formatSignificance(finding.clinicalSignificance)}
                                      </Badge>
                                      {finding.followUpRecommended && (
                                        <Badge className="ml-2 bg-purple-100 text-purple-800">
                                          Follow-up Recommended
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      {format(parseISO(finding.date), "MMMM d, yyyy")} • {finding.source}
                                    </p>
                                    {timelineView === "detailed" && (
                                      <p className="text-sm">{finding.interpretation.substring(0, 120)}...</p>
                                    )}
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    {expandedFindings[finding.id] ? (
                                      <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>

                                {expandedFindings[finding.id] && (
                                  <div className="border-t border-gray-100 bg-gray-50 p-4 pl-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-700">Interpretation</h5>
                                        <p className="mt-1 text-sm">{finding.interpretation}</p>
                                      </div>

                                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-700">Gene</h5>
                                          <p className="mt-1 text-sm">{finding.gene}</p>
                                        </div>
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-700">Mutation</h5>
                                          <p className="mt-1 text-sm">{finding.mutation}</p>
                                        </div>
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-700">Zygosity</h5>
                                          <p className="mt-1 text-sm">{finding.zygosity}</p>
                                        </div>
                                      </div>

                                      {finding.notes && (
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-700">Notes</h5>
                                          <p className="mt-1 text-sm">{finding.notes}</p>
                                        </div>
                                      )}

                                      {finding.relatedFindings && finding.relatedFindings.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-700">Related Findings</h5>
                                          <div className="mt-1 flex flex-wrap gap-2">
                                            {finding.relatedFindings.map((relatedFinding, index) => (
                                              <Badge key={index} variant="outline">
                                                {relatedFinding}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                          <a href={`/reports/${finding.reportId}`}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            View Full Report
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gene</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mutation</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Zygosity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Clinical Significance</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Source</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredFindings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                          No genetic findings match your current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredFindings.map((finding) => (
                        <tr key={finding.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            {format(parseISO(finding.date), "MMM d, yyyy")}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{finding.gene}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">{finding.mutation}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">{finding.zygosity}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <Badge className={getSignificanceBadgeColor(finding.clinicalSignificance)}>
                              {formatSignificance(finding.clinicalSignificance)}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">{finding.source}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Full Report</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{findings.length}</div>
                      <div className="mt-1 text-sm text-gray-500">Total Genetic Findings</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {
                          findings.filter(
                            (f) =>
                              f.clinicalSignificance === "pathogenic" || f.clinicalSignificance === "likely_pathogenic",
                          ).length
                        }
                      </div>
                      <div className="mt-1 text-sm text-gray-500">Pathogenic Variants</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {findings.filter((f) => f.clinicalSignificance === "uncertain").length}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">Variants of Uncertain Significance</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Findings by Gene</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uniqueGenes.map((gene) => {
                      const geneFindings = findings.filter((f) => f.gene === gene)
                      const pathogenic = geneFindings.filter(
                        (f) =>
                          f.clinicalSignificance === "pathogenic" || f.clinicalSignificance === "likely_pathogenic",
                      ).length
                      const uncertain = geneFindings.filter((f) => f.clinicalSignificance === "uncertain").length
                      const benign = geneFindings.filter(
                        (f) => f.clinicalSignificance === "benign" || f.clinicalSignificance === "likely_benign",
                      ).length

                      return (
                        <div key={gene} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{gene}</div>
                            <div className="text-sm text-gray-500">{geneFindings.length} findings</div>
                          </div>
                          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{ width: `${(pathogenic / geneFindings.length) * 100}%`, float: "left" }}
                            ></div>
                            <div
                              className="h-full rounded-full bg-yellow-500"
                              style={{ width: `${(uncertain / geneFindings.length) * 100}%`, float: "left" }}
                            ></div>
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${(benign / geneFindings.length) * 100}%`, float: "left" }}
                            ></div>
                          </div>
                          <div className="mt-2 flex justify-between text-xs">
                            <div>
                              <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span> Pathogenic:{" "}
                              {pathogenic}
                            </div>
                            <div>
                              <span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span> Uncertain:{" "}
                              {uncertain}
                            </div>
                            <div>
                              <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span> Benign: {benign}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clinical Implications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {findings
                      .filter(
                        (f) =>
                          f.clinicalSignificance === "pathogenic" || f.clinicalSignificance === "likely_pathogenic",
                      )
                      .map((finding) => (
                        <div key={finding.id} className="rounded-lg border p-4">
                          <div className="flex items-start space-x-4">
                            <div
                              className={`rounded-full p-2 ${
                                finding.clinicalSignificance === "pathogenic"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {finding.gene} - {finding.mutation}
                              </div>
                              <div className="mt-1 text-sm">{finding.interpretation}</div>
                              <div className="mt-2 text-sm text-gray-500">
                                Detected on {format(parseISO(finding.date), "MMMM d, yyyy")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {findings.filter(
                      (f) => f.clinicalSignificance === "pathogenic" || f.clinicalSignificance === "likely_pathogenic",
                    ).length === 0 && (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                        <h3 className="mt-2 font-medium">No Pathogenic Variants Detected</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No pathogenic or likely pathogenic variants have been detected in this patient's genetic
                          testing.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
