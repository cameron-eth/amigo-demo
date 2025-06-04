"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Mic, Settings, ArrowLeft, User, MapPin, Heart, Stethoscope, Clock } from "lucide-react"
import type { IntakeData } from "@/types/medical-types"

interface ChatIntakeFormProps {
  onSubmit: (data: IntakeData) => void
  isLoading: boolean
}

export function SectionedIntakeForm({ onSubmit, isLoading }: ChatIntakeFormProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState<IntakeData>({
    fullName: "",
    age: 0,
    gender: "",
    existingMedicalConditions: "",
    primarySymptomDescription: "",
    symptomOnset: "",
    location: "",
    height: "",
    weight: "",
    heightFeet: "",
    heightInches: "",
  })

  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [customCondition, setCustomCondition] = useState("")
  const [completedSections, setCompletedSections] = useState<boolean[]>([false, false, false, false, false])
  const [detectedLocation, setDetectedLocation] = useState<string>("")

  const sections = [
    {
      title: "Personal Info",
      icon: User,
      description: "Basic information about you",
    },
    {
      title: "Location",
      icon: MapPin,
      description: "Your current location",
    },
    {
      title: "Medical History",
      icon: Heart,
      description: "Your existing medical conditions",
    },
    {
      title: "Current Symptom",
      icon: Stethoscope,
      description: "What you're experiencing now",
    },
    {
      title: "Timeline",
      icon: Clock,
      description: "When did this start",
    },
  ]

  const commonCities = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Phoenix, AZ",
    "Philadelphia, PA",
    "San Antonio, TX",
    "San Diego, CA",
    "Dallas, TX",
    "San Jose, CA",
  ]

  const commonConditions = [
    "High blood pressure",
    "Diabetes",
    "Heart disease",
    "Asthma",
    "Allergies",
    "Arthritis",
    "Depression/Anxiety",
    "Kidney disease",
    "Liver disease",
    "Cancer",
  ]

  const commonSymptoms = [
    "Headache",
    "Fever",
    "Cough",
    "Sore throat",
    "Stomach pain",
    "Nausea",
    "Fatigue",
    "Dizziness",
    "Back pain",
    "Joint pain",
    "Skin rash",
    "Shortness of breath",
  ]

  const timeframes = [
    "Just started (less than 1 hour)",
    "A few hours ago",
    "Yesterday",
    "2-3 days ago",
    "About a week ago",
    "More than a week ago",
    "Several weeks ago",
    "More than a month ago",
  ]

  const ageRanges = [
    { label: "Under 18", value: 16 },
    { label: "18-25", value: 22 },
    { label: "26-35", value: 30 },
    { label: "36-45", value: 40 },
    { label: "46-55", value: 50 },
    { label: "56-65", value: 60 },
    { label: "66-75", value: 70 },
    { label: "Over 75", value: 80 },
  ]

  // Auto-detect location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use a reverse geocoding service (this is a simplified example)
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
            )
            const data = await response.json()
            const location = `${data.city}, ${data.principalSubdivisionCode}`
            setDetectedLocation(location)
            setFormData((prev) => ({ ...prev, location }))
          } catch (error) {
            console.log("Could not detect location automatically")
          }
        },
        (error) => {
          console.log("Location access denied or unavailable")
        },
      )
    }
  }, [])

  const handleChange = (field: keyof IntakeData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions((prev) => [...prev, condition])
    } else {
      setSelectedConditions((prev) => prev.filter((c) => c !== condition))
    }
  }

  const validateSection = (sectionIndex: number): boolean => {
    switch (sectionIndex) {
      case 0:
        return !!(formData.fullName.trim() && formData.age > 0 && formData.gender.trim())
      case 1:
        return !!formData.location.trim()
      case 2:
        return true // Medical history is optional
      case 3:
        return !!formData.primarySymptomDescription.trim()
      case 4:
        return !!formData.symptomOnset.trim()
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateSection(currentSection)) {
      const newCompleted = [...completedSections]
      newCompleted[currentSection] = true
      setCompletedSections(newCompleted)

      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSectionClick = (index: number) => {
    if (index <= currentSection || completedSections[index]) {
      setCurrentSection(index)
    }
  }

  const handleSubmit = () => {
    const allConditions = [...selectedConditions]
    if (customCondition.trim()) {
      allConditions.push(customCondition.trim())
    }

    const finalFormData = {
      ...formData,
      existingMedicalConditions: allConditions.length > 0 ? allConditions.join(", ") : "None",
    }

    onSubmit(finalFormData)
  }

  const isFormComplete =
    completedSections.every((completed, index) => completed || index === currentSection) &&
    validateSection(currentSection)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm mb-6 p-3 flex items-center justify-between hidden sm:flex">
          <div className="flex items-center gap-2 hidden sm:flex">
            <Button variant="ghost" size="icon" className="rounded-full bg-indigo-200/90 text-white hover:bg-blue-700">
              <Mic className="h-5 w-5" />
            </Button>
            <div className="text-gray-500 font-medium">00:00</div>
          </div>
          <div className="flex items-center gap-2 hidden sm:flex">
            <Button variant="outline" size="sm" className="rounded-md font-light bg-gray-100 border-gray-200">
              Ask AI
            </Button>
            <Button variant="outline" size="icon" className="rounded-md bg-gray-100 border-gray-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-md bg-gray-100 border-gray-200">
              Show/Hide
            </Button>
            <Button variant="outline" size="icon" className="rounded-md bg-gray-100 border-gray-200">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Response Card */}
        <Card className="bg-white/30 backdrop-blur-xl border border-gray-900/30 rounded shadow-sm mb-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <div className="bg-gray-200 rounded-full p-2">
                <User className="h-5 w-5 text-gray-500" />
              </div>
                <div
                  className="text-xl text-gray-600 font-extralight" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 200 }} >Hi there, I'm here to navigate your consultation
                </div>            
              </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Section Navigation */}
                <div className="flex items-center gap-4 overflow-x-auto pb-2 mb-4">
                  {sections.map((section, index) => {
                    const Icon = section.icon
                    const isActive = index === currentSection
                    const isCompleted = completedSections[index]
                    const isAccessible = index <= currentSection || isCompleted

                    return (
                      <div
                        key={index}
                        className={`flex flex-col items-center gap-1 min-w-[80px] cursor-pointer transition-all ${
                          !isAccessible && "opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() => isAccessible && handleSectionClick(index)}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive
                              ? "bg-blue-600/50 text-white"
                              : isCompleted
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-xs ${
                            isActive ? "font-medium text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {section.title}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Current Section Content */}
                <div className="bg-gray-500/700 rounded-xl p-6 relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                      {React.createElement(sections[currentSection].icon, { className: "h-5 w-5 text-blue-600" })}
                      {sections[currentSection].title}
                    </h3>

                    {/* Section 0: Personal Info */}
                    {currentSection === 0 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                            Full Name*
                          </Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            placeholder="Enter your full name"
                            className="h-10 bg-white border-gray-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Age Range*</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {ageRanges.map((range) => (
                              <div
                                key={range.value}
                                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                  formData.age === range.value
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                                onClick={() => handleChange("age", range.value)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{range.label}</span>
                                  {formData.age === range.value && (
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Gender*</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              { label: "Male", value: "male" },
                              { label: "Female", value: "female" },
                              { label: "Non-binary", value: "non-binary" },
                              { label: "Prefer not to say", value: "prefer-not-to-say" },
                            ].map((gender) => (
                              <div
                                key={gender.value}
                                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                  formData.gender === gender.value
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                                onClick={() => handleChange("gender", gender.value)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{gender.label}</span>
                                  {formData.gender === gender.value && (
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="heightFeet" className="text-sm font-medium text-gray-700">
                              Height (ft)
                            </Label>
                            <Input
                              id="heightFeet"
                              value={formData.heightFeet}
                              onChange={(e) => handleChange("heightFeet", e.target.value)}
                              placeholder="Feet"
                              className="h-10 bg-white border-gray-200"
                              type="number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="heightInches" className="text-sm font-medium text-gray-700">
                              Height (in)
                            </Label>
                            <Input
                              id="heightInches"
                              value={formData.heightInches}
                              onChange={(e) => handleChange("heightInches", e.target.value)}
                              placeholder="Inches"
                              className="h-10 bg-white border-gray-200"
                              type="number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                              Weight (kg)
                            </Label>
                            <Input
                              id="weight"
                              value={formData.weight}
                              onChange={(e) => handleChange("weight", e.target.value)}
                              placeholder="Weight"
                              className="h-10 bg-white border-gray-200"
                              type="number"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 1: Location */}
                    {currentSection === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                            Your Location*
                          </Label>
                          <div className="relative">
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => handleChange("location", e.target.value)}
                              placeholder="Enter your city and state"
                              className="h-10 pl-10 bg-white border-gray-200"
                            />
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {detectedLocation && (
                          <div className="bg-blue-50 p-3 rounded-lg flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <div className="text-sm">
                              <span className="font-medium">Detected location:</span>{" "}
                              <Button
                                variant="link"
                                className="p-0 h-auto text-blue-600"
                                onClick={() => handleChange("location", detectedLocation)}
                              >
                                {detectedLocation} (Use this)
                              </Button>
                            </div>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Common Cities</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {commonCities.map((city) => (
                              <Button
                                key={city}
                                variant="outline"
                                className="justify-start text-sm h-auto py-1.5 bg-white"
                                onClick={() => handleChange("location", city)}
                              >
                                {city}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Medical History */}
                    {currentSection === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Existing Medical Conditions</Label>

                          {selectedConditions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {selectedConditions.map((condition) => (
                                <Badge
                                  key={condition}
                                  variant="secondary"
                                  className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50"
                                >
                                  {condition}
                                  <button
                                    type="button"
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => handleConditionChange(condition, false)}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-white rounded-lg border border-gray-200">
                            {commonConditions.map((condition) => (
                              <div key={condition} className="flex items-center space-x-2">
                                <Checkbox
                                  id={condition}
                                  checked={selectedConditions.includes(condition)}
                                  onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                />
                                <Label htmlFor={condition} className="text-sm cursor-pointer text-gray-700">
                                  {condition}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Input
                              placeholder="Add another condition"
                              value={customCondition}
                              onChange={(e) => setCustomCondition(e.target.value)}
                              className="h-10 bg-white border-gray-200"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              if (customCondition.trim()) {
                                handleConditionChange(customCondition.trim(), true)
                                setCustomCondition("")
                              }
                            }}
                            disabled={!customCondition.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Section 3: Current Symptom */}
                    {currentSection === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">What's your primary symptom?*</Label>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {commonSymptoms.map((symptom) => (
                              <div
                                key={symptom}
                                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                  formData.primarySymptomDescription === symptom
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                                onClick={() => handleChange("primarySymptomDescription", symptom)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{symptom}</span>
                                  {formData.primarySymptomDescription === symptom && (
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                              </div>
                            ))}

                            <div
                              className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                formData.primarySymptomDescription === "other-symptom"
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300 bg-white"
                              }`}
                              onClick={() => handleChange("primarySymptomDescription", "other-symptom")}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Other</span>
                                {formData.primarySymptomDescription === "other-symptom" && (
                                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                )}
                              </div>
                            </div>
                          </div>

                          {formData.primarySymptomDescription === "other-symptom" && (
                            <Textarea
                              placeholder="Please describe your symptom in detail"
                              onChange={(e) => handleChange("primarySymptomDescription", e.target.value)}
                              className="min-h-[100px] mt-2 bg-white border-gray-200"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Symptom Severity</Label>
                          <div className="flex items-center justify-between px-2">
                            <span className="text-xs text-gray-500">Mild</span>
                            <span className="text-xs text-gray-500">Moderate</span>
                            <span className="text-xs text-gray-500">Severe</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              step="1"
                              defaultValue="5"
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 4: Timeline */}
                    {currentSection === 4 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">When did your symptoms start?*</Label>

                          <div className="space-y-2">
                            {timeframes.map((timeframe) => (
                              <div
                                key={timeframe}
                                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                                  formData.symptomOnset === timeframe
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300 bg-white"
                                }`}
                                onClick={() => handleChange("symptomOnset", timeframe)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{timeframe}</span>
                                  {formData.symptomOnset === timeframe && (
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Have you experienced this before?</Label>
                          <div className="flex space-x-3">
                            <div className="border rounded-lg p-2 cursor-pointer transition-all hover:border-blue-300 flex-1 text-center bg-white">
                              <span className="text-sm">Yes</span>
                            </div>
                            <div className="border rounded-lg p-2 cursor-pointer transition-all hover:border-blue-300 flex-1 text-center bg-white">
                              <span className="text-sm">No</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                        className="flex items-center gap-2 bg-white"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>

                      <div className="text-sm text-gray-500">
                        Step {currentSection + 1} of {sections.length}
                      </div>

                      {currentSection < sections.length - 1 ? (
                        <Button
                          onClick={handleNext}
                          disabled={!validateSection(currentSection)}
                          className="flex items-center gap-2 bg-slate-900/80 hover:bg-blue-700"
                        >
                          <span>Next</span>
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={!isFormComplete || isLoading}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? "Starting..." : "Start Consultation"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
