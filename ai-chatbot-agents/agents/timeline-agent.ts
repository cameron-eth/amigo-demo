import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import type { IntakeData, TimelineData, CaseLabel } from "@/types/medical-types"

const timelineAnalysisSchema = z.object({
  progression: z
    .enum(["better", "worse", "same"])
    .describe("Whether symptoms are getting better, worse, or staying the same"),
  rapidWorsening: z.boolean().describe("Whether symptoms are rapidly worsening"),
  alarmingChange: z.boolean().describe("Whether there are alarming changes in symptoms"),
  recommendedLabel: z
    .enum(["Mild", "Potential Emergency", "Emergency"])
    .describe("Recommended case label based on timeline"),
  reasoning: z.string().describe("Reasoning behind the timeline analysis"),
})

export class TimelineAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  getTimelineQuestion(): string {
    return "When did this first start, and has it been getting better, worse, or staying the same?"
  }

  async analyzeTimeline(
    timelineResponse: string,
    intakeData: IntakeData,
  ): Promise<{
    timelineData: TimelineData
    updatedLabel: CaseLabel
    rapidWorsening: boolean
    alarmingChange: boolean
    reasoning: string
  }> {
    const systemPrompt = `You are a medical timeline analysis agent. Your job is to examine the patient's description of their symptom timeline and determine if there are concerning patterns.
    
    If the patient indicates rapid worsening or alarming changes in symptoms, this may warrant escalation to "Potential Emergency" or "Emergency".
    
    Examples of concerning timeline patterns:
    - Symptoms rapidly worsening over hours
    - Sudden onset of severe symptoms
    - Progressive worsening despite self-care
    - New, severe symptoms appearing
    
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
        
        Timeline Response: "${timelineResponse}"
        
        Analyze this timeline information and determine if there are concerning patterns.
      `,
      schema: timelineAnalysisSchema,
    })

    const timelineData: TimelineData = {
      progression: object.progression,
      details: timelineResponse,
    }

    return {
      timelineData,
      updatedLabel: object.recommendedLabel,
      rapidWorsening: object.rapidWorsening,
      alarmingChange: object.alarmingChange,
      reasoning: object.reasoning,
    }
  }
}
