import { EvidenceStrengthVisualizer } from "@/components/evidence/evidence-strength-visualizer"

// Mock data for evidence strength visualization
const mockVariantEvidence = [
  {
    variantId: "var1",
    gene: "BRCA1",
    variant: "c.5123C>A (p.Ala1708Glu)",
    classification: "Pathogenic",
    overallStrength: 85,
    lastUpdated: "2023-11-15",
    evidenceItems: [
      {
        id: "ev1",
        type: "functional",
        description: "Functional studies show complete loss of protein function",
        strength: "very_strong",
        source: "ClinVar",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/55590/",
        date: "2023-10-05",
      },
      {
        id: "ev2",
        type: "population",
        description: "Absent from population databases (gnomAD)",
        strength: "moderate",
        source: "gnomAD",
        sourceUrl: "https://gnomad.broadinstitute.org/",
        date: "2023-09-12",
      },
      {
        id: "ev3",
        type: "computational",
        description: "Multiple in silico algorithms predict deleterious effect",
        strength: "supporting",
        source: "REVEL, SIFT, PolyPhen",
        date: "2023-08-20",
      },
      {
        id: "ev4",
        type: "segregation",
        description: "Segregates with disease in 3 affected family members",
        strength: "moderate",
        source: "Internal Lab Data",
        date: "2023-07-15",
      },
      {
        id: "ev5",
        type: "literature",
        description: "Multiple case reports in peer-reviewed literature",
        strength: "strong",
        source: "PubMed",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/",
        date: "2023-06-10",
      },
    ],
  },
  {
    variantId: "var2",
    gene: "TP53",
    variant: "c.844C>T (p.Arg282Trp)",
    classification: "Likely Pathogenic",
    overallStrength: 72,
    lastUpdated: "2023-10-20",
    evidenceItems: [
      {
        id: "ev6",
        type: "functional",
        description: "Functional studies show partial loss of transcriptional activity",
        strength: "moderate",
        source: "IARC TP53 Database",
        sourceUrl: "https://p53.iarc.fr/",
        date: "2023-09-25",
      },
      {
        id: "ev7",
        type: "computational",
        description: "All in silico algorithms predict deleterious effect",
        strength: "supporting",
        source: "REVEL, SIFT, PolyPhen",
        date: "2023-08-15",
      },
      {
        id: "ev8",
        type: "other_database",
        description: "Classified as likely pathogenic by multiple laboratories in ClinVar",
        strength: "strong",
        source: "ClinVar",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/12345/",
        date: "2023-07-10",
      },
      {
        id: "ev9",
        type: "de_novo",
        description: "De novo occurrence in proband with no family history",
        strength: "moderate",
        source: "Internal Lab Data",
        date: "2023-06-05",
      },
    ],
  },
  {
    variantId: "var3",
    gene: "APC",
    variant: "c.3920T>A (p.Ile1307Lys)",
    classification: "Uncertain Significance",
    overallStrength: 45,
    lastUpdated: "2023-09-10",
    evidenceItems: [
      {
        id: "ev10",
        type: "population",
        description: "Present at low frequency in Ashkenazi Jewish population (1-2%)",
        strength: "moderate",
        source: "gnomAD",
        sourceUrl: "https://gnomad.broadinstitute.org/",
        date: "2023-08-20",
      },
      {
        id: "ev11",
        type: "computational",
        description: "Mixed predictions from in silico algorithms",
        strength: "neutral",
        source: "REVEL, SIFT, PolyPhen",
        date: "2023-07-15",
      },
      {
        id: "ev12",
        type: "case_control",
        description: "Modest association with colorectal cancer in case-control studies",
        strength: "supporting",
        source: "PubMed",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/",
        date: "2023-06-10",
      },
      {
        id: "ev13",
        type: "literature",
        description: "Conflicting interpretations in literature",
        strength: "contradictory",
        source: "PubMed",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/",
        date: "2023-05-05",
      },
    ],
  },
  {
    variantId: "var4",
    gene: "PTEN",
    variant: "c.388C>T (p.Arg130*)",
    classification: "Pathogenic",
    overallStrength: 95,
    lastUpdated: "2023-11-01",
    evidenceItems: [
      {
        id: "ev14",
        type: "functional",
        description: "Nonsense variant leading to premature protein truncation",
        strength: "very_strong",
        source: "ClinVar",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/5678/",
        date: "2023-10-15",
      },
      {
        id: "ev15",
        type: "population",
        description: "Absent from population databases",
        strength: "moderate",
        source: "gnomAD",
        sourceUrl: "https://gnomad.broadinstitute.org/",
        date: "2023-09-10",
      },
      {
        id: "ev16",
        type: "segregation",
        description: "Segregates with disease in multiple affected family members",
        strength: "strong",
        source: "Internal Lab Data",
        date: "2023-08-05",
      },
      {
        id: "ev17",
        type: "de_novo",
        description: "De novo occurrence confirmed in proband",
        strength: "strong",
        source: "Internal Lab Data",
        date: "2023-07-01",
      },
      {
        id: "ev18",
        type: "other_database",
        description: "Consensus pathogenic classification in ClinVar",
        strength: "strong",
        source: "ClinVar",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/5678/",
        date: "2023-06-01",
      },
    ],
  },
  {
    variantId: "var5",
    gene: "MLH1",
    variant: "c.350C>T (p.Thr117Met)",
    classification: "Likely Benign",
    overallStrength: 30,
    lastUpdated: "2023-08-15",
    evidenceItems: [
      {
        id: "ev19",
        type: "population",
        description: "Present at frequency inconsistent with disease prevalence",
        strength: "strong",
        source: "gnomAD",
        sourceUrl: "https://gnomad.broadinstitute.org/",
        date: "2023-07-20",
      },
      {
        id: "ev20",
        type: "computational",
        description: "Most in silico algorithms predict benign effect",
        strength: "supporting",
        source: "REVEL, SIFT, PolyPhen",
        date: "2023-06-15",
      },
      {
        id: "ev21",
        type: "functional",
        description: "Functional studies show normal protein function",
        strength: "strong",
        source: "Internal Lab Data",
        date: "2023-05-10",
      },
      {
        id: "ev22",
        type: "other_database",
        description: "Classified as likely benign by multiple laboratories",
        strength: "moderate",
        source: "ClinVar",
        sourceUrl: "https://www.ncbi.nlm.nih.gov/clinvar/variation/9876/",
        date: "2023-04-05",
      },
    ],
  },
]

export default function EvidenceStrengthPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Evidence Strength Analysis</h1>
        <p className="text-gray-500">
          Visualize and analyze the strength of evidence supporting variant classifications
        </p>
      </div>

      <EvidenceStrengthVisualizer variantEvidence={mockVariantEvidence} />
    </div>
  )
}
