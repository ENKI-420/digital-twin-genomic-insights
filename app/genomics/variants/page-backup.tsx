"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VariantAnalysisPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Variant Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>AI-powered genomic variant classification with ACMG guidelines</p>
          <p className="text-sm text-gray-500 mt-4">
            This page is temporarily simplified for deployment. Full functionality will be restored soon.
          </p>
          <Button className="mt-4">
            View Variants
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}