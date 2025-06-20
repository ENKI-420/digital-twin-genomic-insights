import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import { TrialMatchingService } from "@/lib/ai/trial-matching-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const trialId = searchParams.get("trialId")

    if (!patientId || !trialId) {
      return NextResponse.json({ error: "Patient ID and Trial ID are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Get patient data
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single()

    if (patientError || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Calculate patient age
    const birthDate = new Date(patient.date_of_birth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    patient.age = age

    // Get trial data
    const { data: trial, error: trialError } = await supabase
      .from("clinical_trials")
      .select(`
        *,
        trial_genomic_criteria(*)
      `)
      .eq("id", trialId)
      .single()

    if (trialError || !trial) {
      return NextResponse.json({ error: "Trial not found" }, { status: 404 })
    }

    // Get match data
    const match = await TrialMatchingService.getMatchResults(patientId, trialId)

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    return NextResponse.json({
      patient,
      trial,
      match,
    })
  } catch (error) {
    console.error("Error fetching match details:", error)
    return NextResponse.json({ error: "Failed to fetch match details" }, { status: 500 })
  }
}
