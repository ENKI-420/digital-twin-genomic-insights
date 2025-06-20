import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"
import { EpicFHIRClient } from "@/lib/epic/fhir-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const patientId = params.id

    // Get patient basic info
    const { data: patient, error } = await supabase.from("patients").select("*").eq("id", patientId).single()

    if (error || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Get Epic data if available
    const { data: epicData } = await supabase.from("patient_epic_data").select("*").eq("patient_id", patientId).single()

    // If Epic integration is available, fetch additional data
    let epicPatientData = null
    if (epicData?.epic_patient_id) {
      try {
        // This would use the actual Epic access token in production
        const fhirClient = new EpicFHIRClient("mock_token")
        epicPatientData = await fhirClient.getPatient(epicData.epic_patient_id)
      } catch (error) {
        console.error("Error fetching Epic data:", error)
      }
    }

    return NextResponse.json({
      ...patient,
      epic_data: epicPatientData,
    })
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
