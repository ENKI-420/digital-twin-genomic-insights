import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GenomicTwin Provider Dashboard',
  description: 'Healthcare provider tools for genomic insights and clinical decision support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}