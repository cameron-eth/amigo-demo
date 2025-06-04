import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"

const empathyAnalysisSchema = z.object({
  containsWorry: z.boolean().describe("Whether the message contains expressions of worry or anxiety"),
  containsPain: z.boolean().describe("Whether the message describes pain"),
  containsDontWorry: z.boolean().describe("Whether the message contains 'don't worry' phrasing"),
  specificSymptom: z.string().describe("The specific symptom the user is worried about, if any"),
})

export class EmpathyAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  async processMessage(message: string): Promise<{
    modifiedMessage: string
    empathyLines: string[]
    analysis: {
      containsWorry: boolean
      containsPain: boolean
      containsDontWorry: boolean
      specificSymptom: string
    }
  }> {
    // For simple cases, we can detect these patterns without calling the API
    const worryTerms = ["worried", "anxious", "concerned", "scared", "afraid", "fear", "stress", "nervous"]
    const painTerms = ["pain", "hurt", "ache", "sore", "discomfort", "agony", "suffering"]

    let containsWorry = worryTerms.some((term) => message.toLowerCase().includes(term))
    let containsPain = painTerms.some((term) => message.toLowerCase().includes(term))
    let containsDontWorry =
      message.toLowerCase().includes("don't worry") || message.toLowerCase().includes("dont worry")

    // For more complex cases or to extract the specific symptom, use the AI
    if (containsWorry || containsPain || containsDontWorry) {
      const { object } = await generateObject({
        model: this.model,
        prompt: `
          Analyze this message for expressions of worry, pain, or "don't worry" phrasing:
          "${message}"
          
          If the user expresses worry or concern, identify the specific symptom they're worried about.
        `,
        schema: empathyAnalysisSchema,
      })

      containsWorry = object.containsWorry
      containsPain = object.containsPain
      containsDontWorry = object.containsDontWorry

      let modifiedMessage = message
      const empathyLines: string[] = []

      if (containsWorry && object.specificSymptom) {
        const empathyLine = `It's completely understandable that you're concerned about ${object.specificSymptom}.`
        empathyLines.push(empathyLine)
      }

      if (containsPain) {
        const painLine = "That sounds really uncomfortable."
        empathyLines.push(painLine)
      }

      if (containsDontWorry) {
        modifiedMessage = modifiedMessage.replace(/don['']?t worry/gi, "Let's work through this together")
      }

      return {
        modifiedMessage,
        empathyLines,
        analysis: {
          containsWorry,
          containsPain,
          containsDontWorry,
          specificSymptom: object.specificSymptom,
        },
      }
    }

    return {
      modifiedMessage: message,
      empathyLines: [],
      analysis: {
        containsWorry: false,
        containsPain: false,
        containsDontWorry: false,
        specificSymptom: "",
      },
    }
  }
}
