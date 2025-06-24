import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { AuthProvider } from "@/lib/auth/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AGENT Platform - Precision Medicine Platform",
  description: "AI-powered genomic analysis and clinical decision support platform for precision medicine. Adaptive Genomic Evidence Network for Trials.",
  keywords: ["genomics", "precision medicine", "AI", "clinical decision support", "healthcare", "genetic testing"],
  authors: [{ name: "AGENT Platform Team" }],
  creator: "AGENT Platform",
  publisher: "AGENT Platform",
  generator: 'Next.js',
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066cc" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" }
  ],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AGENT Platform"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" }
    ],
    shortcut: "/icons/icon-192x192.png"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agent-platform.com",
    title: "AGENT Platform - Precision Medicine Platform",
    description: "AI-powered genomic analysis and clinical decision support platform for precision medicine.",
    siteName: "AGENT Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "AGENT Platform - Precision Medicine Platform",
    description: "AI-powered genomic analysis and clinical decision support platform for precision medicine.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0066cc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AGENT Platform" />
        <meta name="msapplication-TileColor" content="#0066cc" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);

                      // Request notification permission
                      if ('Notification' in window && Notification.permission === 'default') {
                        Notification.requestPermission();
                      }
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
