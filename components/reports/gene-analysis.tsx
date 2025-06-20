"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts"
import { Download, ZoomIn, ZoomOut, RotateCw, Info, ExternalLink } from "lucide-react"
import type { DiagnosticReportResult } from "@/lib/api/fhir-service"

interface GeneAnalysisProps {
  reports: DiagnosticReportResult[]
}

// Color palette for charts
const COLORS = ["#0066cc", "#00c1c1", "#ffc107", "#dc3545", "#6f42c1", "#28a745", "#fd7e14", "#20c997"]

// Mock data for gene-disease associations
const GENE_DISEASE_DATA = [
  { gene: "TP53", disease: "Li-Fraumeni Syndrome", association: 0.95 },
  { gene: "TP53", disease: "Breast Cancer", association: 0.85 },
  { gene: "TP53", disease: "Sarcoma", association: 0.8 },
  { gene: "TP53", disease: "Adrenocortical Carcinoma", association: 0.75 },
  { gene: "TP53", disease: "Brain Tumors", association: 0.7 },
  { gene: "BRCA1", disease: "Breast Cancer", association: 0.9 },
  { gene: "BRCA1", disease: "Ovarian Cancer", association: 0.85 },
  { gene: "BRCA1", disease: "Pancreatic Cancer", association: 0.6 },
  { gene: "BRCA1", disease: "Prostate Cancer", association: 0.55 },
  { gene: "BRCA2", disease: "Breast Cancer", association: 0.85 },
  { gene: "BRCA2", disease: "Ovarian Cancer", association: 0.7 },
  { gene: "BRCA2", disease: "Pancreatic Cancer", association: 0.65 },
  { gene: "BRCA2", disease: "Melanoma", association: 0.5 },
  { gene: "MLH1", disease: "Lynch Syndrome", association: 0.9 },
  { gene: "MLH1", disease: "Colorectal Cancer", association: 0.85 },
  { gene: "MLH1", disease: "Endometrial Cancer", association: 0.75 },
]

// Mock data for gene expression levels
const GENE_EXPRESSION_DATA = [
  { gene: "TP53", tissue: "Breast", expression: 85 },
  { gene: "TP53", tissue: "Lung", expression: 75 },
  { gene: "TP53", tissue: "Colon", expression: 80 },
  { gene: "TP53", tissue: "Skin", expression: 65 },
  { gene: "TP53", tissue: "Brain", expression: 70 },
  { gene: "BRCA1", tissue: "Breast", expression: 90 },
  { gene: "BRCA1", tissue: "Ovary", expression: 85 },
  { gene: "BRCA1", tissue: "Prostate", expression: 40 },
  { gene: "BRCA1", tissue: "Pancreas", expression: 55 },
  { gene: "BRCA1", tissue: "Colon", expression: 50 },
  { gene: "BRCA2", tissue: "Breast", expression: 85 },
  { gene: "BRCA2", tissue: "Ovary", expression: 70 },
  { gene: "BRCA2", tissue: "Prostate", expression: 60 },
  { gene: "BRCA2", tissue: "Pancreas", expression: 65 },
  { gene: "BRCA2", tissue: "Skin", expression: 50 },
]

// Mock data for variant pathogenicity scores
const VARIANT_PATHOGENICITY_DATA = [
  { gene: "TP53", variant: "R175H", pathogenicity: 0.95, frequency: 0.05 },
  { gene: "TP53", variant: "R248Q", pathogenicity: 0.92, frequency: 0.04 },
  { gene: "TP53", variant: "R273H", pathogenicity: 0.9, frequency: 0.06 },
  { gene: "TP53", variant: "R282W", pathogenicity: 0.88, frequency: 0.03 },
  { gene: "BRCA1", variant: "c.5266dupC", pathogenicity: 0.95, frequency: 0.02 },
  { gene: "BRCA1", variant: "c.68_69delAG", pathogenicity: 0.94, frequency: 0.01 },
  { gene: "BRCA1", variant: "c.181T>G", pathogenicity: 0.85, frequency: 0.01 },
  { gene: "BRCA2", variant: "c.5946delT", pathogenicity: 0.93, frequency: 0.02 },
  { gene: "BRCA2", variant: "c.6275_6276delTT", pathogenicity: 0.9, frequency: 0.01 },
]

// Mock data for gene function
const GENE_FUNCTION_DATA = [
  { gene: "TP53", function: "Tumor suppression", importance: 95 },
  { gene: "TP53", function: "DNA repair", importance: 85 },
  { gene: "TP53", function: "Cell cycle regulation", importance: 90 },
  { gene: "TP53", function: "Apoptosis", importance: 88 },
  { gene: "BRCA1", function: "DNA repair", importance: 95 },
  { gene: "BRCA1", function: "Tumor suppression", importance: 90 },
  { gene: "BRCA1", function: "Cell cycle regulation", importance: 80 },
  { gene: "BRCA1", function: "Transcription regulation", importance: 75 },
  { gene: "BRCA2", function: "DNA repair", importance: 95 },
  { gene: "BRCA2", function: "Tumor suppression", importance: 85 },
  { gene: "BRCA2", function: "Genomic stability", importance: 90 },
  { gene: "MLH1", function: "DNA mismatch repair", importance: 95 },
  { gene: "MLH1", function: "Tumor suppression", importance: 85 },
  { gene: "MLH1", function: "Genomic stability", importance: 90 },
]

export function GeneAnalysis({ reports }: GeneAnalysisProps) {
  const [activeTab, setActiveTab] = useState("disease")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedGene, setSelectedGene] = useState<string | null>(null)

  if (!reports || reports.length === 0) {
    return null
  }

  // Extract unique genes from reports
  const genes = [...new Set(reports.map((report) => report.gene))]

  // Filter disease associations for detected genes
  const diseaseAssociations = selectedGene
    ? GENE_DISEASE_DATA.filter((item) => item.gene === selectedGene)
    : GENE_DISEASE_DATA.filter((item) => genes.includes(item.gene))

  // Filter expression data for detected genes
  const expressionData = selectedGene
    ? GENE_EXPRESSION_DATA.filter((item) => item.gene === selectedGene)
    : GENE_EXPRESSION_DATA.filter((item) => genes.includes(item.gene))

  // Filter pathogenicity data for detected genes and variants
  const pathogenicityData = selectedGene
    ? VARIANT_PATHOGENICITY_DATA.filter((item) => item.gene === selectedGene)
    : VARIANT_PATHOGENICITY_DATA.filter((item) =>
        reports.some((report) => report.gene === item.gene && report.mutation === item.variant),
      )

  // Filter function data for detected genes
  const functionData = selectedGene
    ? GENE_FUNCTION_DATA.filter((item) => item.gene === selectedGene)
    : GENE_FUNCTION_DATA.filter((item) => genes.includes(item.gene))

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.2, 0.6))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Gene Analysis</CardTitle>
          <p className="text-sm text-gray-500">Detailed analysis of detected genes and variants</p>
        </div>
        <div className="flex space-x-2">
          <div className="mr-2">
            <select
              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm"
              value={selectedGene || ""}
              onChange={(e) => setSelectedGene(e.target.value || null)}
            >
              <option value="">All Genes</option>
              {genes.map((gene) => (
                <option key={gene} value={gene}>
                  {gene}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetZoom}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="disease" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="disease" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Disease Associations
            </TabsTrigger>
            <TabsTrigger value="expression" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Gene Expression
            </TabsTrigger>
            <TabsTrigger
              value="pathogenicity"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700"
            >
              Variant Pathogenicity
            </TabsTrigger>
            <TabsTrigger value="function" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Gene Function
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disease">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This chart shows the strength of association between detected genes and various diseases based on
                      published literature.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diseaseAssociations} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                      dataKey="disease"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      tick={{ fill: "#495057" }}
                    />
                    <YAxis
                      label={{ value: "Association Strength", angle: -90, position: "insideLeft", fill: "#495057" }}
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${(Number(value) * 100).toFixed(0)}%`, "Association"]}
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="association" name="Disease Association" radius={[4, 4, 0, 0]}>
                      {diseaseAssociations.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.gene === "TP53"
                              ? "#0066cc"
                              : entry.gene === "BRCA1"
                                ? "#dc3545"
                                : entry.gene === "BRCA2"
                                  ? "#fd7e14"
                                  : "#6f42c1"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {genes.map((gene) => (
                  <Card key={gene} className="overflow-hidden">
                    <div
                      className="h-2"
                      style={{
                        backgroundColor:
                          gene === "TP53"
                            ? "#0066cc"
                            : gene === "BRCA1"
                              ? "#dc3545"
                              : gene === "BRCA2"
                                ? "#fd7e14"
                                : "#6f42c1",
                      }}
                    ></div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{gene}</div>
                        <Button variant="ghost" size="sm" className="h-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="font-medium">Top Associations:</div>
                        <ul className="mt-1 space-y-1">
                          {GENE_DISEASE_DATA.filter((item) => item.gene === gene)
                            .sort((a, b) => b.association - a.association)
                            .slice(0, 3)
                            .map((item, idx) => (
                              <li key={idx} className="flex items-center justify-between">
                                <span>{item.disease}</span>
                                <Badge
                                  className={
                                    item.association > 0.8
                                      ? "bg-red-100 text-red-800"
                                      : item.association > 0.6
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {(item.association * 100).toFixed(0)}%
                                </Badge>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expression">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This radar chart displays the expression levels of detected genes across different tissue types.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} width={730} height={250} data={expressionData}>
                    <PolarGrid stroke="#e9ecef" />
                    <PolarAngleAxis dataKey="tissue" tick={{ fill: "#495057" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {genes.map((gene, index) => {
                      const geneData = expressionData.filter((item) => item.gene === gene)
                      if (geneData.length === 0) return null
                      return (
                        <Radar
                          key={gene}
                          name={gene}
                          dataKey="expression"
                          stroke={COLORS[index % COLORS.length]}
                          fill={COLORS[index % COLORS.length]}
                          fillOpacity={0.6}
                          data={geneData}
                        />
                      )
                    })}
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Expression Level"]}
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-md border">
                <div className="bg-gray-50 p-3 font-medium">Tissue Expression Analysis</div>
                <div className="p-4">
                  <p className="text-sm text-gray-700">
                    The radar chart above shows the expression levels of the detected genes across different tissue
                    types. Higher expression levels in specific tissues may correlate with the phenotypic effects of
                    mutations in these genes. For example, BRCA1 and BRCA2 show high expression in breast and ovarian
                    tissue, which aligns with their association with breast and ovarian cancers.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {genes.map((gene) => {
                      const maxExpressionTissue = GENE_EXPRESSION_DATA.filter((item) => item.gene === gene).reduce(
                        (max, item) => (item.expression > max.expression ? item : max),
                        { tissue: "", expression: 0 },
                      )
                      return (
                        <div key={gene} className="rounded-md border p-3">
                          <div className="font-medium">{gene}</div>
                          <div className="mt-1 text-sm">
                            Highest expression in <span className="font-medium">{maxExpressionTissue.tissue}</span>{" "}
                            tissue ({maxExpressionTissue.expression}%)
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pathogenicity">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This scatter plot shows the relationship between pathogenicity scores and population frequencies
                      for detected variants. Variants in the upper right are both highly pathogenic and relatively
                      common.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                      type="number"
                      dataKey="pathogenicity"
                      name="Pathogenicity Score"
                      domain={[0, 1]}
                      label={{
                        value: "Pathogenicity Score",
                        position: "bottom",
                        offset: 50,
                        fill: "#495057",
                      }}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      tick={{ fill: "#495057" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="frequency"
                      name="Population Frequency"
                      domain={[0, 0.1]}
                      label={{ value: "Population Frequency", angle: -90, position: "insideLeft", fill: "#495057" }}
                      tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                      tick={{ fill: "#495057" }}
                    />
                    <ZAxis dataKey="variant" name="Variant" />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Pathogenicity Score") {
                          return [`${(Number(value) * 100).toFixed(0)}%`, name]
                        }
                        if (name === "Population Frequency") {
                          return [`${(Number(value) * 100).toFixed(2)}%`, name]
                        }
                        return [value, name]
                      }}
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 20 }} />
                    {genes.map((gene, index) => {
                      const geneData = pathogenicityData.filter((item) => item.gene === gene)
                      if (geneData.length === 0) return null
                      return (
                        <Scatter
                          key={gene}
                          name={gene}
                          data={geneData}
                          fill={COLORS[index % COLORS.length]}
                          shape="circle"
                        />
                      )
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-md border">
                <div className="bg-gray-50 p-3 font-medium">Variant Analysis</div>
                <div className="divide-y">
                  {pathogenicityData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div>
                        <div className="font-medium">
                          {item.gene} - {item.variant}
                        </div>
                        <div className="text-sm text-gray-500">
                          Pathogenicity: {(item.pathogenicity * 100).toFixed(0)}% | Frequency:{" "}
                          {(item.frequency * 100).toFixed(2)}%
                        </div>
                      </div>
                      <Badge
                        className={
                          item.pathogenicity > 0.9
                            ? "bg-red-100 text-red-800"
                            : item.pathogenicity > 0.7
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {item.pathogenicity > 0.9 ? "High" : item.pathogenicity > 0.7 ? "Moderate" : "Low"}{" "}
                        Pathogenicity
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="function">
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This chart shows the primary functions of the detected genes and their relative importance in
                      cellular processes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={functionData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                      dataKey="function"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      tick={{ fill: "#495057" }}
                    />
                    <YAxis
                      label={{ value: "Importance Score", angle: -90, position: "insideLeft", fill: "#495057" }}
                      domain={[0, 100]}
                      tick={{ fill: "#495057" }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", borderColor: "#dee2e6" }}
                      itemStyle={{ color: "#212529" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="importance" name="Functional Importance" radius={[4, 4, 0, 0]}>
                      {functionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.gene === "TP53"
                              ? "#0066cc"
                              : entry.gene === "BRCA1"
                                ? "#dc3545"
                                : entry.gene === "BRCA2"
                                  ? "#fd7e14"
                                  : "#6f42c1"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-4">
                {genes.map((gene) => (
                  <Card key={gene}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">{gene} Function Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {GENE_FUNCTION_DATA.filter((item) => item.gene === gene).map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <div className="h-2 flex-grow rounded-full bg-gray-200" style={{ width: "100%" }}>
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${item.importance}%`,
                                  backgroundColor:
                                    gene === "TP53"
                                      ? "#0066cc"
                                      : gene === "BRCA1"
                                        ? "#dc3545"
                                        : gene === "BRCA2"
                                          ? "#fd7e14"
                                          : "#6f42c1",
                                }}
                              ></div>
                            </div>
                            <div className="ml-3 w-40 text-sm">{item.function}</div>
                            <div className="ml-2 w-10 text-right text-sm font-medium">{item.importance}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
