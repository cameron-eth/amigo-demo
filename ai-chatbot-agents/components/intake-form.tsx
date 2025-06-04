"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IntakeData } from "@/types/medical-types"

interface IntakeFormProps {
  onSubmit: (data: IntakeData) => void
  isLoading: boolean
}

export function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [formData, setFormData] = useState<IntakeData>({
    fullName: "",
    age: 0,
    gender: "",
    existingMedicalConditions: "",
    primarySymptomDescription: "",
    symptomOnset: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof IntakeData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.age || formData.age <= 0 || formData.age > 120) {
      newErrors.age = "Please enter a valid age between 1 and 120"
    }

    if (!formData.gender.trim()) {
      newErrors.gender = "Gender is required"
    }

    if (!formData.primarySymptomDescription.trim()) {
      newErrors.primarySymptomDescription = "Primary symptom description is required"
    }

    if (!formData.symptomOnset.trim()) {
      newErrors.symptomOnset = "Symptom onset information is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Medical Consultation Intake Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ""}
              onChange={(e) => handleChange("age", Number.parseInt(e.target.value) || 0)}
              placeholder="Enter your age"
              className={errors.age ? "border-red-500" : ""}
            />
            {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
              <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="existingMedicalConditions">Existing Medical Conditions (if none, enter "None")</Label>
            <Textarea
              id="existingMedicalConditions"
              value={formData.existingMedicalConditions}
              onChange={(e) => handleChange("existingMedicalConditions", e.target.value)}
              placeholder="List any existing medical conditions"
              className={errors.existingMedicalConditions ? "border-red-500" : ""}
            />
            {errors.existingMedicalConditions && (
              <p className="text-sm text-red-500">{errors.existingMedicalConditions}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primarySymptomDescription">Primary Symptom Description</Label>
            <Textarea
              id="primarySymptomDescription"
              value={formData.primarySymptomDescription}
              onChange={(e) => handleChange("primarySymptomDescription", e.target.value)}
              placeholder="Describe your main symptom in your own words"
              className={errors.primarySymptomDescription ? "border-red-500" : ""}
            />
            {errors.primarySymptomDescription && (
              <p className="text-sm text-red-500">{errors.primarySymptomDescription}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptomOnset">Symptom Onset</Label>
            <Input
              id="symptomOnset"
              value={formData.symptomOnset}
              onChange={(e) => handleChange("symptomOnset", e.target.value)}
              placeholder="e.g., Started two days ago"
              className={errors.symptomOnset ? "border-red-500" : ""}
            />
            {errors.symptomOnset && <p className="text-sm text-red-500">{errors.symptomOnset}</p>}
          </div>

          <CardFooter className="flex justify-end pt-4 px-0">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
