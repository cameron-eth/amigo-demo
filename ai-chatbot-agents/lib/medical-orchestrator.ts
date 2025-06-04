import { v4 as uuidv4 } from "uuid"
import { IntakeAgent } from "@/agents/intake-agent"
import { TriageAgent } from "@/agents/triage-agent"
import { TimelineAgent } from "@/agents/timeline-agent"
import { EmpathyAgent } from "@/agents/empathy-agent"
import { ContentAgent } from "@/agents/content-agent"
import { LanguageCheckAgent } from "@/agents/language-check-agent"
import { EscalationAgent } from "@/agents/escalation-agent"
import { LoggingAgent } from "@/agents/logging-agent"
import { FollowUpAgent } from "@/agents/follow-up-agent"
import { SearchAgent } from "@/agents/search-agent"
import { conversationCache } from "@/lib/conversation-cache"
import type { IntakeData, ConsultationState, Message, AgentResponse } from "@/types/medical-types"
import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"

export class MedicalOrchestrator {
  private intakeAgent: IntakeAgent
  private triageAgent: TriageAgent
  private timelineAgent: TimelineAgent
  private empathyAgent: EmpathyAgent
  private contentAgent: ContentAgent
  private languageCheckAgent: LanguageCheckAgent
  private escalationAgent: EscalationAgent
  private loggingAgent: LoggingAgent
  private followUpAgent: FollowUpAgent
  private searchAgent: SearchAgent
  private state: ConsultationState
  private openai
  private sessionId: string

  constructor(sessionId: string) {
    this.sessionId = sessionId

    // Initialize OpenAI client
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Initialize agents
    this.intakeAgent = new IntakeAgent()
    this.triageAgent = new TriageAgent()
    this.timelineAgent = new TimelineAgent()
    this.empathyAgent = new EmpathyAgent()
    this.contentAgent = new ContentAgent()
    this.languageCheckAgent = new LanguageCheckAgent()
    this.escalationAgent = new EscalationAgent()
    this.loggingAgent = new LoggingAgent()
    this.followUpAgent = new FollowUpAgent()
    this.searchAgent = new SearchAgent()

    // Try to restore from cache or initialize new state
    const cached = conversationCache.get(sessionId)
    if (cached) {
      this.state = cached.state
      console.log(`Restored conversation for session ${sessionId} with ${cached.messages.length} messages`)
    } else {
      this.state = {
        intakeData: null,
        timelineData: null,
        caseLabel: null,
        decisions: [],
        transcript: [],
        currentStep: "intake",
      }
      console.log(`Created new conversation for session ${sessionId}`)
    }
  }

  private addMessage(role: "user" | "assistant" | "system", content: string, followUpSuggestions?: string[]): void {
    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
      followUpSuggestions,
    }

    this.state.transcript.push(message)
    this.loggingAgent.logMessage(message)

    // Update cache
    this.updateCache()
  }

  private addDecision(agent: string, decision: string): void {
    this.loggingAgent.logAgentDecision(agent, decision)
  }

  private updateCache(): void {
    conversationCache.set(this.sessionId, this.state.transcript, this.state)
  }

  private getConversationContext(): string[] {
    return conversationCache.getConversationHistory(this.sessionId)
  }

  private getRecentMessages(): Message[] {
    return conversationCache.getRecentMessages(this.sessionId, 10)
  }

  async processIntakeForm(intakeData: IntakeData): Promise<AgentResponse> {
    try {
      console.log("Processing intake form...")

      // Step 1: Validate intake data
      const validationResult = this.intakeAgent.validateIntake(intakeData)
      if (!validationResult.valid) {
        this.addDecision("IntakeAgent", `Validation failed: ${validationResult.message}`)
        return {
          content: `Please complete all required fields. ${validationResult.message}`,
        }
      }

      this.addDecision("IntakeAgent", "Intake data validated")
      this.state.intakeData = intakeData
      this.state.location = intakeData.location
      this.state.currentStep = "triage"
      this.loggingAgent.logIntakeData(intakeData)

      // Step 2: Triage the case
      const triageResult = await this.triageAgent.triageCase(intakeData)
      this.state.caseLabel = triageResult.caseLabel
      this.addDecision("TriageAgent", `Case labeled as ${triageResult.caseLabel}`)
      this.loggingAgent.logCaseLabel(triageResult.caseLabel)

      // Step 3: Route based on triage result
      if (triageResult.caseLabel === "Emergency" && !this.isMildSymptom(intakeData.primarySymptomDescription)) {
        this.state.currentStep = "escalation"
        const escalationResponse = await this.escalationAgent.generateEscalationResponse(
          intakeData,
          triageResult.caseLabel,
        )

        // Step 4: Language check
        const checkedResponse = await this.languageCheckAgent.checkLanguage(escalationResponse, triageResult.caseLabel)

        const finalResponse = checkedResponse.compliant ? escalationResponse : checkedResponse.correctedText

        // Generate follow-up suggestions
        const followUpSuggestions = this.followUpAgent.generateFollowUpSuggestions(
          intakeData,
          triageResult.caseLabel,
          finalResponse,
        )

        this.addMessage("assistant", finalResponse, followUpSuggestions)
        this.state.currentStep = "complete"

        return { content: finalResponse, followUpSuggestions }
      } else {
        // For mild cases, we need to ask for timeline information
        this.state.currentStep = "timeline"
        const timelineQuestion = this.timelineAgent.getTimelineQuestion()
        this.addMessage("assistant", timelineQuestion)

        return { content: timelineQuestion }
      }
    } catch (error) {
      console.error("Error in medical orchestrator:", error)
      this.addDecision("Orchestrator", `Error: ${error instanceof Error ? error.message : String(error)}`)
      return { content: "I'm sorry, there was an error processing your information. Please try again." }
    }
  }

  private isMildSymptom(symptom: string): boolean {
    const mildSymptoms = ["sore throat", "headache", "cough"];
    const moderateSymptoms = ["persistent cough", "high fever", "severe headache"];
    const severeSymptoms = ["chest pain", "difficulty breathing", "loss of consciousness"];

    // Example severity ranking
    console.log(`Evaluating symptom severity for: ${symptom}`);
    if (mildSymptoms.includes(symptom.toLowerCase())) {
      console.log(`Symptom '${symptom}' is considered mild.`);
      return true;
    } else if (moderateSymptoms.includes(symptom.toLowerCase())) {
      console.log(`Symptom '${symptom}' is considered moderate.`);
      return false;
    } else if (severeSymptoms.includes(symptom.toLowerCase())) {
      console.log(`Symptom '${symptom}' is considered severe.`);
      return false;
    } else {
      console.log(`Symptom '${symptom}' is not recognized, defaulting to non-mild.`);
      return false;
    }
  }

  async processUserMessage(message: string): Promise<AgentResponse> {
    try {
      console.log(`Processing user message: ${message}`)
      this.addMessage("user", message)

      // Step 1: Check if this is a search query
      const searchIntent = await this.searchAgent.detectSearchIntent(message)

      if (searchIntent.isSearchQuery) {
        this.addDecision(
          "SearchAgent",
          `Detected search query: ${searchIntent.serviceType} in ${searchIntent.location}`,
        )

        // Perform the search
        const searchResults = await this.searchAgent.performSearch(
          message,
          searchIntent.location,
          searchIntent.searchType,
          this.state.intakeData || undefined,
        )

        // Format the results
        const formattedResponse = this.searchAgent.formatSearchResults(searchResults)

        // Generate search-specific follow-ups
        const followUpSuggestions = this.searchAgent.generateSearchFollowUps(
          searchIntent.searchType,
          searchIntent.location,
        )

        this.addMessage("assistant", formattedResponse, followUpSuggestions)

        return { content: formattedResponse, followUpSuggestions }
      }

      // Get conversation context for better responses
      const conversationHistory = this.getConversationContext()
      const recentMessages = this.getRecentMessages()

      console.log(`Using conversation context: ${conversationHistory.length} messages`)

      // Step 2: Process with empathy agent
      const empathyResult = await this.empathyAgent.processMessage(message)
      if (empathyResult.empathyLines.length > 0) {
        this.addDecision("EmpathyAgent", `Added empathy lines: ${empathyResult.empathyLines.join(", ")}`)
      }

      // Step 3: Route based on current step
      if (this.state.currentStep === "intake") {
        // Handle intake step
        if (!this.state.intakeData) {
          throw new Error("Intake data missing")
        }
        // Process intake data and move to the next step
        this.state.currentStep = "timeline"
        return { content: "Intake data received. Moving to timeline analysis." }
      } else if (this.state.currentStep === "timeline") {
        if (!this.state.intakeData) {
          throw new Error("Intake data missing")
        }

        // Process timeline response with conversation context
        const timelineAnalysis = await this.timelineAgent.analyzeTimeline(message, this.state.intakeData)
        this.state.timelineData = timelineAnalysis.timelineData
        this.loggingAgent.logTimelineData(timelineAnalysis.timelineData)

        // Check if we need to escalate based on timeline
        if (timelineAnalysis.rapidWorsening || timelineAnalysis.alarmingChange) {
          this.state.caseLabel = "Potential Emergency"
          this.addDecision(
            "TimelineAgent",
            `Escalated to ${this.state.caseLabel} due to ${timelineAnalysis.rapidWorsening ? "rapid worsening" : "alarming changes"}`,
          )
          this.loggingAgent.logCaseLabel(this.state.caseLabel)

          this.state.currentStep = "escalation"
          const escalationResponse = await this.escalationAgent.generateEscalationResponse(
            this.state.intakeData,
            this.state.caseLabel,
            empathyResult.empathyLines,
          )

          // Language check
          const checkedResponse = await this.languageCheckAgent.checkLanguage(escalationResponse, this.state.caseLabel)

          const finalResponse = checkedResponse.compliant ? escalationResponse : checkedResponse.correctedText

          // Generate follow-up suggestions
          const followUpSuggestions = this.followUpAgent.generateFollowUpSuggestions(
            this.state.intakeData,
            this.state.caseLabel,
            finalResponse,
          )

          this.addMessage("assistant", finalResponse, followUpSuggestions)
          this.state.currentStep = "complete"

          return { content: finalResponse, followUpSuggestions }
        } else {
          // Continue with mild case flow
          this.state.currentStep = "content"
          const contentResult = await this.contentAgent.generateMildCaseResponse(
            this.state.intakeData,
            this.state.timelineData,
          )

          const formattedResponse = this.contentAgent.formatMildCaseResponse(
            contentResult.acknowledgment,
            contentResult.selfCareRecommendations,
            contentResult.followUpTimeframe,
            empathyResult.empathyLines,
          )

          // Language check
          const checkedResponse = await this.languageCheckAgent.checkLanguage(formattedResponse, "Mild")

          const finalResponse = checkedResponse.compliant ? formattedResponse : checkedResponse.correctedText

          // Generate follow-up suggestions
          const followUpSuggestions = this.followUpAgent.generateFollowUpSuggestions(
            this.state.intakeData,
            "Mild",
            finalResponse,
          )

          this.addMessage("assistant", finalResponse, followUpSuggestions)
          this.state.currentStep = "complete"

          return { content: finalResponse, followUpSuggestions }
        }
      } else if (this.state.currentStep === "complete") {
        // Handle follow-up questions with full conversation context
        if (!this.state.intakeData) {
          throw new Error("Intake data missing")
        }

        // Re-triage to check for new red flags
        const triageResult = await this.triageAgent.triageCase({
          ...this.state.intakeData,
          primarySymptomDescription: `${this.state.intakeData.primarySymptomDescription} + FOLLOW-UP: ${message}`,
        })

        if (triageResult.caseLabel === "Emergency" || triageResult.caseLabel === "Potential Emergency") {
          // Escalate if new red flags detected
          this.state.caseLabel = triageResult.caseLabel
          this.addDecision("TriageAgent", `Re-escalated to ${triageResult.caseLabel} based on follow-up`)
          this.loggingAgent.logCaseLabel(triageResult.caseLabel)

          const escalationResponse = await this.escalationAgent.generateEscalationResponse(
            this.state.intakeData,
            triageResult.caseLabel,
            empathyResult.empathyLines,
          )

          // Language check
          const checkedResponse = await this.languageCheckAgent.checkLanguage(
            escalationResponse,
            triageResult.caseLabel,
          )

          const finalResponse = checkedResponse.compliant ? escalationResponse : checkedResponse.correctedText

          // Generate follow-up suggestions
          const followUpSuggestions = this.followUpAgent.generateFollowUpSuggestions(
            this.state.intakeData,
            triageResult.caseLabel,
            finalResponse,
          )

          this.addMessage("assistant", finalResponse, followUpSuggestions)

          return { content: finalResponse, followUpSuggestions }
        } else {
          // Generate follow-up response for mild case with conversation context
          const model = this.openai("gpt-4o")
          const { object } = await generateObject({
            model,
            system: `You are a medical assistant providing follow-up guidance. 
            Maintain a conversational but professional tone. 
            Use only lay language (no medical jargon).
            Always end with "How does this sound to you?"
            Always include "I can provide guidance, but I cannot replace an in-person examination."
            
            Use the conversation history to provide contextual responses and remember what was previously discussed.`,
            prompt: `
              Patient Information:
              ${JSON.stringify(this.state.intakeData)}
              
              Full Conversation History:
              ${conversationHistory.join("\n")}
              
              Recent Messages Context:
              ${recentMessages
                .slice(-6)
                .map((m) => `${m.role}: ${m.content}`)
                .join("\n")}
              
              User's Current Follow-up Question:
              "${message}"
              
              ${empathyResult.empathyLines.length > 0 ? `Empathy lines to include: ${empathyResult.empathyLines.join(" ")}` : ""}
              
              Provide a helpful response that acknowledges the conversation history and addresses this follow-up question contextually.
            `,
            schema: z.object({
              response: z.string().describe("The contextual follow-up response"),
            }),
          })

          // Language check
          const checkedResponse = await this.languageCheckAgent.checkLanguage(object.response, "Mild")

          const finalResponse = checkedResponse.compliant ? object.response : checkedResponse.correctedText

          // Generate follow-up suggestions
          const followUpSuggestions = this.state.location
            ? this.followUpAgent.generateGenericFollowUpSuggestions(this.state.location)
            : []

          this.addMessage("assistant", finalResponse, followUpSuggestions)

          return { content: finalResponse, followUpSuggestions }
        }
      } else {
        throw new Error(`Invalid step: ${this.state.currentStep}`)
      }
    } catch (error) {
      console.error("Error processing user message:", error)
      this.addDecision("Orchestrator", `Error: ${error instanceof Error ? error.message : String(error)}`)
      return { content: "I'm sorry, there was an error processing your message. Please try again." }
    }
  }

  getState(): ConsultationState {
    return { ...this.state }
  }

  getTranscript(): Message[] {
    return [...this.state.transcript]
  }

  // Get full conversation history for debugging
  getFullConversationHistory(): string[] {
    return this.getConversationContext()
  }

  // Clear conversation cache
  clearConversation(): void {
    conversationCache.clear(this.sessionId)
    this.state = {
      intakeData: null,
      timelineData: null,
      caseLabel: null,
      decisions: [],
      transcript: [],
      currentStep: "intake",
    }
  }
}
