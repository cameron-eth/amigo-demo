import type { IntakeData, CaseLabel } from "@/types/medical-types"

export class FollowUpAgent {
  generateFollowUpSuggestions(intakeData: IntakeData, caseLabel: CaseLabel, responseContent: string): string[] {
    const location = intakeData.location
    const symptom = intakeData.primarySymptomDescription

    if (caseLabel === "Emergency" || caseLabel === "Potential Emergency") {
      return [`Find emergency rooms near ${location}`, `Locate urgent care centers in ${location}`]
    }

    // For mild cases, generate contextual suggestions based on the symptom
    const suggestions: string[] = []

    // Add location-based medical services
    if (symptom.toLowerCase().includes("cough") || symptom.toLowerCase().includes("throat")) {
      suggestions.push(`Find ENT specialists in ${location}`)
      suggestions.push(`Locate pharmacies near ${location}`)
    } else if (symptom.toLowerCase().includes("pain") || symptom.toLowerCase().includes("back")) {
      suggestions.push(`Find physical therapy clinics in ${location}`)
      suggestions.push(`Locate pain management doctors in ${location}`)
    } else if (symptom.toLowerCase().includes("skin") || symptom.toLowerCase().includes("rash")) {
      suggestions.push(`Find dermatologists in ${location}`)
      suggestions.push(`Locate urgent care centers in ${location}`)
    } else if (symptom.toLowerCase().includes("stomach") || symptom.toLowerCase().includes("nausea")) {
      suggestions.push(`Find gastroenterologists in ${location}`)
      suggestions.push(`Locate urgent care centers in ${location}`)
    } else if (symptom.toLowerCase().includes("headache") || symptom.toLowerCase().includes("dizziness")) {
      suggestions.push(`Find neurologists in ${location}`)
      suggestions.push(`Locate urgent care centers in ${location}`)
    } else {
      // Generic suggestions
      suggestions.push(`Find primary care doctors in ${location}`)
      suggestions.push(`Locate urgent care centers in ${location}`)
    }

    return suggestions.slice(0, 2) // Return only 2 suggestions
  }

  generateGenericFollowUpSuggestions(location: string): string[] {
    return [`Find primary care doctors in ${location}`, `Locate pharmacies near ${location}`]
  }
}
