import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { trialId } = await request.json()

    // Generate XML trial registry document
    const xmlContent = generateTrialRegistryXML(trialId)

    return new NextResponse(xmlContent, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="trial-registry-${trialId}.xml"`,
      },
    })
  } catch (error) {
    console.error("Error exporting trial registry:", error)
    return NextResponse.json({ error: "Failed to export trial registry" }, { status: 500 })
  }
}

function generateTrialRegistryXML(trialId: string): string {
  // In production, this would generate a real ClinicalTrials.gov-compatible XML
  return `<?xml version="1.0" encoding="UTF-8"?>
<clinical_study>
  <id_info>
    <org_study_id>${trialId}</org_study_id>
    <nct_id>NCT00000000</nct_id>
  </id_info>
  <brief_title>AGENT Precision Oncology Implementation Trial</brief_title>
  <official_title>Implementation of CPIC Guidelines for Precision Oncology Using the AGENT Platform</official_title>
  <sponsors>
    <lead_sponsor>
      <agency>Norton Healthcare</agency>
      <agency_class>Other</agency_class>
    </lead_sponsor>
    <collaborator>
      <agency>Advanced Defense Solutions</agency>
      <agency_class>Industry</agency_class>
    </collaborator>
  </sponsors>
  <source>Norton Healthcare</source>
  <oversight_info>
    <has_dmc>Yes</has_dmc>
    <is_fda_regulated_drug>No</is_fda_regulated_drug>
    <is_fda_regulated_device>No</is_fda_regulated_device>
  </oversight_info>
  <brief_summary>
    <textblock>
      This study evaluates the implementation of Clinical Pharmacogenetics Implementation
      Consortium (CPIC) guidelines for precision oncology using the AGENT platform.
    </textblock>
  </brief_summary>
  <detailed_description>
    <textblock>
      The AGENT platform provides real-time genomic analysis and clinical decision support
      for precision oncology implementation. This study will evaluate the effectiveness of
      CPIC guideline implementation using the AGENT platform compared to standard care.
    </textblock>
  </detailed_description>
  <overall_status>Not yet recruiting</overall_status>
  <start_date type="Anticipated">2024-03-01</start_date>
  <completion_date type="Anticipated">2025-03-01</completion_date>
  <primary_completion_date type="Anticipated">2025-01-01</primary_completion_date>
  <phase>Phase 2</phase>
  <study_type>Interventional</study_type>
  <has_expanded_access>No</has_expanded_access>
  <study_design_info>
    <allocation>Randomized</allocation>
    <intervention_model>Parallel Assignment</intervention_model>
    <primary_purpose>Health Services Research</primary_purpose>
    <masking>None (Open Label)</masking>
  </study_design_info>
  <primary_outcome>
    <measure>Time to appropriate therapy</measure>
    <time_frame>30 days</time_frame>
    <description>Time from genomic test result to appropriate therapy selection</description>
  </primary_outcome>
  <secondary_outcome>
    <measure>CPIC guideline adherence</measure>
    <time_frame>90 days</time_frame>
    <description>Percentage of cases with adherence to CPIC guidelines</description>
  </secondary_outcome>
  <enrollment type="Anticipated">200</enrollment>
  <condition>Cancer</condition>
  <intervention>
    <intervention_type>Other</intervention_type>
    <intervention_name>AGENT Platform</intervention_name>
    <description>Implementation of CPIC guidelines using the AGENT platform</description>
  </intervention>
  <eligibility>
    <criteria>
      <textblock>
        Inclusion Criteria:
        - Adult patients (age ≥18 years)
        - Diagnosis of cancer
        - Receiving care at Norton Cancer Institute
        - Genomic testing ordered as part of clinical care

        Exclusion Criteria:
        - Unable to provide informed consent
        - Life expectancy &lt;3 months
      </textblock>
    </criteria>
    <gender>All</gender>
    <minimum_age>18 Years</minimum_age>
    <maximum_age>N/A</maximum_age>
    <healthy_volunteers>No</healthy_volunteers>
  </eligibility>
  <overall_contact>
    <last_name>Sameer Talwalkar, MD</last_name>
    <phone>555-123-4567</phone>
    <email>sameer.talwalkar@nortonhealthcare.org</email>
  </overall_contact>
  <verification_date>2024-01-15</verification_date>
  <study_first_submitted>2024-01-15</study_first_submitted>
  <study_first_submitted_qc>2024-01-15</study_first_submitted_qc>
  <study_first_posted type="Actual">2024-01-20</study_first_posted>
  <last_update_submitted>2024-01-15</last_update_submitted>
  <last_update_submitted_qc>2024-01-15</last_update_submitted_qc>
  <last_update_posted type="Actual">2024-01-20</last_update_posted>
  <responsible_party>
    <responsible_party_type>Sponsor</responsible_party_type>
  </responsible_party>
  <keyword>precision medicine</keyword>
  <keyword>pharmacogenomics</keyword>
  <keyword>CPIC</keyword>
  <keyword>oncology</keyword>
  <patient_data>
    <sharing_ipd>Yes</sharing_ipd>
    <ipd_description>De-identified individual participant data will be available</ipd_description>
    <ipd_time_frame>Data will be available 6 months after study completion</ipd_time_frame>
    <ipd_access_criteria>Researchers who provide a methodologically sound proposal</ipd_access_criteria>
  </patient_data>
</clinical_study>`
}
