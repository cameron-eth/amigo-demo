export const agentConfig = {
  queryAgent: {
    model: "gpt-4o",
    temperature: 0.3, // Lower temperature for more consistent analysis
    maxTokens: 500,
  },
  responseAgent: {
    model: "gpt-4o",
    temperature: 0.7, // Higher temperature for more creative responses
    maxTokens: 1000,
  },
  orchestrator: {
    enableLogging: true,
    enableAnalysisHeaders: true,
  },
}
