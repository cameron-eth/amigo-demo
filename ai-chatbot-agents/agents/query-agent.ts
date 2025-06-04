import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import type { QueryAnalysis } from "@/types/agents"

const queryAnalysisSchema = z.object({
  intent: z.string().describe("The main intent or purpose of the user query"),
  entities: z.array(z.string()).describe("Key entities, names, or concepts mentioned"),
  context: z.string().describe("Additional context or background information"),
  complexity: z.enum(["simple", "medium", "complex"]).describe("Complexity level of the query"),
  formattedQuery: z.string().describe("A clear, well-formatted version of the original query"),
})

export class QueryAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  async analyzeQuery(userQuery: string, conversationHistory: string[] = []): Promise<QueryAnalysis> {
    const systemPrompt = `You are a query analysis agent. Your job is to understand user queries and extract key information.
    
    Analyze the user's query and provide:
    1. Intent: What the user wants to accomplish
    2. Entities: Important nouns, names, concepts mentioned
    3. Context: Background information that might be relevant
    4. Complexity: How complex this query is to answer
    5. Formatted Query: A clear, well-structured version of the query
    
    Consider the conversation history for context.`

    const { object } = await generateObject({
      model: this.model,
      system: systemPrompt,
      prompt: `
        User Query: "${userQuery}"
        
        Conversation History: ${conversationHistory.join("\n")}
        
        Analyze this query and provide the structured analysis.
      `,
      schema: queryAnalysisSchema,
    })

    return object
  }
}
