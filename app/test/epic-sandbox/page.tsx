"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EpicAuthButton } from "@/components/auth/epic-auth-button"
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"

interface TestResult {
  test: string
  status: "PASS" | "FAIL" | "SKIP"
  message: string
  duration: number
  data?: any
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  skipped: number
}

export default function EpicSandboxTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastTestTime, setLastTestTime] = useState<string | null>(null)

  const runSandboxTests = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/test/epic-sandbox")
      const data = await response.json()

      if (data.success) {
        setTestResults(data.results)
        setSummary(data.summary)
        setLastTestTime(data.timestamp)
      } else {
        console.error("Test failed:", data.error)
      }
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Run tests on page load
    runSandboxTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "SKIP":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS":
        return "bg-green-100 text-green-800"
      case "FAIL":
        return "bg-red-100 text-red-800"
      case "SKIP":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Epic Sandbox Connection Test</h1>
          <p className="text-muted-foreground">Test real connections to Epic's FHIR sandbox environment</p>
        </div>
        <Button onClick={runSandboxTests} disabled={isLoading}>
          {isLoading ? "Running Tests..." : "Run Tests"}
        </Button>
      </div>

      {/* Authentication Section */}
      <EpicAuthButton
        onAuthSuccess={(session) => {
          console.log("Epic auth success:", session)
          runSandboxTests() // Re-run tests after successful auth
        }}
        onAuthError={(error) => {
          console.error("Epic auth error:", error)
        }}
      />

      {/* Test Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
            {lastTestTime && <CardDescription>Last run: {new Date(lastTestTime).toLocaleString()}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Test Results</h2>
        {testResults.map((result, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  {result.test}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                  <span className="text-sm text-muted-foreground">{result.duration}ms</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{result.message}</p>

              {result.data && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium">View Details</summary>
                    <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
                  </details>
                </div>
              )}

              {result.data?.authorizationUrl && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.data.authorizationUrl, "_blank")}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Complete Epic Authentication
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No test results available. Click "Run Tests" to start testing Epic sandbox connection.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
