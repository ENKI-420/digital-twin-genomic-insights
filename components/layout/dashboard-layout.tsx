"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import {
  FileText,
  Home,
  Settings,
  Database,
  Bell,
  Menu,
  X,
  Download,
  Activity,
  Dna,
  Cpu,
  MessageSquare,
  Layers,
  BookOpen,
  Share2,
  LogOut,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const mainNavItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Research Center", href: "/research", icon: Target },
    { name: "Genomic Viewer", href: "/genomic-viewer", icon: Dna },
    { name: "Mutation Analysis", href: "/mutation-analysis", icon: Activity },
    { name: "Digital Twin", href: "/digital-twin", icon: Cpu },
    { name: "AIDEN Assistant", href: "/chat", icon: MessageSquare },
  ]

  const researchNavItems = [
    { name: "Research Dashboard", href: "/research", icon: Layers },
    { name: "Batch Analysis", href: "/batch-analysis", icon: Database },
    { name: "Advanced Tools", href: "/advanced-tools", icon: Settings },
    { name: "Federated Learning", href: "/federated-learning", icon: Share2 },
    { name: "Epic FHIR", href: "/beaker-reports", icon: FileText },
  ]

  const dataNavItems = [
    { name: "Import Data", href: "/import", icon: Database },
    { name: "Export Results", href: "/export", icon: Download },
    { name: "Share Analysis", href: "/share", icon: Share2 },
    { name: "Research Library", href: "/library", icon: BookOpen },
  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#0a2240] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-400">
                <Dna className="h-5 w-5 text-[#0a2240]" />
              </div>
              <div className="ml-2">
                <div className="text-lg font-bold text-white">AGENT AI</div>
                <div className="text-xs text-gray-300">Advanced Genomic Insights</div>
              </div>
            </div>
            <button
              className="rounded-md p-1 text-gray-300 hover:bg-gray-700 hover:text-white lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-6">
              <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Main Navigation
              </div>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                        isActive ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="mb-6">
              <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Research Tools
              </div>
              <nav className="space-y-1">
                {researchNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                        isActive ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                      />
                      {item.name}
                      {item.name === "Epic FHIR" && <Badge className="ml-auto bg-green-500 text-white">Active</Badge>}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="mb-6">
              <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Data Management
              </div>
              <nav className="space-y-1">
                {dataNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                        isActive ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* User profile */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || user?.email}</p>
                <p className="text-xs text-gray-300">{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</p>
              </div>
              <button
                onClick={() => logout()}
                className="ml-auto rounded-full p-1 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <button
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 text-lg font-semibold text-[#0a2240]">AGILE Advanced Genomic Insights</div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hidden md:flex">
                <FileText className="mr-2 h-4 w-4" />
                Access Beaker Lab Reports
              </Button>
              <Button variant="outline" className="hidden md:flex">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Badge className="bg-green-100 text-green-800">HIPAA Compliant</Badge>
              <Badge className="bg-blue-100 text-blue-800">Epic FHIR Integration</Badge>
              <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600">
                <Bell className="h-6 w-6" />
              </button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">{children}</main>
      </div>
    </div>
  )
}
