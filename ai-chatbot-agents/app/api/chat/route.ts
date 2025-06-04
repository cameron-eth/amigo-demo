import { AgentOrchestrator } from "@/lib/agent-orchestrator"
import { validateEnvironment } from "@/lib/env"
import type { NextRequest } from "next/server"

export const maxDuration = 30

// Validate environment on startup
if (!validateEnvironment()) {
  console.error("Environment validation failed. Please check your API key configuration.")
}

let orchestrator: AgentOrchestrator

try {
  orchestrator = new AgentOrchestrator()
} catch (error) {
  console.error("Failed to initialize AgentOrchestrator:", error)
}

export async function POST(req: NextRequest) {
  try {
    if (!orchestrator) {
      return new Response("Service unavailable - configuration error", { status: 503 })
    }

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content) {
      return new Response("Message content is required", { status: 400 })
    }

    const conversationHistory = messages.slice(0, -1)

    const { analysis, responseStream } = await orchestrator.processMessage(lastMessage.content, conversationHistory)

    // Add analysis to response headers for debugging
    const response = responseStream.toDataStreamResponse()
    response.headers.set("X-Query-Analysis", JSON.stringify(analysis))

    return response
  } catch (error) {
    console.error("Chat API error:", error)

    if (error instanceof Error && error.message.includes("API key")) {
      return new Response("API configuration error", { status: 500 })
    }

    return new Response("Internal server error", { status: 500 })
  }
}
