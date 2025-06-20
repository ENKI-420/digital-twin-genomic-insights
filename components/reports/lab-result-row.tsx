"use client"

import { useState } from "react"
import type { LabResult } from "@/types/medical-reports"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChevronDown, ChevronUp } from "lucide-react"

interface LabResultRowProps {
  result: LabResult
}

export function LabResultRow({ result }: LabResultRowProps) {
  const [showTrend, setShowTrend] = useState(false)

  const hasTrendData = result.previousResults && result.previousResults.length > 0

  // Prepare data for chart if numeric values
  const chartData = hasTrendData
    ? [
        ...result.previousResults.map((prev) => ({
          date: new Date(prev.date).toLocaleDateString(),
          value: typeof prev.value === "number" ? prev.value : null,
        })),
        {
          date: "Current",
          value: typeof result.value === "number" ? result.value : null,
        },
      ]
    : []

  // Check if we can show a chart (all numeric values)
  const canShowChart = chartData.every((item) => item.value !== null)

  // Get status color
  const getStatusColor = () => {
    switch (result.status) {
      case "normal":
        return "text-green-600"
      case "abnormal":
        return "text-amber-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="py-3 px-4">{result.name}</td>
        <td className={`py-3 px-4 font-medium ${getStatusColor()}`}>
          {result.value} {result.unit}
        </td>
        <td className="py-3 px-4">{result.referenceRange}</td>
        <td className="py-3 px-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              result.status === "normal"
                ? "bg-green-100 text-green-800"
                : result.status === "abnormal"
                  ? "bg-amber-100 text-amber-800"
                  : result.status === "critical"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
          </span>
        </td>
        <td className="py-3 px-4">
          {hasTrendData && (
            <Button variant="ghost" size="sm" onClick={() => setShowTrend(!showTrend)}>
              {showTrend ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showTrend ? "Hide Trend" : "Show Trend"}
            </Button>
          )}
        </td>
      </tr>
      {showTrend && hasTrendData && (
        <tr>
          <td colSpan={5} className="py-4 px-4 bg-gray-50">
            <div className="h-64">
              {canShowChart ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Trend data is not available in chart format for this result.</p>
                </div>
              )}
            </div>
            <div className="mt-2">
              <h4 className="font-medium text-sm mb-1">Historical Values</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.previousResults?.map((prev, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{new Date(prev.date).toLocaleDateString()}</td>
                        <td className="py-2 px-4">
                          {prev.value} {result.unit}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50">
                      <td className="py-2 px-4 font-medium">Current</td>
                      <td className="py-2 px-4 font-medium">
                        {result.value} {result.unit}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
