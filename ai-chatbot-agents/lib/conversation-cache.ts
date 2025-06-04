import type { Message, ConsultationState } from "@/types/medical-types"

interface CachedConversation {
  messages: Message[]
  state: ConsultationState
  lastUpdated: Date
}

class ConversationCache {
  private cache = new Map<string, CachedConversation>()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours

  set(sessionId: string, messages: Message[], state: ConsultationState): void {
    this.cache.set(sessionId, {
      messages: [...messages],
      state: { ...state },
      lastUpdated: new Date(),
    })
  }

  get(sessionId: string): CachedConversation | null {
    const cached = this.cache.get(sessionId)
    if (!cached) return null

    // Check if cache is expired
    if (Date.now() - cached.lastUpdated.getTime() > this.TTL) {
      this.cache.delete(sessionId)
      return null
    }

    return cached
  }

  clear(sessionId: string): void {
    this.cache.delete(sessionId)
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [sessionId, cached] of this.cache.entries()) {
      if (now - cached.lastUpdated.getTime() > this.TTL) {
        this.cache.delete(sessionId)
      }
    }
  }

  // Get conversation history for AI context
  getConversationHistory(sessionId: string): string[] {
    const cached = this.get(sessionId)
    if (!cached) return []

    return cached.messages.filter((msg) => msg.role !== "system").map((msg) => `${msg.role}: ${msg.content}`)
  }

  // Get recent messages for context (last N messages)
  getRecentMessages(sessionId: string, count = 10): Message[] {
    const cached = this.get(sessionId)
    if (!cached) return []

    return cached.messages.slice(-count)
  }
}

// Singleton instance
export const conversationCache = new ConversationCache()

// Cleanup expired entries every hour
setInterval(
  () => {
    conversationCache.cleanup()
  },
  60 * 60 * 1000,
)
