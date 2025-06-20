"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type ChatSession, type ChatMessage, generateId } from "./types"
import { useAuth } from "../auth/auth-context"

// Mock AI responses based on keywords
const AI_RESPONSES: Record<string, string> = {
  default: "I'm your AI health assistant. How can I help you today?",
  hello: "Hello! I'm your AI health assistant. How are you feeling today?",
  help: "I can help you understand your medical records, explain test results, answer health questions, or provide general wellness advice. What would you like to know?",
  test: "I see you have several recent test results. Your complete blood count (CBC) from last week shows all values within normal ranges. Your cholesterol levels are slightly elevated but not concerning. Would you like me to explain any specific test in more detail?",
  pain: "I'm sorry to hear you're experiencing pain. Could you tell me more about where the pain is located, when it started, and how severe it is on a scale of 1-10? This will help me provide better information.",
  medication:
    "Based on your records, you're currently taking Lisinopril 10mg daily for blood pressure. It's important to take this medication regularly as prescribed. Are you experiencing any side effects or have questions about this medication?",
  sleep:
    "Good sleep is essential for health. Adults typically need 7-9 hours of quality sleep per night. If you're having trouble sleeping, consider establishing a regular sleep schedule, creating a restful environment, limiting screen time before bed, and avoiding caffeine and alcohol close to bedtime.",
  diet: "A balanced diet is crucial for maintaining good health. Focus on whole foods like fruits, vegetables, lean proteins, and whole grains. Based on your health profile, reducing sodium intake and increasing fiber would be beneficial for your specific conditions.",
  exercise:
    "Regular physical activity is important for your health. Given your medical history, moderate activities like walking, swimming, or cycling for 150 minutes per week would be beneficial. Always start slowly and increase intensity gradually.",
  stress:
    "Chronic stress can impact your health. Techniques like deep breathing, meditation, physical activity, and ensuring adequate rest can help manage stress. Would you like some specific stress management exercises?",
  genomic:
    "Your genomic test results indicate several variants of interest. One notable finding is a variant in the MTHFR gene, which may affect how your body processes certain B vitamins. This isn't cause for alarm but might suggest benefit from methylated B vitamins. Would you like me to explain more about any specific genetic findings?",
}

// Function to generate AI response based on user message
function generateAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Check for keywords in the message
  for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
    if (keyword !== "default" && lowerMessage.includes(keyword)) {
      return response
    }
  }

  // If no keywords match, return default response
  return AI_RESPONSES.default
}

interface ChatContextType {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  isLoading: boolean
  createNewSession: () => void
  selectSession: (sessionId: string) => void
  sendMessage: (content: string) => Promise<void>
  deleteSession: (sessionId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load sessions from localStorage on initial load
  useEffect(() => {
    if (user) {
      const storedSessions = localStorage.getItem(`chat_sessions_${user.id}`)
      if (storedSessions) {
        try {
          const parsedSessions = JSON.parse(storedSessions) as ChatSession[]
          setSessions(parsedSessions)

          // Set the most recent session as current if available
          if (parsedSessions.length > 0) {
            const mostRecent = parsedSessions.reduce((prev, current) =>
              current.updatedAt > prev.updatedAt ? current : prev,
            )
            setCurrentSession(mostRecent)
          }
        } catch (error) {
          console.error("Failed to parse stored sessions:", error)
        }
      }
    }
    setIsLoading(false)
  }, [user])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (user && sessions.length > 0) {
      localStorage.setItem(`chat_sessions_${user.id}`, JSON.stringify(sessions))
    }
  }, [sessions, user])

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: `Chat ${new Date().toLocaleDateString()}`,
      messages: [
        {
          id: generateId(),
          role: "assistant",
          content: "Hello! I'm your AI health assistant. How can I help you today?",
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setSessions((prev) => [newSession, ...prev])
    setCurrentSession(newSession)
  }

  const selectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSession(session)
    }
  }

  const sendMessage = async (content: string) => {
    if (!currentSession) {
      createNewSession()
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    }

    // Update current session with user message
    const updatedSession = {
      ...currentSession!,
      messages: [...currentSession!.messages, userMessage],
      updatedAt: Date.now(),
    }

    // Update sessions state
    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)))
    setCurrentSession(updatedSession)

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate AI response
    const aiResponse: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: generateAIResponse(content),
      timestamp: Date.now(),
    }

    // Update session with AI response
    const finalSession = {
      ...updatedSession,
      messages: [...updatedSession.messages, aiResponse],
      updatedAt: Date.now(),
      // Update title based on first user message if this is the first exchange
      title:
        updatedSession.messages.filter((m) => m.role === "user").length === 1
          ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
          : updatedSession.title,
    }

    // Update sessions state
    setSessions((prev) => prev.map((s) => (s.id === finalSession.id ? finalSession : s)))
    setCurrentSession(finalSession)
  }

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))

    if (currentSession?.id === sessionId) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId)
      setCurrentSession(remainingSessions.length > 0 ? remainingSessions[0] : null)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSession,
        isLoading,
        createNewSession,
        selectSession,
        sendMessage,
        deleteSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
