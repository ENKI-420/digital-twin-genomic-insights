import { EpicAuthTestDashboard } from "@/components/testing/epic-auth-test-dashboard"

export default function EpicAuthTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Epic Authentication Testing</h1>
        <p className="text-gray-600">
          Comprehensive testing suite for Epic OAuth2 authentication and FHIR API access. This dashboard validates all
          aspects of the Epic integration for Norton Healthcare.
        </p>
      </div>

      <EpicAuthTestDashboard />
    </div>
  )
}
