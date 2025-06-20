import { getValidAccessToken } from "../auth/epic-auth"

const FHIR_BASE_URL = process.env.EPIC_FHIR_BASE_URL || ""

export interface DiagnosticReportResult {
  patientId: string
  patientName: string
  gene: string
  mutation: string
  zygosity: string
  interpretation: string
  loincCode: string
  icdCodes: string
  diseaseStage: string
  dateOfCollection: string
}

export async function fetchDiagnosticReport(patientId: string): Promise<DiagnosticReportResult[]> {
  try {
    const accessToken = await getValidAccessToken()

    // Fetch the DiagnosticReport for the patient
    const response = await fetch(`${FHIR_BASE_URL}/DiagnosticReport?patient=${patientId}&_format=json`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      throw new Error(`Failed to fetch diagnostic report: ${response.statusText}`)
    }

    const data = await response.json()

    // Process and map the FHIR response to our required format
    const reports: DiagnosticReportResult[] = []

    if (data.entry && Array.isArray(data.entry)) {
      for (const entry of data.entry) {
        const report = entry.resource

        if (report.resourceType === "DiagnosticReport") {
          // Extract patient name - in a real app, we would fetch this from the patient resource
          let patientName = "Unknown"
          if (report.subject && report.subject.display) {
            patientName = report.subject.display
          }

          // Extract genetic information from the report
          // Note: This is a simplified example. In a real app, you would need to
          // parse the actual structure of the DiagnosticReport resource
          const geneticInfo = extractGeneticInfo(report)

          reports.push({
            patientId: patientId,
            patientName: patientName,
            gene: geneticInfo.gene || "N/A",
            mutation: geneticInfo.mutation || "N/A",
            zygosity: geneticInfo.zygosity || "N/A",
            interpretation: geneticInfo.interpretation || "N/A",
            loincCode: geneticInfo.loincCode || "N/A",
            icdCodes: geneticInfo.icdCodes || "N/A",
            diseaseStage: geneticInfo.diseaseStage || "N/A",
            dateOfCollection: report.effectiveDateTime || "N/A",
          })
        }
      }
    }

    return reports
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      // Handle authentication errors specifically
      throw error
    }
    console.error("Error fetching diagnostic report:", error)
    throw new Error("Failed to fetch diagnostic report data")
  }
}

// Helper function to extract genetic information from a DiagnosticReport
function extractGeneticInfo(report: any) {
  const result = {
    gene: "",
    mutation: "",
    zygosity: "",
    interpretation: "",
    loincCode: "",
    icdCodes: "",
    diseaseStage: "",
  }

  // Extract LOINC code
  if (report.code && report.code.coding) {
    const loincCoding = report.code.coding.find((coding: any) => coding.system === "http://loinc.org")
    if (loincCoding) {
      result.loincCode = loincCoding.code
    }
  }

  // Extract ICD codes
  if (report.conclusionCode && report.conclusionCode.coding) {
    const icdCodes = report.conclusionCode.coding
      .filter((coding: any) => coding.system === "http://hl7.org/fhir/sid/icd-10")
      .map((coding: any) => coding.code)
      .join(", ")
    result.icdCodes = icdCodes
  }

  // Extract genetic information from observations
  // This is a simplified example - in a real app, you would need to
  // fetch the referenced Observation resources
  if (report.result && Array.isArray(report.result)) {
    // In a real app, you would fetch each observation reference
    // For this demo, we'll simulate the data
    result.gene = "TP53" // Simulated
    result.mutation = "R175H" // Simulated
    result.zygosity = "Heterozygous" // Simulated
    result.interpretation = "Pathogenic" // Simulated
    result.diseaseStage = "Stage II" // Simulated
  }

  return result
}

// Function to fetch patient data
export async function fetchPatient(patientId: string) {
  try {
    const accessToken = await getValidAccessToken()

    const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}?_format=json`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      throw new Error(`Failed to fetch patient: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching patient:", error)
    throw error
  }
}
