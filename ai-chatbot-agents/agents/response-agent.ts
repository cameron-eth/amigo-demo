import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import type { QueryAnalysis } from "@/types/agents"

export class ResponseAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  async generateResponse(analysis: QueryAnalysis, conversationHistory: string[] = []) {
    const systemPrompt = `You are a helpful AI assistant. You have received a pre-analyzed query with the following information:
    
    Intent: ${analysis.intent}
    Entities: ${analysis.entities.join(", ")}
    Context: ${analysis.context}
    Complexity: ${analysis.complexity}
    Formatted Query: ${analysis.formattedQuery}
    
    Use this analysis to provide a helpful, accurate, and contextually appropriate response.
    Be conversational but informative. Adjust your response style based on the complexity level.`

    const result = streamText({
      model: this.model,
      system: systemPrompt,
      messages: [
        ...conversationHistory.map((msg, index) => ({
          role: index % 2 === 0 ? "user" : ("assistant" as const),
          content: msg,
        })),
        {
          role: "user" as const,
          content: analysis.formattedQuery,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result
  }
}
