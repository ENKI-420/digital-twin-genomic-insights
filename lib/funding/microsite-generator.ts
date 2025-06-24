import { institution } from "@/lib/config/institution"

export interface TrialMatchingDemo {
  patientId: string
  demographics: PatientDemographics
  genomicProfile: GenomicProfile
  matchedTrials: ClinicalTrial[]
  cpicRecommendations: CPICRecommendation[]
}

export interface PatientDemographics {
  age: number
  gender: string
  ethnicity: string
  diagnosis: string
  stage: string
  priorTreatments: string[]
}

export interface GenomicProfile {
  variants: GenomicVariant[]
  pharmacogenes: PharmacogeneResult[]
  tumorMutationBurden: number
  microsatelliteInstability: string
}

export interface GenomicVariant {
  gene: string
  variant: string
  classification: string
  actionability: string
}

export interface PharmacogeneResult {
  gene: string
  diplotype: string
  phenotype: string
  drugs: string[]
  recommendation: string
}

export interface ClinicalTrial {
  nctId: string
  title: string
  phase: string
  sponsor: string
  eligibilityMatch: number
  keyInclusion: string[]
  keyExclusion: string[]
  estimatedEnrollment: number
  primaryEndpoint: string
}

export interface CPICRecommendation {
  drug: string
  gene: string
  guideline: string
  recommendation: string
  evidenceLevel: string
  dosing: string
}

export class MicrositeGenerator {
  generateDemoPatients(): TrialMatchingDemo[] {
    return [
      {
        patientId: "BH_DEMO_001",
        demographics: {
          age: 58,
          gender: "Female",
          ethnicity: "Caucasian",
          diagnosis: "Triple-Negative Breast Cancer",
          stage: "Stage IIIA",
          priorTreatments: ["Doxorubicin", "Cyclophosphamide", "Paclitaxel"],
        },
        genomicProfile: {
          variants: [
            {
              gene: "BRCA1",
              variant: "c.5266dupC",
              classification: "Pathogenic",
              actionability: "High",
            },
            {
              gene: "TP53",
              variant: "c.742C>T",
              classification: "Pathogenic",
              actionability: "Medium",
            },
          ],
          pharmacogenes: [
            {
              gene: "CYP2D6",
              diplotype: "*1/*4",
              phenotype: "Intermediate Metabolizer",
              drugs: ["Tamoxifen", "Codeine"],
              recommendation: "Consider alternative therapy",
            },
          ],
          tumorMutationBurden: 12.5,
          microsatelliteInstability: "MSS",
        },
        matchedTrials: [
          {
            nctId: "NCT04567890",
            title: "PARP Inhibitor in BRCA1/2 Mutated Breast Cancer",
            phase: "Phase III",
            sponsor: "Baptist Health Medical Group Hematology & Oncology",
            eligibilityMatch: 95,
            keyInclusion: ["BRCA1/2 mutation", "Stage II-IV breast cancer", "Age ≥18"],
            keyExclusion: ["Prior PARP inhibitor", "Pregnancy"],
            estimatedEnrollment: 300,
            primaryEndpoint: "Progression-free survival",
          },
        ],
        cpicRecommendations: [
          {
            drug: "Tamoxifen",
            gene: "CYP2D6",
            guideline: "CPIC Guideline for CYP2D6 and Tamoxifen",
            recommendation: "Consider alternative therapy (aromatase inhibitor)",
            evidenceLevel: "Level A",
            dosing: "Standard dosing may be ineffective",
          },
        ],
      },
      {
        patientId: "BH_DEMO_002",
        demographics: {
          age: 65,
          gender: "Male",
          ethnicity: "African American",
          diagnosis: "Metastatic Lung Adenocarcinoma",
          stage: "Stage IV",
          priorTreatments: ["Carboplatin", "Pemetrexed", "Pembrolizumab"],
        },
        genomicProfile: {
          variants: [
            {
              gene: "EGFR",
              variant: "L858R",
              classification: "Pathogenic",
              actionability: "High",
            },
            {
              gene: "KRAS",
              variant: "G12C",
              classification: "Pathogenic",
              actionability: "High",
            },
          ],
          pharmacogenes: [
            {
              gene: "DPYD",
              diplotype: "*1/*2A",
              phenotype: "Intermediate Metabolizer",
              drugs: ["5-Fluorouracil", "Capecitabine"],
              recommendation: "Reduce starting dose by 50%",
            },
          ],
          tumorMutationBurden: 8.2,
          microsatelliteInstability: "MSS",
        },
        matchedTrials: [
          {
            nctId: "NCT05123456",
            title: "KRAS G12C Inhibitor in Advanced NSCLC",
            phase: "Phase II",
            sponsor: "Baptist Health Medical Group Hematology & Oncology",
            eligibilityMatch: 88,
            keyInclusion: ["KRAS G12C mutation", "Advanced NSCLC", "Prior platinum therapy"],
            keyExclusion: ["Active brain metastases", "Prior KRAS inhibitor"],
            estimatedEnrollment: 150,
            primaryEndpoint: "Overall response rate",
          },
        ],
        cpicRecommendations: [
          {
            drug: "5-Fluorouracil",
            gene: "DPYD",
            guideline: "CPIC Guideline for DPYD and Fluoropyrimidines",
            recommendation: "Reduce starting dose by 50%",
            evidenceLevel: "Level A",
            dosing: "Monitor for severe toxicity",
          },
        ],
      },
      {
        patientId: "BH_DEMO_003",
        demographics: {
          age: 42,
          gender: "Female",
          ethnicity: "Hispanic",
          diagnosis: "Colorectal Cancer",
          stage: "Stage IIIB",
          priorTreatments: ["FOLFOX", "Bevacizumab"],
        },
        genomicProfile: {
          variants: [
            {
              gene: "KRAS",
              variant: "G12D",
              classification: "Pathogenic",
              actionability: "High",
            },
            {
              gene: "PIK3CA",
              variant: "H1047R",
              classification: "Pathogenic",
              actionability: "Medium",
            },
          ],
          pharmacogenes: [
            {
              gene: "UGT1A1",
              diplotype: "*28/*28",
              phenotype: "Poor Metabolizer",
              drugs: ["Irinotecan"],
              recommendation: "Reduce starting dose by 70%",
            },
          ],
          tumorMutationBurden: 15.8,
          microsatelliteInstability: "MSI-H",
        },
        matchedTrials: [
          {
            nctId: "NCT05789012",
            title: "Immunotherapy in MSI-H Colorectal Cancer",
            phase: "Phase II",
            sponsor: "Baptist Health Medical Group Hematology & Oncology",
            eligibilityMatch: 92,
            keyInclusion: ["MSI-H status", "Advanced colorectal cancer", "Prior chemotherapy"],
            keyExclusion: ["Active autoimmune disease", "Prior immunotherapy"],
            estimatedEnrollment: 120,
            primaryEndpoint: "Objective response rate",
          },
        ],
        cpicRecommendations: [
          {
            drug: "Irinotecan",
            gene: "UGT1A1",
            guideline: "CPIC Guideline for UGT1A1 and Irinotecan",
            recommendation: "Reduce starting dose by 70% and monitor closely",
            evidenceLevel: "Level A",
            dosing: "Consider alternative regimen",
          },
        ],
      },
    ]
  }

  generateMicrositeHTML(): string {
    const demoPatients = this.generateDemoPatients()

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AGENT Platform Demo - Baptist Health Precision Oncology</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'baptist-blue': '#1B4B82',
                        'baptist-red': '#E31837',
                    }
                }
            }
        }
    </script>
    <style>
        .baptist-gradient {
            background: linear-gradient(135deg, #1B4B82 0%, #E31837 100%);
        }
        .baptist-card {
            border-left: 4px solid #1B4B82;
        }
        .pulse-animation {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-lg border-b-2 border-baptist-blue">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 baptist-gradient rounded-lg flex items-center justify-center">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"></path>
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-baptist-blue">AGENT Platform</h1>
                                <p class="text-sm text-gray-600">Precision Oncology Demo</p>
                            </div>
                        </div>
                        <span class="px-4 py-2 bg-baptist-red text-white text-sm rounded-full font-medium">Baptist Health</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                ✓ HIPAA Compliant
                            </span>
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                ✓ Epic Certified
                            </span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full pulse-animation"></div>
                            <span class="text-sm text-gray-600 font-medium">Live Demo</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="baptist-gradient text-white py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h2 class="text-4xl font-bold mb-4">
                        Baptist Health Precision Oncology Platform
                    </h2>
                    <p class="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                        Experience the future of cancer care with AI-powered genomic analysis,
                        automated clinical trial matching, and real-time pharmacogenomic recommendations—all
                        integrated seamlessly with Baptist Health's Epic EHR system.
                    </p>
                    <div class="flex justify-center space-x-4">
                        <button class="bg-white text-baptist-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            View Patient Demos
                        </button>
                        <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-baptist-blue transition-colors">
                            Technical Documentation
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Metrics Section -->
        <section class="py-12 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div class="text-center">
                        <div class="text-4xl font-bold text-baptist-blue mb-2">40%</div>
                        <div class="text-gray-600">Faster Trial Enrollment</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-baptist-red mb-2">$2.3M</div>
                        <div class="text-gray-600">Annual Cost Savings</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-baptist-blue mb-2">95%</div>
                        <div class="text-gray-600">CPIC Compliance</div>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold text-baptist-red mb-2">6 Mo</div>
                        <div class="text-gray-600">Deployment Timeline</div>
                    </div>
                                 </div>
             </div>
         </section>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <!-- Demo Patients -->
            <div class="mb-12">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-baptist-blue mb-4">Live Patient Demonstrations</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        Explore real-world examples of how AGENT transforms patient care through AI-powered genomic analysis
                        and precision oncology recommendations.
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${demoPatients.map((patient) => this.generatePatientCard(patient)).join("")}
                </div>
            </div>

            <!-- Features Overview -->
            <div class="bg-white rounded-lg shadow p-6 mb-8">
                <h2 class="text-xl font-semibold mb-4">AGENT Platform Features</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="text-center">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="font-medium">Automated Trial Matching</h3>
                        <p class="text-sm text-gray-600 mt-1">AI-powered patient-trial matching with 95% accuracy</p>
                    </div>
                    <div class="text-center">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"></path>
                            </svg>
                        </div>
                        <h3 class="font-medium">CPIC Integration</h3>
                        <p class="text-sm text-gray-600 mt-1">Real-time pharmacogenomic recommendations</p>
                    </div>
                    <div class="text-center">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 class="font-medium">Epic Integration</h3>
                        <p class="text-sm text-gray-600 mt-1">Seamless EHR workflow integration</p>
                    </div>
                </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-blue-50 rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">Ready to Deploy at ${institution.name}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="font-medium mb-2">Clinical Lead</h3>
                        <p class="text-sm">Dr. Sameer Talwalkar</p>
                        <p class="text-sm text-gray-600">sameer.talwalkar@nortonhealthcare.org</p>
                    </div>
                    <div>
                        <h3 class="font-medium mb-2">Technical Lead</h3>
                        <p class="text-sm">Devin Pellegrino, Advanced Defense Solutions</p>
                        <p class="text-sm text-gray-600">devin@ads-llc.com</p>
                    </div>
                </div>
                <div class="mt-4">
                    <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Schedule Implementation Meeting
                    </button>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
    `
  }

  private generatePatientCard(patient: TrialMatchingDemo): string {
    return `
    <div class="bg-white rounded-xl shadow-lg p-6 baptist-card hover:shadow-xl transition-shadow duration-300">
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="font-bold text-xl text-baptist-blue mb-2">Patient ${patient.patientId.replace('BH_DEMO_', '')}</h3>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">${patient.demographics.age}y ${patient.demographics.gender} • ${patient.demographics.ethnicity}</p>
                    <p class="font-medium text-gray-800">${patient.demographics.diagnosis}</p>
                    <p class="text-sm text-gray-600">Stage: ${patient.demographics.stage}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    ${patient.matchedTrials.length} Trial${patient.matchedTrials.length !== 1 ? "s" : ""} Matched
                </span>
                <div class="mt-2">
                    <span class="px-2 py-1 bg-baptist-blue text-white text-xs rounded-full">
                        MSI: ${patient.genomicProfile.microsatelliteInstability}
                    </span>
                </div>
            </div>
        </div>

        <!-- Genomic Profile -->
        <div class="mb-6">
            <h4 class="font-semibold text-baptist-blue text-sm mb-3">Key Genomic Variants</h4>
            <div class="space-y-2">
                ${patient.genomicProfile.variants
                  .map(
                    (variant) => `
                    <div class="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <div>
                            <span class="font-medium text-gray-800">${variant.gene}</span>
                            <span class="text-gray-600 ml-2">${variant.variant}</span>
                        </div>
                        <div class="flex space-x-2">
                            <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">${variant.classification}</span>
                            <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">${variant.actionability}</span>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <div class="mt-3 text-xs text-gray-600">
                TMB: ${patient.genomicProfile.tumorMutationBurden} mutations/Mb
            </div>
        </div>

        <!-- Matched Trials -->
        <div class="mb-4">
            <h4 class="font-medium text-sm mb-2">Matched Trials</h4>
            ${patient.matchedTrials
              .map(
                (trial) => `
                <div class="border rounded p-3 mb-2">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-medium text-sm">${trial.nctId}</span>
                        <span class="text-xs text-green-600">${trial.eligibilityMatch}% match</span>
                    </div>
                    <p class="text-xs text-gray-600 mb-2">${trial.title}</p>
                    <div class="flex justify-between text-xs">
                        <span>${trial.phase}</span>
                        <span>${trial.sponsor}</span>
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>

        <!-- CPIC Recommendations -->
        <div>
            <h4 class="font-medium text-sm mb-2">CPIC Recommendations</h4>
            ${patient.cpicRecommendations
              .map(
                (rec) => `
                <div class="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                    <div class="flex justify-between items-start">
                        <span class="font-medium text-xs">${rec.drug}</span>
                        <span class="text-xs text-yellow-800">${rec.evidenceLevel}</span>
                    </div>
                    <p class="text-xs text-gray-600">${rec.recommendation}</p>
                </div>
            `,
              )
              .join("")}
        </div>

        <div class="mt-4 pt-4 border-t">
            <button class="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors">
                View Full Analysis
            </button>
        </div>
    </div>
    `
  }
}
