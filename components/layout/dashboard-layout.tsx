"use client"

import type React from "react"
import { EnhancedNavigation } from "./enhanced-navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <EnhancedNavigation variant="dashboard">
      {children}
    </EnhancedNavigation>
  )
}
