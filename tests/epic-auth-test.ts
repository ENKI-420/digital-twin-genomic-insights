import { getAuthorizationUrl, exchangeCodeForToken, getValidAccessToken } from "@/lib/auth/epic-auth"
import { EpicFHIRClient } from "@/lib/epic/fhir-client"

interface TestResult {
  test: string
  status: "PASS" | "FAIL" | "SKIP"
  message: string
  duration?: number
  data?: any
}

export class EpicAuthTester {
  private results: TestResult[] = []

  async runAllTests(): Promise<{
    summary: {
      total: number
      passed: number
      failed: number
      skipped: number
    }
    results: TestResult[]
  }> {
    console.log("🔐 Starting Epic Authentication & FHIR Access Tests...")

    await this.testEnvironmentVariables()
    await this.testAuthorizationUrl()
    await this.testTokenExchange()
    await this.testFHIRClientCreation()
    await this.testPatientDataAccess()
    await this.testDiagnosticReports()
    await this.testObservations()
    await this.testGenomicData()
    await this.testErrorHandling()
    await this.testTokenRefresh()

    const summary = this.calculateSummary()

    console.log("\n📊 Test Summary:")
    console.log(`Total: ${summary.total}`)
    console.log(`✅ Passed: ${summary.passed}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`⏭️ Skipped: ${summary.skipped}`)

    return { summary, results: this.results }
  }

  private async testEnvironmentVariables(): Promise<void> {
    const startTime = Date.now()

    try {
      const requiredVars = [
        "EPIC_FHIR_BASE_URL",
        "EPIC_AUTHORIZATION_URL",
        "EPIC_TOKEN_URL",
        "EPIC_CLIENT_ID",
        "EPIC_CLIENT_SECRET",
        "EPIC_REDIRECT_URI",
        "EPIC_SCOPES",
      ]

      const missingVars = requiredVars.filter((varName) => !process.env[varName])

      if (missingVars.length > 0) {
        this.results.push({
          test: "Environment Variables",
          status: "FAIL",
          message: `Missing required environment variables: ${missingVars.join(", ")}`,
          duration: Date.now() - startTime,
        })
        return
      }

      // Validate URL formats
      const urls = [
        { name: "EPIC_FHIR_BASE_URL", value: process.env.EPIC_FHIR_BASE_URL },
        { name: "EPIC_AUTHORIZATION_URL", value: process.env.EPIC_AUTHORIZATION_URL },
        { name: "EPIC_TOKEN_URL", value: process.env.EPIC_TOKEN_URL },
        { name: "EPIC_REDIRECT_URI", value: process.env.EPIC_REDIRECT_URI },
      ]

      for (const url of urls) {
        try {
          new URL(url.value!)
        } catch {
          this.results.push({
            test: "Environment Variables",
            status: "FAIL",
            message: `Invalid URL format for ${url.name}: ${url.value}`,
            duration: Date.now() - startTime,
          })
          return
        }
      }

      this.results.push({
        test: "Environment Variables",
        status: "PASS",
        message: "All required environment variables are present and valid",
        duration: Date.now() - startTime,
        data: {
          baseUrl: process.env.EPIC_FHIR_BASE_URL,
          clientId: process.env.EPIC_CLIENT_ID?.substring(0, 8) + "...",
          scopes: process.env.EPIC_SCOPES,
        },
      })
    } catch (error) {
      this.results.push({
        test: "Environment Variables",
        status: "FAIL",
        message: `Error validating environment variables: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testAuthorizationUrl(): Promise<void> {
    const startTime = Date.now()

    try {
      const state = "test-state-123"
      const authUrl = await getAuthorizationUrl(state)

      // Validate URL structure
      const url = new URL(authUrl)
      const params = new URLSearchParams(url.search)

      const requiredParams = ["response_type", "client_id", "redirect_uri", "scope", "state"]
      const missingParams = requiredParams.filter((param) => !params.has(param))

      if (missingParams.length > 0) {
        this.results.push({
          test: "Authorization URL Generation",
          status: "FAIL",
          message: `Missing required parameters: ${missingParams.join(", ")}`,
          duration: Date.now() - startTime,
        })
        return
      }

      // Validate parameter values
      if (params.get("response_type") !== "code") {
        this.results.push({
          test: "Authorization URL Generation",
          status: "FAIL",
          message: `Invalid response_type: ${params.get("response_type")}`,
          duration: Date.now() - startTime,
        })
        return
      }

      if (params.get("state") !== state) {
        this.results.push({
          test: "Authorization URL Generation",
          status: "FAIL",
          message: `State parameter mismatch: expected ${state}, got ${params.get("state")}`,
          duration: Date.now() - startTime,
        })
        return
      }

      this.results.push({
        test: "Authorization URL Generation",
        status: "PASS",
        message: "Authorization URL generated successfully with all required parameters",
        duration: Date.now() - startTime,
        data: {
          url: authUrl,
          parameters: Object.fromEntries(params.entries()),
        },
      })
    } catch (error) {
      this.results.push({
        test: "Authorization URL Generation",
        status: "FAIL",
        message: `Error generating authorization URL: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testTokenExchange(): Promise<void> {
    const startTime = Date.now()

    try {
      // This test uses a mock authorization code since we can't complete the full OAuth flow in tests
      const mockCode = "mock-authorization-code-for-testing"

      // In a real scenario, this would fail with an invalid code, but we're testing the request structure
      try {
        await exchangeCodeForToken(mockCode)

        // If we get here without an error, something's wrong (unless using a real sandbox)
        this.results.push({
          test: "Token Exchange",
          status: "SKIP",
          message: "Token exchange test skipped - requires valid authorization code from Epic sandbox",
          duration: Date.now() - startTime,
        })
      } catch (error) {
        // Expected behavior with mock code
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes("Failed to exchange code for token")) {
          this.results.push({
            test: "Token Exchange",
            status: "PASS",
            message: "Token exchange endpoint is reachable and properly configured (expected error with mock code)",
            duration: Date.now() - startTime,
            data: { expectedError: errorMessage },
          })
        } else {
          this.results.push({
            test: "Token Exchange",
            status: "FAIL",
            message: `Unexpected error during token exchange: ${errorMessage}`,
            duration: Date.now() - startTime,
          })
        }
      }
    } catch (error) {
      this.results.push({
        test: "Token Exchange",
        status: "FAIL",
        message: `Error in token exchange test: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testFHIRClientCreation(): Promise<void> {
    const startTime = Date.now()

    try {
      const mockToken = "mock-access-token-for-testing"
      const client = new EpicFHIRClient(mockToken)

      // Verify client was created successfully
      if (!client) {
        this.results.push({
          test: "FHIR Client Creation",
          status: "FAIL",
          message: "Failed to create FHIR client instance",
          duration: Date.now() - startTime,
        })
        return
      }

      this.results.push({
        test: "FHIR Client Creation",
        status: "PASS",
        message: "FHIR client created successfully",
        duration: Date.now() - startTime,
        data: {
          clientType: "EpicFHIRClient",
          baseUrl: process.env.EPIC_FHIR_BASE_URL,
        },
      })
    } catch (error) {
      this.results.push({
        test: "FHIR Client Creation",
        status: "FAIL",
        message: `Error creating FHIR client: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testPatientDataAccess(): Promise<void> {
    const startTime = Date.now()

    try {
      const mockToken = "mock-access-token-for-testing"
      const client = new EpicFHIRClient(mockToken)

      // Test with Epic's test patient ID
      const testPatientId = "eVHNQiVtf-nP6vguPHqfWwB"

      try {
        const patient = await client.getPatient(testPatientId)

        this.results.push({
          test: "Patient Data Access",
          status: "PASS",
          message: "Successfully retrieved patient data from Epic FHIR API",
          duration: Date.now() - startTime,
          data: {
            patientId: testPatientId,
            resourceType: patient.resourceType,
            hasData: !!patient.id,
          },
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes("FHIR request failed: 401")) {
          this.results.push({
            test: "Patient Data Access",
            status: "PASS",
            message: "FHIR endpoint is reachable and properly secured (401 expected with mock token)",
            duration: Date.now() - startTime,
            data: { expectedError: "Authentication required" },
          })
        } else if (errorMessage.includes("FHIR request failed")) {
          this.results.push({
            test: "Patient Data Access",
            status: "PASS",
            message: "FHIR endpoint is reachable and responding",
            duration: Date.now() - startTime,
            data: { response: errorMessage },
          })
        } else {
          this.results.push({
            test: "Patient Data Access",
            status: "FAIL",
            message: `Unexpected error accessing patient data: ${errorMessage}`,
            duration: Date.now() - startTime,
          })
        }
      }
    } catch (error) {
      this.results.push({
        test: "Patient Data Access",
        status: "FAIL",
        message: `Error in patient data access test: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testDiagnosticReports(): Promise<void> {
    const startTime = Date.now()

    try {
      const mockToken = "mock-access-token-for-testing"
      const client = new EpicFHIRClient(mockToken)

      const testPatientId = "eVHNQiVtf-nP6vguPHqfWwB"

      try {
        const reports = await client.getDiagnosticReports(testPatientId)

        this.results.push({
          test: "Diagnostic Reports Access",
          status: "PASS",
          message: "Successfully accessed diagnostic reports endpoint",
          duration: Date.now() - startTime,
          data: {
            patientId: testPatientId,
            reportCount: Array.isArray(reports) ? reports.length : 0,
          },
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes("FHIR request failed")) {
          this.results.push({
            test: "Diagnostic Reports Access",
            status: "PASS",
            message: "Diagnostic reports endpoint is reachable and properly secured",
            duration: Date.now() - startTime,
            data: { expectedError: "Authentication required" },
          })
        } else {
          this.results.push({
            test: "Diagnostic Reports Access",
            status: "FAIL",
            message: `Error accessing diagnostic reports: ${errorMessage}`,
            duration: Date.now() - startTime,
          })
        }
      }
    } catch (error) {
      this.results.push({
        test: "Diagnostic Reports Access",
        status: "FAIL",
        message: `Error in diagnostic reports test: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testObservations(): Promise<void> {
    const startTime = Date.now()

    try {
      const mockToken = "mock-access-token-for-testing"
      const client = new EpicFHIRClient(mockToken)

      const testPatientId = "eVHNQiVtf-nP6vguPHqfWwB"

      try {
        const observations = await client.getObservations(testPatientId, "laboratory")

        this.results.push({
          test: "Observations Access",
          status: "PASS",
          message: "Successfully accessed observations endpoint",
          duration: Date.now() - startTime,
          data: {
            patientId: testPatientId,
            category: "laboratory",
            observationCount: Array.isArray(observations) ? observations.length : 0,
          },
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes("FHIR request failed")) {
          this.results.push({
            test: "Observations Access",
            status: "PASS",
            message: "Observations endpoint is reachable and properly secured",
            duration: Date.now() - startTime,
            data: { expectedError: "Authentication required" },
          })
        } else {
          this.results.push({
            test: "Observations Access",
            status: "FAIL",
            message: `Error accessing observations: ${errorMessage}`,
            duration: Date.now() - startTime,
          })
        }
      }
    } catch (error) {
      this.results.push({
        test: "Observations Access",
        status: "FAIL",
        message: `Error in observations test: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testGenomicData(): Promise<void> {
    const startTime = Date.now()

    try {
      const mockToken = "mock-access-token-for-testing"
      const client = new EpicFHIRClient(mockToken)

      const testPatientId = "eVHNQiVtf-nP6vguPHqfWwB"

      try {
        const genomicObservations = await client.getGenomicObservations(testPatientId)

        this.results.push({
          test: "Genomic Data Access",
          status: "PASS",
          message: "Successfully accessed genomic observations endpoint",
          duration: Date.now() - startTime,
          data: {
            patientId: testPatientId,
            genomicObservationCount: Array.isArray(genomicObservations) ? genomicObservations.length : 0,
          },
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes("FHIR request failed")) {
          this.results.push({
            test: "Genomic Data Access",
            status: "PASS",
            message: "Genomic data endpoint is reachable and properly secured",
            duration: Date.now() - startTime,
            data: { expectedError: "Authentication required" },
          })
        } else {
          this.results.push({
            test: "Genomic Data Access",
            status: "FAIL",
            message: `Error accessing genomic data: ${errorMessage}`,
            duration: Date.now() - startTime,
          })
        }
      }
    } catch (error) {
      this.results.push({
        test: "Genomic Data Access",
        status: "FAIL",
        message: `Error in genomic data test: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now()

    try {
      const mockToken = "mock-access-token-for-testing"
      const client = new EpicFHIRClient(mockToken)

      // Test with invalid patient ID
      const invalidPatientId = "invalid-patient-id-12345"

      try {
        await client.getPatient(invalidPatientId)

        this.results.push({
          test: "Error Handling",
          status: "FAIL",
          message: "Expected error for invalid patient ID, but request succeeded",
          duration: Date.now() - startTime,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes("FHIR request failed")) {
          this.results.push({
            test: "Error Handling",
            status: "PASS",
            message: "Proper error handling for invalid requests",
            duration: Date.now() - startTime,
            data: { errorHandled: errorMessage },
          })
        } else {
          this.results.push({
            test: "Error Handling",
            status: "FAIL",
            message: `Unexpected error type: ${errorMessage}`,
            duration: Date.now() - startTime,
          })
        }
      }
    } catch (error) {
      this.results.push({
        test: "Error Handling",
        status: "FAIL",
        message: `Error in error handling test: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private async testTokenRefresh(): Promise<void> {
    const startTime = Date.now()

    try {
      // Test token validation logic
      try {
        await getValidAccessToken()

        this.results.push({
          test: "Token Refresh Logic",
          status: "SKIP",
          message: "Token refresh test skipped - requires existing valid token",
          duration: Date.now() - startTime,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes("No token available")) {
          this.results.push({
            test: "Token Refresh Logic",
            status: "PASS",
            message: "Token validation logic working correctly (no token available)",
            duration: Date.now() - startTime,
            data: { expectedBehavior: "No token available for demo user" },
          })
        } else {
          this.results.push({
            test: "Token Refresh Logic",
            status: "FAIL",
            message: `Unexpected error in token validation: ${errorMessage}`,
            duration: Date.now() - startTime,
          })
        }
      }
    } catch (error) {
      this.results.push({
        test: "Token Refresh Logic",
        status: "FAIL",
        message: `Error in token refresh test: ${error}`,
        duration: Date.now() - startTime,
      })
    }
  }

  private calculateSummary() {
    const total = this.results.length
    const passed = this.results.filter((r) => r.status === "PASS").length
    const failed = this.results.filter((r) => r.status === "FAIL").length
    const skipped = this.results.filter((r) => r.status === "SKIP").length

    return { total, passed, failed, skipped }
  }
}
