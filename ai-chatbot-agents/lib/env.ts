export function getOpenAIApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please set OPENAI_API_KEY environment variable.")
  }

  return apiKey
}

export function validateEnvironment() {
  try {
    getOpenAIApiKey()
    console.log("✅ Environment validation passed")
    return true
  } catch (error) {
    console.error("❌ Environment validation failed:", error)
    return false
  }
}
