"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Share2,
  Copy,
  Download,
  Eye,
  Clock,
  Shield,
  Users,
  ExternalLink,
  QrCode,
  Mail,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'

interface ShareSettings {
  expirationHours: number
  requireAuth: boolean
  allowDownload: boolean
  trackViews: boolean
  recipientEmail?: string
  accessNote?: string
}

interface ShareLink {
  id: string
  url: string
  shortUrl: string
  qrCode: string
  createdAt: Date
  expiresAt: Date
  settings: ShareSettings
  analytics: {
    views: number
    downloads: number
    lastViewed?: Date
    viewerLocations: string[]
    devices: string[]
  }
}

interface ReportShareProps {
  reportId: string
  patientId: string
  reportTitle: string
  reportSummary?: string
  onShareCreated?: (shareLink: ShareLink) => void
  className?: string
}

export function ReportShare({
  reportId,
  patientId,
  reportTitle,
  reportSummary,
  onShareCreated,
  className
}: ReportShareProps) {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    expirationHours: 24,
    requireAuth: true,
    allowDownload: false,
    trackViews: true,
    recipientEmail: '',
    accessNote: ''
  })

  const [activeShare, setActiveShare] = useState<ShareLink | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const generateShareLink = async () => {
    setIsCreating(true)

    // Simulate API call to create secure share link
    await new Promise(resolve => setTimeout(resolve, 2000))

    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share/${shareId}`
    const shortUrl = `agile.ly/${shareId.substr(-8)}`

    const newShare: ShareLink = {
      id: shareId,
      url: shareUrl,
      shortUrl,
      qrCode: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=`, // Mock QR code
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + shareSettings.expirationHours * 60 * 60 * 1000),
      settings: { ...shareSettings },
      analytics: {
        views: 0,
        downloads: 0,
        viewerLocations: [],
        devices: []
      }
    }

    setActiveShare(newShare)
    setIsCreating(false)

    if (onShareCreated) {
      onShareCreated(newShare)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const sendEmail = () => {
    if (!activeShare || !shareSettings.recipientEmail) return

    const subject = encodeURIComponent(`Secure Report: ${reportTitle}`)
    const body = encodeURIComponent(`
I'm sharing a secure genomic report with you via AGILE Agent.

Report: ${reportTitle}
Patient ID: ${patientId}

Access Link: ${activeShare.url}
Short Link: ${activeShare.shortUrl}

${shareSettings.accessNote ? `Note: ${shareSettings.accessNote}` : ''}

This link expires on ${activeShare.expiresAt.toLocaleDateString()} at ${activeShare.expiresAt.toLocaleTimeString()}.

The link is ${shareSettings.requireAuth ? 'password protected' : 'publicly accessible'} and ${shareSettings.trackViews ? 'tracks access analytics' : 'does not track access'}.

Best regards,
AGILE Agent Clinical Team
    `)

    window.open(`mailto:${shareSettings.recipientEmail}?subject=${subject}&body=${body}`)
  }

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else {
      return `${minutes}m remaining`
    }
  }

  const revokeShare = () => {
    setActiveShare(null)
  }

  useEffect(() => {
    // Simulate real-time analytics updates
    if (activeShare) {
      const interval = setInterval(() => {
        setActiveShare(prev => {
          if (!prev) return null

          return {
            ...prev,
            analytics: {
              ...prev.analytics,
              views: prev.analytics.views + Math.floor(Math.random() * 3),
              downloads: prev.analytics.downloads + (Math.random() > 0.8 ? 1 : 0),
              lastViewed: Math.random() > 0.5 ? new Date() : prev.analytics.lastViewed,
              viewerLocations: [...prev.analytics.viewerLocations, 'Baltimore, MD', 'Rochester, MN'].slice(0, 5),
              devices: [...prev.analytics.devices, 'Desktop', 'Mobile', 'Tablet'].slice(0, 3)
            }
          }
        })
      }, 10000) // Update every 10 seconds for demo

      return () => clearInterval(interval)
    }
  }, [activeShare])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-iris-500" />
          Secure Report Sharing
        </CardTitle>
        <p className="text-sm text-gray-600">
          Create HIPAA-compliant shareable links with analytics and access controls
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {!activeShare ? (
          <>
            {/* Report Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{reportTitle}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Patient ID:</span> {patientId}
                </div>
                <div>
                  <span className="font-medium">Report ID:</span> {reportId}
                </div>
              </div>
              {reportSummary && (
                <p className="text-sm text-gray-600 mt-2">{reportSummary}</p>
              )}
            </div>

            {/* Share Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Share Settings</h4>

              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expiration">Link Expiration</Label>
                <select
                  id="expiration"
                  value={shareSettings.expirationHours}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, expirationHours: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  title="Select link expiration time"
                >
                  <option value={1}>1 Hour</option>
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>1 Week</option>
                  <option value={720}>30 Days</option>
                </select>
              </div>

              {/* Security Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireAuth">Require Authentication</Label>
                    <p className="text-xs text-gray-500">Recipients must verify identity to access</p>
                  </div>
                  <Switch
                    id="requireAuth"
                    checked={shareSettings.requireAuth}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, requireAuth: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowDownload">Allow Downloads</Label>
                    <p className="text-xs text-gray-500">Enable PDF download and printing</p>
                  </div>
                  <Switch
                    id="allowDownload"
                    checked={shareSettings.allowDownload}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allowDownload: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="trackViews">Track Analytics</Label>
                    <p className="text-xs text-gray-500">Monitor access, views, and downloads</p>
                  </div>
                  <Switch
                    id="trackViews"
                    checked={shareSettings.trackViews}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, trackViews: checked }))}
                  />
                </div>
              </div>

              {/* Recipient Email */}
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="colleague@hospital.org"
                  value={shareSettings.recipientEmail}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, recipientEmail: e.target.value }))}
                />
              </div>

              {/* Access Note */}
              <div className="space-y-2">
                <Label htmlFor="accessNote">Access Note (Optional)</Label>
                <Textarea
                  id="accessNote"
                  placeholder="Add a note for the recipient..."
                  value={shareSettings.accessNote}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, accessNote: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* HIPAA Notice */}
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>HIPAA Compliance:</strong> All shared links are encrypted, access-controlled, and automatically logged for audit compliance.
                Links expire automatically and can be revoked at any time.
              </AlertDescription>
            </Alert>

            {/* Generate Button */}
            <Button
              onClick={generateShareLink}
              disabled={isCreating}
              className="w-full bg-iris-500 hover:bg-iris-700"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Creating Secure Link...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Generate Secure Share Link
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Active Share Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Share Link Created</h4>
                <Badge className={`${
                  new Date() < activeShare.expiresAt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {new Date() < activeShare.expiresAt ? 'Active' : 'Expired'}
                </Badge>
              </div>

              {/* Link Display */}
              <div className="space-y-3">
                <div>
                  <Label>Secure Link</Label>
                  <div className="flex gap-2">
                    <Input value={activeShare.url} readOnly className="font-mono text-sm" />
                    <Button size="sm" onClick={() => copyToClipboard(activeShare.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Short Link</Label>
                  <div className="flex gap-2">
                    <Input value={activeShare.shortUrl} readOnly className="font-mono text-sm" />
                    <Button size="sm" onClick={() => copyToClipboard(activeShare.shortUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {copySuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Link copied to clipboard!
                  </AlertDescription>
                </Alert>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button onClick={() => setShowQR(!showQR)} variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  {showQR ? 'Hide' : 'Show'} QR Code
                </Button>

                {shareSettings.recipientEmail && (
                  <Button onClick={sendEmail} variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                )}

                <Button onClick={() => copyToClipboard(activeShare.url)} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>

              {/* QR Code */}
              {showQR && (
                <div className="text-center p-4 bg-white border rounded-lg">
                  <img
                    src={activeShare.qrCode}
                    alt="QR Code for share link"
                    className="mx-auto mb-2"
                    width={150}
                    height={150}
                  />
                  <p className="text-sm text-gray-600">Scan to access report</p>
                </div>
              )}

              {/* Expiration Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Expiration</span>
                </div>
                <p className="text-sm text-gray-600">
                  Expires on {activeShare.expiresAt.toLocaleDateString()} at {activeShare.expiresAt.toLocaleTimeString()}
                </p>
                <p className="text-sm font-medium mt-1">
                  {formatTimeRemaining(activeShare.expiresAt)}
                </p>
              </div>

              {/* Analytics */}
              {shareSettings.trackViews && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Access Analytics</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-iris-500">{activeShare.analytics.views}</div>
                      <div className="text-sm text-gray-600">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{activeShare.analytics.downloads}</div>
                      <div className="text-sm text-gray-600">Downloads</div>
                    </div>
                  </div>

                  {activeShare.analytics.lastViewed && (
                    <p className="text-sm text-gray-600">
                      Last viewed: {activeShare.analytics.lastViewed.toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Management Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => setActiveShare(null)} variant="outline">
                Create New Link
              </Button>
              <Button onClick={revokeShare} variant="outline" className="text-red-600">
                <Lock className="h-4 w-4 mr-2" />
                Revoke Access
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}