import type { DiagnosticReportResult } from "../api/fhir-service"

export function generateCSV(data: DiagnosticReportResult[]): string {
  // Define CSV headers
  const headers = [
    "patient_id",
    "patient_name",
    "gene",
    "mutation",
    "zygosity",
    "interpretation",
    "loinc_code",
    "icd_codes",
    "disease_stage",
    "date_of_collection",
  ]

  // Create CSV content
  let csvContent = headers.join(",") + "\n"

  // Add data rows
  data.forEach((row) => {
    const values = [
      row.patientId,
      `"${row.patientName}"`, // Wrap in quotes to handle commas in names
      row.gene,
      row.mutation,
      row.zygosity,
      `"${row.interpretation}"`, // Wrap in quotes to handle commas
      row.loincCode,
      `"${row.icdCodes}"`, // Wrap in quotes to handle commas
      row.diseaseStage,
      row.dateOfCollection,
    ]

    csvContent += values.join(",") + "\n"
  })

  return csvContent
}

export function downloadCSV(csvContent: string, filename = "AGENT_Beaker_Report.csv"): void {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  // Create a download link
  const link = document.createElement("a")

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Set link properties
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Append to document, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
