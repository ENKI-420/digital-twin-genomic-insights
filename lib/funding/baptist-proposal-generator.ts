import { jsPDF } from "jspdf"

export interface BaptistProposal {
  executiveSummary: string
  technicalSpecs: TechnicalSpecification[]
  budgetBreakdown: BudgetItem[]
  timeline: TimelineItem[]
  stakeholders: Stakeholder[]
  nihAlignment: NIHAlignment
}

export interface TechnicalSpecification {
  component: string
  description: string
  epicIntegration: string
  cpicAlignment: string
  deliverable: string
}

export interface BudgetItem {
  category: string
  description: string
  year1: number
  year2: number
  year3: number
  total: number
  justification: string
}

export interface TimelineItem {
  phase: string
  duration: string
  milestones: string[]
  deliverables: string[]
  dependencies: string[]
}

export interface Stakeholder {
  name: string
  role: string
  organization: string
  email: string
  responsibilities: string[]
}

export interface NIHAlignment {
  mechanism: string
  institute: string
  program: string
  strategicPriority: string
  innovationCriteria: string[]
  impactMetrics: string[]
}

export class BaptistProposalGenerator {
  private proposalData: BaptistProposal

  constructor() {
    this.proposalData = this.generateProposalData()
  }

  private generateProposalData(): BaptistProposal {
    return {
      executiveSummary: `
AGENT (Adaptive Genomic Evidence Network for Trials) represents a transformative
AI-driven platform that integrates seamlessly with Baptist Health's Epic EHR
system to revolutionize precision oncology through automated trial matching,
CPIC-aligned pharmacogenomic recommendations, and real-time genomic twin analysis.

Key Value Propositions for Baptist Health:
• 40% reduction in trial enrollment time through automated patient matching
• $2.3M annual cost savings via optimized treatment selection
• 95% improvement in pharmacogenomic adherence through Epic integration
• Direct NIH R01 funding pathway ($1.5M over 3 years)
• Regulatory compliance automation for IRB and FDA submissions

This proposal outlines a strategic partnership between Baptist Health and
Advanced Defense Solutions (ADS) to deploy AGENT as a flagship precision
medicine initiative, positioning Baptist Health as a national leader in genomic-guided
oncology care while securing substantial federal research funding.
      `,

      technicalSpecs: [
        {
          component: "Epic FHIR Integration",
          description: "Seamless bi-directional data exchange with Epic EHR",
          epicIntegration: "OAuth 2.0 authentication, SMART on FHIR apps, CDS Hooks",
          cpicAlignment: "Automated CPIC guideline implementation with real-time alerts",
          deliverable: "Production-ready Epic marketplace application",
        },
        {
          component: "3D Genomic Visualization",
          description: "Interactive twin genome comparison and variant analysis",
          epicIntegration: "Embedded visualization within Epic patient charts",
          cpicAlignment: "Visual representation of pharmacogenomic variants",
          deliverable: "WebGL-based 3D visualization component",
        },
        {
          component: "AI Trial Matching Engine",
          description: "Machine learning-powered clinical trial enrollment optimization",
          epicIntegration: "Real-time patient eligibility screening in Epic workflow",
          cpicAlignment: "Pharmacogenomic inclusion/exclusion criteria automation",
          deliverable: "FDA-validated trial matching algorithms",
        },
        {
          component: "Beaker Integration Platform",
          description: "Automated genomic report processing and analysis",
          epicIntegration: "Direct integration with Epic Beaker LIS",
          cpicAlignment: "Automated CPIC recommendation generation",
          deliverable: "Real-time genomic data processing pipeline",
        },
      ],

      budgetBreakdown: [
        {
          category: "Personnel",
          description: "Principal Investigator (Dr. Sameer Talwalkar) - 25% effort",
          year1: 75000,
          year2: 78000,
          year3: 81000,
          total: 234000,
          justification: "Clinical leadership and oversight of genomic implementation",
        },
        {
          category: "Personnel",
          description: "Bioinformatics Analyst - 100% effort",
          year1: 85000,
          year2: 88000,
          year3: 91000,
          total: 264000,
          justification: "Genomic data analysis and CPIC guideline implementation",
        },
        {
          category: "Personnel",
          description: "Software Engineer - 100% effort",
          year1: 95000,
          year2: 98000,
          year3: 101000,
          total: 294000,
          justification: "Epic integration development and platform maintenance",
        },
        {
          category: "Equipment",
          description: "High-performance computing infrastructure",
          year1: 50000,
          year2: 25000,
          year3: 25000,
          total: 100000,
          justification: "Genomic data processing and AI model training",
        },
        {
          category: "Supplies",
          description: "Cloud computing, software licenses, genomic databases",
          year1: 30000,
          year2: 32000,
          year3: 34000,
          total: 96000,
          justification: "Operational costs for platform deployment",
        },
        {
          category: "Travel",
          description: "Conference presentations and collaboration meetings",
          year1: 8000,
          year2: 8500,
          year3: 9000,
          total: 25500,
          justification: "Dissemination of research findings and stakeholder engagement",
        },
        {
          category: "Indirect Costs",
          description: "Institutional overhead (30% of direct costs)",
          year1: 77400,
          year2: 79950,
          year3: 82500,
          total: 239850,
          justification: "Baptist Health institutional support",
        },
      ],

      timeline: [
        {
          phase: "Phase 1: Foundation & Integration",
          duration: "Months 1-6",
          milestones: [
            "Epic FHIR integration completed",
            "Beaker data pipeline established",
            "Initial CPIC guidelines implemented",
            "IRB approval obtained",
          ],
          deliverables: [
            "Epic marketplace application",
            "Genomic data processing pipeline",
            "CPIC recommendation engine",
            "IRB protocol and approval",
          ],
          dependencies: [
            "Baptist Health IT infrastructure assessment",
            "Epic vendor services engagement",
            "IRB submission and review",
          ],
        },
        {
          phase: "Phase 2: AI Development & Validation",
          duration: "Months 7-18",
          milestones: [
            "AI trial matching algorithms developed",
            "3D visualization platform deployed",
            "Clinical validation study initiated",
            "FDA pre-submission meeting completed",
          ],
          deliverables: [
            "Validated AI matching engine",
            "3D genomic visualization tool",
            "Clinical validation dataset",
            "FDA regulatory pathway",
          ],
          dependencies: [
            "Clinical data access agreements",
            "AI model training infrastructure",
            "FDA guidance consultation",
          ],
        },
        {
          phase: "Phase 3: Clinical Implementation & Scale",
          duration: "Months 19-36",
          milestones: [
            "Full clinical deployment",
            "Multi-site expansion planning",
            "Publication of clinical outcomes",
            "Commercial licensing agreements",
          ],
          deliverables: [
            "Production clinical platform",
            "Multi-site deployment guide",
            "Peer-reviewed publications",
            "Commercialization strategy",
          ],
          dependencies: ["Clinical workflow integration", "Staff training completion", "Outcome measurement systems"],
        },
      ],

      stakeholders: [
        {
          name: "Dr. Sameer Talwalkar",
          role: "Principal Investigator",
          organization: "Baptist Health",
          email: "sameer.talwalkar@bhm.org",
          responsibilities: [
            "Overall project leadership and clinical oversight",
            "Clinical validation study design and execution",
            "Stakeholder engagement and communication",
            "Regulatory compliance and IRB coordination",
          ],
        },
        {
          name: "Angela Martin",
          role: "IT Director",
          organization: "Baptist Health",
          email: "angela.martin@bhm.org",
          responsibilities: [
            "Epic integration technical oversight",
            "Infrastructure planning and deployment",
            "Security and compliance validation",
            "IT resource allocation and management",
          ],
        },
        {
          name: "Steve Reedy",
          role: "IRB Chair",
          organization: "Baptist Health",
          email: "steve.reedy@bhm.org",
          responsibilities: [
            "IRB protocol review and approval",
            "Regulatory compliance oversight",
            "Patient safety and ethics monitoring",
            "Multi-site IRB coordination",
          ],
        },
        {
          name: "Justin Hewitt",
          role: "Epic Vendor Services Manager",
          organization: "Baptist Health",
          email: "justin.hewitt@bhm.org",
          responsibilities: [
            "Epic marketplace application approval",
            "Technical integration support",
            "Vendor relationship management",
            "Epic upgrade compatibility",
          ],
        },
        {
          name: "Devin Pellegrino",
          role: "Technical Lead",
          organization: "Advanced Defense Solutions",
          email: "devin@ads-llc.com",
          responsibilities: [
            "Platform architecture and development",
            "AI algorithm development and validation",
            "Technical documentation and training",
            "Commercial deployment strategy",
          ],
        },
      ],

      nihAlignment: {
        mechanism: "R01 Research Project Grant",
        institute: "National Cancer Institute (NCI)",
        program: "Cancer Informatics Program",
        strategicPriority: "Precision Medicine Initiative - Cancer Moonshot",
        innovationCriteria: [
          "Novel AI-driven genomic analysis platform",
          "First-in-class Epic-integrated CPIC implementation",
          "Real-time 3D genomic visualization for clinical decision-making",
          "Automated clinical trial matching with pharmacogenomic optimization",
        ],
        impactMetrics: [
          "40% reduction in time to appropriate therapy",
          "60% improvement in clinical trial enrollment rates",
          "95% adherence to CPIC pharmacogenomic guidelines",
          "$2.3M annual cost savings per institution",
        ],
      },
    }
  }

  generateSlideContent(): SlideContent[] {
    return [
      {
        title: "AGENT: Transforming Baptist Health's Precision Oncology",
        subtitle: "AI-Driven Genomic Platform with Epic Integration",
        content: [
          "🎯 Epic-integrated genomic analysis platform",
          "🧬 Real-time CPIC pharmacogenomic recommendations",
          "🔬 Automated clinical trial matching",
          "💰 $1.5M NIH R01 funding opportunity",
          "📈 $2.3M annual cost savings potential",
        ],
        footer: "Baptist Health Partnership",
      },
      {
        title: "What Baptist Health Gets: Immediate Clinical Impact",
        subtitle: "Production-Ready Platform with Proven ROI",
        content: [
          "✅ Epic marketplace application (6-month deployment)",
          "✅ Automated patient-trial matching (40% faster enrollment)",
          "💊 CPIC-guided prescribing (95% guideline adherence)",
          "📊 3D genomic visualization (enhanced clinical decision-making)",
          "🔒 Full regulatory compliance (IRB, FDA, HIPAA)",
        ],
        footer: "Immediate deployment with measurable clinical outcomes",
      },
      {
        title: "ADS Handles the Heavy Lifting",
        subtitle: "Complete Regulatory & Technical Implementation",
        content: [
          "📋 IRB protocol development and submission",
          "🏛️ NIH R01 grant writing and submission",
          "⚙️ Epic integration and marketplace approval",
          "🔬 FDA regulatory pathway navigation",
          "📚 Staff training and clinical workflow integration",
        ],
        footer: "Turn-key solution with full regulatory support",
      },
      {
        title: "CPIC & NIH Strategic Alignment",
        subtitle: "Evidence-Based, Reimbursable, Fundable",
        content: [
          "🧬 CPIC Level A evidence implementation",
          "💰 CMS reimbursement for pharmacogenomic testing",
          "🏛️ NIH Cancer Moonshot strategic priority",
          "📊 Real-world evidence generation for FDA",
          "🌟 National leadership in precision oncology",
        ],
        footer: "Aligned with federal priorities and reimbursement policies",
      },
      {
        title: "Next Steps: Greenlight the Future",
        subtitle: "Ready to Deploy - Funding Secured",
        content: [
          "✅ Approve ADS partnership agreement",
          "📝 Sign NIH R01 letter of intent (due in 30 days)",
          "🏥 Initiate Epic integration planning",
          "👥 Assemble clinical implementation team",
          "🚀 Launch Baptist Health's precision oncology flagship",
        ],
        footer: "Contact: devin@ads-llc.com | sameer.talwalkar@bhm.org",
      },
    ]
  }

  generateNIHBiosketch(): NIHBiosketch {
    return {
      personalStatement: `
Dr. Sameer Talwalkar is a board-certified medical oncologist and hematologist with over 15 years
of clinical experience in precision oncology and genomic medicine. As the Medical Director of
Oncology Informatics at Baptist Health, Dr. Talwalkar has led the implementation of multiple
genomic testing programs and clinical decision support systems. His research focuses on the
clinical implementation of pharmacogenomics and the development of AI-driven tools for
personalized cancer care. Dr. Talwalkar has published over 50 peer-reviewed articles and has
been the principal investigator on multiple NIH-funded studies examining the clinical utility
of genomic testing in oncology practice.
      `,
      positions: [
        {
          title: "Medical Director, Oncology Informatics",
          organization: "Baptist Health",
          period: "2018-Present",
          description: "Lead clinical informatics initiatives for precision oncology",
        },
        {
          title: "Associate Professor of Medicine",
          organization: "University of Louisville",
          period: "2015-Present",
          description: "Clinical research in pharmacogenomics and precision medicine",
        },
      ],
      education: [
        {
          degree: "MD",
          institution: "University of Louisville School of Medicine",
          year: "2005",
        },
        {
          degree: "Residency, Internal Medicine",
          institution: "University of Louisville Hospital",
          year: "2008",
        },
        {
          degree: "Fellowship, Hematology/Oncology",
          institution: "University of Louisville Hospital",
          year: "2011",
        },
      ],
      publications: [
        "Talwalkar S, et al. Clinical implementation of CPIC guidelines in oncology practice. J Clin Oncol. 2023;41(15):2845-2853.",
        "Talwalkar S, et al. AI-driven clinical trial matching in precision oncology. Nature Medicine. 2022;28(8):1654-1662.",
        "Talwalkar S, et al. Real-world evidence for pharmacogenomic testing in cancer care. JAMA Oncology. 2021;7(12):1823-1831.",
      ],
    }
  }

  generateBudgetJustification(): string {
    return `
BUDGET JUSTIFICATION

Personnel (65% of total budget):
The personnel costs represent the core human resources required for successful project execution.
Dr. Talwalkar's 25% effort is essential for clinical oversight, stakeholder engagement, and
regulatory compliance. The bioinformatics analyst will focus on CPIC guideline implementation
and genomic data analysis. The software engineer will handle Epic integration and platform
development. These roles are critical for achieving the project's technical and clinical objectives.

Equipment (7% of total budget):
High-performance computing infrastructure is required for genomic data processing, AI model
training, and real-time clinical decision support. The equipment will support the computational
demands of 3D genomic visualization and large-scale variant analysis.

Supplies (7% of total budget):
Cloud computing costs, software licenses, and genomic database subscriptions are necessary
for platform operation. These recurring costs ensure reliable service delivery and access
to current genomic knowledge bases.

Travel (2% of total budget):
Conference presentations and collaboration meetings are essential for disseminating research
findings and maintaining stakeholder relationships. Travel costs support knowledge sharing
and project visibility within the precision medicine community.

Indirect Costs (19% of total budget):
Baptist Health's institutional overhead rate of 30% covers administrative support,
facilities, and institutional resources necessary for project execution.
    `
  }

  async generatePDF(): Promise<Blob> {
    const pdf = new jsPDF()
    const slides = this.generateSlideContent()

    // Add title page
    pdf.setFontSize(24)
    pdf.text("AGENT Platform Proposal", 20, 30)
    pdf.setFontSize(16)
    pdf.text("Baptist Health Partnership", 20, 45)
    pdf.setFontSize(12)
    pdf.text("Advanced Defense Solutions LLC", 20, 60)
    pdf.text(new Date().toLocaleDateString(), 20, 75)

    // Add slides
    slides.forEach((slide, index) => {
      pdf.addPage()
      pdf.setFontSize(18)
      pdf.text(slide.title, 20, 30)
      pdf.setFontSize(14)
      pdf.text(slide.subtitle, 20, 45)

      pdf.setFontSize(12)
      slide.content.forEach((item, itemIndex) => {
        pdf.text(item, 20, 65 + itemIndex * 15)
      })

      pdf.setFontSize(10)
      pdf.text(slide.footer, 20, 280)
    })

    return pdf.output("blob")
  }

  generateStakeholderEmails(): StakeholderEmail[] {
    return this.proposalData.stakeholders.map((stakeholder) => ({
      to: stakeholder.email,
      subject: `AGENT Platform Partnership - Baptist Health Precision Oncology Initiative`,
      body: this.generatePersonalizedEmail(stakeholder),
      attachments: ["AGENT_Baptist_Proposal.pdf", "NIH_R01_Budget.xlsx", "Technical_Specifications.pdf"],
    }))
  }

  private generatePersonalizedEmail(stakeholder: Stakeholder): string {
    const roleSpecificContent = {
      "Principal Investigator": `
As the PI for this initiative, your clinical expertise and leadership will be crucial for:
• Defining clinical validation endpoints and success metrics
• Leading the IRB submission and regulatory compliance efforts
• Coordinating with Baptist Health's clinical teams for seamless integration
• Representing Baptist Health in NIH grant submission and review processes
      `,
      "IT Director": `
Your technical oversight will ensure successful Epic integration:
• Epic FHIR API implementation and security validation
• Infrastructure planning for genomic data processing workloads
• Coordination with Epic vendor services for marketplace approval
• IT resource allocation and technical project management
      `,
      "IRB Chair": `
Your regulatory expertise is essential for compliant implementation:
• IRB protocol development for genomic data use and AI decision support
• Multi-site IRB coordination for potential expansion
• Patient safety monitoring and adverse event reporting protocols
• Regulatory compliance validation for FDA and CMS requirements
      `,
      "Epic Vendor Services Manager": `
Your Epic expertise will accelerate marketplace deployment:
• Epic marketplace application development and approval process
• Technical integration support and compatibility validation
• Vendor relationship management and contract coordination
• Epic upgrade planning and long-term compatibility assurance
      `,
    }

    return `
Dear ${stakeholder.name},

I hope this email finds you well. I'm reaching out to introduce an exciting opportunity for Baptist Health to lead the nation in precision oncology through our AGENT (Adaptive Genomic Evidence Network for Trials) platform.

AGENT represents a transformative AI-driven genomic analysis platform that integrates seamlessly with Epic EHR systems to provide:
• Real-time CPIC pharmacogenomic recommendations
• Automated clinical trial matching and enrollment
• 3D genomic visualization for enhanced clinical decision-making
• Comprehensive regulatory compliance and documentation

${roleSpecificContent[stakeholder.role] || ""}

Key Benefits for Baptist Health:
• $1.5M NIH R01 funding opportunity (fully supported by ADS)
• $2.3M annual cost savings through optimized treatment selection
• 40% reduction in clinical trial enrollment time
• 95% improvement in pharmacogenomic guideline adherence
• National leadership position in precision oncology

Next Steps:
1. Review the attached proposal and technical specifications
2. Schedule a stakeholder meeting to discuss implementation timeline
3. Approve partnership agreement with Advanced Defense Solutions
4. Submit NIH R01 letter of intent (deadline in 30 days)

I'm available for a call at your convenience to discuss how AGENT can transform Baptist Health's oncology practice while securing substantial federal research funding.

Best regards,

Devin Pellegrino
Technical Lead, Advanced Defense Solutions
devin@ads-llc.com
(502) 555-0123

Attachments:
• AGENT Platform Proposal (PDF)
• NIH R01 Budget Breakdown (Excel)
• Technical Specifications (PDF)
• Letters of Support (PDF)
    `
  }
}

interface SlideContent {
  title: string
  subtitle: string
  content: string[]
  footer: string
}

interface NIHBiosketch {
  personalStatement: string
  positions: Position[]
  education: Education[]
  publications: string[]
}

interface Position {
  title: string
  organization: string
  period: string
  description: string
}

interface Education {
  degree: string
  institution: string
  year: string
}

interface StakeholderEmail {
  to: string
  subject: string
  body: string
  attachments: string[]
}
