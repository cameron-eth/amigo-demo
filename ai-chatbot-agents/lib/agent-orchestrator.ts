import { QueryAgent } from "@/agents/query-agent"
import { ResponseAgent } from "@/agents/response-agent"
import type { Message } from "@/types/agents"

export class AgentOrchestrator {
  private queryAgent: QueryAgent
  private responseAgent: ResponseAgent

  constructor() {
    // Validate API key exists
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OpenAI API key is required. Please set OPENAI_API_KEY environment variable.")
    }

    this.queryAgent = new QueryAgent()
    this.responseAgent = new ResponseAgent()
  }

  async processMessage(userMessage: string, conversationHistory: Message[] = []) {
    try {
      console.log("Processing message:", userMessage)

      // Step 1: Analyze the query
      const historyStrings = conversationHistory.map((msg) => msg.content)
      console.log("Analyzing query with history:", historyStrings.length, "messages")

      const analysis = await this.queryAgent.analyzeQuery(userMessage, historyStrings)
      console.log("Query analysis complete:", analysis)

      // Step 2: Generate response using the analysis
      console.log("Generating response...")
      const responseStream = await this.responseAgent.generateResponse(analysis, historyStrings)

      return {
        analysis,
        responseStream,
      }
    } catch (error) {
      console.error("Error in agent orchestrator:", error)
      throw error
    }
  }
}
