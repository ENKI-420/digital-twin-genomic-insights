import { PatientTrialMatching } from "@/components/research/patient-trial-matching"

export default function TrialMatchingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Clinical Trial Patient Matching</h1>
      <PatientTrialMatching />
    </div>
  )
}
