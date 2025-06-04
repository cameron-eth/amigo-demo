import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"

const languageCheckSchema = z.object({
  compliant: z.boolean().describe("Whether the response complies with all language requirements"),
  correctedText: z.string().describe("The corrected text if non-compliant"),
  issues: z.array(z.string()).describe("List of identified issues"),
})

export class LanguageCheckAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  async checkLanguage(
    text: string,
    caseLabel: "Mild" | "Potential Emergency" | "Emergency",
  ): Promise<{
    compliant: boolean
    correctedText: string
    issues: string[]
  }> {
    const systemPrompt = `You are a medical language compliance agent. Your job is to ensure all responses follow these strict rules:

    1. Acknowledgments must begin with "I understand"
    2. No medical jargon - only lay terms (e.g., "high blood pressure" not "hypertension")
    3. Timeline question must be exactly: "When did this first start, and has it been getting better, worse, or staying the same?"
    4. For mild cases, must ask "What concerns you most about this?" before recommendations
    5. Empathy lines must be exact:
       - For worry: "It's completely understandable that you're concerned about [specific symptom]."
       - For pain: "That sounds really uncomfortable."
       - Replace "don't worry" with "Let's work through this together."
    6. All responses must end with "How does this sound to you?"
    7. Emergency responses must include "Call 911 or go to the nearest emergency department right away."
    8. All responses must include "I can provide guidance, but I cannot replace an in-person examination."
    
    If any rule is violated, correct the text while preserving the medical content.`

    const { object } = await generateObject({
      model: this.model,
      system: systemPrompt,
      prompt: `
        Case Label: ${caseLabel}
        
        Response Text:
        "${text}"
        
        Check if this response complies with all language requirements. If not, provide a corrected version.
      `,
      schema: languageCheckSchema,
    })

    return object
  }
}
