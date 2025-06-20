"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  InfoIcon,
  AlertTriangleIcon,
  BarChartIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRightIcon,
  DownloadIcon,
} from "lucide-react"
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
  LineChart,
  Line,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts"

// Helper function to determine classification color
const getClassificationColor = (classification: string, confidence: string) => {
  switch (classification) {
    case "Pathogenic":
      return "#dc2626" // Red 600
    case "Likely Pathogenic":
      return "#ea580c" // Orange 600
    case "VUS":
      return "#ca8a04" // Yellow 600
    case "Likely Benign":
      return "#65a30d" // Lime 600
    case "Benign":
      return "#16a34a" // Green 600
    default:
      return "#6b7280" // Gray 500
  }
}

// Mock data for laboratory comparison
const laboratoriesData = [
  {
    id: "lab1",
    name: "GenomeDx",
    type: "Commercial",
    size: "Large",
    region: "North America",
    acmgAdherence: 0.92,
    concordanceRate: 0.89,
    reclassificationRate: 0.07,
    vusRate: 0.22,
    averageConflictScore: 0.17,
    resolvedConflictsPerMonth: 120,
    primaryApproach: "Bayesian Framework",
    details: {
      customCriteria: true,
      expertPanel: true,
      automatedScoring: true,
      bayesianModel: true,
      aiAssisted: true,
      publicationRate: "High",
      dataSharing: true,
    },
    evidenceWeighting: {
      functional: 40,
      population: 25,
      computational: 10,
      clinical: 25,
    },
    acmgCriteriaApplication: {
      ps3: "Automated score-based",
      pm2: "Frequency threshold-based",
      pp3: "Multiple algorithm requirement",
      ba1: "Strict threshold",
      bs1: "Frequency adjustment for ethnicity",
    },
    performanceMetrics: [
      { month: "Jan", vusRate: 0.26, concordance: 0.85, conflictScore: 0.21 },
      { month: "Feb", vusRate: 0.25, concordance: 0.86, conflictScore: 0.2 },
      { month: "Mar", vusRate: 0.24, concordance: 0.86, conflictScore: 0.19 },
      { month: "Apr", vusRate: 0.24, concordance: 0.87, conflictScore: 0.19 },
      { month: "May", vusRate: 0.23, concordance: 0.88, conflictScore: 0.18 },
      { month: "Jun", vusRate: 0.23, concordance: 0.88, conflictScore: 0.18 },
      { month: "Jul", vusRate: 0.22, concordance: 0.88, conflictScore: 0.17 },
      { month: "Aug", vusRate: 0.22, concordance: 0.89, conflictScore: 0.17 },
      { month: "Sep", vusRate: 0.22, concordance: 0.89, conflictScore: 0.17 },
      { month: "Oct", vusRate: 0.22, concordance: 0.89, conflictScore: 0.17 },
      { month: "Nov", vusRate: 0.22, concordance: 0.89, conflictScore: 0.17 },
      { month: "Dec", vusRate: 0.22, concordance: 0.89, conflictScore: 0.17 },
    ],
    uniqueFeatures: [
      "Proprietary Bayesian classification framework",
      "Weekly interdisciplinary classification meetings",
      "Automated conflict detection algorithm",
      "Comprehensive internal variant database",
    ],
    strengths: [
      "Sophisticated quantitative approach",
      "Rapid integration of new evidence",
      "Transparent documentation",
      "High concordance with expert panels",
    ],
    challenges: [
      "Complex system requires specialized expertise",
      "Resource-intensive review process",
      "Limited public sharing of methodological details",
    ],
  },
  {
    id: "lab2",
    name: "MolecularInsight",
    type: "Academic",
    size: "Medium",
    region: "Europe",
    acmgAdherence: 0.96,
    concordanceRate: 0.84,
    reclassificationRate: 0.09,
    vusRate: 0.28,
    averageConflictScore: 0.23,
    resolvedConflictsPerMonth: 85,
    primaryApproach: "ACMG/AMP Framework",
    details: {
      customCriteria: true,
      expertPanel: true,
      automatedScoring: false,
      bayesianModel: false,
      aiAssisted: false,
      publicationRate: "Very High",
      dataSharing: true,
    },
    evidenceWeighting: {
      functional: 35,
      population: 30,
      computational: 15,
      clinical: 20,
    },
    acmgCriteriaApplication: {
      ps3: "Evidence-based manual review",
      pm2: "Standard threshold",
      pp3: "Conservative application",
      ba1: "Standard threshold",
      bs1: "Standard application",
    },
    performanceMetrics: [
      { month: "Jan", vusRate: 0.32, concordance: 0.8, conflictScore: 0.27 },
      { month: "Feb", vusRate: 0.32, concordance: 0.8, conflictScore: 0.27 },
      { month: "Mar", vusRate: 0.31, concordance: 0.81, conflictScore: 0.26 },
      { month: "Apr", vusRate: 0.31, concordance: 0.81, conflictScore: 0.26 },
      { month: "May", vusRate: 0.3, concordance: 0.82, conflictScore: 0.25 },
      { month: "Jun", vusRate: 0.3, concordance: 0.82, conflictScore: 0.25 },
      { month: "Jul", vusRate: 0.29, concordance: 0.83, conflictScore: 0.24 },
      { month: "Aug", vusRate: 0.29, concordance: 0.83, conflictScore: 0.24 },
      { month: "Sep", vusRate: 0.28, concordance: 0.84, conflictScore: 0.23 },
      { month: "Oct", vusRate: 0.28, concordance: 0.84, conflictScore: 0.23 },
      { month: "Nov", vusRate: 0.28, concordance: 0.84, conflictScore: 0.23 },
      { month: "Dec", vusRate: 0.28, concordance: 0.84, conflictScore: 0.23 },
    ],
    uniqueFeatures: [
      "Extreme transparency in classification rationale",
      "Regular publication of classification approaches",
      "Extensive data sharing with public databases",
      "Conservative approach to classification",
    ],
    strengths: [
      "Rigorous adherence to guidelines",
      "Exceptionally well-documented decisions",
      "Strong research orientation",
      "Significant contribution to public knowledge",
    ],
    challenges: [
      "Higher VUS rate than industry average",
      "Manual processes limit throughput",
      "Slower adaptation to emerging methodologies",
    ],
  },
  {
    id: "lab3",
    name: "PrecisionDx",
    type: "Hospital",
    size: "Small",
    region: "North America",
    acmgAdherence: 0.9,
    concordanceRate: 0.82,
    reclassificationRate: 0.11,
    vusRate: 0.31,
    averageConflictScore: 0.26,
    resolvedConflictsPerMonth: 45,
    primaryApproach: "Expert Consensus",
    details: {
      customCriteria: false,
      expertPanel: true,
      automatedScoring: false,
      bayesianModel: false,
      aiAssisted: false,
      publicationRate: "Low",
      dataSharing: true,
    },
    evidenceWeighting: {
      functional: 30,
      population: 20,
      computational: 20,
      clinical: 30,
    },
    acmgCriteriaApplication: {
      ps3: "Conservative application",
      pm2: "Standard threshold",
      pp3: "Standard application",
      ba1: "Standard threshold",
      bs1: "Standard application",
    },
    performanceMetrics: [
      { month: "Jan", vusRate: 0.35, concordance: 0.78, conflictScore: 0.3 },
      { month: "Feb", vusRate: 0.35, concordance: 0.78, conflictScore: 0.3 },
      { month: "Mar", vusRate: 0.34, concordance: 0.79, conflictScore: 0.29 },
      { month: "Apr", vusRate: 0.34, concordance: 0.79, conflictScore: 0.29 },
      { month: "May", vusRate: 0.33, concordance: 0.8, conflictScore: 0.28 },
      { month: "Jun", vusRate: 0.33, concordance: 0.8, conflictScore: 0.28 },
      { month: "Jul", vusRate: 0.32, concordance: 0.81, conflictScore: 0.27 },
      { month: "Aug", vusRate: 0.32, concordance: 0.81, conflictScore: 0.27 },
      { month: "Sep", vusRate: 0.31, concordance: 0.82, conflictScore: 0.26 },
      { month: "Oct", vusRate: 0.31, concordance: 0.82, conflictScore: 0.26 },
      { month: "Nov", vusRate: 0.31, concordance: 0.82, conflictScore: 0.26 },
      { month: "Dec", vusRate: 0.31, concordance: 0.82, conflictScore: 0.26 },
    ],
    uniqueFeatures: [
      "Direct clinician involvement in classification",
      "Patient-specific classification considerations",
      "Integration with clinical care pathways",
      "Emphasis on clinical correlation",
    ],
    strengths: [
      "Strong clinical context integration",
      "Patient-centered approach",
      "Direct clinical feedback loop",
      "Good communication with treating physicians",
    ],
    challenges: [
      "Limited resources for comprehensive analysis",
      "Higher VUS and reclassification rates",
      "Smaller variant database for reference",
      "Less automated processes",
    ],
  },
  {
    id: "lab4",
    name: "GenePrecision",
    type: "Commercial",
    size: "Large",
    region: "Asia-Pacific",
    acmgAdherence: 0.88,
    concordanceRate: 0.86,
    reclassificationRate: 0.08,
    vusRate: 0.25,
    averageConflictScore: 0.19,
    resolvedConflictsPerMonth: 110,
    primaryApproach: "AI-Assisted Framework",
    details: {
      customCriteria: true,
      expertPanel: true,
      automatedScoring: true,
      bayesianModel: false,
      aiAssisted: true,
      publicationRate: "Medium",
      dataSharing: false,
    },
    evidenceWeighting: {
      functional: 45,
      population: 25,
      computational: 15,
      clinical: 15,
    },
    acmgCriteriaApplication: {
      ps3: "AI-assisted scoring",
      pm2: "Population-adjusted thresholds",
      pp3: "AI-weighted algorithm combination",
      ba1: "Population-specific thresholds",
      bs1: "Ethnicity-specific application",
    },
    performanceMetrics: [
      { month: "Jan", vusRate: 0.29, concordance: 0.82, conflictScore: 0.23 },
      { month: "Feb", vusRate: 0.28, concordance: 0.83, conflictScore: 0.22 },
      { month: "Mar", vusRate: 0.28, concordance: 0.83, conflictScore: 0.22 },
      { month: "Apr", vusRate: 0.27, concordance: 0.84, conflictScore: 0.21 },
      { month: "May", vusRate: 0.27, concordance: 0.84, conflictScore: 0.21 },
      { month: "Jun", vusRate: 0.26, concordance: 0.85, conflictScore: 0.2 },
      { month: "Jul", vusRate: 0.26, concordance: 0.85, conflictScore: 0.2 },
      { month: "Aug", vusRate: 0.25, concordance: 0.86, conflictScore: 0.19 },
      { month: "Sep", vusRate: 0.25, concordance: 0.86, conflictScore: 0.19 },
      { month: "Oct", vusRate: 0.25, concordance: 0.86, conflictScore: 0.19 },
      { month: "Nov", vusRate: 0.25, concordance: 0.86, conflictScore: 0.19 },
      { month: "Dec", vusRate: 0.25, concordance: 0.86, conflictScore: 0.19 },
    ],
    uniqueFeatures: [
      "AI-driven evidence evaluation",
      "Population-specific classification models",
      "Automated literature mining",
      "Proprietary variant database with Asian population focus",
    ],
    strengths: [
      "Efficiency through automation",
      "Population-specific insights",
      "Rapid turnaround time",
      "Sophisticated pattern recognition",
    ],
    challenges: [
      "Limited transparency in AI methodologies",
      "Reduced data sharing with public databases",
      "Region-specific biases in classification",
      "Regulatory challenges with AI-based approaches",
    ],
  },
  {
    id: "lab5",
    name: "GenomeConnect",
    type: "Non-profit",
    size: "Medium",
    region: "Europe",
    acmgAdherence: 0.94,
    concordanceRate: 0.87,
    reclassificationRate: 0.06,
    vusRate: 0.24,
    averageConflictScore: 0.18,
    resolvedConflictsPerMonth: 95,
    primaryApproach: "Quantitative Framework",
    details: {
      customCriteria: true,
      expertPanel: true,
      automatedScoring: true,
      bayesianModel: true,
      aiAssisted: false,
      publicationRate: "High",
      dataSharing: true,
    },
    evidenceWeighting: {
      functional: 35,
      population: 35,
      computational: 10,
      clinical: 20,
    },
    acmgCriteriaApplication: {
      ps3: "Quantitative scoring system",
      pm2: "Statistical approach",
      pp3: "Combined algorithm score with threshold",
      ba1: "Statistical confidence intervals",
      bs1: "Quantitative approach with population data",
    },
    performanceMetrics: [
      { month: "Jan", vusRate: 0.28, concordance: 0.83, conflictScore: 0.22 },
      { month: "Feb", vusRate: 0.27, concordance: 0.84, conflictScore: 0.21 },
      { month: "Mar", vusRate: 0.27, concordance: 0.84, conflictScore: 0.21 },
      { month: "Apr", vusRate: 0.26, concordance: 0.85, conflictScore: 0.2 },
      { month: "May", vusRate: 0.26, concordance: 0.85, conflictScore: 0.2 },
      { month: "Jun", vusRate: 0.25, concordance: 0.86, conflictScore: 0.19 },
      { month: "Jul", vusRate: 0.25, concordance: 0.86, conflictScore: 0.19 },
      { month: "Aug", vusRate: 0.24, concordance: 0.87, conflictScore: 0.18 },
      { month: "Sep", vusRate: 0.24, concordance: 0.87, conflictScore: 0.18 },
      { month: "Oct", vusRate: 0.24, concordance: 0.87, conflictScore: 0.18 },
      { month: "Nov", vusRate: 0.24, concordance: 0.87, conflictScore: 0.18 },
      { month: "Dec", vusRate: 0.24, concordance: 0.87, conflictScore: 0.18 },
    ],
    uniqueFeatures: [
      "Open-source classification framework",
      "Community-driven evidence sharing",
      "Mathematical modeling of evidence strength",
      "Collaborative classification approach",
    ],
    strengths: [
      "Transparency and reproducibility",
      "Collaborative approach to difficult variants",
      "Strong statistical foundation",
      "Balanced consideration of evidence types",
    ],
    challenges: [
      "Complex statistical approaches require expertise",
      "Continual refinement of mathematical models",
      "Balancing consensus with individual expertise",
    ],
  },
]

// Data for specific variant classification comparison
const variantClassificationData = [
  {
    variant: "BRCA1 c.5339T>C (p.Leu1780Pro)",
    lab: "GenomeDx",
    classification: "Likely Pathogenic",
    confidence: 0.85,
    keyEvidence: [
      { type: "Functional", direction: "Pathogenic", strength: "Strong" },
      { type: "Computational", direction: "Pathogenic", strength: "Supporting" },
      { type: "Population", direction: "Pathogenic", strength: "Moderate" },
      { type: "Clinical", direction: "Uncertain", strength: "Supporting" },
    ],
    rationale:
      "Strong functional evidence of impaired protein function, absent from population databases, and supported by computational predictions.",
  },
  {
    variant: "BRCA1 c.5339T>C (p.Leu1780Pro)",
    lab: "MolecularInsight",
    classification: "VUS",
    confidence: 0.62,
    keyEvidence: [
      { type: "Functional", direction: "Pathogenic", strength: "Moderate" },
      { type: "Computational", direction: "Pathogenic", strength: "Supporting" },
      { type: "Population", direction: "Pathogenic", strength: "Supporting" },
      { type: "Clinical", direction: "Uncertain", strength: "Supporting" },
    ],
    rationale:
      "Insufficient evidence to classify as likely pathogenic. Functional studies show effect but methodological limitations reduce strength of evidence.",
  },
  {
    variant: "BRCA1 c.5339T>C (p.Leu1780Pro)",
    lab: "PrecisionDx",
    classification: "VUS",
    confidence: 0.58,
    keyEvidence: [
      { type: "Functional", direction: "Pathogenic", strength: "Supporting" },
      { type: "Computational", direction: "Pathogenic", strength: "Supporting" },
      { type: "Population", direction: "Pathogenic", strength: "Supporting" },
      { type: "Clinical", direction: "Uncertain", strength: "Supporting" },
    ],
    rationale:
      "Criteria for likely pathogenic not met. More functional and clinical evidence needed before upgrading classification.",
  },
  {
    variant: "BRCA1 c.5339T>C (p.Leu1780Pro)",
    lab: "GenePrecision",
    classification: "Likely Pathogenic",
    confidence: 0.78,
    keyEvidence: [
      { type: "Functional", direction: "Pathogenic", strength: "Strong" },
      { type: "Computational", direction: "Pathogenic", strength: "Moderate" },
      { type: "Population", direction: "Pathogenic", strength: "Moderate" },
      { type: "Clinical", direction: "Uncertain", strength: "Supporting" },
    ],
    rationale:
      "AI-assisted evaluation indicates strong probability of pathogenicity based on functional impact and absence from population databases.",
  },
  {
    variant: "BRCA1 c.5339T>C (p.Leu1780Pro)",
    lab: "GenomeConnect",
    classification: "Likely Pathogenic",
    confidence: 0.82,
    keyEvidence: [
      { type: "Functional", direction: "Pathogenic", strength: "Strong" },
      { type: "Computational", direction: "Pathogenic", strength: "Supporting" },
      { type: "Population", direction: "Pathogenic", strength: "Moderate" },
      { type: "Clinical", direction: "Pathogenic", strength: "Supporting" },
    ],
    rationale:
      "Quantitative analysis of combined evidence meets threshold for likely pathogenic classification with good confidence.",
  },
]

// Data for approach comparison across labs
const approachComparisonData = [
  {
    approach: "Evidence Weighting Method",
    GenomeDx: "Quantitative Bayesian",
    MolecularInsight: "Semi-quantitative",
    PrecisionDx: "Qualitative Expert",
    GenePrecision: "AI-assisted Scoring",
    GenomeConnect: "Probabilistic Model",
  },
  {
    approach: "Conflict Resolution Process",
    GenomeDx: "Automated detection with expert review",
    MolecularInsight: "Consensus panel discussion",
    PrecisionDx: "Individual expert judgment",
    GenePrecision: "AI-suggested resolution with validation",
    GenomeConnect: "Statistical modeling of evidence strength",
  },
  {
    approach: "ACMG Criteria Customization",
    GenomeDx: "Extensive",
    MolecularInsight: "Moderate",
    PrecisionDx: "Minimal",
    GenePrecision: "Extensive",
    GenomeConnect: "Extensive",
  },
  {
    approach: "External Data Integration",
    GenomeDx: "Automated with validation",
    MolecularInsight: "Manual comprehensive review",
    PrecisionDx: "Limited manual review",
    GenePrecision: "Automated comprehensive mining",
    GenomeConnect: "Collaborative data sharing",
  },
  {
    approach: "Reclassification Triggers",
    GenomeDx: "Automated flagging system",
    MolecularInsight: "Scheduled periodic review",
    PrecisionDx: "Case-based review",
    GenePrecision: "Continuous AI monitoring",
    GenomeConnect: "Statistical threshold crossing",
  },
]

// Evidence type metrics by lab
const evidenceTypeMetricsData = [
  {
    lab: "GenomeDx",
    functional: 40,
    population: 25,
    computational: 10,
    clinical: 25,
  },
  {
    lab: "MolecularInsight",
    functional: 35,
    population: 30,
    computational: 15,
    clinical: 20,
  },
  {
    lab: "PrecisionDx",
    functional: 30,
    population: 20,
    computational: 20,
    clinical: 30,
  },
  {
    lab: "GenePrecision",
    functional: 45,
    population: 25,
    computational: 15,
    clinical: 15,
  },
  {
    lab: "GenomeConnect",
    functional: 35,
    population: 35,
    computational: 10,
    clinical: 20,
  },
]

// Performance metrics for radar chart
const performanceMetricsData = [
  {
    lab: "GenomeDx",
    acmgAdherence: 92,
    concordanceRate: 89,
    lowReclassRate: 93, // 100 - reclassification rate * 100
    lowVusRate: 78, // 100 - vus rate * 100
    lowConflictScore: 83, // 100 - average conflict score * 100
    resolvedConflictsPerMonth: 100, // normalized to 100
  },
  {
    lab: "MolecularInsight",
    acmgAdherence: 96,
    concordanceRate: 84,
    lowReclassRate: 91,
    lowVusRate: 72,
    lowConflictScore: 77,
    resolvedConflictsPerMonth: 71,
  },
  {
    lab: "PrecisionDx",
    acmgAdherence: 90,
    concordanceRate: 82,
    lowReclassRate: 89,
    lowVusRate: 69,
    lowConflictScore: 74,
    resolvedConflictsPerMonth: 38,
  },
  {
    lab: "GenePrecision",
    acmgAdherence: 88,
    concordanceRate: 86,
    lowReclassRate: 92,
    lowVusRate: 75,
    lowConflictScore: 81,
    resolvedConflictsPerMonth: 92,
  },
  {
    lab: "GenomeConnect",
    acmgAdherence: 94,
    concordanceRate: 87,
    lowReclassRate: 94,
    lowVusRate: 76,
    lowConflictScore: 82,
    resolvedConflictsPerMonth: 79,
  },
]

// Outcome metrics across labs
const outcomeMetricsData = [
  {
    name: "VUS Rate",
    GenomeDx: 22,
    MolecularInsight: 28,
    PrecisionDx: 31,
    GenePrecision: 25,
    GenomeConnect: 24,
  },
  {
    name: "Concordance Rate",
    GenomeDx: 89,
    MolecularInsight: 84,
    PrecisionDx: 82,
    GenePrecision: 86,
    GenomeConnect: 87,
  },
  {
    name: "Reclassification Rate",
    GenomeDx: 7,
    MolecularInsight: 9,
    PrecisionDx: 11,
    GenePrecision: 8,
    GenomeConnect: 6,
  },
  {
    name: "Conflict Score",
    GenomeDx: 17,
    MolecularInsight: 23,
    PrecisionDx: 26,
    GenePrecision: 19,
    GenomeConnect: 18,
  },
]

// Effectiveness correlation data
const effectivenessCorrelationData = laboratoriesData.map((lab) => ({
  name: lab.name,
  automationLevel:
    lab.details.automatedScoring && lab.details.bayesianModel && lab.details.aiAssisted
      ? 3
      : lab.details.automatedScoring || lab.details.bayesianModel || lab.details.aiAssisted
        ? 2
        : 1,
  vusRate: lab.vusRate * 100,
  concordanceRate: lab.concordanceRate * 100,
  acmgAdherence: lab.acmgAdherence * 100,
  conflictScore: lab.averageConflictScore * 100,
}))

// Helper function for color coding
const getStatusColor = (value: number, type: string) => {
  if (type === "vusRate" || type === "reclassificationRate" || type === "conflictScore") {
    // Lower is better
    if (value < 0.2) return "text-green-600"
    if (value < 0.25) return "text-lime-600"
    if (value < 0.3) return "text-yellow-600"
    return "text-red-600"
  } else {
    // Higher is better
    if (value > 0.9) return "text-green-600"
    if (value > 0.85) return "text-lime-600"
    if (value > 0.8) return "text-yellow-600"
    return "text-red-600"
  }
}

export function LabComparison() {
  const [selectedLabs, setSelectedLabs] = useState<string[]>(laboratoriesData.map((lab) => lab.id))
  const [metricTimeframe, setMetricTimeframe] = useState("12")

  const toggleLabSelection = (labId: string) => {
    if (selectedLabs.includes(labId)) {
      if (selectedLabs.length > 1) {
        // Don't allow deselecting all labs
        setSelectedLabs(selectedLabs.filter((id) => id !== labId))
      }
    } else {
      setSelectedLabs([...selectedLabs, labId])
    }
  }

  // Filter data based on selected labs
  const filteredLabs = laboratoriesData.filter((lab) => selectedLabs.includes(lab.id))
  const filteredPerformanceMetrics = performanceMetricsData.filter((item) =>
    selectedLabs.includes(laboratoriesData.find((lab) => lab.name === item.lab)?.id || ""),
  )
  const filteredEvidenceTypeMetrics = evidenceTypeMetricsData.filter((item) =>
    selectedLabs.includes(laboratoriesData.find((lab) => lab.name === item.lab)?.id || ""),
  )
  const filteredVariantClassifications = variantClassificationData.filter((item) =>
    selectedLabs.includes(laboratoriesData.find((lab) => lab.name === item.lab)?.id || ""),
  )
  const filteredCorrelationData = effectivenessCorrelationData.filter((item) =>
    selectedLabs.includes(laboratoriesData.find((lab) => lab.name === item.name)?.id || ""),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laboratory Conflict Resolution Comparison</h1>
          <p className="text-gray-500">
            Compare conflict resolution approaches, methodologies, and outcomes across genetic testing laboratories
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="md:w-1/4">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <BuildingIcon className="h-4 w-4 mr-2" />
              Laboratory Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {laboratoriesData.map((lab) => (
                <div key={lab.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={lab.id}
                    checked={selectedLabs.includes(lab.id)}
                    onCheckedChange={() => toggleLabSelection(lab.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={lab.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {lab.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {lab.type} • {lab.size} • {lab.region}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">Filter by attributes:</p>
              <div className="space-y-2">
                <Select defaultValue="all-types">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Lab Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="non-profit">Non-profit</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-sizes">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Lab Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-sizes">All Sizes</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-regions">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-regions">All Regions</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:w-3/4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <BarChartIcon className="h-4 w-4 mr-2" />
                Key Performance Metrics
              </CardTitle>
              <CardDescription>Comparison of conflict resolution outcomes across laboratories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Performance Overview</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={filteredPerformanceMetrics}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="lab" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="ACMG Adherence"
                          dataKey="acmgAdherence"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                        />
                        <Radar
                          name="Concordance Rate"
                          dataKey="concordanceRate"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                        />
                        <Radar
                          name="Low Reclass Rate"
                          dataKey="lowReclassRate"
                          stroke="#f97316"
                          fill="#f97316"
                          fillOpacity={0.2}
                        />
                        <Radar
                          name="Low VUS Rate"
                          dataKey="lowVusRate"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.2}
                        />
                        <Radar
                          name="Low Conflict Score"
                          dataKey="lowConflictScore"
                          stroke="#ec4899"
                          fill="#ec4899"
                          fillOpacity={0.2}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Evidence Type Weighting</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredEvidenceTypeMetrics}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="lab" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="functional" name="Functional" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="population" name="Population" stackId="a" fill="#10b981" />
                        <Bar dataKey="computational" name="Computational" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="clinical" name="Clinical" stackId="a" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Outcome Metrics</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Laboratory</TableHead>
                        <TableHead>Primary Approach</TableHead>
                        <TableHead>VUS Rate</TableHead>
                        <TableHead>Concordance</TableHead>
                        <TableHead>Reclass Rate</TableHead>
                        <TableHead>Conflict Score</TableHead>
                        <TableHead>Conflicts/Month</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLabs.map((lab) => (
                        <TableRow key={lab.id}>
                          <TableCell className="font-medium">{lab.name}</TableCell>
                          <TableCell>{lab.primaryApproach}</TableCell>
                          <TableCell className={getStatusColor(lab.vusRate, "vusRate")}>
                            {(lab.vusRate * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className={getStatusColor(lab.concordanceRate, "concordanceRate")}>
                            {(lab.concordanceRate * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className={getStatusColor(lab.reclassificationRate, "reclassificationRate")}>
                            {(lab.reclassificationRate * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className={getStatusColor(lab.averageConflictScore, "conflictScore")}>
                            {(lab.averageConflictScore * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>{lab.resolvedConflictsPerMonth}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="approaches">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="approaches">Approach Comparison</TabsTrigger>
          <TabsTrigger value="effectiveness">Effectiveness Analysis</TabsTrigger>
          <TabsTrigger value="variant">Variant Classification</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="approaches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Resolution Approach Comparison</CardTitle>
              <CardDescription>
                Detailed comparison of how laboratories approach variant classification conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Approach</TableHead>
                      {filteredLabs.map((lab) => (
                        <TableHead key={lab.id}>{lab.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approachComparisonData.map((approach) => (
                      <TableRow key={approach.approach}>
                        <TableCell className="font-medium">{approach.approach}</TableCell>
                        {filteredLabs.map((lab) => (
                          <TableCell key={lab.id}>{approach[lab.name as keyof typeof approach] as string}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-medium">ACMG Criteria Application Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLabs.map((lab) => (
                    <Card key={lab.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{lab.name}</CardTitle>
                        <CardDescription>{lab.primaryApproach}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium mb-1">PS3 (Functional)</div>
                            <div className="text-sm">{lab.acmgCriteriaApplication.ps3}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">PM2 (Population)</div>
                            <div className="text-sm">{lab.acmgCriteriaApplication.pm2}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">PP3 (Computational)</div>
                            <div className="text-sm">{lab.acmgCriteriaApplication.pp3}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">BA1 (Population)</div>
                            <div className="text-sm">{lab.acmgCriteriaApplication.ba1}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">BS1 (Population)</div>
                            <div className="text-sm">{lab.acmgCriteriaApplication.bs1}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Unique Approaches</h3>
                    <div className="space-y-4">
                      {filteredLabs.map((lab) => (
                        <div key={lab.id} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{lab.name}</h4>
                          <ul className="space-y-1">
                            {lab.uniqueFeatures.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <ArrowRightIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Technology & Infrastructure</h3>
                    <div className="space-y-4">
                      {filteredLabs.map((lab) => (
                        <div key={lab.id} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{lab.name}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center">
                              {lab.details.customCriteria ? (
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                              )}
                              <span className="text-sm">Custom Criteria</span>
                            </div>
                            <div className="flex items-center">
                              {lab.details.expertPanel ? (
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                              )}
                              <span className="text-sm">Expert Panel</span>
                            </div>
                            <div className="flex items-center">
                              {lab.details.automatedScoring ? (
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                              )}
                              <span className="text-sm">Automated Scoring</span>
                            </div>
                            <div className="flex items-center">
                              {lab.details.bayesianModel ? (
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                              )}
                              <span className="text-sm">Bayesian Model</span>
                            </div>
                            <div className="flex items-center">
                              {lab.details.aiAssisted ? (
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                              )}
                              <span className="text-sm">AI-Assisted</span>
                            </div>
                            <div className="flex items-center">
                              {lab.details.dataSharing ? (
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 mr-2 text-red-500" />
                              )}
                              <span className="text-sm">Data Sharing</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center">
                            <span className="text-sm font-medium mr-2">Publication Rate:</span>
                            <Badge variant="outline">{lab.details.publicationRate}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approach Effectiveness Analysis</CardTitle>
              <CardDescription>
                Analysis of how different conflict resolution approaches impact classification outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Automation Level vs. VUS Rate</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis
                          type="number"
                          dataKey="automationLevel"
                          name="Automation Level"
                          domain={[0, 3.5]}
                          label={{ value: "Automation Level", position: "bottom" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="vusRate"
                          name="VUS Rate"
                          label={{ value: "VUS Rate (%)", angle: -90, position: "left" }}
                        />
                        <ZAxis range={[60, 120]} />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-2 border rounded shadow-sm">
                                  <p className="font-medium">{data.name}</p>
                                  <p>Automation: {data.automationLevel}/3</p>
                                  <p>VUS Rate: {data.vusRate.toFixed(1)}%</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Scatter name="Laboratories" data={filteredCorrelationData} fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Automation Level vs. Concordance</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis
                          type="number"
                          dataKey="automationLevel"
                          name="Automation Level"
                          domain={[0, 3.5]}
                          label={{ value: "Automation Level", position: "bottom" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="concordanceRate"
                          name="Concordance Rate"
                          domain={[75, 95]}
                          label={{ value: "Concordance Rate (%)", angle: -90, position: "left" }}
                        />
                        <ZAxis range={[60, 120]} />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-2 border rounded shadow-sm">
                                  <p className="font-medium">{data.name}</p>
                                  <p>Automation: {data.automationLevel}/3</p>
                                  <p>Concordance: {data.concordanceRate.toFixed(1)}%</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Scatter name="Laboratories" data={filteredCorrelationData} fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Outcome Metrics by Approach</h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={outcomeMetricsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Legend />
                      {filteredLabs.map((lab) => (
                        <Bar
                          key={lab.id}
                          dataKey={lab.name}
                          fill={
                            lab.primaryApproach === "Bayesian Framework"
                              ? "#8b5cf6"
                              : lab.primaryApproach === "ACMG/AMP Framework"
                                ? "#3b82f6"
                                : lab.primaryApproach === "Expert Consensus"
                                  ? "#6b7280"
                                  : lab.primaryApproach === "AI-Assisted Framework"
                                    ? "#ec4899"
                                    : "#14b8a6"
                          }
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-medium">Strengths & Challenges Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLabs.map((lab) => (
                    <Card key={lab.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{lab.name}</CardTitle>
                        <CardDescription>{lab.primaryApproach}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                              Strengths
                            </h4>
                            <ul className="space-y-1 pl-6 list-disc">
                              {lab.strengths.map((strength, index) => (
                                <li key={index} className="text-sm">
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <AlertTriangleIcon className="h-4 w-4 mr-2 text-amber-500" />
                              Challenges
                            </h4>
                            <ul className="space-y-1 pl-6 list-disc">
                              {lab.challenges.map((challenge, index) => (
                                <li key={index} className="text-sm">
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Key Effectiveness Findings</AlertTitle>
                  <AlertDescription>
                    <ul className="space-y-1 mt-2">
                      <li>
                        <span className="font-medium">Automation correlation:</span> Labs with higher automation levels
                        generally show lower VUS rates and higher concordance, indicating more efficient conflict
                        resolution.
                      </li>
                      <li>
                        <span className="font-medium">Approach impact:</span> Bayesian and AI-assisted approaches show
                        the lowest conflict scores and reclassification rates, while maintaining high concordance.
                      </li>
                      <li>
                        <span className="font-medium">Evidence balance:</span> Labs that emphasize functional evidence
                        while balancing multiple evidence types tend to have better overall outcomes.
                      </li>
                      <li>
                        <span className="font-medium">Transparency correlation:</span> Labs with higher publication
                        rates and data sharing demonstrate better long-term stability in classifications.
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variant Classification Comparison</CardTitle>
              <CardDescription>Side-by-side comparison of how laboratories classify the same variant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <InfoIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-700">BRCA1 c.5339T&gt;C (p.Leu1780Pro)</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      Missense variant located in the BRCT domain. This example shows how laboratories differ in
                      interpreting the same evidence and resolving conflicts for this challenging variant.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVariantClassifications.map((variant, index) => (
                  <Card
                    key={index}
                    className="border-2"
                    style={{ borderColor: getClassificationColor(variant.classification, "") }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{variant.lab}</CardTitle>
                      <div className="flex items-center justify-between">
                        <Badge
                          style={{
                            backgroundColor: getClassificationColor(variant.classification, ""),
                            color: "white",
                          }}
                        >
                          {variant.classification}
                        </Badge>
                        <Badge variant="outline">Confidence: {(variant.confidence * 100).toFixed(0)}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Key Evidence</h4>
                          <div className="space-y-2">
                            {variant.keyEvidence.map((evidence, idx) => (
                              <div key={idx} className="border rounded-md p-2">
                                <div className="flex flex-wrap gap-2 mb-1">
                                  <Badge variant="outline">{evidence.type}</Badge>
                                  <Badge
                                    className={
                                      evidence.direction === "Pathogenic"
                                        ? "bg-red-100 text-red-800"
                                        : evidence.direction === "Benign"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                    }
                                  >
                                    {evidence.direction}
                                  </Badge>
                                  <Badge
                                    className={
                                      evidence.strength === "Very Strong"
                                        ? "bg-purple-900 text-white"
                                        : evidence.strength === "Strong"
                                          ? "bg-purple-700 text-white"
                                          : evidence.strength === "Moderate"
                                            ? "bg-purple-500 text-white"
                                            : "bg-purple-300 text-purple-900"
                                    }
                                  >
                                    {evidence.strength}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Classification Rationale</h4>
                          <p className="text-sm">{variant.rationale}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Evidence Interpretation Differences</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Functional Evidence</h4>
                      <p className="text-sm">
                        <span className="font-medium">Key finding:</span> Different labs assign varying strength to the
                        same functional data. GenomeDx and GenomeConnect rate it as Strong, while MolecularInsight and
                        PrecisionDx consider it Moderate or Supporting.
                      </p>
                      <div className="mt-2 text-sm text-amber-600 flex items-center">
                        <AlertTriangleIcon className="h-4 w-4 mr-1" />
                        <span>Primary source of classification discordance</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Population Evidence</h4>
                      <p className="text-sm">
                        <span className="font-medium">Key finding:</span> All labs rate population evidence as
                        supporting or moderate for pathogenicity, showing consistency in population data interpretation.
                      </p>
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span>Consistent interpretation across laboratories</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Clinical Evidence</h4>
                      <p className="text-sm">
                        <span className="font-medium">Key finding:</span> Most labs rate clinical evidence as uncertain,
                        with only GenomeConnect assigning pathogenic direction, indicating insufficient clinical data.
                      </p>
                      <div className="mt-2 text-sm text-amber-600 flex items-center">
                        <AlertTriangleIcon className="h-4 w-4 mr-1" />
                        <span>Limited clinical data available</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Confidence Levels</h4>
                      <p className="text-sm">
                        <span className="font-medium">Key finding:</span> Labs with "Likely Pathogenic" classification
                        show higher confidence (78-85%) than those with "VUS" classification (58-62%).
                      </p>
                      <div className="mt-2 text-sm text-blue-600 flex items-center">
                        <InfoIcon className="h-4 w-4 mr-1" />
                        <span>Methodology impacts confidence assessment</span>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Classification Discrepancy Analysis</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      This variant demonstrates how different conflict resolution methodologies lead to different
                      classifications. The primary discrepancy stems from how each lab weighs functional evidence, with
                      automated and quantitative approaches generally assigning higher weight to functional data
                      compared to expert consensus approaches.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend Analysis</CardTitle>
              <CardDescription>
                Historical trends in conflict resolution effectiveness across laboratories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <h3 className="text-lg font-medium">Performance Metrics Over Time</h3>
                <Select value={metricTimeframe} onValueChange={setMetricTimeframe}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Last 3 Months</SelectItem>
                    <SelectItem value="6">Last 6 Months</SelectItem>
                    <SelectItem value="12">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">VUS Rate Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} />
                          <YAxis domain={[0.15, 0.4]} />
                          <Tooltip />
                          <Legend />
                          {filteredLabs.map((lab) => (
                            <Line
                              key={lab.id}
                              data={lab.performanceMetrics.slice(-Number.parseInt(metricTimeframe))}
                              type="monotone"
                              dataKey="vusRate"
                              name={lab.name}
                              stroke={
                                lab.primaryApproach === "Bayesian Framework"
                                  ? "#8b5cf6"
                                  : lab.primaryApproach === "ACMG/AMP Framework"
                                    ? "#3b82f6"
                                    : lab.primaryApproach === "Expert Consensus"
                                      ? "#6b7280"
                                      : lab.primaryApproach === "AI-Assisted Framework"
                                        ? "#ec4899"
                                        : "#14b8a6"
                              }
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Concordance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} />
                          <YAxis domain={[0.75, 0.95]} />
                          <Tooltip />
                          <Legend />
                          {filteredLabs.map((lab) => (
                            <Line
                              key={lab.id}
                              data={lab.performanceMetrics.slice(-Number.parseInt(metricTimeframe))}
                              type="monotone"
                              dataKey="concordance"
                              name={lab.name}
                              stroke={
                                lab.primaryApproach === "Bayesian Framework"
                                  ? "#8b5cf6"
                                  : lab.primaryApproach === "ACMG/AMP Framework"
                                    ? "#3b82f6"
                                    : lab.primaryApproach === "Expert Consensus"
                                      ? "#6b7280"
                                      : lab.primaryApproach === "AI-Assisted Framework"
                                        ? "#ec4899"
                                        : "#14b8a6"
                              }
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Conflict Score Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" type="category" allowDuplicatedCategory={false} />
                          <YAxis domain={[0.15, 0.35]} />
                          <Tooltip />
                          <Legend />
                          {filteredLabs.map((lab) => (
                            <Line
                              key={lab.id}
                              data={lab.performanceMetrics.slice(-Number.parseInt(metricTimeframe))}
                              type="monotone"
                              dataKey="conflictScore"
                              name={lab.name}
                              stroke={
                                lab.primaryApproach === "Bayesian Framework"
                                  ? "#8b5cf6"
                                  : lab.primaryApproach === "ACMG/AMP Framework"
                                    ? "#3b82f6"
                                    : lab.primaryApproach === "Expert Consensus"
                                      ? "#6b7280"
                                      : lab.primaryApproach === "AI-Assisted Framework"
                                        ? "#ec4899"
                                        : "#14b8a6"
                              }
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-medium mb-4">Improvement Rate Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredLabs.map((lab) => {
                    // Calculate improvement rates
                    const firstMonth = lab.performanceMetrics[0]
                    const lastMonth = lab.performanceMetrics[lab.performanceMetrics.length - 1]
                    const vusRateImprovement = ((firstMonth.vusRate - lastMonth.vusRate) / firstMonth.vusRate) * 100
                    const concordanceImprovement =
                      ((lastMonth.concordance - firstMonth.concordance) / firstMonth.concordance) * 100
                    const conflictScoreImprovement =
                      ((firstMonth.conflictScore - lastMonth.conflictScore) / firstMonth.conflictScore) * 100

                    return (
                      <Card key={lab.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{lab.name}</CardTitle>
                          <CardDescription>{lab.primaryApproach}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">VUS Rate Improvement:</span>
                              <div className="flex items-center">
                                {vusRateImprovement > 0 ? (
                                  <TrendingDownIcon className="h-4 w-4 mr-1 text-green-500" />
                                ) : (
                                  <TrendingUpIcon className="h-4 w-4 mr-1 text-red-500" />
                                )}
                                <span
                                  className={
                                    vusRateImprovement > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"
                                  }
                                >
                                  {Math.abs(vusRateImprovement).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Concordance Improvement:</span>
                              <div className="flex items-center">
                                {concordanceImprovement > 0 ? (
                                  <TrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                                ) : (
                                  <TrendingDownIcon className="h-4 w-4 mr-1 text-red-500" />
                                )}
                                <span
                                  className={
                                    concordanceImprovement > 0
                                      ? "text-green-500 font-medium"
                                      : "text-red-500 font-medium"
                                  }
                                >
                                  {Math.abs(concordanceImprovement).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Conflict Score Improvement:</span>
                              <div className="flex items-center">
                                {conflictScoreImprovement > 0 ? (
                                  <TrendingDownIcon className="h-4 w-4 mr-1 text-green-500" />
                                ) : (
                                  <TrendingUpIcon className="h-4 w-4 mr-1 text-red-500" />
                                )}
                                <span
                                  className={
                                    conflictScoreImprovement > 0
                                      ? "text-green-500 font-medium"
                                      : "text-red-500 font-medium"
                                  }
                                >
                                  {Math.abs(conflictScoreImprovement).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="pt-2 border-t mt-2">
                              <span className="text-sm font-medium">Overall Improvement Rate:</span>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div
                                  className="h-2.5 rounded-full bg-blue-600"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        (vusRateImprovement + concordanceImprovement + conflictScoreImprovement) / 3 +
                                          10,
                                        0,
                                      ),
                                      100,
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Key Trend Findings</AlertTitle>
                  <AlertDescription>
                    <ul className="space-y-1 mt-2">
                      <li>
                        <span className="font-medium">Consistent improvement:</span> All laboratories show improvement
                        in key metrics over the past 12 months, regardless of approach.
                      </li>
                      <li>
                        <span className="font-medium">Approach impact:</span> Labs using AI-assisted and Bayesian
                        approaches show the most rapid improvement in VUS rate reduction.
                      </li>
                      <li>
                        <span className="font-medium">Convergence trend:</span> Performance metrics are converging over
                        time, suggesting industry-wide standardization of conflict resolution practices.
                      </li>
                      <li>
                        <span className="font-medium">Technology adoption impact:</span> Labs that have adopted more
                        automated approaches show steeper improvement curves compared to traditional methods.
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
