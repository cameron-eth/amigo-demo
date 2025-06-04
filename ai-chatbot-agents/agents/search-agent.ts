import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import type { IntakeData } from "@/types/medical-types"

const searchResultSchema = z.object({
  searchType: z.enum(["emergency", "specialist", "pharmacy", "urgent_care", "primary_care", "general"]),
  results: z.array(
    z.object({
      name: z.string().describe("Name of the medical facility or service"),
      address: z.string().describe("Full address of the facility"),
      phone: z.string().describe("Phone number if available"),
      type: z.string().describe("Type of facility (e.g., Emergency Room, Urgent Care, etc.)"),
      distance: z.string().describe("Estimated distance from user location"),
      hours: z.string().describe("Operating hours if available"),
      specialties: z.array(z.string()).describe("Medical specialties offered"),
      rating: z.number().optional().describe("Rating out of 5 if available"),
      acceptsInsurance: z.boolean().describe("Whether they accept insurance"),
      emergencyServices: z.boolean().describe("Whether they provide emergency services"),
    }),
  ),
  searchQuery: z.string().describe("The processed search query"),
  location: z.string().describe("The location being searched"),
  additionalInfo: z.string().describe("Additional helpful information about the search"),
})

const searchIntentSchema = z.object({
  isSearchQuery: z.boolean().describe("Whether this is a location-based search query"),
  searchType: z.enum(["emergency", "specialist", "pharmacy", "urgent_care", "primary_care", "general"]),
  location: z.string().describe("The location mentioned in the query"),
  serviceType: z.string().describe("The type of medical service being searched for"),
  urgency: z.enum(["emergency", "urgent", "routine"]).describe("The urgency level of the search"),
})

export class SearchAgent {
  private openai
  private model

  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.model = this.openai("gpt-4o")
  }

  async detectSearchIntent(message: string): Promise<{
    isSearchQuery: boolean
    searchType: string
    location: string
    serviceType: string
    urgency: string
  }> {
    const systemPrompt = `You are a search intent detection agent. Your job is to determine if a user message is requesting a location-based search for medical services.

    Look for patterns like:
    - "Find [medical service] in [location]"
    - "Locate [medical facility] near [location]"
    - "Search for [doctor type] in [location]"
    - "[Medical service] near me"
    - "Emergency rooms in [location]"
    - "Urgent care centers in [location]"
    
    If the message is a search query, extract the location and service type.`

    try {
      const { object } = await generateObject({
        model: this.model,
        system: systemPrompt,
        prompt: `
          Analyze this message to determine if it's a location-based medical search query:
          "${message}"
          
          Determine if this is a search query and extract the relevant information.
        `,
        schema: searchIntentSchema,
      })

      return object
    } catch (error) {
      console.error("Error detecting search intent:", error)
      return {
        isSearchQuery: false,
        searchType: "general",
        location: "",
        serviceType: "",
        urgency: "routine",
      }
    }
  }

  async performSearch(
    searchQuery: string,
    location: string,
    searchType: string,
    intakeData?: IntakeData,
  ): Promise<{
    results: any[]
    searchQuery: string
    location: string
    additionalInfo: string
    searchType: string
  }> {
    const systemPrompt = `You are a medical search agent. Your job is to provide realistic, helpful search results for medical services in specific locations.

    Generate realistic but fictional medical facilities and services for the requested location. Include:
    - Names that sound realistic for medical facilities
    - Actual street addresses that could exist in the specified city
    - Phone numbers in the correct format for the area
    - Realistic operating hours
    - Appropriate specialties for the search type
    - Helpful additional information

    Make the results diverse and comprehensive. Include a mix of:
    - Large hospital systems
    - Independent practices
    - Urgent care centers
    - Specialty clinics
    - Community health centers

    For emergency searches, prioritize hospitals with emergency departments.
    For specialist searches, focus on relevant specialty practices.
    For pharmacy searches, include both chain and independent pharmacies.`

    try {
      const { object } = await generateObject({
        model: this.model,
        system: systemPrompt,
        prompt: `
          Search Query: "${searchQuery}"
          Location: "${location}"
          Search Type: "${searchType}"
          ${intakeData ? `Patient Context: ${JSON.stringify(intakeData)}` : ""}
          
          Generate realistic search results for medical services in this location.
          Provide 5-8 relevant results with complete information.
        `,
        schema: searchResultSchema,
      })

      return object
    } catch (error) {
      console.error("Error performing search:", error)
      return {
        results: [],
        searchQuery,
        location,
        additionalInfo: "Sorry, I encountered an error while searching for medical services.",
        searchType,
      }
    }
  }

  formatSearchResults(searchResults: {
    results: any[]
    searchQuery: string
    location: string
    additionalInfo: string
    searchType: string
  }): string {
    const { results, searchQuery, location, additionalInfo, searchType } = searchResults

    if (results.length === 0) {
      return `I couldn't find any results for "${searchQuery}" in ${location}. ${additionalInfo}`
    }

    let formattedResponse = `## 🔍 Search Results: ${searchQuery}\n\n`
    formattedResponse += `**Location:** ${location}\n\n`

    if (searchType === "emergency") {
      formattedResponse += `⚠️ **For immediate emergencies, call 911**\n\n`
    }

    results.forEach((result, index) => {
      formattedResponse += `### ${index + 1}. **${result.name}**\n`
      formattedResponse += `📍 **Address:** ${result.address}\n`
      formattedResponse += `📞 **Phone:** ${result.phone}\n`
      formattedResponse += `🏥 **Type:** ${result.type}\n`

      if (result.distance) {
        formattedResponse += `📏 **Distance:** ${result.distance}\n`
      }

      if (result.hours) {
        formattedResponse += `🕒 **Hours:** ${result.hours}\n`
      }

      if (result.specialties && result.specialties.length > 0) {
        formattedResponse += `🩺 **Specialties:** ${result.specialties.join(", ")}\n`
      }

      if (result.rating) {
        formattedResponse += `⭐ **Rating:** ${result.rating}/5\n`
      }

      if (result.acceptsInsurance) {
        formattedResponse += `💳 **Insurance:** Accepts most insurance plans\n`
      }

      if (result.emergencyServices) {
        formattedResponse += `🚨 **Emergency Services:** Available 24/7\n`
      }

      formattedResponse += `\n`
    })

    if (additionalInfo) {
      formattedResponse += `\n💡 **Additional Information:** ${additionalInfo}\n\n`
    }

    formattedResponse += `\n**Important:** Please call ahead to confirm availability and insurance acceptance. For emergencies, always call 911 or go to the nearest emergency room.\n\n`
    formattedResponse += `How does this help with your medical needs?`

    return formattedResponse
  }

  generateSearchFollowUps(searchType: string, location: string): string[] {
    const followUps: string[] = []

    switch (searchType) {
      case "emergency":
        followUps.push(`Find urgent care centers in ${location}`)
        followUps.push(`Locate pharmacies near ${location}`)
        break
      case "specialist":
        followUps.push(`Find primary care doctors in ${location}`)
        followUps.push(`Locate urgent care centers in ${location}`)
        break
      case "pharmacy":
        followUps.push(`Find urgent care centers in ${location}`)
        followUps.push(`Locate primary care doctors in ${location}`)
        break
      case "urgent_care":
        followUps.push(`Find emergency rooms near ${location}`)
        followUps.push(`Locate pharmacies near ${location}`)
        break
      case "primary_care":
        followUps.push(`Find specialists in ${location}`)
        followUps.push(`Locate urgent care centers in ${location}`)
        break
      default:
        followUps.push(`Find primary care doctors in ${location}`)
        followUps.push(`Locate urgent care centers in ${location}`)
    }

    return followUps
  }
}
