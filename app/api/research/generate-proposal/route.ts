import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { opportunityId } = await request.json()

    // Generate PDF proposal document
    const proposalContent = generateProposalContent(opportunityId)

    // In production, this would use a PDF generation library
    const pdfBuffer = Buffer.from(proposalContent, "utf-8")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal-${opportunityId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating proposal:", error)
    return NextResponse.json({ error: "Failed to generate proposal" }, { status: 500 })
  }
}

function generateProposalContent(opportunityId: string): string {
  return `
AGENT PLATFORM RESEARCH PROPOSAL
Opportunity ID: ${opportunityId}
Generated: ${new Date().toISOString()}

EXECUTIVE SUMMARY
The AGENT (Adaptive Genomic Evidence Network for Trials) platform addresses critical gaps in precision medicine implementation through an innovative AI-driven approach that integrates seamlessly with Epic EHR systems.

SPECIFIC AIMS
Aim 1: Develop and validate AI-powered genomic analysis algorithms aligned with CPIC guidelines
Aim 2: Implement Epic FHIR integration for real-time clinical decision support
Aim 3: Deploy automated clinical trial matching for precision oncology patients
Aim 4: Evaluate clinical outcomes and cost-effectiveness in real-world settings

SIGNIFICANCE
This work addresses the critical gap in precision medicine implementation by providing the first Epic-integrated platform for automated CPIC guideline implementation.

INNOVATION
- First-in-class Epic marketplace application for genomic medicine
- Real-time 3D genomic visualization for clinical decision-making
- AI-powered automated clinical trial matching with CPIC integration
- Automated regulatory compliance and documentation generation

APPROACH
Our approach leverages proven technologies:
- Next.js and React for responsive user interfaces
- Python/Flask for AI model deployment
- Redis for real-time data caching
- Epic FHIR APIs for seamless EHR integration
- CPIC Level A evidence for pharmacogenomic recommendations

BUDGET JUSTIFICATION
Personnel (65%): PI, Co-I, Bioinformatician, Software Engineer
Equipment (15%): Genomic analysis hardware and software licenses
Supplies (10%): Laboratory reagents and consumables
Travel (5%): Conference presentations and collaboration meetings
Indirect (5%): Institutional overhead

TIMELINE
Year 1: Platform development and Epic integration
Year 2: Clinical validation and CPIC implementation
Year 3: Multi-site deployment and outcome evaluation

EXPECTED OUTCOMES
- 40% reduction in time to appropriate therapy
- 95% improvement in pharmacogenomic guideline adherence
- $2.3M annual cost savings per institution
- 20+ peer-reviewed publications
- 5+ patent applications

INSTITUTIONAL COMMITMENT
Norton Healthcare provides:
- Access to 2,000+ oncology patients annually
- Epic EHR integration support
- IRB and regulatory compliance infrastructure
- Clinical research coordination team

PRINCIPAL INVESTIGATOR QUALIFICATIONS
Dr. Sameer Talwalkar, MD
- Medical Oncologist, Norton Cancer Institute
- 15+ years clinical research experience
- 50+ peer-reviewed publications
- Expert in precision oncology implementation

CO-INVESTIGATOR QUALIFICATIONS
Devin Pellegrino, MS
- CEO, Advanced Defense Solutions
- 10+ years healthcare AI development
- Expert in Epic FHIR integration
- Defense contractor with federal research experience

This proposal represents a transformative approach to precision medicine implementation that will establish Norton Healthcare as a national leader in genomic medicine while advancing the field through innovative technology development.
  `
}
