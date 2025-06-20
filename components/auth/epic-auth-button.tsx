"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Shield, Database, Activity } from "lucide-react"

interface EpicAuthButtonProps {
  onAuthSuccess?: (session: any) => void
  onAuthError?: (error: string) => void
}

export function EpicAuthButton({ onAuthSuccess, onAuthError }: EpicAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [authUrl, setAuthUrl] = useState<string | null>(null)

  const handleEpicAuth = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/epic/authorize")
      const data = await response.json()

      if (data.success) {
        setAuthUrl(data.authorizationUrl)
        // Redirect to Epic authorization
        window.location.href = data.authorizationUrl
      } else {
        onAuthError?.(data.error || "Failed to generate authorization URL")
      }
    } catch (error) {
      onAuthError?.(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const testSandboxConnection = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/test/epic-sandbox")
      const data = await response.json()

      if (data.success) {
        console.log("Epic sandbox test results:", data)

        if (data.summary.passed > 0) {
          onAuthSuccess?.(data)
        } else {
          onAuthError?.("Epic sandbox tests failed")
        }
      } else {
        onAuthError?.(data.error || "Sandbox test failed")
      }
    } catch (error) {
      onAuthError?.(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Epic Sandbox Authentication
        </CardTitle>
        <CardDescription>
          Connect to Epic's FHIR sandbox environment to access real patient data for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-sm">FHIR R4 API</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Real Patient Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-sm">OAuth2 Secured</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Available Test Patients:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Camron Smart (eVHNQiVtf-nP6vguPHqfWwB)</Badge>
            <Badge variant="outline">Derrick Lin (erXuFYUfucBZaryVksYEcMg3)</Badge>
            <Badge variant="outline">Nancy Smart (eq081-VQEgP8drUUqCWzHfw3)</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Required Scopes:</h4>
          <div className="text-sm text-muted-foreground">launch, openid, fhirUser, patient/*.read, offline_access</div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleEpicAuth} disabled={isLoading} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            {isLoading ? "Connecting..." : "Connect to Epic Sandbox"}
          </Button>

          <Button variant="outline" onClick={testSandboxConnection} disabled={isLoading}>
            Test Connection
          </Button>
        </div>

        {authUrl && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Authorization URL Generated:</strong>
              <br />
              You will be redirected to Epic's authorization server to complete the authentication flow.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
