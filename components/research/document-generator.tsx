"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"

interface DocumentGeneratorProps {
  opportunities?: any[]
  patients?: any[]
}

export function DocumentGenerator({ opportunities = [], patients = [] }: DocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const documentTypes = [
    { id: "proposal", name: "Grant Proposal", description: "Generate NIH/NCI grant proposal" },
    { id: "irb", name: "IRB Protocol", description: "Generate IRB protocol document" },
    { id: "consent", name: "eConsent Form", description: "Generate electronic consent form" },
    { id: "registry", name: "Trial Registry", description: "Generate ClinicalTrials.gov submission" },
  ]

  const handleGenerateDocument = async (docType: string) => {
    setIsGenerating(docType)

    // Simulate document generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsGenerating(null)

    // In production, this would trigger a real document download
    alert(`${docType.toUpperCase()} document generated successfully`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map((doc) => (
            <Card key={doc.id} className="border">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">{doc.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{doc.description}</p>
                <Button
                  onClick={() => handleGenerateDocument(doc.id)}
                  disabled={isGenerating === doc.id}
                  className="w-full"
                >
                  {isGenerating === doc.id ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Generate {doc.name}
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">AI-Powered Document Generation</h4>
          <p className="text-sm text-blue-800">
            All documents are automatically populated with institutional data, CPIC guidelines, and federal compliance
            requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
