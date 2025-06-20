"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  HelpCircle,
  Lightbulb,
  Zap,
  MessageCircle,
  BookOpen,
  Video,
  ExternalLink,
  X,
  ChevronRight,
  AlertCircle,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter
} from 'lucide-react'

interface ContextualTooltip {
  id: string
  element: string
  trigger: 'hover' | 'click' | 'focus' | 'auto'
  content: {
    title: string
    description: string
    tips: string[]
    relatedActions: string[]
    learnMoreUrl?: string
  }
  positioning: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  delay: number
  priority: 'low' | 'medium' | 'high'
  userRole: string[]
  experienceLevel: string[]
}

interface ProactiveAssistance {
  id: string
  type: 'suggestion' | 'warning' | 'tip' | 'tutorial' | 'shortcut'
  title: string
  message: string
  actions: {
    label: string
    action: string
    primary?: boolean
  }[]
  dismissible: boolean
  persistUntilAction: boolean
  showCount: number
  maxShows: number
}

interface HelpResource {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'tutorial' | 'faq' | 'shortcut'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  tags: string[]
  content: string
  mediaUrl?: string
  relatedFeatures: string[]
  rating: number
  viewCount: number
}

interface ContextualHelpProps {
  userId: string
  currentPage: string
  userContext: {
    role: string
    experience: string
    timeOnPage: number
    lastAction: string
    strugglingWith?: string[]
  }
}

export default function ContextualHelp({ userId, currentPage, userContext }: ContextualHelpProps) {
  const [activeTooltips, setActiveTooltips] = useState<Map<string, ContextualTooltip>>(new Map())
  const [proactiveAssistance, setProactiveAssistance] = useState<ProactiveAssistance | null>(null)
  const [helpResources, setHelpResources] = useState<HelpResource[]>([])
  const [showHelpPanel, setShowHelpPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [userFeedback, setUserFeedback] = useState<Map<string, 'helpful' | 'not_helpful'>>(new Map())

  const assistanceCheckInterval = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    initializeContextualHelp()
    startProactiveAssistanceCheck()

    return () => {
      if (assistanceCheckInterval.current) {
        window.clearInterval(assistanceCheckInterval.current)
      }
    }
  }, [currentPage, userContext])

  const initializeContextualHelp = async () => {
    try {
      // Load contextual tooltips for current page
      const tooltipsResponse = await fetch(`/api/ai/engagement/tooltips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPage,
          userContext
        })
      })

      if (tooltipsResponse.ok) {
        const tooltipsData = await tooltipsResponse.json()
        const tooltipMap = new Map()
        tooltipsData.tooltips.forEach((tooltip: ContextualTooltip) => {
          tooltipMap.set(tooltip.element, tooltip)
        })
        setActiveTooltips(tooltipMap)
      }

      // Load help resources
      const resourcesResponse = await fetch(`/api/ai/engagement/help-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPage,
          userRole: userContext.role,
          experience: userContext.experience
        })
      })

      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json()
        setHelpResources(resourcesData.resources)
      }

    } catch (error) {
      console.error('Failed to initialize contextual help:', error)
      // Load fallback help content
      setHelpResources(createFallbackHelpResources())
    }
  }

  const startProactiveAssistanceCheck = () => {
    assistanceCheckInterval.current = setInterval(async () => {
      try {
        const response = await fetch('/api/ai/engagement/proactive-assistance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            currentPage,
            userContext: {
              ...userContext,
              timeOnPage: Date.now() - (userContext.timeOnPage || 0)
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.shouldIntervene && data.assistance) {
            setProactiveAssistance(data.assistance)
          }
        }
      } catch (error) {
        console.error('Proactive assistance check failed:', error)
      }
    }, 10000) // Check every 10 seconds
  }

  const createFallbackHelpResources = (): HelpResource[] => [
    {
      id: 'getting_started',
      title: 'Getting Started with AI-Driven Medicine',
      description: 'Learn the basics of using our platform for clinical decision support',
      type: 'tutorial',
      category: 'basics',
      difficulty: 'beginner',
      estimatedTime: 5,
      tags: ['basics', 'tutorial', 'clinical'],
      content: 'Step-by-step guide to get you started...',
      relatedFeatures: ['clinical-decision-support', 'patient-apps'],
      rating: 4.8,
      viewCount: 1250
    },
    {
      id: 'clinical_decision_support',
      title: 'Mastering Clinical Decision Support',
      description: 'Advanced techniques for leveraging AI recommendations',
      type: 'video',
      category: 'clinical',
      difficulty: 'intermediate',
      estimatedTime: 10,
      tags: ['clinical', 'ai', 'advanced'],
      content: 'In-depth exploration of clinical AI features...',
      mediaUrl: '/videos/clinical-decision-support.mp4',
      relatedFeatures: ['ai-recommendations', 'clinical-alerts'],
      rating: 4.9,
      viewCount: 890
    }
  ]

  const dismissProactiveAssistance = () => {
    setProactiveAssistance(null)
    // Log dismissal for learning
    recordUserFeedback('proactive_assistance', 'dismissed')
  }

  const handleAssistanceAction = (action: string) => {
    // Handle different assistance actions
    switch (action) {
      case 'start_tour':
        // Start guided tour
        break
      case 'show_help':
        setShowHelpPanel(true)
        break
      case 'suggest_alternative':
        // Show alternative approaches
        break
      default:
        console.log('Unknown assistance action:', action)
    }

    dismissProactiveAssistance()
  }

  const recordUserFeedback = async (resourceId: string, feedback: 'helpful' | 'not_helpful' | 'dismissed') => {
    try {
      await fetch('/api/ai/engagement/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          resourceId,
          feedback,
          context: { currentPage, userContext }
        })
      })

      if (feedback !== 'dismissed') {
        setUserFeedback(prev => new Map(prev.set(resourceId, feedback as 'helpful' | 'not_helpful')))
      }
    } catch (error) {
      console.error('Failed to record feedback:', error)
    }
  }

  const filteredResources = helpResources.filter(resource => {
    const matchesSearch = searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(helpResources.map(r => r.category))]

  return (
    <TooltipProvider>
      <div>
        {/* Floating Help Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowHelpPanel(true)}
                size="lg"
                className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
              >
                <HelpCircle className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Get Help & Support</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Proactive Assistance */}
        {proactiveAssistance && (
          <div className="fixed bottom-24 right-6 z-40 max-w-sm">
            <Card className="shadow-xl border-l-4 border-l-blue-500 animate-in slide-in-from-right">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {proactiveAssistance.type === 'suggestion' && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                    {proactiveAssistance.type === 'warning' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {proactiveAssistance.type === 'tip' && <Zap className="h-4 w-4 text-blue-500" />}
                    {proactiveAssistance.type === 'tutorial' && <BookOpen className="h-4 w-4 text-green-500" />}
                    <CardTitle className="text-sm">{proactiveAssistance.title}</CardTitle>
                  </div>
                  {proactiveAssistance.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={dismissProactiveAssistance}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">{proactiveAssistance.message}</p>
                <div className="flex flex-wrap gap-2">
                  {proactiveAssistance.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.primary ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAssistanceAction(action.action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Panel */}
        <Dialog open={showHelpPanel} onOpenChange={setShowHelpPanel}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Help & Support</span>
              </DialogTitle>
              <DialogDescription>
                Find tutorials, documentation, and get assistance with your current task
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search help articles, tutorials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                                 <div className="flex items-center space-x-2">
                   <Filter className="h-4 w-4 text-gray-500" />
                   <select
                     value={selectedCategory}
                     onChange={(e) => setSelectedCategory(e.target.value)}
                     className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     aria-label="Filter help resources by category"
                   >
                     <option value="all">All Categories</option>
                     {categories.map(category => (
                       <option key={category} value={category}>
                         {category.charAt(0).toUpperCase() + category.slice(1)}
                       </option>
                     ))}
                   </select>
                 </div>
              </div>

              {/* Help Resources */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredResources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No help resources found matching your criteria.</p>
                    <p className="text-sm">Try adjusting your search or category filter.</p>
                  </div>
                ) : (
                  filteredResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {resource.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
                              {resource.type === 'tutorial' && <BookOpen className="h-4 w-4 text-blue-500" />}
                              {resource.type === 'article' && <MessageCircle className="h-4 w-4 text-green-500" />}
                              {resource.type === 'faq' && <HelpCircle className="h-4 w-4 text-purple-500" />}
                              <h3 className="font-medium">{resource.title}</h3>
                              <Badge variant="outline" className={`text-xs ${
                                resource.difficulty === 'beginner' ? 'border-green-500 text-green-700' :
                                resource.difficulty === 'intermediate' ? 'border-yellow-500 text-yellow-700' :
                                'border-red-500 text-red-700'
                              }`}>
                                {resource.difficulty}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{resource.description}</p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{resource.estimatedTime} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-current text-yellow-500" />
                                <span>{resource.rating}</span>
                              </div>
                              <span>{resource.viewCount} views</span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resource.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>

                            {/* Feedback buttons */}
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => recordUserFeedback(resource.id, 'helpful')}
                                className={`p-1 ${userFeedback.get(resource.id) === 'helpful' ? 'text-green-600' : 'text-gray-400'}`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => recordUserFeedback(resource.id, 'not_helpful')}
                                className={`p-1 ${userFeedback.get(resource.id) === 'not_helpful' ? 'text-red-600' : 'text-gray-400'}`}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Take a Tour
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Videos
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Keyboard Shortcuts
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Smart Tooltips */}
        {Array.from(activeTooltips.entries()).map(([element, tooltip]) => (
          <SmartTooltip key={tooltip.id} tooltip={tooltip} />
        ))}
      </div>
    </TooltipProvider>
  )
}

// Smart Tooltip Component
function SmartTooltip({ tooltip }: { tooltip: ContextualTooltip }) {
  const [isVisible, setIsVisible] = useState(false)
  const [showExtended, setShowExtended] = useState(false)

  useEffect(() => {
    const targetElement = document.querySelector(tooltip.element)
    if (!targetElement) return

    const showTooltip = () => {
      setTimeout(() => setIsVisible(true), tooltip.delay)
    }

    const hideTooltip = () => {
      setIsVisible(false)
      setShowExtended(false)
    }

    if (tooltip.trigger === 'hover') {
      targetElement.addEventListener('mouseenter', showTooltip)
      targetElement.addEventListener('mouseleave', hideTooltip)
    } else if (tooltip.trigger === 'click') {
      targetElement.addEventListener('click', () => setIsVisible(!isVisible))
    }

    return () => {
      targetElement.removeEventListener('mouseenter', showTooltip)
      targetElement.removeEventListener('mouseleave', hideTooltip)
      targetElement.removeEventListener('click', () => setIsVisible(!isVisible))
    }
  }, [tooltip])

  if (!isVisible) return null

  return (
    <div className="absolute z-50 bg-white border rounded-lg shadow-lg p-3 max-w-xs">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{tooltip.content.title}</h4>
        <p className="text-xs text-gray-600">{tooltip.content.description}</p>

        {showExtended && (
          <div className="space-y-2 border-t pt-2">
            {tooltip.content.tips.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Tips:</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {tooltip.content.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {tooltip.content.relatedActions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700 mb-1">Related:</div>
                <ul className="text-xs text-blue-600 space-y-1">
                  {tooltip.content.relatedActions.map((action, index) => (
                    <li key={index} className="cursor-pointer hover:underline">• {action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExtended(!showExtended)}
            className="text-xs p-1"
          >
            {showExtended ? 'Less' : 'More info'}
            <ChevronRight className={`h-3 w-3 transition-transform ${showExtended ? 'rotate-90' : ''}`} />
          </Button>

          {tooltip.content.learnMoreUrl && (
            <Button variant="ghost" size="sm" className="text-xs p-1">
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}