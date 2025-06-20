import { AIConflictPredictor } from "@/components/evidence/ai-conflict-predictor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangleIcon, BuildingIcon } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "AI Conflict Resolution Predictions",
  description: "AI-powered predictions for future trends in variant classification and conflict resolution",
}

export default function AIPredictionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Conflict Resolution Predictions</h1>
        <p className="text-gray-500 mt-2">
          Explore AI-powered predictions for how variant classification and conflict resolution will evolve over time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <AlertTriangleIcon className="h-5 w-5 mr-2 text-amber-600" />
              High Reclassification Risk Variants Detected
            </CardTitle>
            <CardDescription className="text-amber-700">
              Our AI system has identified several variants with high probability of reclassification in the near future
            </CardDescription>
          </CardHeader>
          <CardContent className="text-amber-700">
            <p>
              These variants require immediate attention and specific action plans to manage potential reclassification
              impacts on patients and clinical care.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
              <Link href="/variant-recommendations">View Variant-Specific Recommendations</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <BuildingIcon className="h-5 w-5 mr-2 text-blue-600" />
              Laboratory Approach Comparison
            </CardTitle>
            <CardDescription className="text-blue-700">
              Compare conflict resolution approaches and outcomes across different genetic testing laboratories
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p>
              Understand which methodologies produce the best outcomes, identify best practices, and see how your
              approach compares to industry benchmarks.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="border-blue-300 text-blue-800 hover:bg-blue-100">
              <Link href="/lab-comparison">Compare Laboratory Approaches</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AIConflictPredictor />
    </div>
  )
}
