"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User, LogOut, Home, Users, Settings, Menu, X, MessageSquare, FileText,
  Dna, Brain, Stethoscope, FlaskConical, Search, Target, LineChart,
  BookOpen, Bell, Calendar, Shield, Database, Microscope, Activity,
  Zap, Network, ChevronDown
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Skip rendering header on auth pages
  if (pathname.startsWith("/auth/")) {
    return null
  }

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
      description: "Overview and quick access"
    },
    {
      title: "Patients",
      href: "/patients",
      icon: <Users className="h-4 w-4" />,
      description: "Patient management and records",
      roles: ["clinician", "admin"]
    },
    {
      title: "Genomics",
      href: "/genomics",
      icon: <Dna className="h-4 w-4" />,
      description: "Genomic analysis and insights",
      submenu: [
        { title: "Variant Analysis", href: "/genomics/variants", icon: <Microscope className="h-4 w-4" /> },
        { title: "3D Visualization", href: "/genomics/3d-visualization", icon: <Network className="h-4 w-4" /> },
        { title: "Evolution Tracking", href: "/variant-evolution", icon: <Activity className="h-4 w-4" /> },
        { title: "Recommendations", href: "/variant-recommendations", icon: <Target className="h-4 w-4" /> },
        { title: "Timeline", href: "/genetic-timeline", icon: <Calendar className="h-4 w-4" /> }
      ]
    },
    {
      title: "Research",
      href: "/research",
      icon: <FlaskConical className="h-4 w-4" />,
      description: "Research tools and collaboration",
      submenu: [
        { title: "Trial Matching", href: "/trial-matching", icon: <Search className="h-4 w-4" /> },
        { title: "Opportunities", href: "/research/opportunities", icon: <Target className="h-4 w-4" /> },
        { title: "Collaboration", href: "/research/collaboration", icon: <Users className="h-4 w-4" /> },
        { title: "Metrics", href: "/research/metrics", icon: <LineChart className="h-4 w-4" /> },
        { title: "Export Dashboard", href: "/research/export-dashboard", icon: <Database className="h-4 w-4" /> }
      ]
    },
    {
      title: "AI Assistant",
      href: "/ai-assistant",
      icon: <Brain className="h-4 w-4" />,
      description: "AI-powered insights and chat",
      submenu: [
        { title: "Chat", href: "/chat", icon: <MessageSquare className="h-4 w-4" /> },
        { title: "Predictions", href: "/ai-predictions", icon: <Zap className="h-4 w-4" /> },
        { title: "Evidence Strength", href: "/evidence-strength", icon: <Shield className="h-4 w-4" /> },
        { title: "Conflict Resolution", href: "/conflict-resolution", icon: <Target className="h-4 w-4" /> }
      ]
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <FileText className="h-4 w-4" />,
      description: "Medical and lab reports",
      submenu: [
        { title: "Beaker Reports", href: "/beaker-reports", icon: <FlaskConical className="h-4 w-4" /> },
        { title: "Lab Comparison", href: "/lab-comparison", icon: <Microscope className="h-4 w-4" /> },
        { title: "Report Builder", href: "/reports/builder", icon: <FileText className="h-4 w-4" /> }
      ]
    }
  ]

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Dna className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AGENT
                </span>
              </div>
            </Link>

            <nav className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {mainNavItems.map((item) => {
                if (item.roles && user && !item.roles.includes(user.role)) {
                  return null
                }

                if (item.submenu) {
                  return (
                    <DropdownMenu key={item.title}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`px-3 py-2 text-sm font-medium ${
                            isActiveLink(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-gray-900"
                          }`}
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel className="text-xs text-gray-500">
                          {item.description}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={item.href} className="flex items-center">
                            {item.icon}
                            <span className="ml-2">Overview</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.submenu.map((subItem) => (
                          <DropdownMenuItem key={subItem.href} asChild>
                            <Link href={subItem.href} className="flex items-center">
                              {subItem.icon}
                              <span className="ml-2">{subItem.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                      isActiveLink(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainNavItems.map((item) => {
              if (item.roles && user && !item.roles.includes(user.role)) {
                return null
              }

              return (
                <div key={item.title}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActiveLink(item.href)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                  </Link>
                  {item.submenu && (
                    <div className="ml-6 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            {subItem.icon}
                            <span className="ml-3">{subItem.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name || user.email}</div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    logout()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
