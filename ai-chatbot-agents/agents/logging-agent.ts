import type { IntakeData, TimelineData, CaseLabel, AgentDecision, Message } from "@/types/medical-types"

export class LoggingAgent {
  private logs: {
    timestamp: Date
    type: string
    data: any
  }[] = []

  logIntakeData(intakeData: IntakeData): void {
    this.logs.push({
      timestamp: new Date(),
      type: "INTAKE_DATA",
      data: intakeData,
    })
    console.log(`📝 LOG: Intake data received for ${intakeData.fullName}`)
  }

  logTimelineData(timelineData: TimelineData): void {
    this.logs.push({
      timestamp: new Date(),
      type: "TIMELINE_DATA",
      data: timelineData,
    })
    console.log(`📝 LOG: Timeline data recorded - Progression: ${timelineData.progression}`)
  }

  logAgentDecision(agent: string, decision: string): void {
    const agentDecision: AgentDecision = {
      agent,
      decision,
      timestamp: new Date(),
    }

    this.logs.push({
      timestamp: new Date(),
      type: "AGENT_DECISION",
      data: agentDecision,
    })
    console.log(`📝 LOG: ${agent}: ${decision}`)
  }

  logCaseLabel(caseLabel: CaseLabel): void {
    this.logs.push({
      timestamp: new Date(),
      type: "CASE_LABEL",
      data: { caseLabel },
    })
    console.log(`📝 LOG: Case labeled as ${caseLabel}`)
  }

  logMessage(message: Message): void {
    this.logs.push({
      timestamp: new Date(),
      type: "MESSAGE",
      data: message,
    })
    console.log(`📝 LOG: ${message.role} message: ${message.content.substring(0, 50)}...`)
  }

  getTranscript(): any[] {
    return this.logs
  }
}
