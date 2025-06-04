export interface IntakeData {
  fullName: string
  age: number
  gender: string
  existingMedicalConditions: string
  primarySymptomDescription: string
  symptomOnset: string
  location: string // Added location field
  height: string // Added height field
  weight: string // Added weight field
  heightFeet?: string;
  heightInches?: string;
}

export interface TimelineData {
  progression: string // better, worse, or same
  details: string
}

export type CaseLabel = "Mild" | "Potential Emergency" | "Emergency"

export interface AgentDecision {
  agent: string
  decision: string
  timestamp: Date
}

export interface ConsultationState {
  intakeData: IntakeData | null
  timelineData: TimelineData | null
  caseLabel: CaseLabel | null
  decisions: AgentDecision[]
  transcript: Message[]
  currentStep: "intake" | "triage" | "timeline" | "content" | "escalation" | "complete"
  location?: string // Store user location
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  followUpSuggestions?: string[] // Add follow-up suggestions
  userName?: string
  userLocation?: string
}

export interface AgentResponse {
  content: string
  metadata?: Record<string, any>
  followUpSuggestions?: string[] // Add follow-up suggestions to responses
}
