"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

interface EmptyStateProps {
  onNewChat: () => void
}

export function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-blue-100 p-3 rounded-full mb-4">
        <MessageSquare className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">AI Health Assistant</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Chat with your AI assistant to get insights about your health data, understand medical terms, or ask general
        health questions.
      </p>
      <Button onClick={onNewChat}>Start a new conversation</Button>
    </div>
  )
}
