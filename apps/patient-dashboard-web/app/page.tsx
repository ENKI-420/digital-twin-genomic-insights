"use client"

import Link from "next/link"
import {
  Users,
  FileText,
  Dna,
  ArrowRight,
  Activity,
  Heart,
  Pill
} from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-3">
            Welcome to Baptist Health GenomicTwin Demo
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
            Experience the future of precision medicine, clinical decision support,
            and community health insights—all in one integrated platform.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link href="/baptist/microsite">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                <Heart className="h-4 w-4" />
                Community Health
              </button>
            </Link>
            <Link href="/patients/BH-0001/digital-twin">
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                <Dna className="h-4 w-4" />
                Digital Twin Demo
              </button>
            </Link>
          </div>
        </header>

        {/* Demo Cards Grid */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Community Report Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Community Report</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Interactive CHNA dashboard with population health insights
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• FY25-27 Louisville CHNA Report</li>
              <li>• Population health metrics</li>
              <li>• Community initiatives tracking</li>
            </ul>
            <Link href="/baptist/microsite">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                View Report
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Digital Twin Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-teal-600" />
              <h3 className="text-xl font-semibold">Patient Digital Twin</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Comprehensive genomic and clinical data visualization
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Pharmacogenomic profiles</li>
              <li>• Clinical trial matching</li>
              <li>• Risk assessment scores</li>
            </ul>
            <Link href="/patients/BH-0001/digital-twin">
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                View Patient
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* CDS-Hooks Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold">CDS-Hooks Demo</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Real-time clinical decision support at point of care
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Medication prescribe alerts</li>
              <li>• Genomic-based dosing</li>
              <li>• Drug interaction warnings</li>
            </ul>
            <Link href="/cds-hooks-demo">
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Try CDS Demo
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Platform Capabilities</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">EHR Integration</h3>
                <p className="text-sm text-gray-600">
                  Seamless Epic/FHIR integration with real-time data sync
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Dna className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Genomic Intelligence</h3>
                <p className="text-sm text-gray-600">
                  Advanced pharmacogenomics and precision medicine insights
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Population Health</h3>
                <p className="text-sm text-gray-600">
                  Data-driven community health initiatives and outcomes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm">
              <strong>Demo Mode:</strong> This is a demonstration environment with simulated patient data.
              Click "Log Out" in the header to return to the login screen.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}