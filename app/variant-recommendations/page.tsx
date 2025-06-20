import { VariantRecommendations } from "@/components/evidence/variant-recommendations"

export const metadata = {
  title: "Variant-Specific Recommendations",
  description: "Specific recommendations for variants with high reclassification risk",
}

export default function VariantRecommendationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Variant-Specific Recommendations</h1>
        <p className="text-gray-500 mt-2">
          Actionable recommendations for variants with high probability of reclassification
        </p>
      </div>

      <VariantRecommendations />
    </div>
  )
}
