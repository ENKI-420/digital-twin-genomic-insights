import { ConflictResolutionVisualizer } from "@/components/evidence/conflict-resolution-visualizer"

// Mock data for conflict resolution visualization
const mockConflicts = [
  {
    id: "conflict1",
    variantId: "var1",
    gene: "BRCA1",
    variant: "c.5123C>A (p.Ala1708Glu)",
    conflictingEvidence: [
      {
        id: "ev1",
        source: "functional",
        direction: "supporting",
        weight: "very_strong",
        description: "Functional studies show complete loss of protein function",
        reference: "Findlay et al., Nature 2018",
        referenceUrl: "https://pubmed.ncbi.nlm.nih.gov/30209399/",
      },
      {
        id: "ev2",
        source: "population",
        direction: "supporting",
        weight: "moderate",
        description: "Absent from population databases (gnomAD)",
        reference: "gnomAD v2.1.1",
        referenceUrl: "https://gnomad.broadinstitute.org/",
      },
      {
        id: "ev3",
        source: "computational",
        direction: "contradictory",
        weight: "supporting",
        description: "One in silico algorithm predicts benign effect",
        reference: "REVEL, SIFT, PolyPhen",
      },
      {
        id: "ev4",
        source: "computational",
        direction: "supporting",
        weight: "moderate",
        description: "Multiple in silico algorithms predict deleterious effect",
        reference: "REVEL, SIFT, PolyPhen",
      },
      {
        id: "ev5",
        source: "clinical",
        direction: "contradictory",
        weight: "weak",
        description: "One case report suggests no association with disease",
        reference: "Smith et al., J Med Genet 2016",
        referenceUrl: "https://pubmed.ncbi.nlm.nih.gov/example1/",
      },
      {
        id: "ev6",
        source: "clinical",
        direction: "supporting",
        weight: "strong",
        description: "Multiple case reports show association with disease",
        reference: "Johnson et al., Breast Cancer Res 2019",
        referenceUrl: "https://pubmed.ncbi.nlm.nih.gov/example2/",
      },
      {
        id: "ev7",
        source: "literature",
        direction: "supporting",
        weight: "strong",
        description: "Multiple peer-reviewed publications support pathogenicity",
        reference: "Various sources",
      },
    ],
    resolutionMethod: "Evidence-based weighted scoring with expert review",
    resolutionJustification:
      "Strong functional evidence demonstrating loss of protein function was given highest priority. The contradictory computational prediction was outweighed by multiple other algorithms predicting deleterious effect. The single contradictory case report was from a small study with methodological limitations, while multiple larger studies supported pathogenicity. The overall weight of evidence strongly supports pathogenicity.",
    finalClassification: "pathogenic",
    confidenceScore: 85,
    dateResolved: "2023-11-15",
  },
  {
    id: "conflict2",
    variantId: "var2",
    gene: "TP53",
    variant: "c.844C>T (p.Arg282Trp)",
    conflictingEvidence: [
      {
        id: "ev8",
        source: "functional",
        direction: "supporting",
        weight: "moderate",
        description: "Functional studies show partial loss of transcriptional activity",
        reference: "IARC TP53 Database",
        referenceUrl: "https://p53.iarc.fr/",
      },
      {
        id: "ev9",
        source: "computational",
        direction: "supporting",
        weight: "supporting",
        description: "All in silico algorithms predict deleterious effect",
        reference: "REVEL, SIFT, PolyPhen",
      },
      {
        id: "ev10",
        source: "population",
        direction: "contradictory",
        weight: "weak",
        description: "Present at very low frequency in population databases",
        reference: "gnomAD v2.1.1",
        referenceUrl: "https://gnomad.broadinstitute.org/",
      },
      {
        id: "ev11",
        source: "clinical",
        direction: "neutral",
        weight: "supporting",
        description: "Limited clinical data available",
        reference: "Internal database",
      },
      {
        id: "ev12",
        source: "literature",
        direction: "supporting",
        weight: "strong",
        description: "Multiple publications suggest pathogenicity",
        reference: "Various sources",
      },
    ],
    resolutionMethod: "Modified ACMG/AMP framework with quantitative scoring",
    resolutionJustification:
      "Functional studies showing partial loss of function were given significant weight. The presence at very low frequency in population databases was not considered strong evidence against pathogenicity given the gene's role in cancer predisposition. The supporting computational and literature evidence further strengthened the case for pathogenicity. The limited clinical data was considered neutral and did not significantly impact the classification.",
    finalClassification: "likely_pathogenic",
    confidenceScore: 72,
    dateResolved: "2023-10-20",
  },
  {
    id: "conflict3",
    variantId: "var3",
    gene: "APC",
    variant: "c.3920T>A (p.Ile1307Lys)",
    conflictingEvidence: [
      {
        id: "ev13",
        source: "functional",
        direction: "contradictory",
        weight: "moderate",
        description: "Functional studies show normal protein function",
        reference: "Laken et al., Nature Genetics 1997",
        referenceUrl: "https://pubmed.ncbi.nlm.nih.gov/9288098/",
      },
      {
        id: "ev14",
        source: "population",
        direction: "contradictory",
        weight: "moderate",
        description: "Present at low frequency in Ashkenazi Jewish population (1-2%)",
        reference: "gnomAD v2.1.1",
        referenceUrl: "https://gnomad.broadinstitute.org/",
      },
      {
        id: "ev15",
        source: "computational",
        direction: "neutral",
        weight: "supporting",
        description: "Mixed predictions from in silico algorithms",
        reference: "REVEL, SIFT, PolyPhen",
      },
      {
        id: "ev16",
        source: "clinical",
        direction: "supporting",
        weight: "moderate",
        description: "Modest association with colorectal cancer in case-control studies",
        reference: "Various clinical studies",
      },
      {
        id: "ev17",
        source: "literature",
        direction: "contradictory",
        weight: "moderate",
        description: "Conflicting interpretations in literature",
        reference: "Various sources",
      },
    ],
    resolutionMethod: "Expert panel consensus with literature review",
    resolutionJustification:
      "This variant has been extensively studied with conflicting results. Functional studies show normal protein function, but clinical studies suggest a modest increase in cancer risk. The variant creates a hypermutable tract that may predispose to somatic mutations rather than directly affecting protein function. Given the conflicting evidence and unclear mechanism, the variant was classified as uncertain significance, though it may confer a modest risk factor in certain populations.",
    finalClassification: "uncertain_significance",
    confidenceScore: 45,
    dateResolved: "2023-09-10",
  },
]

export default function ConflictResolutionPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Evidence Conflict Resolution</h1>
        <p className="text-gray-500">
          Visualize how conflicting evidence is resolved in variant classification decisions
        </p>
      </div>

      <ConflictResolutionVisualizer conflicts={mockConflicts} />
    </div>
  )
}
