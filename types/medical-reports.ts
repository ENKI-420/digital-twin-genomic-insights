export type LabResultStatus = "normal" | "abnormal" | "critical" | "pending"

export interface LabResult {
  name: string
  value: number | string
  unit: string
  referenceRange: string
  status: LabResultStatus
  previousResults?: Array<{
    value: number | string
    date: string
  }>
}

export interface LabPanel {
  name: string
  category: string
  results: LabResult[]
}

export type ReportType = "laboratory" | "radiology" | "pathology" | "clinical"

export interface MedicalReport {
  id: string
  patientId: string
  type: ReportType
  name: string
  date: string
  provider: string
  status: "preliminary" | "final" | "amended" | "corrected" | "cancelled"
  panels?: LabPanel[]
  findings?: string
  impression?: string
  clinicalInformation?: string
  technique?: string
  specimens?: Array<{
    type: string
    site: string
    collectionDate: string
  }>
  images?: Array<{
    id: string
    description: string
    url: string
  }>
  conclusion?: string
  recommendations?: string
  notes?: string
}
