import { MedicalOrchestrator } from "@/lib/medical-orchestrator"
import type { NextRequest } from "next/server"

export const maxDuration = 60

// Store orchestrator instances by session ID
const orchestrators = new Map<string, MedicalOrchestrator>()

export async function POST(req: NextRequest) {
  try {
    const { sessionId, action, data } = await req.json()

    if (!sessionId) {
      return Response.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Get or create orchestrator for this session
    let orchestrator = orchestrators.get(sessionId)
    if (!orchestrator) {
      try {
        // Pass sessionId to orchestrator for cache management
        orchestrator = new MedicalOrchestrator(sessionId)
        orchestrators.set(sessionId, orchestrator)
        console.log(`🔄 Created new orchestrator for session: ${sessionId}`)
      } catch (error) {
        console.error("Failed to initialize orchestrator:", error)
        return Response.json({ error: "Failed to initialize orchestrator" }, { status: 500 })
      }
    }

    let response

    if (action === "submitIntakeForm") {
      if (!data || !data.intakeData) {
        return Response.json({ error: "Intake data is required" }, { status: 400 })
      }

      try {
        response = await orchestrator.processIntakeForm(data.intakeData)
      } catch (error) {
        console.error("Error processing intake form:", error)
        return Response.json({ error: "Error processing intake form" }, { status: 500 })
      }
    } else if (action === "sendMessage") {
      if (!data || !data.message) {
        return Response.json({ error: "Message is required" }, { status: 400 })
      }

      try {
        response = await orchestrator.processUserMessage(data.message)
      } catch (error) {
        console.error("Error processing message:", error)
        return Response.json({ error: "Error processing message" }, { status: 500 })
      }
    } else if (action === "getHistory") {
      // New action to get conversation history for debugging
      try {
        const history = orchestrator.getFullConversationHistory()
        return Response.json({ history })
      } catch (error) {
        console.error("Error getting history:", error)
        return Response.json({ error: "Error getting history" }, { status: 500 })
      }
    } else if (action === "clearConversation") {
      // New action to clear conversation
      try {
        orchestrator.clearConversation()
        orchestrators.delete(sessionId)
        return Response.json({ success: true })
      } catch (error) {
        console.error("Error clearing conversation:", error)
        return Response.json({ error: "Error clearing conversation" }, { status: 500 })
      }
    } else {
      return Response.json({ error: `Invalid action: ${action}` }, { status: 400 })
    }

    return Response.json({
      response,
      state: orchestrator.getState(),
      conversationLength: orchestrator.getTranscript().length,
    })
  } catch (error) {
    console.error("Medical chat API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { sessionId } = req.nextUrl.searchParams;

  if (!sessionId) {
    return new Response('Session ID is required', { status: 400 });
  }

  const orchestrator = orchestrators.get(sessionId);
  if (!orchestrator) {
    return new Response('Orchestrator not found', { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      orchestrator.on('data', (chunk) => {
        controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
      });

      orchestrator.on('end', () => {
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
