export interface QueryAnalysis {
  intent: string
  entities: string[]
  context: string
  complexity: "simple" | "medium" | "complex"
  formattedQuery: string
}

export interface AgentResponse {
  content: string
  confidence: number
  reasoning?: string
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  analysis?: QueryAnalysis
}
