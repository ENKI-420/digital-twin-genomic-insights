'use client'

import React from 'react'
import { useHyperdrive } from './hyperdrive-provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

export function HyperdriveStatus() {
  const { context, isCompatible, compatibilityIssues } = useHyperdrive()

  if (!context.isHyperdrive) {
    return null // Don't show anything if not in Hyperdrive
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Hyperdrive Status
        </CardTitle>
        <CardDescription>
          Epic Hyperdrive Integration Status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Integration Status:</span>
          <Badge variant={isCompatible ? "default" : "destructive"}>
            {isCompatible ? "Compatible" : "Issues Detected"}
          </Badge>
        </div>

        {/* Epic Domain */}
        {context.epicDomain && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Epic Domain:</span>
            <span className="text-sm text-muted-foreground">{context.epicDomain}</span>
          </div>
        )}

        {/* Patient Context */}
        {context.patientId && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Patient ID:</span>
            <span className="text-sm text-muted-foreground">{context.patientId}</span>
          </div>
        )}

        {/* Compatibility Issues */}
        {compatibilityIssues.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Compatibility Issues</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {compatibilityIssues.map((issue, index) => (
                  <li key={index} className="text-sm">• {issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {isCompatible && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Ready for Hyperdrive</AlertTitle>
            <AlertDescription>
              Your application is compatible with Epic's Hyperdrive client and ready for integration.
            </AlertDescription>
          </Alert>
        )}

        {/* Launch Context */}
        {context.launchContext && Object.keys(context.launchContext).length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Launch Context:</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(context.launchContext, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function HyperdriveCompatibilityBanner() {
  const { context, isCompatible, compatibilityIssues } = useHyperdrive()

  if (!context.isHyperdrive) {
    return null
  }

  if (isCompatible) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Hyperdrive Compatible</AlertTitle>
        <AlertDescription className="text-green-700">
          Your application is running within Epic's Hyperdrive client and all compatibility checks have passed.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Hyperdrive Compatibility Issues</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p className="mb-2">The following issues may affect your Hyperdrive integration:</p>
          <ul className="space-y-1">
            {compatibilityIssues.map((issue, index) => (
              <li key={index} className="text-sm">• {issue}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}