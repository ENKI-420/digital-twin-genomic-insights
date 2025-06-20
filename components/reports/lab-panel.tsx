import type { LabPanel } from "@/types/medical-reports"
import { LabResultRow } from "./lab-result-row"

interface LabPanelProps {
  panel: LabPanel
}

export function LabPanel({ panel }: LabPanelProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">{panel.name}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-3 px-4">Test</th>
              <th className="text-left py-3 px-4">Result</th>
              <th className="text-left py-3 px-4">Reference Range</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Trend</th>
            </tr>
          </thead>
          <tbody>
            {panel.results.map((result, index) => (
              <LabResultRow key={index} result={result} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
