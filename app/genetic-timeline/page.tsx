"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GeneticTimeline } from "@/components/timeline/genetic-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Share2, Printer } from "lucide-react"
import Link from "next/link"

// Mock genetic findings data
const MOCK_GENETIC_FINDINGS = [
  {
    id: "gf1",
    date: "2023-05-15",
    gene: "BRCA1",
    mutation: "c.5266dupC",
    zygosity: "Heterozygous",
    interpretation:
      "This is a well-characterized pathogenic variant in BRCA1 that is associated with an increased risk for breast, ovarian, and other cancers. This variant results in premature protein truncation and is one of the most common BRCA1 pathogenic variants.",
    clinicalSignificance: "pathogenic",
    source: "Foundation Medicine",
    reportId: "r1",
    followUpRecommended: true,
    relatedFindings: ["Breast Cancer Risk", "Ovarian Cancer Risk"],
  },
  {
    id: "gf2",
    date: "2023-05-15",
    gene: "TP53",
    mutation: "R175H",
    zygosity: "Heterozygous",
    interpretation:
      "This missense variant in TP53 is a well-established pathogenic variant that disrupts p53 protein function. It is associated with Li-Fraumeni syndrome and an increased risk for multiple cancers including breast cancer, sarcomas, and brain tumors.",
    clinicalSignificance: "pathogenic",
    source: "Foundation Medicine",
    reportId: "r1",
    followUpRecommended: true,
    relatedFindings: ["Li-Fraumeni Syndrome", "Multiple Cancer Risk"],
  },
  {
    id: "gf3",
    date: "2023-05-15",
    gene: "PTEN",
    mutation: "c.697C>T",
    zygosity: "Heterozygous",
    interpretation:
      "This variant in PTEN results in a premature stop codon and is classified as pathogenic. It is associated with PTEN Hamartoma Tumor Syndrome (including Cowden syndrome) and an increased risk for breast, thyroid, endometrial, and other cancers.",
    clinicalSignificance: "pathogenic",
    source: "Foundation Medicine",
    reportId: "r1",
    followUpRecommended: true,
  },
  {
    id: "gf4",
    date: "2023-05-15",
    gene: "ATM",
    mutation: "c.7271T>G",
    zygosity: "Heterozygous",
    interpretation:
      "This missense variant in ATM has been reported in multiple individuals with ataxia-telangiectasia and breast cancer. It affects a highly conserved amino acid and functional studies have shown it disrupts ATM kinase activity.",
    clinicalSignificance: "likely_pathogenic",
    source: "Foundation Medicine",
    reportId: "r1",
  },
  {
    id: "gf5",
    date: "2023-05-15",
    gene: "CHEK2",
    mutation: "c.1100delC",
    zygosity: "Heterozygous",
    interpretation:
      "This frameshift variant in CHEK2 is a well-established pathogenic variant that results in a truncated protein. It is associated with an increased risk for breast cancer and possibly other cancers.",
    clinicalSignificance: "pathogenic",
    source: "Foundation Medicine",
    reportId: "r1",
  },
  {
    id: "gf6",
    date: "2023-05-15",
    gene: "MUTYH",
    mutation: "G396D",
    zygosity: "Heterozygous",
    interpretation:
      "This missense variant in MUTYH is a common pathogenic variant. Biallelic MUTYH pathogenic variants cause MUTYH-associated polyposis, an autosomal recessive condition characterized by multiple colorectal adenomas and increased risk for colorectal cancer. Heterozygous carriers may have a slightly increased risk for colorectal cancer.",
    clinicalSignificance: "pathogenic",
    source: "Foundation Medicine",
    reportId: "r1",
  },
  {
    id: "gf7",
    date: "2023-05-15",
    gene: "BRCA2",
    mutation: "c.6275_6276delTT",
    zygosity: "Heterozygous",
    interpretation:
      "This frameshift variant in BRCA2 results in a premature stop codon and is classified as pathogenic. It is associated with an increased risk for breast, ovarian, pancreatic, and prostate cancers.",
    clinicalSignificance: "pathogenic",
    source: "Foundation Medicine",
    reportId: "r1",
    followUpRecommended: true,
    relatedFindings: ["Breast Cancer Risk", "Ovarian Cancer Risk", "Pancreatic Cancer Risk"],
  },
  {
    id: "gf8",
    date: "2022-11-10",
    gene: "BRCA1",
    mutation: "c.5266dupC",
    zygosity: "Heterozygous",
    interpretation:
      "Pathogenic variant in BRCA1 associated with Hereditary Breast and Ovarian Cancer Syndrome. Recommend genetic counseling and consideration of increased cancer surveillance.",
    clinicalSignificance: "pathogenic",
    source: "Myriad Genetics",
    reportId: "r2",
    followUpRecommended: true,
    relatedFindings: ["Breast Cancer Risk", "Ovarian Cancer Risk"],
  },
  {
    id: "gf9",
    date: "2022-11-10",
    gene: "MLH1",
    mutation: "c.350C>T",
    zygosity: "Heterozygous",
    interpretation:
      "This variant in MLH1 results in a premature stop codon and is classified as pathogenic. It is associated with Lynch syndrome and an increased risk for colorectal, endometrial, and other cancers.",
    clinicalSignificance: "pathogenic",
    source: "Myriad Genetics",
    reportId: "r2",
    followUpRecommended: true,
    relatedFindings: ["Lynch Syndrome", "Colorectal Cancer Risk"],
  },
  {
    id: "gf10",
    date: "2022-11-10",
    gene: "APC",
    mutation: "c.3927_3931delAAAGA",
    zygosity: "Heterozygous",
    interpretation:
      "This frameshift variant in APC is classified as pathogenic. It is associated with Familial Adenomatous Polyposis and an increased risk for colorectal cancer and other manifestations of FAP.",
    clinicalSignificance: "pathogenic",
    source: "Myriad Genetics",
    reportId: "r2",
    followUpRecommended: true,
    relatedFindings: ["Familial Adenomatous Polyposis", "Colorectal Cancer Risk"],
  },
  {
    id: "gf11",
    date: "2022-11-10",
    gene: "PALB2",
    mutation: "c.3113G>A",
    zygosity: "Heterozygous",
    interpretation:
      "This variant in PALB2 results in a premature stop codon and is classified as pathogenic. It is associated with an increased risk for breast cancer and possibly pancreatic cancer.",
    clinicalSignificance: "pathogenic",
    source: "Myriad Genetics",
    reportId: "r2",
    followUpRecommended: true,
    relatedFindings: ["Breast Cancer Risk", "Pancreatic Cancer Risk"],
  },
  {
    id: "gf12",
    date: "2022-11-10",
    gene: "RAD51C",
    mutation: "c.904+5G>T",
    zygosity: "Heterozygous",
    interpretation:
      "This splice site variant in RAD51C is predicted to affect RNA splicing and is classified as likely pathogenic. It is associated with an increased risk for ovarian cancer and possibly breast cancer.",
    clinicalSignificance: "likely_pathogenic",
    source: "Myriad Genetics",
    reportId: "r2",
    relatedFindings: ["Ovarian Cancer Risk"],
  },
  {
    id: "gf13",
    date: "2022-11-10",
    gene: "BRIP1",
    mutation: "c.2392C>T",
    zygosity: "Heterozygous",
    interpretation:
      "This nonsense variant in BRIP1 results in a premature stop codon and is classified as pathogenic. It is associated with an increased risk for ovarian cancer.",
    clinicalSignificance: "pathogenic",
    source: "Myriad Genetics",
    reportId: "r2",
    relatedFindings: ["Ovarian Cancer Risk"],
  },
  {
    id: "gf14",
    date: "2022-03-22",
    gene: "BRCA1",
    mutation: "c.5266dupC",
    zygosity: "Heterozygous",
    interpretation:
      "Pathogenic BRCA1 variant detected. This variant is associated with an increased risk for breast, ovarian, and other cancers. Recommend genetic counseling.",
    clinicalSignificance: "pathogenic",
    source: "Invitae",
    reportId: "r3",
    followUpRecommended: true,
  },
  {
    id: "gf15",
    date: "2022-03-22",
    gene: "CDKN2A",
    mutation: "c.301G>T",
    zygosity: "Heterozygous",
    interpretation:
      "This missense variant in CDKN2A is classified as a variant of uncertain significance. Its impact on protein function is not well-established, and its association with melanoma and pancreatic cancer risk is uncertain.",
    clinicalSignificance: "uncertain",
    source: "Invitae",
    reportId: "r3",
  },
  {
    id: "gf16",
    date: "2022-03-22",
    gene: "BARD1",
    mutation: "c.1977A>G",
    zygosity: "Heterozygous",
    interpretation:
      "This synonymous variant in BARD1 is classified as likely benign. It does not change the amino acid sequence and is not expected to impact protein function.",
    clinicalSignificance: "likely_benign",
    source: "Invitae",
    reportId: "r3",
  },
  {
    id: "gf17",
    date: "2022-03-22",
    gene: "NBN",
    mutation: "c.511A>G",
    zygosity: "Heterozygous",
    interpretation:
      "This missense variant in NBN is classified as a variant of uncertain significance. Its impact on protein function is not well-established, and its association with cancer risk is uncertain.",
    clinicalSignificance: "uncertain",
    source: "Invitae",
    reportId: "r3",
  },
  {
    id: "gf18",
    date: "2021-09-15",
    gene: "BRCA1",
    mutation: "c.5266dupC",
    zygosity: "Heterozygous",
    interpretation:
      "Pathogenic BRCA1 variant identified in initial screening. Patient should be referred for comprehensive genetic counseling.",
    clinicalSignificance: "pathogenic",
    source: "Color Genomics",
    reportId: "r4",
    followUpRecommended: true,
  },
  {
    id: "gf19",
    date: "2021-09-15",
    gene: "ATM",
    mutation: "c.8147T>C",
    zygosity: "Heterozygous",
    interpretation:
      "This missense variant in ATM is classified as a variant of uncertain significance. Its impact on protein function is not well-established, and its association with cancer risk is uncertain.",
    clinicalSignificance: "uncertain",
    source: "Color Genomics",
    reportId: "r4",
  },
  {
    id: "gf20",
    date: "2021-09-15",
    gene: "BRCA2",
    mutation: "c.9976A>T",
    zygosity: "Heterozygous",
    interpretation:
      "This missense variant in BRCA2 is classified as a variant of uncertain significance. Its impact on protein function is not well-established, and its association with cancer risk is uncertain.",
    clinicalSignificance: "uncertain",
    source: "Color Genomics",
    reportId: "r4",
  },
]

export default function GeneticTimelinePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/signin?callbackUrl=/genetic-timeline")
        return
      }
      setIsPageLoading(false)
    }
  }, [isLoading, user, router])

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
            <h1 className="text-2xl font-bold text-gray-900">Genetic Timeline</h1>
            <p className="text-gray-500">Chronological view of genetic findings and interpretations</p>
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
                  20 Genetic Findings
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Genetic Timeline
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Clinical Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <GeneticTimeline patientId="1" findings={MOCK_GENETIC_FINDINGS} />
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h3 className="font-medium text-red-800">High Priority Recommendations</h3>
                    <ul className="mt-2 space-y-2 text-sm text-red-700">
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-red-600">
                          1
                        </span>
                        <span>
                          <strong>BRCA1 (c.5266dupC) - Pathogenic:</strong> Refer to genetic counseling. Consider
                          increased breast surveillance with annual mammogram and breast MRI starting at age 25-30, and
                          discussion of risk-reducing mastectomy and oophorectomy.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-red-600">
                          2
                        </span>
                        <span>
                          <strong>TP53 (R175H) - Pathogenic:</strong> Refer to genetic counseling for Li-Fraumeni
                          syndrome management. Consider comprehensive cancer surveillance protocol including whole-body
                          MRI.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-red-600">
                          3
                        </span>
                        <span>
                          <strong>MLH1 (c.350C&gt;T) - Pathogenic:</strong> Refer to genetic counseling for Lynch
                          syndrome management. Consider colonoscopy every 1-2 years beginning at age 20-25, and
                          screening for endometrial and ovarian cancer.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h3 className="font-medium text-amber-800">Medium Priority Recommendations</h3>
                    <ul className="mt-2 space-y-2 text-sm text-amber-700">
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-600">
                          1
                        </span>
                        <span>
                          <strong>ATM (c.7271T&gt;G) - Likely Pathogenic:</strong> Consider increased breast cancer
                          surveillance with annual mammogram starting at age 40.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-600">
                          2
                        </span>
                        <span>
                          <strong>CHEK2 (c.1100delC) - Pathogenic:</strong> Consider increased breast cancer
                          surveillance with annual mammogram starting at age 40, and colonoscopy every 5 years starting
                          at age 40.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="font-medium text-blue-800">Surveillance Recommendations</h3>
                    <ul className="mt-2 space-y-2 text-sm text-blue-700">
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-600">
                          1
                        </span>
                        <span>
                          <strong>Breast Cancer Screening:</strong> Annual mammogram and breast MRI starting at age
                          25-30, clinical breast exam every 6-12 months.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-600">
                          2
                        </span>
                        <span>
                          <strong>Colorectal Cancer Screening:</strong> Colonoscopy every 1-2 years beginning at age
                          20-25.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-600">
                          3
                        </span>
                        <span>
                          <strong>Comprehensive Cancer Surveillance:</strong> Consider annual whole-body MRI and
                          additional organ-specific screening based on family history.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-800">Family Testing Recommendations</h3>
                    <p className="mt-2 text-sm text-gray-700">
                      Recommend cascade genetic testing for first-degree relatives (parents, siblings, children) for the
                      following pathogenic variants:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>• BRCA1 (c.5266dupC)</li>
                      <li>• TP53 (R175H)</li>
                      <li>• MLH1 (c.350C&gt;T)</li>
                      <li>• BRCA2 (c.6275_6276delTT)</li>
                      <li>• APC (c.3927_3931delAAAGA)</li>
                    </ul>
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
