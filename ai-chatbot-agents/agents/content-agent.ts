import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import type { IntakeData, TimelineData, CaseLabel } from "@/types/medical-types"

const mildCaseResponseSchema = z.object({
  acknowledgment: z.string().describe("Acknowledgment of the patient's primary symptom"),
  selfCareRecommendations: z
    .array(z.string())
    .min(3)
    .max(3)
    .describe("Three self-care recommendations in lay language"),
  followUpTimeframe: z.number().describe("Number of days to wait before seeking further care if not improving"),
})

const emergencyResponseSchema = z.object({
  assessment: z.string().describe("Brief layperson assessment of the situation"),
})

export class ContentAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  async generateMildCaseResponse(
    intakeData: IntakeData,
    timelineData: TimelineData,
  ): Promise<{
    acknowledgment: string
    selfCareRecommendations: string[]
    followUpTimeframe: number
  }> {
    const systemPrompt = `You are a medical content agent providing guidance for mild medical cases. 
    
    Your recommendations must:
    1. Be in simple, lay language (no medical jargon)
    2. Be practical and actionable
    3. Focus on self-care measures
    
    For the follow-up timeframe, suggest a reasonable number of days (typically 3-7) after which the patient should seek professional care if symptoms don't improve.`

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
        
        Timeline Information:
        Progression: ${timelineData.progression}
        Details: ${timelineData.details}
        
        Generate an acknowledgment and three self-care recommendations for this patient.
      `,
      schema: mildCaseResponseSchema,
    })

    return object
  }

  async generateEmergencyResponse(
    intakeData: IntakeData,
    caseLabel: CaseLabel,
  ): Promise<{
    assessment: string
  }> {
    const systemPrompt = `You are a medical content agent providing guidance for potential emergency medical cases.
    
    Your assessment must:
    1. Be in simple, lay language (no medical jargon)
    2. Be brief and clear
    3. Not cause unnecessary panic but convey appropriate urgency
    
    Do not provide a diagnosis, but explain why the symptoms warrant immediate medical attention.`

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
        
        Case Label: ${caseLabel}
        
        Generate a brief layperson assessment explaining why this situation requires immediate medical attention.
      `,
      schema: emergencyResponseSchema,
    })

    return object
  }

  formatMildCaseResponse(
    acknowledgment: string,
    selfCareRecommendations: string[],
    followUpTimeframe: number,
    empathyLines: string[] = [],
  ): string {
    const empathyText = empathyLines.length > 0 ? empathyLines.join(" ") + "\n\n" : ""

    return `${empathyText}I understand you're dealing with ${acknowledgment}

What concerns you most about this?

Based on what you've shared, here are some self-care recommendations:

1. ${selfCareRecommendations[0]}
2. ${selfCareRecommendations[1]}
3. ${selfCareRecommendations[2]}

If this isn't improving in ${followUpTimeframe} days, please contact your healthcare provider. I can provide guidance, but I cannot replace an in-person examination.

How does this sound to you?`
  }

  formatEmergencyResponse(assessment: string, empathyLines: string[] = []): string {
    const empathyText = empathyLines.length > 0 ? empathyLines.join(" ") + "\n\n" : ""

    return `${empathyText}Based on what you've told me, ${assessment}

Here's what I recommend: Call 911 or go to the nearest emergency department right away.

This is beyond what I can safely assess remotely. I can provide guidance, but I cannot replace an in-person examination.

How does this sound to you?`
  }
}
