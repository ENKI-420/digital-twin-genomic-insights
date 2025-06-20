"use client"

import { useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card, CardContent, CardHeader, CardTitle,
  CardDescription, CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users, FileText, Dna, MessageSquare, Clock, AlertTriangle
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin?callbackUrl=/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    )
  }

  if (!user) return <div className="text-center mt-10 text-sm text-gray-500">Redirecting...</div>

  return (
    <>
      <Head>
        <title>Dashboard | AGENT AI</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <StatsCard title="Patients" icon={<Users className="h-4 w-4 text-gray-500" />} value="5" subtitle={user.role === "patient" ? "Your profile" : "Total patients"} />
          <StatsCard title="Reports" icon={<FileText className="h-4 w-4 text-gray-500" />} value="12" subtitle="Medical reports" />
          <StatsCard title="Genomic Reports" icon={<Dna className="h-4 w-4 text-gray-500" />} value="3" subtitle="Genomic test results" />
          <StatsCard title="AI Interactions" icon={<MessageSquare className="h-4 w-4 text-gray-500" />} value="8" subtitle="AI assistant conversations" />

          {/* High Risk Variant Callout */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-amber-800">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                High-Risk Variants
              </CardTitle>
              <CardDescription className="text-amber-700">
                3 variants with high reclassification probability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 mb-4">
                Specific recommendations available for variants with high likelihood of reclassification.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                <Link href="/variant-recommendations">View Recommendations</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Conflict Resolution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Conflict Resolution Evolution</CardTitle>
              <CardDescription>Track how variant classification has evolved</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Understand how conflict resolution methodologies have improved classification reliability.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/conflict-evolution" className="text-blue-600 hover:underline flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                View Evolution Tracker
              </Link>
            </CardFooter>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg font-medium">
                <Dna className="mr-2 h-5 w-5 text-blue-600" />
                Genetic Timeline
              </CardTitle>
              <p className="text-sm text-gray-500">Chronological view of genetic findings</p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-2xl font-bold">20 Findings</div>
                <div className="text-sm text-gray-500">Across 4 test reports</div>
              </div>
              <Button variant="outline" asChild className="w-full">
                <Link href="/genetic-timeline">View Genetic Timeline</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Patient + Activity Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <p className="text-sm text-gray-500">{user.role === "patient" ? "Your profile" : "Recent patients"}</p>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {[
                  { name: "John Smith", dob: "05/12/1980", id: 1 },
                  { name: "Sarah Johnson", dob: "10/23/1975", id: 2 },
                  { name: "Michael Brown", dob: "03/15/1990", id: 3 }
                ].map((p) => (
                  <li key={p.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-500">DOB: {p.dob}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/patients/${p.id}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-gray-500">Latest reports and conversations</p>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                <ActivityItem icon={<FileText className="h-5 w-5 text-blue-500" />} title="New medical report" desc="Complete Blood Count - 05/10/2023" />
                <ActivityItem icon={<Dna className="h-5 w-5 text-purple-500" />} title="New genomic report" desc="Genetic Panel - 04/28/2023" />
                <ActivityItem icon={<MessageSquare className="h-5 w-5 text-green-500" />} title="AI Conversation" desc="Q: What do my latest test results mean?" timestamp="05/15/2023, 2:45 PM" />
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function StatsCard({ title, icon, value, subtitle }: { title: string, icon: React.ReactNode, value: string, subtitle: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ icon, title, desc, timestamp }: { icon: React.ReactNode, title: string, desc: string, timestamp?: string }) {
  return (
    <li className="py-3 flex items-start">
      <div className="mr-4 mt-1">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
        {timestamp && <p className="text-xs text-gray-400">{timestamp}</p>}
      </div>
    </li>
  )
}
