"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { ChatProvider, useChat } from "@/lib/chat/chat-context"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { SessionList } from "@/components/chat/session-list"
import { EmptyState } from "@/components/chat/empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain, Dna, FileText, Search, Lightbulb, TrendingUp,
  AlertTriangle, Users, FlaskConical, Target, Zap,
  MessageSquare, Sparkles, BookOpen, HelpCircle, Microscope
} from "lucide-react"

interface QuickAction {
  icon: React.ReactNode
  label: string
  prompt: string
  category: string
}

interface SuggestedTopic {
  title: string
  description: string
  icon: React.ReactNode
  questions: string[]
}

function ChatPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { sessions, currentSession, isLoading, createNewSession, selectSession, sendMessage, deleteSession } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [activeTab, setActiveTab] = useState("chat")

  const quickActions: QuickAction[] = [
    {
      icon: <Dna className="h-4 w-4" />,
      label: "Analyze Variant",
      prompt: "Can you help me analyze a genomic variant?",
      category: "genomics"
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Risk Assessment",
      prompt: "What's the clinical significance of this pathogenic variant?",
      category: "clinical"
    },
    {
      icon: <Search className="h-4 w-4" />,
      label: "Find Trials",
      prompt: "Find clinical trials for a patient with specific mutations",
      category: "research"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Interpret Report",
      prompt: "Help me understand this genomic test report",
      category: "reports"
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      label: "Treatment Options",
      prompt: "What are the treatment implications of this genetic finding?",
      category: "treatment"
    },
    {
      icon: <Target className="h-4 w-4" />,
      label: "Drug Interactions",
      prompt: "Check pharmacogenomic interactions for this variant",
      category: "pharma"
    }
  ]

  const suggestedTopics: SuggestedTopic[] = [
    {
      title: "Variant Classification",
      description: "Understanding ACMG guidelines and variant interpretation",
      icon: <Microscope className="h-5 w-5 text-blue-500" />,
      questions: [
        "What are the ACMG criteria for variant classification?",
        "How do I interpret a variant of uncertain significance?",
        "What evidence is needed to classify a variant as pathogenic?"
      ]
    },
    {
      title: "Clinical Trials",
      description: "Finding and matching patients to relevant trials",
      icon: <FlaskConical className="h-5 w-5 text-green-500" />,
      questions: [
        "How do I find trials for specific genetic mutations?",
        "What are the eligibility criteria for genomic trials?",
        "How do I enroll a patient in a clinical trial?"
      ]
    },
    {
      title: "Pharmacogenomics",
      description: "Drug response based on genetic variants",
      icon: <Target className="h-5 w-5 text-purple-500" />,
      questions: [
        "Which medications are affected by this variant?",
        "How should dosing be adjusted for this genotype?",
        "What are the CPIC guidelines for this drug-gene pair?"
      ]
    }
  ]

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth/signin?callbackUrl=/chat")
    }
  }, [user, isLoading, router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession?.messages])

  const handleQuickAction = (action: QuickAction) => {
    if (!currentSession) {
      createNewSession()
    }
    sendMessage(action.prompt)
    setShowQuickActions(false)
  }

  const handleSuggestedQuestion = (question: string) => {
    if (!currentSession) {
      createNewSession()
    }
    sendMessage(question)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 hidden md:block">
        <SessionList
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          onSelectSession={selectSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-4">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            {currentSession ? (
              <>
                {/* Chat header */}
                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold truncate">{currentSession.title}</h2>
                    <p className="text-sm text-gray-500">
                      AI-powered genomic analysis and clinical insights
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    GPT-4 Genomics
                  </Badge>
                </div>

                {/* Quick Actions */}
                {showQuickActions && currentSession.messages.length === 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center"
                        >
                          {action.icon}
                          <span className="ml-2">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {currentSession.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md">
                        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Start a conversation
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Ask about genomic variants, clinical trials, treatment options, or any medical genetics question.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="secondary">ACMG Guidelines</Badge>
                          <Badge variant="secondary">ClinVar Database</Badge>
                          <Badge variant="secondary">CPIC Integration</Badge>
                          <Badge variant="secondary">Real-time Analysis</Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentSession.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                  <MessageInput
                    onSendMessage={sendMessage}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Zap className="h-3 w-3" />
                      <span>AI responses are for research purposes only</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Tips
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState onNewChat={createNewSession} />
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Genomics Knowledge Base</h2>
              <div className="grid gap-6">
                {suggestedTopics.map((topic, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {topic.icon}
                        <span className="ml-3">{topic.title}</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-medium mb-3">Common Questions:</h4>
                      <div className="space-y-2">
                        {topic.questions.map((question, qIndex) => (
                          <Button
                            key={qIndex}
                            variant="outline"
                            className="w-full justify-start text-left"
                            onClick={() => handleSuggestedQuestion(question)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{question}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">AI-Generated Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      Recent Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium">↑ 23% increase in BRCA testing</p>
                        <p className="text-xs text-gray-600">More patients seeking preventive screening</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium">New TP53 variant classifications</p>
                        <p className="text-xs text-gray-600">5 VUS reclassified this month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium">Consider cascade testing</p>
                        <p className="text-xs text-gray-600">3 patients with hereditary cancer syndromes</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium">Review pharmacogenomics</p>
                        <p className="text-xs text-gray-600">12 patients on affected medications</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                      Critical Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium">2 pathogenic variants need review</p>
                        <p className="text-xs text-gray-600">Immediate clinical action may be required</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-medium">Drug interaction detected</p>
                        <p className="text-xs text-gray-600">CYP2D6 poor metabolizer on codeine</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      Patient Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium">8 patients eligible for trials</p>
                        <p className="text-xs text-gray-600">Based on genomic profiles</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-sm font-medium">Family history patterns detected</p>
                        <p className="text-xs text-gray-600">Consider genetic counseling referrals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  )
}
