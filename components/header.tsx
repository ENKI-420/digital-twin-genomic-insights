"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"

export function Header() {
  const pathname = usePathname()

  // Skip rendering header on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-baptist-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BH</span>
                </div>
                <span className="font-semibold text-lg hidden sm:inline">GenomicTwin</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/baptist/microsite"
              className={`text-sm font-medium transition-colors hover:text-baptist-blue ${
                pathname === '/baptist/microsite' ? 'text-baptist-blue' : 'text-muted-foreground'
              }`}
            >
              Community Report
            </Link>
            <Link
              href="/patients/BH-0001/digital-twin"
              className={`text-sm font-medium transition-colors hover:text-baptist-blue ${
                pathname.includes('/digital-twin') ? 'text-baptist-blue' : 'text-muted-foreground'
              }`}
            >
              Digital Twin
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Demo Mode</span>
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
