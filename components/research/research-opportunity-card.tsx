"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

interface Opportunity {
  id: string
  source: string
  type: string
  title: string
  agency: string
  institute: string
  announcementNumber: string
  dueDate: string
  budgetCap: number
  duration: number
  description: string
  keyWords: string[]
  cpicAlignment: {
    genes: string[]
    drugs: string[]
    evidenceLevel: string
    implementationScore: number
  }
  matchScore: number
  status: string
}

interface ResearchOpportunityCardProps {
  opportunity: Opportunity
  onGenerateProposal: (id: string) => void
}

export function ResearchOpportunityCard({ opportunity, onGenerateProposal }: ResearchOpportunityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{opportunity.title}</CardTitle>
          <Badge>
            {opportunity.source} {opportunity.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">{opportunity.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Agency</p>
              <p className="font-medium">
                {opportunity.agency} / {opportunity.institute}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium">{opportunity.dueDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Budget</p>
              <p className="font-medium">${opportunity.budgetCap.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-medium">{opportunity.duration} months</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">CPIC Alignment</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {opportunity.cpicAlignment.genes.slice(0, 3).map((gene) => (
                <Badge key={gene} variant="outline" className="text-xs">
                  {gene}
                </Badge>
              ))}
              {opportunity.cpicAlignment.genes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.cpicAlignment.genes.length - 3} more
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Level {opportunity.cpicAlignment.evidenceLevel}</Badge>
              <Badge className="bg-green-100 text-green-800">
                {opportunity.cpicAlignment.implementationScore}% Match
              </Badge>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={() => onGenerateProposal(opportunity.id)} className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Generate Proposal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
