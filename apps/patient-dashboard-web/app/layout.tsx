import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AGENT Platform - Precision Medicine Platform",
  description: "AI-powered genomic analysis and clinical decision support platform for precision medicine. Adaptive Genomic Evidence Network for Trials.",
  keywords: ["genomics", "precision medicine", "AI", "clinical decision support", "healthcare", "genetic testing"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0066cc" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-background">
          <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="font-bold text-xl">GenomicTwin</span>
                </a>
              </div>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <a href="/baptist/microsite" className="text-foreground/60 transition-colors hover:text-foreground/80">
                    Community Health
                  </a>
                  <a href="/patients/BH-0001/digital-twin" className="text-foreground/60 transition-colors hover:text-foreground/80">
                    Digital Twin
                  </a>
                  <a href="/cds-hooks-demo" className="text-foreground/60 transition-colors hover:text-foreground/80">
                    CDS Demo
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}