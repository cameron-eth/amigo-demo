import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { IntakeData } from "@/types/medical-types";

interface CurrentSymptomSectionProps {
  formData: IntakeData;
  handleChange: (field: keyof IntakeData, value: string | number) => void;
  commonSymptoms: string[];
}

const CurrentSymptomSection: React.FC<CurrentSymptomSectionProps> = ({ formData, handleChange, commonSymptoms }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">What's your main symptom?*</Label>
        <RadioGroup
          value={formData.primarySymptomDescription}
          onValueChange={(value) => handleChange("primarySymptomDescription", value)}
          className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg"
        >
          {commonSymptoms.map((symptom) => (
            <div key={symptom} className="flex items-center space-x-2">
              <RadioGroupItem value={symptom} id={symptom} />
              <Label htmlFor={symptom} className="text-sm cursor-pointer">
                {symptom}
              </Label>
            </div>
          ))}
          <div className="flex items-center space-x-2 col-span-2">
            <RadioGroupItem value="other-symptom" id="other-symptom" />
            <Label htmlFor="other-symptom" className="text-sm cursor-pointer">
              Other (describe below)
            </Label>
          </div>
        </RadioGroup>

        {formData.primarySymptomDescription === "other-symptom" && (
          <Textarea
            placeholder="Please describe your symptom in detail"
            onChange={(e) => handleChange("primarySymptomDescription", e.target.value)}
            className="min-h-[80px] mt-3"
          />
        )}
      </div>
    </div>
  );
};

export default CurrentSymptomSection; 