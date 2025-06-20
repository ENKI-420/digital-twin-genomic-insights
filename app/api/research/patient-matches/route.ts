import { NextResponse } from "next/server"

// Mock patient data - in production this would pull from Epic FHIR
const mockPatients = [
  {
    id: "PAT_001",
    name: "Sarah Johnson",
    age: 45,
    condition: "Breast Cancer",
    genomicProfile: ["HER2+", "CYP2D6*4/*4", "BRCA1 wild-type"],
    eligibilityScore: 0.94,
    trialMatches: ["NIH_R01_CA_2024_001", "DOD_CDMRP_2024_001"],
  },
  {
    id: "PAT_002",
    name: "Michael Chen",
    age: 62,
    condition: "Lung Cancer",
    genomicProfile: ["EGFR L858R", "CYP2C19*2/*2", "PD-L1 high"],
    eligibilityScore: 0.87,
    trialMatches: ["NIH_R01_CA_2024_001"],
  },
  {
    id: "PAT_003",
    name: "Emily Rodriguez",
    age: 38,
    condition: "Colorectal Cancer",
    genomicProfile: ["KRAS G12C", "DPYD*2A", "MSI-high"],
    eligibilityScore: 0.91,
    trialMatches: ["NIH_R01_CA_2024_001", "NIH_U01_HG_2024_002"],
  },
  {
    id: "PAT_004",
    name: "David Thompson",
    age: 55,
    condition: "Prostate Cancer",
    genomicProfile: ["BRCA2 mutation", "CYP2D6*1/*4"],
    eligibilityScore: 0.83,
    trialMatches: ["DOD_CDMRP_2024_001"],
  },
  {
    id: "PAT_005",
    name: "Lisa Wang",
    age: 41,
    condition: "Ovarian Cancer",
    genomicProfile: ["BRCA1 mutation", "CYP2C19*1/*17"],
    eligibilityScore: 0.89,
    trialMatches: ["NIH_U01_HG_2024_002", "DOD_CDMRP_2024_001"],
  },
  {
    id: "PAT_006",
    name: "Robert Martinez",
    age: 67,
    condition: "Pancreatic Cancer",
    genomicProfile: ["KRAS G12D", "DPYD wild-type"],
    eligibilityScore: 0.76,
    trialMatches: ["NIH_R01_CA_2024_001"],
  },
  {
    id: "PAT_007",
    name: "Jennifer Lee",
    age: 52,
    condition: "Melanoma",
    genomicProfile: ["BRAF V600E", "CYP2D6*1/*1"],
    eligibilityScore: 0.85,
    trialMatches: ["NIH_R01_CA_2024_001", "BARDA_BAA_2024_001"],
  },
  {
    id: "PAT_008",
    name: "Thomas Brown",
    age: 59,
    condition: "Leukemia",
    genomicProfile: ["BCR-ABL1", "TPMT*3A/*3A"],
    eligibilityScore: 0.92,
    trialMatches: ["NIH_U01_HG_2024_002"],
  },
]

export async function GET() {
  try {
    // In production, this would query Epic FHIR for real patient data
    // with genomic profiles and eligibility calculations

    return NextResponse.json(mockPatients)
  } catch (error) {
    console.error("Error fetching patient matches:", error)
    return NextResponse.json({ error: "Failed to fetch patient matches" }, { status: 500 })
  }
}
