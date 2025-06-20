"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Info,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types for variant interpretation history
export interface VariantInterpretationChange {
  id: string
  date: string
  gene: string
  variant: string
  previousClassification: VariantClassification
  newClassification: VariantClassification
  evidence: string[]
  source: string
  sourceUrl?: string
  citations?: Array<{
    title: string
    authors: string
    journal: string
    year: string
    pmid?: string
    doi?: string
  }>
  notes?: string
}

export type VariantClassification =
  | "pathogenic"
  | "likely_pathogenic"
  | "uncertain_significance"
  | "likely_benign"
  | "benign"
  | "conflicting"
  | "not_provided"

export interface VariantEvolutionData {
  gene: string
  variant: string
  currentClassification: VariantClassification
  history: VariantInterpretationChange[]
}

interface VariantEvolutionTrackerProps {
  variants: VariantEvolutionData[]
}

export function VariantEvolutionTracker({ variants }: VariantEvolutionTrackerProps) {
  const [expandedVariants, setExpandedVariants] = useState<Record<string, boolean>>({})
  const [expandedChanges, setExpandedChanges] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("timeline")

  // Toggle expanded state for a variant
  const toggleVariantExpanded = (variantKey: string) => {
    setExpandedVariants((prev) => ({
      ...prev,
      [variantKey]: !prev[variantKey],
    }))
  }

  // Toggle expanded state for a change
  const toggleChangeExpanded = (changeId: string) => {
    setExpandedChanges((prev) => ({
      ...prev,
      [changeId]: !prev[changeId],
    }))
  }

  // Get color for classification badge
  const getClassificationColor = (classification: VariantClassification) => {
    switch (classification) {
      case "pathogenic":
        return "bg-red-100 text-red-800"
      case "likely_pathogenic":
        return "bg-orange-100 text-orange-800"
      case "uncertain_significance":
        return "bg-yellow-100 text-yellow-800"
      case "likely_benign":
        return "bg-blue-100 text-blue-800"
      case "benign":
        return "bg-green-100 text-green-800"
      case "conflicting":
        return "bg-purple-100 text-purple-800"
      case "not_provided":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format classification for display
  const formatClassification = (classification: VariantClassification) => {
    return classification
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Determine if a change is significant (e.g., VUS to pathogenic)
  const isSignificantChange = (previous: VariantClassification, current: VariantClassification) => {
    const significanceOrder = {
      benign: 1,
      likely_benign: 2,
      uncertain_significance: 3,
      likely_pathogenic: 4,
      pathogenic: 5,
      conflicting: 3,
      not_provided: 0,
    }

    // If moving two or more levels, consider it significant
    return Math.abs(significanceOrder[current] - significanceOrder[previous]) >= 2
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Variant Interpretation Evolution</CardTitle>
          <p className="text-sm text-gray-500">
            Track how variant classifications have changed over time based on emerging evidence
          </p>
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
            <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            {variants.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No variant evolution data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There is no historical data available for variant interpretation changes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {variants.map((variant) => {
                  const variantKey = `${variant.gene}-${variant.variant}`
                  const isExpanded = expandedVariants[variantKey] || false

                  return (
                    <div
                      key={variantKey}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <div
                        className="flex cursor-pointer items-start justify-between p-4"
                        onClick={() => toggleVariantExpanded(variantKey)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <h4 className="font-medium">
                              {variant.gene} - {variant.variant}
                            </h4>
                            <Badge className={`ml-2 ${getClassificationColor(variant.currentClassification)}`}>
                              {formatClassification(variant.currentClassification)}
                            </Badge>
                            {variant.history.some((change) =>
                              isSignificantChange(change.previousClassification, change.newClassification),
                            ) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="ml-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Significant classification changes detected</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {variant.history.length} classification{" "}
                            {variant.history.length === 1 ? "change" : "changes"} recorded
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 p-4">
                          <div className="space-y-4">
                            <div className="relative">
                              <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
                              <div className="space-y-6 pl-12">
                                {variant.history.map((change, index) => {
                                  const isChangeExpanded = expandedChanges[change.id] || false
                                  const isLastChange = index === variant.history.length - 1

                                  return (
                                    <div key={change.id} className="relative">
                                      <div
                                        className={`absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white ${
                                          isSignificantChange(change.previousClassification, change.newClassification)
                                            ? "bg-amber-500"
                                            : "bg-blue-500"
                                        }`}
                                      >
                                        <Calendar className="h-4 w-4 text-white" />
                                      </div>
                                      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                        <div
                                          className="flex cursor-pointer items-start justify-between p-3"
                                          onClick={() => toggleChangeExpanded(change.id)}
                                        >
                                          <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                              {format(parseISO(change.date), "MMMM d, yyyy")}
                                            </p>
                                            <div className="flex items-center text-sm">
                                              <Badge
                                                className={`${getClassificationColor(change.previousClassification)}`}
                                              >
                                                {formatClassification(change.previousClassification)}
                                              </Badge>
                                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                                              <Badge className={`${getClassificationColor(change.newClassification)}`}>
                                                {formatClassification(change.newClassification)}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">Source: {change.source}</p>
                                          </div>
                                          <div className="ml-4 flex-shrink-0">
                                            {isChangeExpanded ? (
                                              <ChevronUp className="h-4 w-4 text-gray-400" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4 text-gray-400" />
                                            )}
                                          </div>
                                        </div>

                                        {isChangeExpanded && (
                                          <div className="border-t border-gray-100 bg-gray-50 p-3">
                                            <div className="space-y-3">
                                              <div>
                                                <h5 className="text-xs font-medium text-gray-700">
                                                  Evidence for Change
                                                </h5>
                                                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
                                                  {change.evidence.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                  ))}
                                                </ul>
                                              </div>

                                              {change.citations && change.citations.length > 0 && (
                                                <div>
                                                  <h5 className="text-xs font-medium text-gray-700">Citations</h5>
                                                  <div className="mt-1 space-y-2">
                                                    {change.citations.map((citation, i) => (
                                                      <div
                                                        key={i}
                                                        className="rounded border border-gray-200 bg-white p-2 text-xs"
                                                      >
                                                        <p className="font-medium">{citation.title}</p>
                                                        <p className="text-gray-600">
                                                          {citation.authors} ({citation.year})
                                                        </p>
                                                        <p className="text-gray-600">{citation.journal}</p>
                                                        <div className="mt-1 flex space-x-2">
                                                          {citation.pmid && (
                                                            <a
                                                              href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="inline-flex items-center text-blue-600 hover:underline"
                                                            >
                                                              PMID: {citation.pmid}
                                                              <ExternalLink className="ml-1 h-3 w-3" />
                                                            </a>
                                                          )}
                                                          {citation.doi && (
                                                            <a
                                                              href={`https://doi.org/${citation.doi}`}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="inline-flex items-center text-blue-600 hover:underline"
                                                            >
                                                              DOI: {citation.doi}
                                                              <ExternalLink className="ml-1 h-3 w-3" />
                                                            </a>
                                                          )}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {change.notes && (
                                                <div>
                                                  <h5 className="text-xs font-medium text-gray-700">Notes</h5>
                                                  <p className="mt-1 text-xs">{change.notes}</p>
                                                </div>
                                              )}

                                              {change.sourceUrl && (
                                                <div className="flex justify-end">
                                                  <Button variant="outline" size="sm" asChild>
                                                    <a
                                                      href={change.sourceUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="inline-flex items-center text-xs"
                                                    >
                                                      <FileText className="mr-1 h-3 w-3" />
                                                      View Source
                                                      <ExternalLink className="ml-1 h-3 w-3" />
                                                    </a>
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{variants.length}</div>
                    <div className="mt-1 text-sm text-gray-500">Variants with Evolution Data</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">
                      {
                        variants.filter((variant) =>
                          variant.history.some((change) =>
                            isSignificantChange(change.previousClassification, change.newClassification),
                          ),
                        ).length
                      }
                    </div>
                    <div className="mt-1 text-sm text-gray-500">Variants with Significant Changes</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {variants.reduce((total, variant) => total + variant.history.length, 0)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">Total Classification Changes</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Classification Change Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Variants with Upgraded Classifications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Variants that have been upgraded to more pathogenic classifications over time
                    </p>
                    <div className="mt-4 space-y-2">
                      {variants
                        .filter((variant) =>
                          variant.history.some(
                            (change) =>
                              (change.previousClassification === "uncertain_significance" &&
                                (change.newClassification === "likely_pathogenic" ||
                                  change.newClassification === "pathogenic")) ||
                              (change.previousClassification === "likely_benign" &&
                                (change.newClassification === "uncertain_significance" ||
                                  change.newClassification === "likely_pathogenic" ||
                                  change.newClassification === "pathogenic")) ||
                              (change.previousClassification === "benign" &&
                                (change.newClassification === "likely_benign" ||
                                  change.newClassification === "uncertain_significance" ||
                                  change.newClassification === "likely_pathogenic" ||
                                  change.newClassification === "pathogenic")),
                          ),
                        )
                        .map((variant) => {
                          const variantKey = `${variant.gene}-${variant.variant}`
                          return (
                            <div key={variantKey} className="rounded border border-gray-200 bg-white p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    {variant.gene} - {variant.variant}
                                  </div>
                                  <div className="mt-1 flex items-center text-sm">
                                    <Badge
                                      className={`${getClassificationColor(
                                        variant.history[variant.history.length - 1].previousClassification,
                                      )}`}
                                    >
                                      {formatClassification(
                                        variant.history[variant.history.length - 1].previousClassification,
                                      )}
                                    </Badge>
                                    <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                                    <Badge className={`${getClassificationColor(variant.currentClassification)}`}>
                                      {formatClassification(variant.currentClassification)}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <a href="#" onClick={() => toggleVariantExpanded(variantKey)}>
                                    View History
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      {variants.filter((variant) =>
                        variant.history.some(
                          (change) =>
                            (change.previousClassification === "uncertain_significance" &&
                              (change.newClassification === "likely_pathogenic" ||
                                change.newClassification === "pathogenic")) ||
                            (change.previousClassification === "likely_benign" &&
                              (change.newClassification === "uncertain_significance" ||
                                change.newClassification === "likely_pathogenic" ||
                                change.newClassification === "pathogenic")) ||
                            (change.previousClassification === "benign" &&
                              (change.newClassification === "likely_benign" ||
                                change.newClassification === "uncertain_significance" ||
                                change.newClassification === "likely_pathogenic" ||
                                change.newClassification === "pathogenic")),
                        ),
                      ).length === 0 && (
                        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                          No variants with upgraded classifications found
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Variants with Downgraded Classifications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Variants that have been downgraded to less pathogenic classifications over time
                    </p>
                    <div className="mt-4 space-y-2">
                      {variants
                        .filter((variant) =>
                          variant.history.some(
                            (change) =>
                              (change.previousClassification === "pathogenic" &&
                                (change.newClassification === "likely_pathogenic" ||
                                  change.newClassification === "uncertain_significance" ||
                                  change.newClassification === "likely_benign" ||
                                  change.newClassification === "benign")) ||
                              (change.previousClassification === "likely_pathogenic" &&
                                (change.newClassification === "uncertain_significance" ||
                                  change.newClassification === "likely_benign" ||
                                  change.newClassification === "benign")) ||
                              (change.previousClassification === "uncertain_significance" &&
                                (change.newClassification === "likely_benign" ||
                                  change.newClassification === "benign")),
                          ),
                        )
                        .map((variant) => {
                          const variantKey = `${variant.gene}-${variant.variant}`
                          return (
                            <div key={variantKey} className="rounded border border-gray-200 bg-white p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    {variant.gene} - {variant.variant}
                                  </div>
                                  <div className="mt-1 flex items-center text-sm">
                                    <Badge
                                      className={`${getClassificationColor(
                                        variant.history[variant.history.length - 1].previousClassification,
                                      )}`}
                                    >
                                      {formatClassification(
                                        variant.history[variant.history.length - 1].previousClassification,
                                      )}
                                    </Badge>
                                    <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                                    <Badge className={`${getClassificationColor(variant.currentClassification)}`}>
                                      {formatClassification(variant.currentClassification)}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <a href="#" onClick={() => toggleVariantExpanded(variantKey)}>
                                    View History
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      {variants.filter((variant) =>
                        variant.history.some(
                          (change) =>
                            (change.previousClassification === "pathogenic" &&
                              (change.newClassification === "likely_pathogenic" ||
                                change.newClassification === "uncertain_significance" ||
                                change.newClassification === "likely_benign" ||
                                change.newClassification === "benign")) ||
                            (change.previousClassification === "likely_pathogenic" &&
                              (change.newClassification === "uncertain_significance" ||
                                change.newClassification === "likely_benign" ||
                                change.newClassification === "benign")) ||
                            (change.previousClassification === "uncertain_significance" &&
                              (change.newClassification === "likely_benign" || change.newClassification === "benign")),
                        ),
                      ).length === 0 && (
                        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                          No variants with downgraded classifications found
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Variants with Multiple Classification Changes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Variants that have undergone multiple classification changes over time
                    </p>
                    <div className="mt-4 space-y-2">
                      {variants
                        .filter((variant) => variant.history.length > 1)
                        .map((variant) => {
                          const variantKey = `${variant.gene}-${variant.variant}`
                          return (
                            <div key={variantKey} className="rounded border border-gray-200 bg-white p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    {variant.gene} - {variant.variant}
                                  </div>
                                  <div className="mt-1 text-sm text-gray-500">
                                    {variant.history.length} classification changes
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <a href="#" onClick={() => toggleVariantExpanded(variantKey)}>
                                    View History
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      {variants.filter((variant) => variant.history.length > 1).length === 0 && (
                        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                          No variants with multiple classification changes found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Implications of Classification Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start">
                      <div className="mr-3 rounded-full bg-amber-100 p-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-amber-800">Important Notice</h3>
                        <p className="mt-1 text-sm text-amber-700">
                          Variant classifications can change over time as new evidence emerges. It is important to
                          periodically review the classification status of clinically significant variants, especially
                          those that were previously classified as variants of uncertain significance (VUS).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Recommendations for Variants with Changed Classifications</h3>
                    <div className="mt-4 space-y-4">
                      {variants
                        .filter((variant) =>
                          variant.history.some((change) =>
                            isSignificantChange(change.previousClassification, change.newClassification),
                          ),
                        )
                        .map((variant) => {
                          const variantKey = `${variant.gene}-${variant.variant}`
                          const significantChanges = variant.history.filter((change) =>
                            isSignificantChange(change.previousClassification, change.newClassification),
                          )
                          const latestSignificantChange = significantChanges[0]

                          return (
                            <div key={variantKey} className="rounded-lg border border-gray-200 bg-white p-4">
                              <div className="flex items-start space-x-4">
                                <div
                                  className={`rounded-full p-2 ${
                                    latestSignificantChange.newClassification === "pathogenic" ||
                                    latestSignificantChange.newClassification === "likely_pathogenic"
                                      ? "bg-red-100 text-red-600"
                                      : latestSignificantChange.newClassification === "uncertain_significance"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  <Info className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {variant.gene} - {variant.variant}
                                  </div>
                                  <div className="mt-1 flex items-center text-sm">
                                    <Badge
                                      className={`${getClassificationColor(
                                        latestSignificantChange.previousClassification,
                                      )}`}
                                    >
                                      {formatClassification(latestSignificantChange.previousClassification)}
                                    </Badge>
                                    <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                                    <Badge
                                      className={`${getClassificationColor(latestSignificantChange.newClassification)}`}
                                    >
                                      {formatClassification(latestSignificantChange.newClassification)}
                                    </Badge>
                                  </div>
                                  <div className="mt-2 text-sm">
                                    {latestSignificantChange.newClassification === "pathogenic" ||
                                    latestSignificantChange.newClassification === "likely_pathogenic" ? (
                                      <div className="text-red-700">
                                        <p className="font-medium">Clinical Action Recommended:</p>
                                        <ul className="mt-1 list-disc pl-5">
                                          <li>
                                            Consider referral to genetic counseling for discussion of implications and
                                            management options
                                          </li>
                                          <li>
                                            Review family history and consider cascade testing for at-risk family
                                            members
                                          </li>
                                          <li>
                                            Implement appropriate surveillance and risk reduction strategies based on
                                            associated cancer risks
                                          </li>
                                        </ul>
                                      </div>
                                    ) : latestSignificantChange.previousClassification === "pathogenic" ||
                                      latestSignificantChange.previousClassification === "likely_pathogenic" ? (
                                      <div className="text-green-700">
                                        <p className="font-medium">Clinical Action Recommended:</p>
                                        <ul className="mt-1 list-disc pl-5">
                                          <li>
                                            Reassess risk management recommendations that were based on previous
                                            classification
                                          </li>
                                          <li>
                                            Consider referral to genetic counseling for discussion of revised
                                            implications
                                          </li>
                                          <li>
                                            Update family members who may have undergone cascade testing based on
                                            previous classification
                                          </li>
                                        </ul>
                                      </div>
                                    ) : (
                                      <div className="text-gray-700">
                                        <p className="font-medium">Clinical Action Recommended:</p>
                                        <ul className="mt-1 list-disc pl-5">
                                          <li>
                                            Review updated classification and consider implications for patient
                                            management
                                          </li>
                                          <li>Document classification change in patient's medical record</li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      {variants.filter((variant) =>
                        variant.history.some((change) =>
                          isSignificantChange(change.previousClassification, change.newClassification),
                        ),
                      ).length === 0 && (
                        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                          No variants with significant classification changes found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
