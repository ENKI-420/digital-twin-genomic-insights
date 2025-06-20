"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Bot,
  User,
  Download,
  FileText,
  BarChart3,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { BeakerAIAssistant, type AIResponse } from "@/lib/ai/beaker-assistant"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  response?: AIResponse
  status?: "sending" | "delivered" | "error"
}

interface BeakerAIChatProps {
  userId: string
  sessionId?: string
  onExport?: (data: any, format: string) => void
  onPatientSelect?: (patientId: string) => void
}

export function BeakerAIChat({ userId, sessionId, onExport, onPatientSelect }: BeakerAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [assistant] = useState(() => new BeakerAIAssistant())
  const [currentSessionId] = useState(sessionId || `session_${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "assistant",
      content:
        "Hello! I'm your Beaker AI assistant. I can help you fetch reports, analyze data, and export results for clinical use. What would you like to do?",
      timestamp: new Date(),
      response: {
        type: "text",
        content:
          "Hello! I'm your Beaker AI assistant. I can help you fetch reports, analyze data, and export results for clinical use. What would you like to do?",
        suggestions: [
          "Fetch lab reports for patient P001",
          "Export recent data to CSV",
          "Search for a patient",
          "Analyze trends in current data",
        ],
        confidence: 1.0,
      },
    }
    setMessages([welcomeMessage])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (message?: string) => {
    const messageText = message || input.trim()
    if (!messageText || isLoading) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: "user",
      content: messageText,
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const { response, queryId } = await assistant.processQuery(currentSessionId, userId, messageText)

      const assistantMessage: ChatMessage = {
        id: queryId,
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        response,
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg)).concat(assistantMessage),
      )
    } catch (error) {
      console.error("Error processing query:", error)

      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        response: {
          type: "text",
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          confidence: 0.0,
        },
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg)).concat(errorMessage),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleActionClick = (action: any) => {
    switch (action.type) {
      case "export_csv":
        if (onExport && action.parameters.data) {
          onExport(action.parameters.data, action.parameters.format || "csv")
        }
        break
      case "fetch_reports":
        if (action.parameters.patientId) {
          handleSendMessage(`Fetch reports for patient ${action.parameters.patientId}`)
        }
        break
      default:
        handleSendMessage(action.label)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderResponse = (response: AIResponse) => {
    switch (response.type) {
      case "data":
        return (
          <div className="space-y-3">
            <p>{response.content}</p>
            {response.data && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b">
                  <h4 className="font-medium text-sm">Data Results</h4>
                </div>
                <div className="p-3">
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )

      case "chart":
        return (
          <div className="space-y-3">
            <p>{response.content}</p>
            {response.data && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Analysis Chart</span>
                </div>
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Chart visualization would appear here</span>
                </div>
              </div>
            )}
          </div>
        )

      case "export":
        return (
          <div className="space-y-3">
            <p>{response.content}</p>
            {response.data && response.data[0]?.exportUrl && (
              <div className="border rounded-lg p-3 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm font-medium">Export Ready</span>
                  </div>
                  <Button size="sm" onClick={() => window.open(response.data[0].exportUrl)}>
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <p>{response.content}</p>
    }
  }

  const renderActions = (actions: any[]) => {
    if (!actions || actions.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {actions.map((action, index) => (
          <Button key={index} variant="outline" size="sm" onClick={() => handleActionClick(action)} className="text-xs">
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  const renderSuggestions = (suggestions: string[]) => {
    if (!suggestions || suggestions.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-blue-600" />
          Beaker AI Assistant
          <Badge className="ml-2 bg-green-100 text-green-800">Online</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === "assistant" && <Bot className="h-4 w-4 mt-0.5 text-blue-600" />}
                    {message.type === "user" && <User className="h-4 w-4 mt-0.5" />}
                    <div className="flex-1">
                      {message.type === "assistant" && message.response ? (
                        <div>
                          {renderResponse(message.response)}
                          {renderActions(message.response.actions)}
                          {renderSuggestions(message.response.suggestions)}
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>

                        {message.type === "user" && (
                          <div className="flex items-center space-x-1">
                            {message.status === "sending" && <Loader2 className="h-3 w-3 animate-spin" />}
                            {message.status === "delivered" && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {message.status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                          </div>
                        )}

                        {message.type === "assistant" && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about Beaker reports, data analysis, or exports..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading} size="sm">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage("Fetch recent lab reports")}
              disabled={isLoading}
            >
              <FileText className="h-3 w-3 mr-1" />
              Fetch Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage("Export data to CSV")}
              disabled={isLoading}
            >
              <Download className="h-3 w-3 mr-1" />
              Export Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage("Search for patient")}
              disabled={isLoading}
            >
              <Search className="h-3 w-3 mr-1" />
              Find Patient
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
