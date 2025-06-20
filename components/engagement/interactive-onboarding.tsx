"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  Target,
  Lightbulb,
  Zap,
  Trophy,
  Clock,
  HelpCircle,
  X,
  ArrowDown,
  MousePointer
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  action: 'click' | 'input' | 'navigate' | 'observe' | 'scroll'
  target: string
  expectedResult: string
  tips: string[]
  estimatedTime: number
  difficulty: 'easy' | 'medium' | 'hard'
}

interface PersonalizedOnboarding {
  id: string
  title: string
  description: string
  estimatedDuration: number
  steps: OnboardingStep[]
  userRole: string
  experienceLevel: string
  completionReward: {
    xp: number
    badge: string
    unlocks: string[]
  }
}

interface InteractiveOnboardingProps {
  userId: string
  onComplete: (completionData: any) => void
  onSkip: () => void
}

export default function InteractiveOnboarding({ userId, onComplete, onSkip }: InteractiveOnboardingProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [onboarding, setOnboarding] = useState<PersonalizedOnboarding | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [showTooltip, setShowTooltip] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [userProgress, setUserProgress] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [personalizedContent, setPersonalizedContent] = useState<any>(null)

  const timerRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    // If onboarding already completed or skipped previously, do not start it again
    const doneFlag = typeof window !== 'undefined' ? localStorage.getItem('gt_onboarding_done') : 'true'

    if (doneFlag === 'true') {
      // Ensure component stays unmounted
      setIsActive(false)
      return
    }

    generatePersonalizedOnboarding()
    startTimer()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [userId])

  useEffect(() => {
    if (onboarding) {
      setUserProgress((currentStep / onboarding.steps.length) * 100)
    }
  }, [currentStep, onboarding])

  const generatePersonalizedOnboarding = async () => {
    try {
      // Simulate API call to engagement engine
      const response = await fetch('/api/ai/engagement/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const data = await response.json()
        setOnboarding(data.onboarding)
        setPersonalizedContent(data.personalizedContent)
        setIsActive(true)
      } else {
        // Fallback onboarding
        setOnboarding(createFallbackOnboarding())
        setIsActive(true)
      }
    } catch (error) {
      console.error('Failed to generate personalized onboarding:', error)
      setOnboarding(createFallbackOnboarding())
      setIsActive(true)
    }
  }

  const createFallbackOnboarding = (): PersonalizedOnboarding => ({
    id: 'fallback_onboarding',
    title: 'Welcome to AI-Driven Personalized Medicine',
    description: 'Let\'s get you started with the core features of our platform',
    estimatedDuration: 5,
    userRole: 'general',
    experienceLevel: 'novice',
    steps: [
      {
        id: 'step_1',
        title: 'Platform Overview',
        description: 'Get familiar with the main dashboard and navigation',
        action: 'observe',
        target: 'main-dashboard',
        expectedResult: 'Understanding of main navigation and key areas',
        tips: ['Take your time to explore', 'Notice the main navigation menu'],
        estimatedTime: 60,
        difficulty: 'easy'
      },
      {
        id: 'step_2',
        title: 'Core AI Features',
        description: 'Discover our AI-powered clinical decision support',
        action: 'click',
        target: '[data-tour="clinical-decision-support"]',
        expectedResult: 'Clinical decision support panel opens',
        tips: ['This is where the AI magic happens', 'Notice the real-time recommendations'],
        estimatedTime: 90,
        difficulty: 'easy'
      },
      {
        id: 'step_3',
        title: 'Personalized Experience',
        description: 'See how the platform adapts to your role and preferences',
        action: 'navigate',
        target: '/profile',
        expectedResult: 'Profile page loads with personalization options',
        tips: ['Customize your experience', 'Set your preferences for better recommendations'],
        estimatedTime: 120,
        difficulty: 'medium'
      }
    ],
    completionReward: {
      xp: 100,
      badge: 'Platform Explorer',
      unlocks: ['Advanced Tutorials', 'Beta Features']
    }
  })

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }

  const handleStepComplete = () => {
    if (!onboarding) return

    const step = onboarding.steps[currentStep]
    setCompletedSteps(prev => new Set([...prev, step.id]))

    // Simulate step completion verification
    setTimeout(() => {
      if (currentStep < onboarding.steps.length - 1) {
        setCurrentStep(prev => prev + 1)
        setShowHint(false)
      } else {
        completeOnboarding()
      }
    }, 500)
  }

  const completeOnboarding = () => {
    const completionData = {
      onboardingId: onboarding?.id,
      timeSpent,
      stepsCompleted: completedSteps.size,
      totalSteps: onboarding?.steps.length || 0,
      completionRate: (completedSteps.size / (onboarding?.steps.length || 1)) * 100,
      reward: onboarding?.completionReward
    }

    onComplete(completionData)
    if (typeof window !== 'undefined') {
      localStorage.setItem('gt_onboarding_done', 'true')
    }
    setIsActive(false)
  }

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gt_onboarding_done', 'true')
    }
    setIsActive(false)
    onSkip()
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (onboarding && currentStep < onboarding.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    // Implement auto-progression logic
  }

  const restartOnboarding = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setTimeSpent(0)
    startTimeRef.current = Date.now()
    setShowHint(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isActive || !onboarding) return null

  const currentStepData = onboarding.steps[currentStep]
  const isLastStep = currentStep === onboarding.steps.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <TooltipProvider>
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{onboarding.title}</h2>
                  <p className="text-blue-100">{onboarding.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Step {currentStep + 1} of {onboarding.steps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Progress</span>
                <span>{Math.round(userProgress)}% complete</span>
              </div>
              <Progress value={userProgress} className="bg-white/20" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
              {/* Current Step */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        completedSteps.has(currentStepData.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {completedSteps.has(currentStepData.id) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-bold">{currentStep + 1}</span>
                        )}
                      </div>
                      <span>{currentStepData.title}</span>
                      <Badge variant="outline" className={`
                        ${currentStepData.difficulty === 'easy' ? 'border-green-500 text-green-700' : ''}
                        ${currentStepData.difficulty === 'medium' ? 'border-yellow-500 text-yellow-700' : ''}
                        ${currentStepData.difficulty === 'hard' ? 'border-red-500 text-red-700' : ''}
                      `}>
                        {currentStepData.difficulty}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>~{currentStepData.estimatedTime}s</span>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {currentStepData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step-specific guidance */}
                  <div className="space-y-4">
                    {/* Action instruction */}
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        {currentStepData.action === 'click' && <MousePointer className="h-4 w-4" />}
                        {currentStepData.action === 'observe' && <Target className="h-4 w-4" />}
                        {currentStepData.action === 'navigate' && <ArrowDown className="h-4 w-4" />}
                        {currentStepData.action === 'input' && <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-blue-900 capitalize">
                          {currentStepData.action} Action Required
                        </div>
                        <div className="text-blue-700">
                          Target: <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                            {currentStepData.target}
                          </code>
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          Expected: {currentStepData.expectedResult}
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    {currentStepData.tips.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span>Helpful Tips</span>
                        </div>
                        <ul className="space-y-1">
                          {currentStepData.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                              <Circle className="h-2 w-2 mt-2 flex-shrink-0 fill-current" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hint Button */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center space-x-2"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                      </Button>

                      {showHint && (
                        <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                          💡 Look for the highlighted element on the screen, or check if the expected result occurred.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {onboarding.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                              completedSteps.has(step.id)
                                ? 'bg-green-500 border-green-500 text-white'
                                : index === currentStep
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'bg-gray-100 border-gray-300 text-gray-500'
                            }`}>
                              {completedSteps.has(step.id) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{step.title}</p>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </TooltipContent>
                        </Tooltip>
                        {index < onboarding.steps.length - 1 && (
                          <div className={`h-0.5 w-8 ${
                            completedSteps.has(step.id) ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="w-80 space-y-4">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Spent</span>
                    <span className="font-medium">{formatTime(timeSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium">{completedSteps.size}/{onboarding.steps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-medium">~{Math.max(0, onboarding.estimatedDuration - Math.floor(timeSpent / 60))}min</span>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Reward */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Completion Reward</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">XP Points</span>
                    <Badge variant="secondary">+{onboarding.completionReward.xp} XP</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Badge</span>
                    <Badge className="bg-yellow-500">{onboarding.completionReward.badge}</Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Unlocks</span>
                    <ul className="mt-1 space-y-1">
                      {onboarding.completionReward.unlocks.map((unlock, index) => (
                        <li key={index} className="text-sm text-green-600 flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{unlock}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Personalized Content */}
              {personalizedContent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Just for You</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      {personalizedContent.message}
                    </div>
                    {personalizedContent.recommendations && (
                      <ul className="mt-2 space-y-1">
                        {personalizedContent.recommendations.slice(0, 3).map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-blue-600">• {rec}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                  disabled={isLastStep}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restartOnboarding}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500">
                  Auto-play {isPlaying ? 'enabled' : 'disabled'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                {!isLastStep ? (
                  <Button onClick={handleStepComplete}>
                    Mark Complete
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={completeOnboarding} className="bg-green-600 hover:bg-green-700">
                    Complete Onboarding
                    <Trophy className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}