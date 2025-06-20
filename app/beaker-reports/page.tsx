"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdvancedAnalysisDashboard } from "@/components/genomics/advanced-analysis-dashboard"
import { PerformanceDashboard } from "@/components/genomics/performance-dashboard"

export default function BeakerReportsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [customPatientId, setCustomPatientId] = useState<string>("")
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false)

  const mockProcessing = () => {
    // Create a mock result that matches the ProcessingResult type structure
    const mockResult = {
      variants: [
        {
          id: "1",
          chromosome: "17",
          position: 7578406,
          reference: "G",
          alternate: "A",
          gene: "TP53",
          transcript: "NM_000546.5",
          consequence: "missense_variant",
          clinicalSignificance: "pathogenic",
          alleleFrequency: 0.0001,
          zygosity: "heterozygous",
          depth: 120,
          quality: 100,
          genotype: "0/1",
          vaf: 0.48,
          annotations: [
            {
              source: "ClinVar",
              type: "pathogenicity",
              score: 0.95,
              description: "Pathogenic - Li-Fraumeni syndrome",
              evidence: ["literature", "functional_studies"],
              lastUpdated: "2023-01-15",
            },
          ],
        },
        {
          id: "2",
          chromosome: "13",
          position: 32936732,
          reference: "C",
          alternate: "T",
          gene: "BRCA2",
          transcript: "NM_000059.3",
          consequence: "nonsense_variant",
          clinicalSignificance: "pathogenic",
          alleleFrequency: 0.0005,
          zygosity: "heterozygous",
          depth: 80,
          quality: 90,
          genotype: "0/1",
          vaf: 0.52,
          annotations: [
            {
              source: "ClinVar",
              type: "pathogenicity",
              score: 0.98,
              description: "Pathogenic - Hereditary breast and ovarian cancer",
              evidence: ["literature", "functional_studies"],
              lastUpdated: "2023-02-20",
            },
          ],
        },
        {
          id: "3",
          chromosome: "17",
          position: 41245466,
          reference: "G",
          alternate: "T",
          gene: "BRCA1",
          transcript: "NM_007294.3",
          consequence: "frameshift_variant",
          clinicalSignificance: "likely_pathogenic",
          alleleFrequency: 0.0002,
          zygosity: "heterozygous",
          depth: 100,
          quality: 95,
          genotype: "0/1",
          vaf: 0.49,
          annotations: [
            {
              source: "ClinVar",
              type: "pathogenicity",
              score: 0.92,
              description: "Likely Pathogenic - Hereditary breast and ovarian cancer",
              evidence: ["literature"],
              lastUpdated: "2023-03-10",
            },
          ],
        },
        {
          id: "4",
          chromosome: "3",
          position: 37067240,
          reference: "A",
          alternate: "G",
          gene: "MLH1",
          transcript: "NM_000249.3",
          consequence: "missense_variant",
          clinicalSignificance: "uncertain_significance",
          alleleFrequency: 0.001,
          zygosity: "heterozygous",
          depth: 70,
          quality: 85,
          genotype: "0/1",
          vaf: 0.47,
          annotations: [
            {
              source: "ClinVar",
              type: "pathogenicity",
              score: 0.5,
              description: "Uncertain Significance - Lynch syndrome",
              evidence: ["computational"],
              lastUpdated: "2023-04-05",
            },
          ],
        },
        {
          id: "5",
          chromosome: "2",
          position: 47702181,
          reference: "C",
          alternate: "T",
          gene: "MSH2",
          transcript: "NM_000251.2",
          consequence: "splice_site_variant",
          clinicalSignificance: "benign",
          alleleFrequency: 0.05,
          zygosity: "homozygous",
          depth: 60,
          quality: 80,
          genotype: "1/1",
          vaf: 0.98,
          annotations: [
            {
              source: "ClinVar",
              type: "pathogenicity",
              score: 0.1,
              description: "Benign",
              evidence: ["population_data"],
              lastUpdated: "2023-05-20",
            },
          ],
        },
      ],
      summary: {
        totalVariants: 5,
        pathogenicVariants: 2,
        likelyPathogenicVariants: 1,
        vusVariants: 1,
        benignVariants: 1,
        processingTime: 1200, // milliseconds
        qualityMetrics: {
          averageDepth: 86,
          averageQuality: 90,
          coverageMetrics: {
            percentage10x: 100,
            percentage20x: 98,
            percentage30x: 95,
          },
          transitionTransversionRatio: 2.1,
          heterozygousHomozygousRatio: 4,
        },
      },
      riskAssessment: {
        overallRisk: "high",
        diseaseRisks: [
          {
            disease: "Hereditary Breast and Ovarian Cancer",
            risk: 0.85,
            confidence: 0.95,
            contributingVariants: ["2", "3"],
            recommendations: ["Enhanced screening", "Genetic counseling", "Consider prophylactic surgery"],
          },
          {
            disease: "Li-Fraumeni Syndrome",
            risk: 0.75,
            confidence: 0.9,
            contributingVariants: ["1"],
            recommendations: ["Comprehensive cancer screening protocol", "Genetic counseling"],
          },
          {
            disease: "Lynch Syndrome",
            risk: 0.3,
            confidence: 0.6,
            contributingVariants: ["4"],
            recommendations: ["Regular colonoscopy", "Further genetic testing"],
          },
        ],
        pharmacogenomicRisks: [
          {
            drug: "Warfarin",
            risk: "increased_sensitivity",
            recommendation: "Consider lower initial dose",
          },
          {
            drug: "Clopidogrel",
            risk: "decreased_efficacy",
            recommendation: "Consider alternative antiplatelet therapy",
          },
        ],
      },
      pharmacogenomics: [
        {
          drug: "Warfarin",
          effect: "increased_sensitivity",
          dosageRecommendation: "Reduce initial dose by 25-50%",
          evidenceLevel: "A",
          guidelines: ["CPIC", "FDA"],
        },
        {
          drug: "Clopidogrel",
          effect: "decreased_sensitivity",
          dosageRecommendation: "Consider alternative antiplatelet therapy",
          evidenceLevel: "B",
          guidelines: ["CPIC"],
        },
      ],
      structuralVariants: [
        {
          type: "deletion",
          size: 50000,
          breakpoints: [
            { chromosome: "17", position: 41200000 },
            { chromosome: "17", position: 41250000 },
          ],
          genes: ["BRCA1"],
          clinicalRelevance: "Pathogenic - disrupts tumor suppressor gene",
        },
      ],
      copyNumberVariants: [
        {
          type: "gain",
          copyNumber: 4,
          size: 200000,
          genes: ["ERBB2"],
          clinicalSignificance: "Pathogenic - gene amplification",
          inheritance: "de_novo",
        },
      ],
    }

    setProcessingResult(mockResult)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Beaker Reports</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Patient Selection</CardTitle>
          <CardDescription>Select a patient from the dropdown or enter a custom ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Select onValueChange={(value) => setSelectedPatientId(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient1">Patient 1</SelectItem>
                <SelectItem value="patient2">Patient 2</SelectItem>
                <SelectItem value="patient3">Patient 3</SelectItem>
              </SelectContent>
            </Select>

            <div>
              <Label htmlFor="customId">Custom Patient ID:</Label>
              <Input
                type="text"
                id="customId"
                value={customPatientId}
                onChange={(e) => setCustomPatientId(e.target.value)}
                className="ml-2"
              />
            </div>
          </div>
          <Button onClick={mockProcessing}>Process Data</Button>
          <div className="flex items-center space-x-2">
            <Label htmlFor="advancedMode">Advanced Mode:</Label>
            <Switch id="advancedMode" checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="reports" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Settings
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Performance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="space-y-4">
          {processingResult ? (
            <>
              <h2 className="text-lg font-semibold">Processing Result Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{processingResult.summary.totalVariants}</p>
                      <p className="text-sm text-gray-600">Total Variants</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{processingResult.summary.pathogenicVariants}</p>
                      <p className="text-sm text-gray-600">Pathogenic</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{processingResult.summary.vusVariants}</p>
                      <p className="text-sm text-gray-600">VUS</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {(processingResult.summary.processingTime / 1000).toFixed(2)}s
                      </p>
                      <p className="text-sm text-gray-600">Processing Time</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableCaption>Key genomic analysis results.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Gene</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Clinical Significance</TableHead>
                    <TableHead>Quality Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processingResult.variants.slice(0, 5).map((variant: any) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.gene}</TableCell>
                      <TableCell>
                        {variant.reference}→{variant.alternate}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            variant.clinicalSignificance === "pathogenic"
                              ? "text-red-600 font-medium"
                              : variant.clinicalSignificance === "likely_pathogenic"
                                ? "text-orange-600 font-medium"
                                : variant.clinicalSignificance === "uncertain_significance"
                                  ? "text-yellow-600 font-medium"
                                  : "text-green-600 font-medium"
                          }
                        >
                          {variant.clinicalSignificance.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>{variant.quality}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <p>No processing result available.</p>
          )}
          {processingResult && isAdvancedMode && (
            <AdvancedAnalysisDashboard result={processingResult} patientId={selectedPatientId || customPatientId} />
          )}
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p>Settings content goes here.</p>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <PerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
