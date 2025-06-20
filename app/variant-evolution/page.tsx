"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { VariantEvolutionTracker } from "@/components/timeline/variant-evolution-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  CalendarIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock variant evolution data
const MOCK_VARIANT_EVOLUTION_DATA = [
  {
    gene: "BRCA1",
    variant: "c.5266dupC",
    currentClassification: "pathogenic",
    history: [
      {
        id: "vc1",
        date: "2023-05-15",
        gene: "BRCA1",
        variant: "c.5266dupC",
        previousClassification: "likely_pathogenic",
        newClassification: "pathogenic",
        evidence: [
          "Multiple lines of computational evidence support a deleterious effect on the gene or gene product",
          "Functional studies supportive of a damaging effect on the gene or gene product",
          "Increased prevalence in affected individuals versus controls",
        ],
        source: "ClinVar",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/37706/",
        citations: [
          {
            title:
              "Comprehensive analysis of BRCA1 and BRCA2 germline mutations in a large cohort of 5931 Chinese women with breast cancer",
            authors: "Lang GT, Shi JX, Hu X, et al.",
            journal: "Breast Cancer Res Treat",
            year: "2017",
            pmid: "28421366",
            doi: "10.1007/s10549-017-4231-7",
          },
        ],
        notes: "Reclassified based on additional functional studies and population data.",
      },
      {
        id: "vc2",
        date: "2022-11-10",
        gene: "BRCA1",
        variant: "c.5266dupC",
        previousClassification: "uncertain_significance",
        newClassification: "likely_pathogenic",
        evidence: [
          "Absent from controls in population databases",
          "Protein length changes due to in-frame deletions/insertions in a non-repeat region",
          "Multiple lines of computational evidence support a deleterious effect",
        ],
        source: "Myriad Genetics",
        citations: [
          {
            title: "Pathogenicity and functional impact of BRCA1 alterations",
            authors: "Findlay GM, Daza RM, Martin B, et al.",
            journal: "Nature",
            year: "2018",
            pmid: "30209399",
            doi: "10.1038/s41586-018-0461-z",
          },
        ],
        notes: "Initial classification as VUS due to limited evidence. Reclassified based on functional studies.",
      },
      {
        id: "vc3",
        date: "2021-09-15",
        gene: "BRCA1",
        variant: "c.5266dupC",
        previousClassification: "not_provided",
        newClassification: "uncertain_significance",
        evidence: ["Novel variant not previously reported in literature", "Computational predictions inconclusive"],
        source: "Color Genomics",
        notes: "Initial detection of variant. Limited evidence available for classification.",
      },
    ],
  },
  {
    gene: "TP53",
    variant: "R175H",
    currentClassification: "pathogenic",
    history: [
      {
        id: "vc4",
        date: "2023-05-15",
        gene: "TP53",
        variant: "R175H",
        previousClassification: "likely_pathogenic",
        newClassification: "pathogenic",
        evidence: [
          "Well-established functional studies show a deleterious effect",
          "Located in a mutational hot spot and/or critical functional domain",
          "Absent from controls in population databases",
        ],
        source: "Foundation Medicine",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/12374/",
        citations: [
          {
            title: "Mutant p53 gain-of-function in cancer",
            authors: "Muller PAJ, Vousden KH",
            journal: "Nat Cell Biol",
            year: "2013",
            pmid: "23736425",
            doi: "10.1038/ncb2756",
          },
        ],
      },
      {
        id: "vc5",
        date: "2022-03-22",
        gene: "TP53",
        variant: "R175H",
        previousClassification: "uncertain_significance",
        newClassification: "likely_pathogenic",
        evidence: [
          "Multiple lines of computational evidence support a deleterious effect",
          "Missense variant in a gene with a low rate of benign missense variation",
          "Located in a critical functional domain",
        ],
        source: "Invitae",
        citations: [
          {
            title: "Comprehensive assessment of TP53 loss-of-function using multiple assays",
            authors: "Kotler E, Shani O, Goldfeld G, et al.",
            journal: "Cell Rep",
            year: "2018",
            pmid: "29590628",
            doi: "10.1016/j.celrep.2018.03.043",
          },
        ],
      },
    ],
  },
  {
    gene: "PTEN",
    variant: "c.697C>T",
    currentClassification: "pathogenic",
    history: [
      {
        id: "vc6",
        date: "2023-05-15",
        gene: "PTEN",
        variant: "c.697C>T",
        previousClassification: "likely_pathogenic",
        newClassification: "pathogenic",
        evidence: [
          "Null variant in a gene where loss of function is a known mechanism of disease",
          "Absent from controls in population databases",
          "Multiple lines of computational evidence support a deleterious effect",
        ],
        source: "Foundation Medicine",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/428708/",
        citations: [
          {
            title: "PTEN mutations in cancer predisposition and progression",
            authors: "Yehia L, Ngeow J, Eng C",
            journal: "Cold Spring Harb Perspect Med",
            year: "2019",
            pmid: "30510124",
            doi: "10.1101/cshperspect.a036194",
          },
        ],
      },
    ],
  },
  {
    gene: "CDKN2A",
    variant: "c.301G>T",
    currentClassification: "likely_benign",
    history: [
      {
        id: "vc7",
        date: "2023-05-15",
        gene: "CDKN2A",
        variant: "c.301G>T",
        previousClassification: "uncertain_significance",
        newClassification: "likely_benign",
        evidence: [
          "Allele frequency greater than expected for disorder",
          "Lack of segregation in affected members of a family",
          "Computational evidence suggests no impact on gene/gene product",
        ],
        source: "Foundation Medicine",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/587212/",
        citations: [
          {
            title: "Comprehensive analysis of CDKN2A variants in melanoma-prone families",
            authors: "Aoude LG, Wadt KA, Pritchard AL, et al.",
            journal: "Genes Chromosomes Cancer",
            year: "2015",
            pmid: "25809665",
            doi: "10.1002/gcc.22247",
          },
        ],
        notes: "Reclassified based on population frequency data and lack of segregation with disease.",
      },
      {
        id: "vc8",
        date: "2022-03-22",
        gene: "CDKN2A",
        variant: "c.301G>T",
        previousClassification: "not_provided",
        newClassification: "uncertain_significance",
        evidence: ["Novel variant not previously reported in literature", "Computational predictions inconclusive"],
        source: "Invitae",
        notes: "Initial detection of variant. Limited evidence available for classification.",
      },
    ],
  },
  {
    gene: "ATM",
    variant: "c.8147T>C",
    currentClassification: "pathogenic",
    history: [
      {
        id: "vc9",
        date: "2023-05-15",
        gene: "ATM",
        variant: "c.8147T>C",
        previousClassification: "uncertain_significance",
        newClassification: "pathogenic",
        evidence: [
          "Multiple lines of computational evidence support a deleterious effect",
          "Functional studies supportive of a damaging effect",
          "Absent from controls in population databases",
        ],
        source: "Foundation Medicine",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/142588/",
        citations: [
          {
            title: "Functional analysis of ATM protein kinase variants",
            authors: "Barone G, Groom A, Reiman A, et al.",
            journal: "Hum Mutat",
            year: "2020",
            pmid: "31943670",
            doi: "10.1002/humu.23965",
          },
        ],
        notes:
          "Significant reclassification based on new functional studies demonstrating loss of ATM kinase activity.",
      },
      {
        id: "vc10",
        date: "2021-09-15",
        gene: "ATM",
        variant: "c.8147T>C",
        previousClassification: "not_provided",
        newClassification: "uncertain_significance",
        evidence: ["Novel variant not previously reported in literature", "Computational predictions inconclusive"],
        source: "Color Genomics",
        notes: "Initial detection of variant. Limited evidence available for classification.",
      },
    ],
  },
  {
    gene: "BRCA2",
    variant: "c.9976A>T",
    currentClassification: "benign",
    history: [
      {
        id: "vc11",
        date: "2023-05-15",
        gene: "BRCA2",
        variant: "c.9976A>T",
        previousClassification: "likely_benign",
        newClassification: "benign",
        evidence: [
          "Allele frequency greater than expected for disorder",
          "Lack of segregation in affected members of a family",
          "Computational evidence suggests no impact on gene/gene product",
          "Well-established functional studies show no deleterious effect",
        ],
        source: "Foundation Medicine",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/812689/",
        citations: [
          {
            title: "Functional analysis of BRCA2 variants of uncertain significance",
            authors: "Guidugli L, Pankratz VS, Singh N, et al.",
            journal: "Hum Mutat",
            year: "2018",
            pmid: "30311370",
            doi: "10.1002/humu.23652",
          },
        ],
      },
      {
        id: "vc12",
        date: "2022-03-22",
        gene: "BRCA2",
        variant: "c.9976A>T",
        previousClassification: "uncertain_significance",
        newClassification: "likely_benign",
        evidence: [
          "Computational evidence suggests no impact on gene/gene product",
          "Observed in cases with alternate molecular basis for disease",
          "Allele frequency greater than expected for disorder",
        ],
        source: "Invitae",
        citations: [
          {
            title: "Analysis of protein-coding genetic variation in 60,706 humans",
            authors: "Lek M, Karczewski KJ, Minikel EV, et al.",
            journal: "Nature",
            year: "2016",
            pmid: "27535533",
            doi: "10.1038/nature19057",
          },
        ],
      },
      {
        id: "vc13",
        date: "2021-09-15",
        gene: "BRCA2",
        variant: "c.9976A>T",
        previousClassification: "not_provided",
        newClassification: "uncertain_significance",
        evidence: ["Novel variant not previously reported in literature", "Computational predictions inconclusive"],
        source: "Color Genomics",
        notes: "Initial detection of variant. Limited evidence available for classification.",
      },
    ],
  },
  {
    gene: "MLH1",
    variant: "c.350C>T",
    currentClassification: "pathogenic",
    history: [
      {
        id: "vc14",
        date: "2022-11-10",
        gene: "MLH1",
        variant: "c.350C>T",
        previousClassification: "likely_pathogenic",
        newClassification: "pathogenic",
        evidence: [
          "Null variant in a gene where loss of function is a known mechanism of disease",
          "Absent from controls in population databases",
          "Multiple lines of computational evidence support a deleterious effect",
          "Segregation with disease in multiple family members",
        ],
        source: "Myriad Genetics",
        citations: [
          {
            title: "Comprehensive assessment of MLH1 variants of uncertain significance",
            authors: "Thompson BA, Greenblatt MS, Vallee MP, et al.",
            journal: "Hum Mutat",
            year: "2013",
            pmid: "23559372",
            doi: "10.1002/humu.22311",
          },
        ],
      },
    ],
  },
]

export default function VariantEvolutionPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [filteredVariants, setFilteredVariants] = useState(MOCK_VARIANT_EVOLUTION_DATA)
  const [geneFilter, setGeneFilter] = useState<string>("all")
  const [changeTypeFilter, setChangeTypeFilter] = useState<string>("all")
  const [dateRangeFrom, setDateRangeFrom] = useState<Date | undefined>(undefined)
  const [dateRangeTo, setDateRangeTo] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  const uniqueGenes = [...new Set(MOCK_VARIANT_EVOLUTION_DATA.map((v) => v.gene))]

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/signin?callbackUrl=/variant-evolution")
        return
      }
      setIsPageLoading(false)
    }
  }, [isLoading, user, router])

  const filterVariants = () => {
    let result = [...MOCK_VARIANT_EVOLUTION_DATA]

    // Filter by gene
    if (geneFilter !== "all") {
      result = result.filter((v) => v.gene === geneFilter)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter((v) => v.gene.toLowerCase().includes(query) || v.variant.toLowerCase().includes(query))
    }

    // Filter by change type
    if (changeTypeFilter !== "all") {
      result = result.filter((v) => {
        // Check each variant's history for matching classification changes
        for (const change of v.history) {
          const prevClass = change.previousClassification
          const newClass = change.newClassification

          if (changeTypeFilter === "upgrade") {
            // Check if classification was upgraded (more pathogenic)
            if (
              (prevClass === "benign" &&
                ["likely_benign", "uncertain_significance", "likely_pathogenic", "pathogenic"].includes(newClass)) ||
              (prevClass === "likely_benign" &&
                ["uncertain_significance", "likely_pathogenic", "pathogenic"].includes(newClass)) ||
              (prevClass === "uncertain_significance" && ["likely_pathogenic", "pathogenic"].includes(newClass)) ||
              (prevClass === "likely_pathogenic" && newClass === "pathogenic")
            ) {
              return true
            }
          } else if (changeTypeFilter === "downgrade") {
            // Check if classification was downgraded (less pathogenic)
            if (
              (prevClass === "pathogenic" &&
                ["likely_pathogenic", "uncertain_significance", "likely_benign", "benign"].includes(newClass)) ||
              (prevClass === "likely_pathogenic" &&
                ["uncertain_significance", "likely_benign", "benign"].includes(newClass)) ||
              (prevClass === "uncertain_significance" && ["likely_benign", "benign"].includes(newClass)) ||
              (prevClass === "likely_benign" && newClass === "benign")
            ) {
              return true
            }
          } else if (changeTypeFilter === "significant") {
            // Check for significant changes (change of 2 or more levels)
            if (isSignificantChange(prevClass, newClass)) {
              return true
            }
          }
        }
        return false
      })
    }

    // Filter by date range
    if (dateRangeFrom || dateRangeTo) {
      result = result.filter((v) => {
        // Check if any changes in the variant's history fall within the date range
        return v.history.some((change) => {
          const changeDate = parseISO(change.date)

          if (dateRangeFrom && dateRangeTo) {
            return (
              (isAfter(changeDate, dateRangeFrom) || isEqual(changeDate, dateRangeFrom)) &&
              (isBefore(changeDate, dateRangeTo) || isEqual(changeDate, dateRangeTo))
            )
          } else if (dateRangeFrom) {
            return isAfter(changeDate, dateRangeFrom) || isEqual(changeDate, dateRangeFrom)
          } else if (dateRangeTo) {
            return isBefore(changeDate, dateRangeTo) || isEqual(changeDate, dateRangeTo)
          }

          return true
        })
      })
    }

    return result
  }

  // Function to determine if a classification change is significant (2 or more levels)
  const isSignificantChange = (prevClass: string, newClass: string): boolean => {
    const classificationLevels: { [key: string]: number } = {
      benign: 1,
      likely_benign: 2,
      uncertain_significance: 3,
      likely_pathogenic: 4,
      pathogenic: 5,
    }

    const prevLevel = classificationLevels[prevClass] || 0
    const newLevel = classificationLevels[newClass] || 0

    return Math.abs(newLevel - prevLevel) >= 2
  }

  useEffect(() => {
    const result = filterVariants()
    setFilteredVariants(result)
  }, [geneFilter, changeTypeFilter, dateRangeFrom, dateRangeTo, searchQuery])

  if (isLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Variant Interpretation Evolution</h1>
            <p className="text-gray-500">Track how variant classifications have changed over time</p>
          </div>
          <div className="mt-4 flex space-x-2 sm:mt-0">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Patient: John Smith</CardTitle>
                <p className="text-gray-500">DOB: May 12, 1980 | MRN: 123456789</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  7 Variants with Evolution Data
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start">
                <div className="mr-3 rounded-full bg-amber-100 p-2">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800">Why Variant Classifications Change</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Variant classifications can change over time as new evidence emerges from research, functional
                    studies, and population databases. These changes can have significant clinical implications,
                    potentially altering medical management recommendations. This tracker helps you monitor these
                    changes and understand their impact on patient care.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="evolution" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="evolution" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Variant Evolution
            </TabsTrigger>
            <TabsTrigger
              value="clinical-impact"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Clinical Impact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evolution">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle>Variant Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setGeneFilter("all")
                      setChangeTypeFilter("all")
                      setDateRangeFrom(undefined)
                      setDateRangeTo(undefined)
                      setSearchQuery("")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search genes or variants"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gene">Gene</Label>
                    <Select value={geneFilter} onValueChange={setGeneFilter}>
                      <SelectTrigger id="gene" className="mt-1">
                        <SelectValue placeholder="Select Gene" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genes</SelectItem>
                        {uniqueGenes.map((gene) => (
                          <SelectItem key={gene} value={gene}>
                            {gene}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="change-type">Classification Change</Label>
                    <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
                      <SelectTrigger id="change-type" className="mt-1">
                        <SelectValue placeholder="Change Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Changes</SelectItem>
                        <SelectItem value="upgrade">Upgraded Classifications</SelectItem>
                        <SelectItem value="downgrade">Downgraded Classifications</SelectItem>
                        <SelectItem value="significant">Significant Changes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Date Range</Label>
                    <div className="flex items-center space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`justify-start text-left font-normal ${!dateRangeFrom && "text-muted-foreground"}`}
                            size="sm"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRangeFrom ? format(dateRangeFrom, "MMM d, yyyy") : "From"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={dateRangeFrom} onSelect={setDateRangeFrom} initialFocus />
                        </PopoverContent>
                      </Popover>

                      <span>to</span>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`justify-start text-left font-normal ${!dateRangeTo && "text-muted-foreground"}`}
                            size="sm"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRangeTo ? format(dateRangeTo, "MMM d, yyyy") : "To"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={dateRangeTo} onSelect={setDateRangeTo} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Showing {filteredVariants.length} of {MOCK_VARIANT_EVOLUTION_DATA.length} variants
              </div>
            </div>

            <VariantEvolutionTracker variants={filteredVariants} />
          </TabsContent>

          <TabsContent value="clinical-impact">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Impact of Variant Reclassifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h3 className="font-medium text-red-800">High Impact Reclassifications</h3>
                    <p className="mt-1 text-sm text-red-700">
                      These reclassifications have significant clinical implications and may require immediate action
                    </p>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-red-100 p-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium">ATM - c.8147T&gt;C</div>
                            <div className="mt-1 flex items-center text-sm">
                              <Badge className="bg-yellow-100 text-yellow-800">Uncertain Significance</Badge>
                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                              <Badge className="bg-red-100 text-red-800">Pathogenic</Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <p className="font-medium">Clinical Implications:</p>
                              <ul className="mt-1 list-disc pl-5">
                                <li>Increased risk for breast cancer (2-4 fold) and possibly pancreatic cancer</li>
                                <li>
                                  Consider increased breast cancer surveillance with annual mammogram starting at age 40
                                </li>
                                <li>
                                  Consider referral to genetic counseling for discussion of implications and management
                                  options
                                </li>
                                <li>Consider cascade testing for at-risk family members</li>
                              </ul>
                            </div>
                            <div className="mt-3 text-sm">
                              <p className="font-medium">Reason for Reclassification:</p>
                              <p>
                                New functional studies demonstrated loss of ATM kinase activity. Multiple lines of
                                computational evidence support a deleterious effect.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-red-100 p-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium">TP53 - R175H</div>
                            <div className="mt-1 flex items-center text-sm">
                              <Badge className="bg-yellow-100 text-yellow-800">Uncertain Significance</Badge>
                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                              <Badge className="bg-orange-100 text-orange-800">Likely Pathogenic</Badge>
                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                              <Badge className="bg-red-100 text-red-800">Pathogenic</Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <p className="font-medium">Clinical Implications:</p>
                              <ul className="mt-1 list-disc pl-5">
                                <li>
                                  Associated with Li-Fraumeni syndrome and increased risk for multiple cancers including
                                  breast cancer, sarcomas, brain tumors, and adrenocortical carcinoma
                                </li>
                                <li>Consider comprehensive cancer surveillance protocol including whole-body MRI</li>
                                <li>Refer to genetic counseling for Li-Fraumeni syndrome management</li>
                                <li>Consider cascade testing for at-risk family members</li>
                              </ul>
                            </div>
                            <div className="mt-3 text-sm">
                              <p className="font-medium">Reason for Reclassification:</p>
                              <p>
                                Well-established functional studies show a deleterious effect. Located in a mutational
                                hot spot and critical functional domain. Absent from controls in population databases.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="font-medium text-green-800">Downgraded Classifications</h3>
                    <p className="mt-1 text-sm text-green-700">
                      These variants have been downgraded to less pathogenic classifications, potentially reducing
                      clinical concern
                    </p>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-green-100 p-2">
                            <Info className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">BRCA2 - c.9976A&gt;T</div>
                            <div className="mt-1 flex items-center text-sm">
                              <Badge className="bg-yellow-100 text-yellow-800">Uncertain Significance</Badge>
                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                              <Badge className="bg-blue-100 text-blue-800">Likely Benign</Badge>
                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                              <Badge className="bg-green-100 text-green-800">Benign</Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <p className="font-medium">Clinical Implications:</p>
                              <ul className="mt-1 list-disc pl-5">
                                <li>No increased cancer risk associated with this variant</li>
                                <li>
                                  Cancer risk assessment should be based on other risk factors including family history
                                </li>
                                <li>No need for cascade testing of family members for this specific variant</li>
                              </ul>
                            </div>
                            <div className="mt-3 text-sm">
                              <p className="font-medium">Reason for Reclassification:</p>
                              <p>
                                Allele frequency greater than expected for disorder. Lack of segregation in affected
                                members of a family. Well-established functional studies show no deleterious effect.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-green-100 p-2">
                            <Info className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">CDKN2A - c.301G&gt;T</div>
                            <div className="mt-1 flex items-center text-sm">
                              <Badge className="bg-yellow-100 text-yellow-800">Uncertain Significance</Badge>
                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                              <Badge className="bg-blue-100 text-blue-800">Likely Benign</Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <p className="font-medium">Clinical Implications:</p>
                              <ul className="mt-1 list-disc pl-5">
                                <li>No increased melanoma or pancreatic cancer risk associated with this variant</li>
                                <li>
                                  Cancer risk assessment should be based on other risk factors including family history
                                </li>
                                <li>No need for cascade testing of family members for this specific variant</li>
                              </ul>
                            </div>
                            <div className="mt-3 text-sm">
                              <p className="font-medium">Reason for Reclassification:</p>
                              <p>
                                Allele frequency greater than expected for disorder. Lack of segregation in affected
                                members of a family. Computational evidence suggests no impact on gene/gene product.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="font-medium text-blue-800">Moderate Impact Reclassifications</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      These reclassifications have moderate clinical implications and may require updates to patient
                      management
                    </p>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-blue-100 p-2">
                            <Info className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">BRCA1 - c.5266dupC</div>
                            <div className="mt-1 flex items-center text-sm">
                              <Badge className="bg-orange-100 text-orange-800">Likely Pathogenic</Badge>
                              <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                              <Badge className="bg-red-100 text-red-800">Pathogenic</Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <p className="font-medium">Clinical Implications:</p>
                              <ul className="mt-1 list-disc pl-5">
                                <li>Confirms high risk for breast and ovarian cancer</li>
                                <li>Management recommendations remain similar but with increased confidence</li>
                                <li>Reinforces importance of cascade testing for family members</li>
                              </ul>
                            </div>
                            <div className="mt-3 text-sm">
                              <p className="font-medium">Reason for Reclassification:</p>
                              <p>Additional functional studies and population data further supporting pathogenicity.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
