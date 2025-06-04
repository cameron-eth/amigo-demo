import type { IntakeData } from "@/types/medical-types"

export class IntakeAgent {
  validateIntake(intakeData: IntakeData): { valid: boolean; message?: string } {
    // Check if all required fields are present and non-empty
    const requiredFields: (keyof IntakeData)[] = [
      "fullName",
      "age",
      "gender",
      "existingMedicalConditions",
      "primarySymptomDescription",
      "symptomOnset",
    ]

    for (const field of requiredFields) {
      if (!intakeData[field] || intakeData[field].toString().trim() === "") {
        return {
          valid: false,
          message: `Missing required field: ${field}`,
        }
      }
    }

    // Validate age is a reasonable number
    if (typeof intakeData.age === "number" && (intakeData.age < 0 || intakeData.age > 120)) {
      return {
        valid: false,
        message: "Age must be between 0 and 120",
      }
    }

    return { valid: true }
  }
}
