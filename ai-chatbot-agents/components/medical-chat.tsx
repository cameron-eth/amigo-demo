"use client"

import type React from "react"
import Image from 'next/image'

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionedIntakeForm } from "./sectioned-intake-form"
import { MessageCard } from "@/components/message-card"
import { Loader2, Send, Stethoscope, Shield, Heart, RotateCcw, History, Clipboard, FileText } from "lucide-react"
import type { IntakeData, ConsultationState, Message } from "@/types/medical-types"
import MedicalChatHeader from "./medical-chat-header"
import MessagesArea from "./messages-area"

export function MedicalChat() {
  const [sessionId] = useState(() => uuidv4())
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [state, setState] = useState<ConsultationState | null>(null)
  const [showIntakeForm, setShowIntakeForm] = useState(true)
  const [conversationLength, setConversationLength] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamedMessages, setStreamedMessages] = useState<string[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const eventSource = new EventSource(`/api/medical-chat?sessionId=${sessionId}`);

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setStreamedMessages((prev) => [...prev, newMessage.content]);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  const handleIntakeSubmit = async (intakeData: IntakeData) => {
    try {
      setIsLoading(true)

      // Add the intake form submission as a user message with better formatting
      const formattedIntakeMessage = `
        **Medical Information Submitted**

        **Name:** ${intakeData.fullName}
        **Age:** ${intakeData.age}
        **Gender:** ${intakeData.gender}
        **Location:** ${intakeData.location}
        **Medical Conditions:** ${intakeData.existingMedicalConditions}
        **Primary Symptom:** ${intakeData.primarySymptomDescription}
        **Symptom Onset:** ${intakeData.symptomOnset}
      `;

      const userMessage = {
        id: uuidv4(),
        role: "user" as const,
        content: formattedIntakeMessage,
        timestamp: new Date(),
      }

      setMessages([userMessage])

      const response = await fetch("/api/medical-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          action: "submitIntakeForm",
          data: { intakeData },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const result = await response.json()

      setShowIntakeForm(false)
      setState(result.state)
      setConversationLength(result.conversationLength || 0)

      if (result.response.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: result.response.content,
            timestamp: new Date(),
            followUpSuggestions: result.response.followUpSuggestions,
          },
        ])
      }
    } catch (error) {
      console.error("Error submitting intake form:", error)
      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content:
            "I'm sorry, there was an error processing your information. Please try refreshing the page and try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    if (!textToSend) return

    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/medical-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          action: "sendMessage",
          data: { message: userMessage.content },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const result = await response.json()
      setState(result.state)
      setConversationLength(result.conversationLength || 0)

      if (result.response.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: result.response.content,
            timestamp: new Date(),
            followUpSuggestions: result.response.followUpSuggestions,
          },
        ])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "I'm sorry, there was an error processing your message. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage()
  }

  const handleClearConversation = async () => {
    try {
      await fetch("/api/medical-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          action: "clearConversation",
        }),
      })

      // Reset local state
      setMessages([])
      setState(null)
      setShowIntakeForm(true)
      setConversationLength(0)
    } catch (error) {
      console.error("Error clearing conversation:", error)
    }
  }

  const handleShowHistory = async () => {
    try {
      const response = await fetch("/api/medical-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          action: "getHistory",
        }),
      })

      const result = await response.json()
      console.log(<FileText className='inline-block w-4 h-4' />, "Full conversation history:", result.history)
      alert(`Conversation has ${result.history.length} messages. Check console for details.`)
    } catch (error) {
      console.error("Error getting history:", error)
    }
  }

  return (
    <div className="h-[95vh] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        {/* Header */}
        <MedicalChatHeader />

        {/* Messages Area */}
        <MessagesArea
          showIntakeForm={showIntakeForm}
          isLoading={isLoading}
          messages={messages}
          streamedMessages={streamedMessages}
          messagesEndRef={messagesEndRef}
          handleIntakeSubmit={handleIntakeSubmit}
          handleSuggestionClick={handleSuggestionClick}
        />

        {/* Input Area */}
        {!showIntakeForm && (
          <CardFooter className="border-t bg-white p-4">
            <div className="flex w-full space-x-3">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowHistory}
                  className="h-12"
                  title="Show conversation history"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearConversation}
                  className="h-12"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleFormSubmit} className="flex flex-1 space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message or ask a follow-up question..."
                    disabled={isLoading}
                    className="pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
