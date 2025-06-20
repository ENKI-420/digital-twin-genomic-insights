"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WifiOff, RefreshCw, Download, Clock, Database, Smartphone } from "lucide-react"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [queuedActions, setQueuedActions] = useState<number>(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for queued actions
    checkQueuedActions()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkQueuedActions = async () => {
    try {
      // This would normally query IndexedDB for queued actions
      // For now, we'll simulate it
      const stored = localStorage.getItem('genomictwin1_queued_actions')
      if (stored) {
        const actions = JSON.parse(stored)
        setQueuedActions(actions.length)
      }

      const lastSyncTime = localStorage.getItem('genomictwin1_last_sync')
      if (lastSyncTime) {
        setLastSync(new Date(lastSyncTime))
      }
    } catch (error) {
      console.error('Failed to check queued actions:', error)
    }
  }

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload()
    } else {
      // Try to trigger a connectivity check
      fetch('/', { method: 'HEAD' })
        .then(() => {
          setIsOnline(true)
          window.location.reload()
        })
        .catch(() => {
          // Still offline
        })
    }
  }

  const offlineFeatures = [
    {
      icon: <Database className="h-5 w-5" />,
      title: "Cached Data Access",
      description: "View previously loaded genomic analysis results and patient data"
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Download Reports",
      description: "Export and save reports from your cached analysis sessions"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Queue Actions",
      description: "Actions performed offline will sync when connection is restored"
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Optimized Experience",
      description: "Core features available with reduced data requirements"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <WifiOff className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            No internet connection detected. Don't worry - you can still access some features!
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant={isOnline ? "default" : "destructive"} className="px-4 py-2">
              {isOnline ? "Back Online!" : "Offline Mode"}
            </Badge>

            {queuedActions > 0 && (
              <Badge variant="outline" className="px-4 py-2">
                {queuedActions} Actions Queued
              </Badge>
            )}
          </div>

          <Button
            onClick={handleRetry}
            className="px-8 py-3"
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isOnline ? "Reconnect" : "Check Connection"}
          </Button>
        </div>

        {/* Available Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Available Offline</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offlineFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cached Data Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cached Data Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">24</div>
                <div className="text-sm text-gray-600">Genomic Analyses</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">157</div>
                <div className="text-sm text-gray-600">Patient Records</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">42</div>
                <div className="text-sm text-gray-600">Reports Available</div>
              </div>
            </div>

            {lastSync && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Last synced: {lastSync.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Database className="h-6 w-6" />
            <span>View Cached Data</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            onClick={() => window.location.href = '/genomics/analysis?offline=true'}
          >
            <Download className="h-6 w-6" />
            <span>Offline Analysis</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            onClick={() => window.location.href = '/reports'}
          >
            <Clock className="h-6 w-6" />
            <span>View Reports</span>
          </Button>
        </div>

        {/* Tips for Offline Usage */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Offline Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Your work will automatically sync when you're back online</li>
              <li>Previously viewed genomic data is still accessible</li>
              <li>You can continue viewing and downloading cached reports</li>
              <li>Some features like real-time collaboration require internet connection</li>
              <li>Enable notifications to know when sync is complete</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}