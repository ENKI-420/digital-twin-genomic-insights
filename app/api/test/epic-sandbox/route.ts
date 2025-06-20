import { NextResponse } from "next/server"
import { EpicSandboxConnector } from "@/lib/epic/sandbox-connector"
import { EpicFHIRClient } from "@/lib/epic/fhir-client"

interface TestResult {
  test: string
  status: "PASS" | "FAIL" | "SKIP"
  message: string
  duration: number
  data?: any
}

export async function GET() {
  const results: TestResult[] = []
  const startTime = Date.now()

  try {
    console.log("🔬 Starting Epic Sandbox Real Connection Tests...")

    const connector = new EpicSandboxConnector()

    // Test 1: Check if we have a valid session
    const sessionTest = await testValidSession(connector)
    results.push(sessionTest)

    if (sessionTest.status === "PASS") {
      // We have a valid session, run FHIR tests
      const session = await connector.getValidSession()
      if (session) {
        const fhirClient = new EpicFHIRClient(session.accessToken)

        // Test patient data access
        const patientTests = await testPatientAccess(fhirClient, session.patientId)
        results.push(...patientTests)

        // Test diagnostic reports
        const diagnosticTests = await testDiagnosticReports(fhirClient, session.patientId)
        results.push(...diagnosticTests)

        // Test observations
        const observationTests = await testObservations(fhirClient, session.patientId)
        results.push(...observationTests)

        // Test genomic data extraction
        const genomicTests = await testGenomicDataExtraction(fhirClient, session.patientId)
        results.push(...genomicTests)
      }
    } else {
      // No valid session, provide authorization URL
      const authTest = await testAuthorizationGeneration(connector)
      results.push(authTest)
    }

    const summary = calculateSummary(results)
    const totalDuration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      environment: {
        epicBaseUrl: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
        clientId: process.env.EPIC_CLIENT_ID?.substring(0, 8) + "...",
        hasValidSession: sessionTest.status === "PASS",
      },
      summary,
      results,
    })
  } catch (error) {
    console.error("Epic sandbox test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        results,
      },
      { status: 500 },
    )
  }
}

async function testValidSession(connector: EpicSandboxConnector): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const session = await connector.getValidSession()

    if (session) {
      return {
        test: "Valid Epic Session",
        status: "PASS",
        message: "Active Epic session found with valid access token",
        duration: Date.now() - startTime,
        data: {
          patientId: session.patientId,
          userId: session.userId,
          scope: session.scope,
          expiresAt: new Date(session.expiresAt).toISOString(),
        },
      }
    } else {
      return {
        test: "Valid Epic Session",
        status: "SKIP",
        message: "No active Epic session - authentication required",
        duration: Date.now() - startTime,
        data: {
          authRequired: true,
        },
      }
    }
  } catch (error) {
    return {
      test: "Valid Epic Session",
      status: "FAIL",
      message: `Error checking session: ${error}`,
      duration: Date.now() - startTime,
    }
  }
}

async function testAuthorizationGeneration(connector: EpicSandboxConnector): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const { url, state } = await connector.getAuthorizationUrl()

    return {
      test: "Authorization URL Generation",
      status: "PASS",
      message: "Epic authorization URL generated successfully",
      duration: Date.now() - startTime,
      data: {
        authorizationUrl: url,
        state,
        instructions: "Visit the authorization URL to complete Epic authentication",
      },
    }
  } catch (error) {
    return {
      test: "Authorization URL Generation",
      status: "FAIL",
      message: `Error generating authorization URL: ${error}`,
      duration: Date.now() - startTime,
    }
  }
}

async function testPatientAccess(client: EpicFHIRClient, patientId?: string): Promise<TestResult[]> {
  const results: TestResult[] = []
  const testPatients = ["eVHNQiVtf-nP6vguPHqfWwB", "erXuFYUfucBZaryVksYEcMg3"]

  // Test with session patient ID if available
  if (patientId) {
    testPatients.unshift(patientId)
  }

  for (const pid of testPatients) {
    const startTime = Date.now()

    try {
      const patient = await client.getPatient(pid)

      results.push({
        test: `Patient Access (${pid})`,
        status: "PASS",
        message: `Successfully retrieved patient data for ${patient.id}`,
        duration: Date.now() - startTime,
        data: {
          patientId: patient.id,
          resourceType: patient.resourceType,
          name: patient.name?.[0]?.family || "Unknown",
          birthDate: patient.birthDate,
          gender: patient.gender,
        },
      })

      // Only test first successful patient to avoid rate limits
      break
    } catch (error) {
      results.push({
        test: `Patient Access (${pid})`,
        status: "FAIL",
        message: `Error accessing patient ${pid}: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  return results
}

async function testDiagnosticReports(client: EpicFHIRClient, patientId?: string): Promise<TestResult[]> {
  const results: TestResult[] = []
  const testPatientId = patientId || "eVHNQiVtf-nP6vguPHqfWwB"
  const startTime = Date.now()

  try {
    const reports = await client.getDiagnosticReports(testPatientId)

    results.push({
      test: "Diagnostic Reports Access",
      status: "PASS",
      message: `Retrieved ${reports.length} diagnostic reports`,
      duration: Date.now() - startTime,
      data: {
        patientId: testPatientId,
        reportCount: reports.length,
        reports: reports.slice(0, 3).map((r) => ({
          id: r.id,
          status: r.status,
          code: r.code?.coding?.[0]?.display,
          effectiveDateTime: r.effectiveDateTime,
        })),
      },
    })
  } catch (error) {
    results.push({
      test: "Diagnostic Reports Access",
      status: "FAIL",
      message: `Error accessing diagnostic reports: ${error}`,
      duration: Date.now() - startTime,
    })
  }

  return results
}

async function testObservations(client: EpicFHIRClient, patientId?: string): Promise<TestResult[]> {
  const results: TestResult[] = []
  const testPatientId = patientId || "eVHNQiVtf-nP6vguPHqfWwB"
  const startTime = Date.now()

  try {
    const observations = await client.getObservations(testPatientId, "laboratory")

    results.push({
      test: "Laboratory Observations",
      status: "PASS",
      message: `Retrieved ${observations.length} laboratory observations`,
      duration: Date.now() - startTime,
      data: {
        patientId: testPatientId,
        observationCount: observations.length,
        observations: observations.slice(0, 5).map((o) => ({
          id: o.id,
          status: o.status,
          code: o.code?.coding?.[0]?.display,
          valueString: o.valueString,
        })),
      },
    })
  } catch (error) {
    results.push({
      test: "Laboratory Observations",
      status: "FAIL",
      message: `Error accessing observations: ${error}`,
      duration: Date.now() - startTime,
    })
  }

  return results
}

async function testGenomicDataExtraction(client: EpicFHIRClient, patientId?: string): Promise<TestResult[]> {
  const results: TestResult[] = []
  const testPatientId = patientId || "erXuFYUfucBZaryVksYEcMg3" // Derrick Lin has genomic data
  const startTime = Date.now()

  try {
    const reports = await client.getDiagnosticReports(testPatientId)
    const variants = await client.extractVariantsFromReports(reports)

    results.push({
      test: "Genomic Data Extraction",
      status: "PASS",
      message: `Extracted ${variants.length} genetic variants from ${reports.length} reports`,
      duration: Date.now() - startTime,
      data: {
        patientId: testPatientId,
        reportCount: reports.length,
        variantCount: variants.length,
        variants: variants.slice(0, 3).map((v) => ({
          gene: v.gene,
          variant: v.variant,
          hgvs: v.hgvs,
          source: v.source,
        })),
      },
    })
  } catch (error) {
    results.push({
      test: "Genomic Data Extraction",
      status: "FAIL",
      message: `Error extracting genomic data: ${error}`,
      duration: Date.now() - startTime,
    })
  }

  return results
}

function calculateSummary(results: TestResult[]) {
  const total = results.length
  const passed = results.filter((r) => r.status === "PASS").length
  const failed = results.filter((r) => r.status === "FAIL").length
  const skipped = results.filter((r) => r.status === "SKIP").length

  return { total, passed, failed, skipped }
}
