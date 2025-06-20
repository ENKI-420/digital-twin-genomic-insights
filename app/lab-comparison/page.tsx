import { LabComparison } from "@/components/evidence/lab-comparison"

export const metadata = {
  title: "Laboratory Conflict Resolution Comparison",
  description:
    "Compare conflict resolution approaches, methodologies, and outcomes across genetic testing laboratories",
}

export default function LabComparisonPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <LabComparison />
    </div>
  )
}
