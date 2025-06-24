'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  HyperdriveContext,
  initializeHyperdriveCompatibility,
  checkHyperdriveCompatibility,
  sendToHyperdrive,
  listenToHyperdrive,
  HyperdriveMessage
} from '@/lib/epic/hyperdrive-compatibility'

interface HyperdriveProviderContextType {
  context: HyperdriveContext
  isCompatible: boolean
  compatibilityIssues: string[]
  sendMessage: (message: HyperdriveMessage) => void
  notifyPatientChange: (patientId: string, context?: Record<string, any>) => void
  notifyAnalysisComplete: (patientId: string, analysisType: string, results: any) => void
}

const HyperdriveContext = createContext<HyperdriveProviderContextType | undefined>(undefined)

export function useHyperdrive() {
  const context = useContext(HyperdriveContext)
  if (context === undefined) {
    throw new Error('useHyperdrive must be used within a HyperdriveProvider')
  }
  return context
}

interface HyperdriveProviderProps {
  children: React.ReactNode
}

export function HyperdriveProvider({ children }: HyperdriveProviderProps) {
  const [context, setContext] = useState<HyperdriveContext>({ isHyperdrive: false })
  const [isCompatible, setIsCompatible] = useState(true)
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([])

  useEffect(() => {
    // Initialize Hyperdrive compatibility
    const hyperdriveContext = initializeHyperdriveCompatibility()
    setContext(hyperdriveContext)

    // Check compatibility
    const compatibility = checkHyperdriveCompatibility()
    setIsCompatible(compatibility.compatible)
    setCompatibilityIssues(compatibility.issues)

    if (!compatibility.compatible) {
      console.warn('Hyperdrive compatibility issues detected:', compatibility.issues)
      console.log('Recommendations:', compatibility.recommendations)
    }

    // Set up message listener
    const cleanup = listenToHyperdrive((message) => {
      console.log('Hyperdrive message received:', message)

      // Handle specific message types
      switch (message.type) {
        case 'patient-context-change':
          // Update patient context
          if (message.data?.patientId) {
            setContext(prev => ({
              ...prev,
              patientId: message.data.patientId,
              encounterId: message.data.encounterId,
              userId: message.data.userId
            }))
          }
          break

        case 'genomic-data-request':
          // Handle genomic data requests
          console.log('Genomic data requested:', message.data)
          break

        case 'analysis-request':
          // Handle analysis requests
          console.log('Analysis requested:', message.data)
          break

        default:
          console.log('Unhandled message type:', message.type)
      }
    })

    return cleanup
  }, [])

  const sendMessage = (message: HyperdriveMessage) => {
    sendToHyperdrive(message)
  }

  const notifyPatientChange = (patientId: string, context?: Record<string, any>) => {
    sendToHyperdrive({
      type: 'patient-context-change',
      data: { patientId, context },
      timestamp: Date.now()
    })
  }

  const notifyAnalysisComplete = (patientId: string, analysisType: string, results: any) => {
    sendToHyperdrive({
      type: 'genomic-analysis-complete',
      data: { patientId, analysisType, results },
      timestamp: Date.now()
    })
  }

  const value: HyperdriveProviderContextType = {
    context,
    isCompatible,
    compatibilityIssues,
    sendMessage,
    notifyPatientChange,
    notifyAnalysisComplete
  }

  return (
    <HyperdriveContext.Provider value={value}>
      {children}
    </HyperdriveContext.Provider>
  )
}