import type { IntakeData, CaseLabel } from "@/types/medical-types"
import { ContentAgent } from "./content-agent"

export class EscalationAgent {
  private contentAgent: ContentAgent

  constructor() {
    this.contentAgent = new ContentAgent()
  }

  async generateEscalationResponse(
    intakeData: IntakeData,
    caseLabel: CaseLabel,
    empathyLines: string[] = [],
  ): Promise<string> {
    console.log(`⚠️ ESCALATION: Case escalated to ${caseLabel} for ${intakeData.fullName}`)

    const { assessment } = await this.contentAgent.generateEmergencyResponse(intakeData, caseLabel)
    return this.contentAgent.formatEmergencyResponse(assessment, empathyLines)
  }
}
