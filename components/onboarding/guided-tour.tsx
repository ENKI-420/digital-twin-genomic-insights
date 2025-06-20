"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Skip,
  HelpCircle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react'
import { OnboardingFlow, OnboardingStep, OnboardingContext, UserRole } from '@/lib/onboarding/types'
import { getOnboardingFlow } from '@/lib/onboarding/flows'

interface GuidedTourProps {
  userRole: UserRole
  context: OnboardingContext
  onComplete?: () => void
  onSkip?: () => void
  onStepChange?: (stepIndex: number) => void
  autoStart?: boolean
  className?: string
}

interface TourState {
  isActive: boolean
  currentStepIndex: number
  completedSteps: Set<string>
  skippedSteps: Set<string>
  startTime: Date
  isPaused: boolean
}

export function GuidedTour({
  userRole,
  context,
  onComplete,
  onSkip,
  onStepChange,
  autoStart = false,
  className = ""
}: GuidedTourProps) {
  const [tourState, setTourState] = useState<TourState>({
    isActive: autoStart,
    currentStepIndex: 0,
    completedSteps: new Set(),
    skippedSteps: new Set(),
    startTime: new Date(),
    isPaused: false
  })

  const [showTour, setShowTour] = useState(autoStart)
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const flow = getOnboardingFlow(userRole)
  const currentStep = flow?.steps[tourState.currentStepIndex]

  useEffect(() => {
    if (tourState.isActive && currentStep) {
      highlightElement(currentStep.targetElement)
      onStepChange?.(tourState.currentStepIndex)
    }
  }, [tourState.currentStepIndex, tourState.isActive, currentStep, onStepChange])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tourState.isActive) return

      switch (event.key) {
        case 'Escape':
          handleCloseTour()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case ' ':
          event.preventDefault()
          togglePause()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [tourState])

  const highlightElement = (selector?: string) => {
    // Remove previous highlight
    setHighlightedElement(null)

    if (!selector) return

    try {
      const element = document.querySelector(selector)
      if (element) {
        setHighlightedElement(element)
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }
    } catch (error) {
      console.warn('Invalid selector for tour step:', selector)
    }
  }

  const startTour = () => {
    setTourState({
      isActive: true,
      currentStepIndex: 0,
      completedSteps: new Set(),
      skippedSteps: new Set(),
      startTime: new Date(),
      isPaused: false
    })
    setShowTour(true)
  }

  const handleNext = () => {
    if (!flow || !currentStep) return

    const newCompletedSteps = new Set(tourState.completedSteps)
    newCompletedSteps.add(currentStep.id)

    if (tourState.currentStepIndex < flow.steps.length - 1) {
      setTourState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        completedSteps: newCompletedSteps
      }))
    } else {
      // Tour completed
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (tourState.currentStepIndex > 0) {
      setTourState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1
      }))
    }
  }

  const handleSkipStep = () => {
    if (!currentStep) return

    const newSkippedSteps = new Set(tourState.skippedSteps)
    newSkippedSteps.add(currentStep.id)

    setTourState(prev => ({
      ...prev,
      skippedSteps: newSkippedSteps
    }))

    handleNext()
  }

  const handleComplete = () => {
    setTourState(prev => ({ ...prev, isActive: false }))
    setShowTour(false)
    setHighlightedElement(null)
    onComplete?.()
  }

  const handleCloseTour = () => {
    setTourState(prev => ({ ...prev, isActive: false }))
    setShowTour(false)
    setHighlightedElement(null)
    onSkip?.()
  }

  const togglePause = () => {
    setTourState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }))
  }

  const getTooltipPosition = () => {
    if (!highlightedElement || !currentStep?.position) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }

    const rect = highlightedElement.getBoundingClientRect()
    const tooltipHeight = 300 // Approximate tooltip height
    const tooltipWidth = 400 // Approximate tooltip width

    switch (currentStep.position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        }
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        }
      case 'left':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - 20,
        }
      case 'right':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + 20,
        }
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
    }
  }

  if (!flow) {
    return null
  }

  // Start button when tour is not active
  if (!showTour) {
    return (
      <Button
        onClick={startTour}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
        size="lg"
      >
        <Play className="h-4 w-4 mr-2" />
        Start Tour
      </Button>
    )
  }

  const progress = ((tourState.currentStepIndex + 1) / flow.steps.length) * 100

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 pointer-events-auto"
        onClick={handleCloseTour}
      />

      {/* Highlight spotlight */}
      {highlightedElement && (
        <div
          className="fixed pointer-events-none z-45"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out'
          }}
        />
      )}

      {/* Tour tooltip */}
      <Card
        ref={tooltipRef}
        className="fixed z-50 w-96 max-w-[90vw] shadow-2xl border-2 border-blue-200"
        style={getTooltipPosition()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Step {tourState.currentStepIndex + 1} of {flow.steps.length}
              </Badge>
              {tourState.isPaused && (
                <Badge variant="secondary" className="text-xs">
                  <Pause className="h-3 w-3 mr-1" />
                  Paused
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseTour}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Progress value={progress} className="h-2" />

          <CardTitle className="text-lg">{currentStep?.title}</CardTitle>
          <p className="text-sm text-gray-600">{currentStep?.description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm">
            {typeof currentStep?.content === 'string' ? (
              <p>{currentStep.content}</p>
            ) : (
              currentStep?.content
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={tourState.currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {currentStep?.canSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipStep}
                >
                  <Skip className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePause}
              >
                {tourState.isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>

              <Button
                onClick={handleNext}
                size="sm"
              >
                {tourState.currentStepIndex === flow.steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tour info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Estimated time: {flow.estimatedTime} minutes</span>
            <div className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              <span>Use arrow keys to navigate</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}