import { ConflictEvolutionTracker } from "@/components/evidence/conflict-evolution-tracker"

export default function ConflictEvolutionPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Conflict Resolution Evolution</h1>
      <p className="text-gray-600 mb-8">
        Track how variant classification and conflict resolution approaches have evolved over time as new evidence
        emerges and methodologies improve.
      </p>
      <ConflictEvolutionTracker />
    </div>
  )
}
