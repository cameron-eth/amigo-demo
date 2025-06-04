"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Bot, Clock } from "lucide-react"
import { FollowUpSuggestions } from "@/components/follow-up-suggestions"
import { SearchResultsCard } from "@/components/search-results-card"
import type { Message } from "@/types/medical-types"
import type { JSX } from "react"

interface MessageCardProps {
  message: Message
  onSuggestionClick?: (suggestion: string) => void
}

// Simple markdown renderer for basic formatting
function renderMarkdown(text: string): JSX.Element {
  // Check if this is a search results message
  if (text.includes("## 🔍 Search Results:")) {
    return renderSearchResults(text)
  }

  // Split text by lines to handle line breaks
  const lines = text.split("\n")

  return (
    <div className="space-y-2">
      {lines.map((line, lineIndex) => {
        if (!line.trim()) {
          return <br key={lineIndex} />
        }

        // Handle bold text (**text**)
        const parts = line.split(/(\*\*.*?\*\*)/)

        return (
          <div key={lineIndex} className="leading-relaxed">
            {parts.map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                // Remove the ** and make it bold
                const boldText = part.slice(2, -2)
                return (
                  <strong key={partIndex} className="font-semibold">
                    {boldText}
                  </strong>
                )
              }
              return <span key={partIndex}>{part}</span>
            })}
          </div>
        )
      })}
    </div>
  )
}

// Enhanced renderer for search results
function renderSearchResults(text: string): JSX.Element {
  const lines = text.split("\n")
  const results: any[] = []
  let currentResult: any = {}
  let searchType = "general"
  let location = ""

  // Parse the search results from the formatted text
  for (const line of lines) {
    if (line.includes("**Location:**")) {
      location = line.replace("**Location:**", "").trim()
    } else if (line.startsWith("### ")) {
      if (currentResult.name) {
        results.push(currentResult)
      }
      currentResult = {
        name: line.replace(/### \d+\. \*\*(.*)\*\*/, "$1"),
        specialties: [],
      }
    } else if (line.includes("**Address:**")) {
      currentResult.address = line.replace("📍 **Address:**", "").trim()
    } else if (line.includes("**Phone:**")) {
      currentResult.phone = line.replace("📞 **Phone:**", "").trim()
    } else if (line.includes("**Type:**")) {
      currentResult.type = line.replace("🏥 **Type:**", "").trim()
    } else if (line.includes("**Distance:**")) {
      currentResult.distance = line.replace("📏 **Distance:**", "").trim()
    } else if (line.includes("**Hours:**")) {
      currentResult.hours = line.replace("🕒 **Hours:**", "").trim()
    } else if (line.includes("**Specialties:**")) {
      const specialtiesText = line.replace("🩺 **Specialties:**", "").trim()
      currentResult.specialties = specialtiesText.split(", ")
    } else if (line.includes("**Rating:**")) {
      const ratingText = line.replace("⭐ **Rating:**", "").trim()
      currentResult.rating = Number.parseFloat(ratingText.split("/")[0])
    } else if (line.includes("**Insurance:**")) {
      currentResult.acceptsInsurance = true
    } else if (line.includes("**Emergency Services:**")) {
      currentResult.emergencyServices = true
    }
  }

  // Add the last result
  if (currentResult.name) {
    results.push(currentResult)
  }

  // Determine search type from the content
  if (text.toLowerCase().includes("emergency")) {
    searchType = "emergency"
  } else if (text.toLowerCase().includes("urgent care")) {
    searchType = "urgent_care"
  } else if (text.toLowerCase().includes("pharmacy")) {
    searchType = "pharmacy"
  } else if (text.toLowerCase().includes("specialist")) {
    searchType = "specialist"
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-gray-800">🔍 Search Results {location && `in ${location}`}</div>
      <SearchResultsCard results={results} searchType={searchType} location={location} />
    </div>
  )
}

export function MessageCard({ message, onSuggestionClick }: MessageCardProps) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <Badge variant="secondary" className="px-3 py-1">
          {message.content}
        </Badge>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[90%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start space-x-3`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-500 ml-3" : "bg-gradient-to-br from-purple-500 to-blue-600 mr-3"
          }`}
        >
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>

        {/* Message Card */}
        <div className="flex flex-col space-y-2 w-full">
          <Card
            className={`shadow-md border-0 ${
              isUser
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                : "bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            }`}
          >
            <CardContent className="p-4">
              {/* Message Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isUser ? "text-blue-100" : "text-gray-500"}`}>
                  {isUser ? `${message.userName}, ${message.userLocation}` : "Medical Assistant"}
                </span>
                <div className={`flex items-center space-x-1 text-xs ${isUser ? "text-blue-100" : "text-gray-400"}`}>
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>

              {/* Message Content with Markdown Rendering */}
              <div className={`text-sm ${isUser ? "text-white" : "text-gray-800"}`}>
                {renderMarkdown(message.content)}
              </div>

              {/* Message Footer for Assistant */}
              {!isUser && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <Badge variant="outline" className="text-xs">
                    {message.content.includes("🔍 Search Results:") ? "Search Results" : "AI-Powered Medical Guidance"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line under User Card */}
          {isUser && <div className="border-t border-blue-200 mt-2"></div>}

          {/* Follow-up Suggestions for Assistant Messages */}
          {!isUser && message.followUpSuggestions && onSuggestionClick && (
            <FollowUpSuggestions suggestions={message.followUpSuggestions} onSuggestionClick={onSuggestionClick} />
          )}
        </div>
      </div>
    </div>
  )
}
