"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ArrowRight } from "lucide-react"

interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
}

export function FollowUpSuggestions({ suggestions, onSuggestionClick }: FollowUpSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <Card className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Location-based suggestions:</span>
        </div>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full justify-between text-left h-auto p-3 hover:bg-blue-100 border-blue-200"
            >
              <span className="text-sm text-blue-700">{suggestion}</span>
              <ArrowRight className="w-3 h-3 text-zinc-500/65" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
