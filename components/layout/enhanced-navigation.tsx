"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { designTokens, getAgentColor } from "@/lib/design-tokens"
import {
  Home,
  Target,
  Dna,
  Activity,
  Cpu,
  MessageSquare,
  Layers,
  Database,
  Settings,
  Share2,
  FileText,
  Download,
  BookOpen,
  Bell,
  Menu,
  X,
  LogOut,
  Brain,
  FlaskConical,
  Stethoscope,
  Users,
  ChevronDown,
  ChevronRight,
  Zap,
  Shield,
  Network,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeColor?: string
  description?: string
  agentType?: string
  children?: NavigationItem[]
}

interface EnhancedNavigationProps {
  children: React.ReactNode
  variant?: "dashboard" | "landing" | "clinical"
}

export function EnhancedNavigation({ children, variant = "dashboard" }: EnhancedNavigationProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'iris-agents'])

  // Enhanced IRIS MCP Navigation Structure
  const navigationStructure: Record<string, NavigationItem[]> = {
    main: [
      {
        name: "Overview",
        href: "/dashboard",
        icon: Home,
        description: "Platform overview and quick access"
      },
      {
        name: "IRIS MCP Platform",
        href: "/iris-mcp",
        icon: Brain,
        badge: "Enhanced",
        badgeColor: "iris",
        description: "Multi-agent AI platform"
      },
      {
        name: "Genomic Twin",
        href: "/genomic-viewer",
        icon: Dna,
        description: "3D genomic visualization platform"
      },
      {
        name: "Digital Twin",
        href: "/digital-twin",
        icon: Cpu,
        badge: "AI",
        badgeColor: "genomic",
        description: "Patient digital twin modeling"
      }
    ],
    "iris-agents": [
      {
        name: "Genomic Analysis",
        href: "/agents/genomic-analysis",
        icon: Activity,
        agentType: "GENOMIC_ANALYSIS_AGENT",
        description: "Variant classification and interpretation"
      },
      {
        name: "Drug Discovery",
        href: "/agents/drug-discovery",
        icon: FlaskConical,
        agentType: "DRUG_DISCOVERY_AGENT",
        badge: "ADMET",
        badgeColor: "agents",
        description: "AI-powered compound analysis"
      },
      {
        name: "Clinical Decision Support",
        href: "/agents/clinical-decision",
        icon: Stethoscope,
        agentType: "CLINICAL_DECISION_SUPPORT_AGENT",
        description: "Evidence-based recommendations"
      },
      {
        name: "Trial Matching",
        href: "/agents/trial-matching",
        icon: Target,
        agentType: "TRIAL_MATCHING_AGENT",
        badge: "94% Accuracy",
        badgeColor: "status",
        description: "Automated patient-trial matching"
      },
      {
        name: "Biomarker Discovery",
        href: "/agents/biomarker-discovery",
        icon: Search,
        agentType: "BIOMARKER_DISCOVERY_AGENT",
        description: "Novel biomarker identification"
      }
    ],
    research: [
      {
        name: "Research Dashboard",
        href: "/research",
        icon: Layers,
        description: "Research project management"
      },
      {
        name: "Batch Analysis",
        href: "/batch-analysis",
        icon: Database,
        description: "High-throughput genomic analysis"
      },
      {
        name: "Federated Learning",
        href: "/federated-learning",
        icon: Network,
        badge: "Beta",
        badgeColor: "status",
        description: "Multi-institutional collaboration"
      },
      {
        name: "Analytics Engine",
        href: "/analytics",
        icon: BarChart3,
        description: "Advanced analytics and reporting"
      }
    ],
    clinical: [
      {
        name: "Patient Portal",
        href: "/patients",
        icon: Users,
        description: "Patient management and records"
      },
      {
        name: "Epic FHIR Gateway",
        href: "/epic-fhir",
        icon: FileText,
        badge: "Active",
        badgeColor: "status",
        description: "EHR integration platform"
      },
      {
        name: "CDS Hooks",
        href: "/cds-hooks",
        icon: Zap,
        description: "Clinical decision support alerts"
      },
      {
        name: "Report Generation",
        href: "/reports",
        icon: Download,
        description: "Clinical report automation"
      }
    ],
    tools: [
      {
        name: "3D Visualization",
        href: "/3d-platform",
        icon: Cpu,
        description: "Interactive 3D molecular viewer"
      },
      {
        name: "Knowledge Library",
        href: "/library",
        icon: BookOpen,
        description: "Clinical knowledge base"
      },
      {
        name: "Data Export",
        href: "/export",
        icon: Share2,
        description: "Secure data sharing"
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Platform configuration"
      }
    ]
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = pathname === item.href
    const agentColor = item.agentType ? getAgentColor(item.agentType) : designTokens.colors.iris[500]

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-gray-100 hover:text-gray-900",
          level > 0 && "ml-6",
          isActive && "bg-iris-50 text-iris-700 border-r-2 border-iris-500"
        )}
        style={isActive ? { borderRightColor: agentColor } : {}}
      >
        <item.icon
          className={cn(
            "mr-3 h-5 w-5 transition-colors",
            isActive ? "text-iris-600" : "text-gray-500 group-hover:text-gray-700"
          )}
          style={isActive && item.agentType ? { color: agentColor } : {}}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span>{item.name}</span>
            {item.badge && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2 text-xs",
                  item.badgeColor === "iris" && "bg-iris-100 text-iris-700",
                  item.badgeColor === "genomic" && "bg-genomic-dna/10 text-genomic-dna",
                  item.badgeColor === "agents" && "bg-agents-drugDiscovery/10 text-agents-drugDiscovery",
                  item.badgeColor === "status" && "bg-status-success/10 text-status-success"
                )}
              >
                {item.badge}
              </Badge>
            )}
          </div>
          {item.description && !isSidebarOpen && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
          )}
        </div>
      </Link>
    )
  }

  const renderNavigationSection = (title: string, items: NavigationItem[]) => {
    const isExpanded = expandedSections.includes(title)

    return (
      <div key={title} className="mb-6">
        <button
          onClick={() => toggleSection(title)}
          className="flex items-center justify-between w-full mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>{title.replace('-', ' ')}</span>
          {isExpanded ?
            <ChevronDown className="h-3 w-3" /> :
            <ChevronRight className="h-3 w-3" />
          }
        </button>
        {isExpanded && (
          <nav className="space-y-1">
            {items.map(item => renderNavigationItem(item))}
          </nav>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "w-80 translate-x-0" : "w-16 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Enhanced Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${designTokens.colors.iris[500]}, ${designTokens.colors.iris[700]})` }}
              >
                <Brain className="h-6 w-6" />
              </div>
              {isSidebarOpen && (
                <div className="ml-3">
                  <div className="text-lg font-bold text-iris-700">IRIS MCP</div>
                  <div className="text-xs text-gray-500">Enhanced AI Platform</div>
                </div>
              )}
            </div>
            <button
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Enhanced Sidebar Content */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {Object.entries(navigationStructure).map(([section, items]) =>
              renderNavigationSection(section, items)
            )}
          </div>

          {/* Enhanced User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 border-2 border-iris-200">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-iris-100 text-iris-700 font-semibold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Security</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Enhanced Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <button
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Enhanced IRIS MCP Platform
                </h1>
                <p className="text-xs text-gray-500">
                  Advanced Genomic Insights with Multi-Agent AI
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
              </Button>

              <Badge variant="outline" className="hidden md:flex border-status-success text-status-success">
                <Shield className="mr-1 h-3 w-3" />
                HIPAA Compliant
              </Badge>

              <Badge variant="outline" className="hidden md:flex border-iris-500 text-iris-600">
                <Network className="mr-1 h-3 w-3" />
                Epic FHIR Active
              </Badge>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-status-error rounded-full"></span>
              </Button>

              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-iris-100 text-iris-700 text-sm font-semibold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Enhanced Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}