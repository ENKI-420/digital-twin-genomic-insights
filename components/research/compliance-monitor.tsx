"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, RefreshCw } from "lucide-react"

interface ComplianceMonitorProps {
  complianceScore?: number
}

export function ComplianceMonitor({ complianceScore = 95 }: ComplianceMonitorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString())

  // Mock compliance items
  const complianceItems = [
    {
      id: "1",
      category: "IRB",
      requirement: "Annual Review",
      status: "compliant",
    },
    {
      id: "2",
      category: "CPIC",
      requirement: "Level A Implementation",
      status: "compliant",
    },
    {
      id: "3",
      category: "HIPAA",
      requirement: "Data Security",
      status: "warning",
    },
    {
      id: "4",
      category: "FDA",
      requirement: "Adverse Event Reporting",
      status: "compliant",
    },
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Simulate compliance check
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsRefreshing(false)
    setLastUpdated(new Date().toLocaleString())
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "violation":
        return <Badge className="bg-red-100 text-red-800">Violation</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Monitor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Compliance Score */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Overall Compliance Score</h3>
              <span className="text-2xl font-bold text-green-600">{complianceScore}%</span>
            </div>
            <Progress value={complianceScore} className="h-2 mb-2" />
            <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
          </div>

          {/* Compliance Items */}
          <div className="space-y-3">
            {complianceItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <Badge variant="outline" className="mb-1">
                    {item.category}
                  </Badge>
                  <p className="font-medium">{item.requirement}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Automated Compliance Monitoring</h4>
            <p className="text-sm text-blue-800">
              Compliance status is automatically updated based on institutional data and federal requirement changes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
