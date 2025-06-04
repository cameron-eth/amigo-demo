import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import type { IntakeData, CaseLabel } from "@/types/medical-types"

const triageResultSchema = z.object({
  caseLabel: z.enum(["Mild", "Potential Emergency", "Emergency"]),
  reasoning: z.string().describe("Reasoning behind the triage decision"),
  redFlagTermsDetected: z.array(z.string()).describe("Red flag terms detected in the symptoms"),
})

export class TriageAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  async triageCase(intakeData: IntakeData): Promise<{
    caseLabel: CaseLabel
    reasoning: string
    redFlagTermsDetected: string[]
  }> {
    try {
      const redFlagTerms = [
        "chest pain",
        "difficulty breathing",
        "severe bleeding",
        "sudden weakness",
        "numbness",
        "paralysis",
        "stroke",
        "heart attack",
        "unconscious",
        "unresponsive",
        "seizure",
        "severe headache",
        "head injury",
        "cannot move",
        "cannot speak",
        "severe abdominal pain",
        "coughing blood",
        "vomiting blood",
        "suicidal",
        "overdose",
      ]

      const systemPrompt = `You are a medical triage agent. Your job is to examine the patient's symptoms and medical conditions to determine if this is an emergency situation.

      Red flag terms that indicate a potential emergency include: ${redFlagTerms.join(", ")}
      
      If any of these terms or similar urgent medical concerns are present, label the case as "Emergency".
      If the symptoms are concerning but not immediately life-threatening, label as "Potential Emergency".
      Otherwise, label the case as "Mild".
      
      Be conservative - if there's any doubt about patient safety, err on the side of caution.`

      const { object } = await generateObject({
        model: this.model,
        system: systemPrompt,
        prompt: `
          Patient Information:
          Full Name: ${intakeData.fullName}
          Age: ${intakeData.age}
          Gender: ${intakeData.gender}
          Existing Medical Conditions: ${intakeData.existingMedicalConditions}
          Primary Symptom Description: ${intakeData.primarySymptomDescription}
          Symptom Onset: ${intakeData.symptomOnset}
          
          Analyze this information and determine the appropriate triage label.
        `,
        schema: triageResultSchema,
      })

      return object
    } catch (error) {
      console.error("Error in triage agent:", error)
      // Default to the safest option if there's an error
      return {
        caseLabel: "Mild",
        reasoning: "Error occurred during triage, defaulting to mild case",
        redFlagTermsDetected: [],
      }
    }
  }
}
