import { NextResponse } from "next/server"
import { institution } from "@/lib/config/institution"

export async function GET() {
  try {
    // Generate dashboard export content
    const dashboardContent = generateDashboardExport()

    return new NextResponse(dashboardContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": 'attachment; filename="research-dashboard-export.html"',
      },
    })
  } catch (error) {
    console.error("Error exporting dashboard:", error)
    return NextResponse.json({ error: "Failed to export dashboard" }, { status: 500 })
  }
}

function generateDashboardExport(): string {
  // In production, this would generate a real dashboard export with current data
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AGENT Research Coordination Dashboard Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    h1 { color: #2563eb; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
    .metric h3 { margin-top: 0; color: #6b7280; }
    .metric p { font-size: 24px; font-weight: bold; margin: 10px 0 0; }
    .section { margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; }
    th { background-color: #f9fafb; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-blue { background-color: #dbeafe; color: #1e40af; }
    .badge-green { background-color: #d1fae5; color: #065f46; }
    .badge-yellow { background-color: #fef3c7; color: #92400e; }
    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>AGENT Research Coordination Dashboard</h1>
      <p>Perpetual Federal Research Coordination Engine (PFRCE)</p>
    </div>
    <div>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p>${institution.name}</p>
    </div>
  </div>

  <div class="metrics">
    <div class="metric">
      <h3>Federal Opportunities</h3>
      <p>47</p>
    </div>
    <div class="metric">
      <h3>Matched Patients</h3>
      <p>156</p>
    </div>
    <div class="metric">
      <h3>Funding Pipeline</h3>
      <p>$2.8M</p>
    </div>
    <div class="metric">
      <h3>Generated Documents</h3>
      <p>23</p>
    </div>
    <div class="metric">
      <h3>Active Coordinations</h3>
      <p>12</p>
    </div>
    <div class="metric">
      <h3>Compliance Score</h3>
      <p>95%</p>
    </div>
  </div>

  <div class="section">
    <h2>Top Federal Opportunities</h2>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Agency</th>
          <th>Due Date</th>
          <th>Budget</th>
          <th>Match Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Precision Oncology Implementation in Clinical Practice</td>
          <td>NIH/NCI</td>
          <td>2024-03-15</td>
          <td>$500,000</td>
          <td><span class="badge badge-green">92%</span></td>
        </tr>
        <tr>
          <td>Genomic Data Integration for Clinical Decision Support</td>
          <td>NIH/NHGRI</td>
          <td>2024-04-01</td>
          <td>$750,000</td>
          <td><span class="badge badge-green">89%</span></td>
        </tr>
        <tr>
          <td>AI-Powered Pandemic Response Platform</td>
          <td>BARDA</td>
          <td>2024-02-28</td>
          <td>$2,000,000</td>
          <td><span class="badge badge-green">84%</span></td>
        </tr>
        <tr>
          <td>Precision Medicine for Military Healthcare</td>
          <td>DOD/CDMRP</td>
          <td>2024-05-15</td>
          <td>$1,500,000</td>
          <td><span class="badge badge-green">87%</span></td>
        </tr>
        <tr>
          <td>AI-Driven Clinical Trial Matching Platform</td>
          <td>HHS/SBIR</td>
          <td>2024-02-28</td>
          <td>$300,000</td>
          <td><span class="badge badge-green">91%</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Patient Trial Matching</h2>
    <table>
      <thead>
        <tr>
          <th>Patient ID</th>
          <th>Condition</th>
          <th>Genomic Profile</th>
          <th>Trial Matches</th>
          <th>Eligibility Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>PAT_001</td>
          <td>Breast Cancer</td>
          <td>HER2+, CYP2D6*4/*4</td>
          <td>NIH_R01_CA_2024_001, DOD_CDMRP_2024_001</td>
          <td><span class="badge badge-green">94%</span></td>
        </tr>
        <tr>
          <td>PAT_002</td>
          <td>Lung Cancer</td>
          <td>EGFR L858R, CYP2C19*2/*2</td>
          <td>NIH_R01_CA_2024_001</td>
          <td><span class="badge badge-green">87%</span></td>
        </tr>
        <tr>
          <td>PAT_003</td>
          <td>Colorectal Cancer</td>
          <td>KRAS G12C, DPYD*2A</td>
          <td>NIH_R01_CA_2024_001, NIH_U01_HG_2024_002</td>
          <td><span class="badge badge-green">91%</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Compliance Status</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Requirement</th>
          <th>Status</th>
          <th>Last Checked</th>
          <th>Next Review</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>IRB</td>
          <td>Annual Continuing Review</td>
          <td><span class="badge badge-green">Compliant</span></td>
          <td>2024-01-15</td>
          <td>2025-01-15</td>
        </tr>
        <tr>
          <td>CPIC</td>
          <td>Level A Evidence Implementation</td>
          <td><span class="badge badge-green">Compliant</span></td>
          <td>2024-01-14</td>
          <td>2024-04-14</td>
        </tr>
        <tr>
          <td>HIPAA</td>
          <td>Data Security Assessment</td>
          <td><span class="badge badge-yellow">Warning</span></td>
          <td>2024-01-10</td>
          <td>2024-02-10</td>
        </tr>
        <tr>
          <td>FDA</td>
          <td>Adverse Event Reporting</td>
          <td><span class="badge badge-green">Compliant</span></td>
          <td>2024-01-13</td>
          <td>2024-01-20</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>AGENT Research Coordination Engine - Powered by Advanced Defense Solutions</p>
    <p>CONFIDENTIAL - For authorized use only</p>
  </div>
</body>
</html>`
}
