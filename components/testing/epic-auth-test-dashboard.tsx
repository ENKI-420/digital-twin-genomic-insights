"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, SkipForward, Play, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TestResult {
  test: string
  status: "PASS" | "FAIL" | "SKIP"
  message: string
  duration?: number
  data?: any
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  skipped: number
}

interface TestResponse {
  success: boolean
  timestamp: string
  environment?: any
  summary: TestSummary
  results: TestResult[]
  error?: string
}

export function EpicAuthTestDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setIsRunning(true)
    setError(null)
    setTestResults(null)

    try {
      const response = await fetch("/api/test/epic-auth", {
        method: "GET",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run tests")
      }

      setTestResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "SKIP":
        return <SkipForward className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === "PASS" ? "default" : status === "FAIL" ? "destructive" : "secondary"
    return (
      <Badge variant={variant} className="ml-2">
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🔐 Epic Authentication & FHIR Access Tests</CardTitle>
          <CardDescription>
            Comprehensive testing of Epic OAuth2 flow, FHIR API access, and authentication mechanisms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={runTests} disabled={isRunning} className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Epic Auth Tests
                </>
              )}
            </Button>

            {testResults && (
              <Button variant="outline" onClick={runTests} disabled={isRunning} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Re-run Tests
              </Button>
            )}
          </div>

          {error && (
            <Alert className="mb-6">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {testResults && (
            <div className="space-y-6">
              {/* Environment Info */}
              {testResults.environment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Environment Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Environment:</strong> {testResults.environment.nodeEnv}
                      </div>
                      <div>
                        <strong>Epic Base URL:</strong> {testResults.environment.epicBaseUrl}
                      </div>
                      <div>
                        <strong>Client ID Configured:</strong>{" "}
                        {testResults.environment.hasClientId ? "✅ Yes" : "❌ No"}
                      </div>
                      <div>
                        <strong>Client Secret Configured:</strong>{" "}
                        {testResults.environment.hasClientSecret ? "✅ Yes" : "❌ No"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Test Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Summary</CardTitle>
                  <CardDescription>Completed at {new Date(testResults.timestamp).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{testResults.summary.total}</div>
                      <div className="text-sm text-blue-600">Total Tests</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                      <div className="text-sm text-green-600">Passed</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{testResults.summary.skipped}</div>
                      <div className="text-sm text-yellow-600">Skipped</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testResults.results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-medium">{result.test}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          {result.duration && <span className="text-sm text-gray-500">{result.duration}ms</span>}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{result.message}</p>

                        {result.data && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Details</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
