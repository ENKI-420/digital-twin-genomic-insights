import { NextResponse } from "next/server"

// Mock federal opportunities data - in production this would pull from real APIs
const mockOpportunities = [
  {
    id: "NIH_R01_CA_2024_001",
    source: "NIH",
    type: "R01",
    title: "Precision Oncology Implementation in Clinical Practice",
    agency: "NIH",
    institute: "NCI",
    announcementNumber: "RFA-CA-24-015",
    dueDate: "2024-03-15",
    budgetCap: 500000,
    duration: 60,
    description: "Support implementation of precision oncology approaches in clinical practice settings",
    keyWords: ["precision oncology", "genomics", "clinical implementation", "CPIC"],
    cpicAlignment: {
      genes: ["CYP2D6", "CYP2C19", "DPYD", "TPMT"],
      drugs: ["tamoxifen", "clopidogrel", "fluorouracil", "mercaptopurine"],
      evidenceLevel: "A",
      implementationScore: 95,
    },
    matchScore: 0.92,
    status: "active",
  },
  {
    id: "NIH_U01_HG_2024_002",
    source: "NIH",
    type: "U01",
    title: "Genomic Data Integration for Clinical Decision Support",
    agency: "NIH",
    institute: "NHGRI",
    announcementNumber: "RFA-HG-24-008",
    dueDate: "2024-04-01",
    budgetCap: 750000,
    duration: 72,
    description: "Develop and validate genomic data integration platforms for clinical decision support",
    keyWords: ["genomics", "clinical decision support", "FHIR", "interoperability"],
    cpicAlignment: {
      genes: ["BRCA1", "BRCA2", "MLH1", "MSH2"],
      drugs: ["olaparib", "pembrolizumab", "trastuzumab"],
      evidenceLevel: "A",
      implementationScore: 88,
    },
    matchScore: 0.89,
    status: "active",
  },
  {
    id: "BARDA_BAA_2024_001",
    source: "BARDA",
    type: "BAA",
    title: "AI-Powered Pandemic Response Platform",
    agency: "HHS",
    institute: "BARDA",
    announcementNumber: "BARDA-24-100-SOL-00001",
    dueDate: "2024-02-28",
    budgetCap: 2000000,
    duration: 36,
    description: "Develop AI-powered platforms for rapid pandemic response and clinical trial coordination",
    keyWords: ["AI", "pandemic response", "clinical trials", "automation"],
    cpicAlignment: {
      genes: ["CYP2D6", "CYP2C19"],
      drugs: ["remdesivir", "paxlovid"],
      evidenceLevel: "B",
      implementationScore: 75,
    },
    matchScore: 0.84,
    status: "active",
  },
  {
    id: "DOD_CDMRP_2024_001",
    source: "DOD",
    type: "CDMRP",
    title: "Precision Medicine for Military Healthcare",
    agency: "DOD",
    institute: "CDMRP",
    announcementNumber: "W81XWH-24-PRCRP-CTA",
    dueDate: "2024-05-15",
    budgetCap: 1500000,
    duration: 48,
    description: "Implement precision medicine approaches for military and veteran healthcare",
    keyWords: ["precision medicine", "military healthcare", "genomics", "PTSD"],
    cpicAlignment: {
      genes: ["CYP2D6", "CYP2C19", "COMT", "OPRM1"],
      drugs: ["morphine", "codeine", "tramadol"],
      evidenceLevel: "A",
      implementationScore: 92,
    },
    matchScore: 0.87,
    status: "active",
  },
  {
    id: "SBIR_HHS_2024_001",
    source: "SBIR",
    type: "SBIR Phase I",
    title: "AI-Driven Clinical Trial Matching Platform",
    agency: "HHS",
    institute: "ONC",
    announcementNumber: "SBIR-24-HHS-001",
    dueDate: "2024-02-28",
    budgetCap: 300000,
    duration: 12,
    description: "Develop AI-powered platforms for automated clinical trial patient matching",
    keyWords: ["AI", "clinical trials", "patient matching", "automation"],
    cpicAlignment: {
      genes: ["CYP2D6", "CYP2C19"],
      drugs: ["warfarin", "clopidogrel"],
      evidenceLevel: "B",
      implementationScore: 75,
    },
    matchScore: 0.91,
    status: "active",
  },
]

export async function GET() {
  try {
    // In production, this would fetch from real federal APIs
    // NIH RePORTER, SBIR.gov, SAM.gov, etc.

    return NextResponse.json(mockOpportunities)
  } catch (error) {
    console.error("Error fetching opportunities:", error)
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 })
  }
}
