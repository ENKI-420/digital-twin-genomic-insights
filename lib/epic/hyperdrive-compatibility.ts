/**
 * Hyperdrive Compatibility Utilities
 *
 * This module provides utilities for ensuring compatibility with Epic's Hyperdrive client.
 * Hyperdrive is Epic's new web-based end user application that replaces Hyperspace.
 */

export interface HyperdriveContext {
  isHyperdrive: boolean
  epicDomain?: string
  patientId?: string
  encounterId?: string
  userId?: string
  launchContext?: Record<string, any>
}

export interface HyperdriveMessage {
  type: string
  data?: any
  timestamp: number
}

/**
 * Detects if the application is running within Epic's Hyperdrive
 */
export function detectHyperdrive(): HyperdriveContext {
  const context: HyperdriveContext = {
    isHyperdrive: false,
  }

  // Check if we're in an iframe (common for Hyperdrive embedding)
  const isInIframe = window !== window.parent

  // Check for Epic-specific URL parameters or headers
  const urlParams = new URLSearchParams(window.location.search)
  const epicParams = ['epic', 'hyperdrive', 'hyperspace', 'fhir', 'smart']

  const hasEpicParams = epicParams.some(param =>
    urlParams.has(param) || window.location.href.includes(param)
  )

  // Check for Epic domains in referrer
  const referrer = document.referrer
  const epicDomains = ['fhir.epic.com', 'open.epic.com', 'apporchard.epic.com']
  const isFromEpicDomain = epicDomains.some(domain => referrer.includes(domain))

  // Check for Hyperdrive-specific window properties
  const hasHyperdriveProps = !!(window as any).epic || !!(window as any).hyperdrive

  context.isHyperdrive = isInIframe || hasEpicParams || isFromEpicDomain || hasHyperdriveProps

  if (context.isHyperdrive) {
    // Extract Epic domain from referrer
    if (referrer) {
      try {
        const url = new URL(referrer)
        context.epicDomain = url.origin
      } catch (e) {
        // Invalid URL, ignore
      }
    }

    // Extract common Epic parameters
    context.patientId = urlParams.get('patient') || undefined
    context.encounterId = urlParams.get('encounter') || undefined
    context.userId = urlParams.get('user') || undefined

    // Extract launch context from URL parameters
    const launchContext: Record<string, any> = {}
    for (const [key, value] of urlParams.entries()) {
      if (key.startsWith('context.')) {
        const contextKey = key.replace('context.', '')
        try {
          launchContext[contextKey] = JSON.parse(decodeURIComponent(value))
        } catch {
          launchContext[contextKey] = value
        }
      }
    }
    context.launchContext = launchContext
  }

  return context
}

/**
 * Sends messages to the parent window (Hyperdrive) if available
 */
export function sendToHyperdrive(message: HyperdriveMessage): void {
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage(message, '*')
    } catch (error) {
      console.warn('Failed to send message to Hyperdrive:', error)
    }
  }
}

/**
 * Listens for messages from Hyperdrive
 */
export function listenToHyperdrive(
  callback: (message: HyperdriveMessage) => void
): () => void {
  const messageHandler = (event: MessageEvent) => {
    // Validate message origin for security
    const allowedOrigins = [
      'https://fhir.epic.com',
      'https://open.epic.com',
      'https://apporchard.epic.com'
    ]

    if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
      console.warn('Received message from unauthorized origin:', event.origin)
      return
    }

    try {
      const message = event.data as HyperdriveMessage
      if (message && typeof message === 'object' && message.type) {
        callback(message)
      }
    } catch (error) {
      console.warn('Failed to process message from Hyperdrive:', error)
    }
  }

  window.addEventListener('message', messageHandler)

  // Return cleanup function
  return () => window.removeEventListener('message', messageHandler)
}

/**
 * Notifies Hyperdrive about patient context changes
 */
export function notifyPatientContextChange(patientId: string, context?: Record<string, any>): void {
  sendToHyperdrive({
    type: 'patient-context-change',
    data: {
      patientId,
      context,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  })
}

/**
 * Notifies Hyperdrive about genomic analysis completion
 */
export function notifyGenomicAnalysisComplete(
  patientId: string,
  analysisType: string,
  results: any
): void {
  sendToHyperdrive({
    type: 'genomic-analysis-complete',
    data: {
      patientId,
      analysisType,
      results,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  })
}

/**
 * Requests patient data from Hyperdrive
 */
export function requestPatientData(patientId: string, resourceTypes?: string[]): void {
  sendToHyperdrive({
    type: 'request-patient-data',
    data: {
      patientId,
      resourceTypes: resourceTypes || ['Patient', 'Observation', 'DiagnosticReport'],
      timestamp: Date.now()
    },
    timestamp: Date.now()
  })
}

/**
 * Handles iframe resize requests from Hyperdrive
 */
export function handleIframeResize(): void {
  const resizeObserver = new ResizeObserver(() => {
    const height = document.documentElement.scrollHeight
    sendToHyperdrive({
      type: 'iframe-resize',
      data: { height },
      timestamp: Date.now()
    })
  })

  resizeObserver.observe(document.body)
}

/**
 * Initializes Hyperdrive compatibility features
 */
export function initializeHyperdriveCompatibility(): HyperdriveContext {
  const context = detectHyperdrive()

  if (context.isHyperdrive) {
    console.log('Hyperdrive compatibility initialized:', context)

    // Set up iframe resize handling
    handleIframeResize()

    // Listen for messages from Hyperdrive
    listenToHyperdrive((message) => {
      console.log('Received message from Hyperdrive:', message)

      switch (message.type) {
        case 'patient-context-change':
          // Handle patient context changes
          break
        case 'genomic-data-request':
          // Handle requests for genomic data
          break
        case 'analysis-request':
          // Handle analysis requests
          break
        default:
          console.log('Unknown message type:', message.type)
      }
    })

    // Notify Hyperdrive that we're ready
    sendToHyperdrive({
      type: 'app-ready',
      data: {
        appName: 'Genomic Twin',
        version: '1.0.0',
        capabilities: ['genomic-analysis', 'pharmacogenomics', 'variant-interpretation']
      },
      timestamp: Date.now()
    })
  }

  return context
}

/**
 * Utility to check if the current environment supports all Hyperdrive features
 */
export function checkHyperdriveCompatibility(): {
  compatible: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  // Check for required browser features
  if (!window.ResizeObserver) {
    issues.push('ResizeObserver not supported')
    recommendations.push('Use a polyfill for ResizeObserver')
  }

  if (!window.postMessage) {
    issues.push('postMessage not supported')
    recommendations.push('Use a modern browser that supports postMessage')
  }

  // Check for HTTPS (required for Hyperdrive)
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    issues.push('HTTPS required for Hyperdrive integration')
    recommendations.push('Deploy application with HTTPS')
  }

  // Check for iframe support
  try {
    const testIframe = document.createElement('iframe')
    document.body.appendChild(testIframe)
    document.body.removeChild(testIframe)
  } catch (error) {
    issues.push('Iframe creation not supported')
    recommendations.push('Check browser security settings')
  }

  return {
    compatible: issues.length === 0,
    issues,
    recommendations
  }
}