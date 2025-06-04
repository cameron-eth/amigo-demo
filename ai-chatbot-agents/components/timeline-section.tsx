import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { IntakeData } from "@/types/medical-types";

interface TimelineSectionProps {
  formData: IntakeData;
  handleChange: (field: keyof IntakeData, value: string | number) => void;
  timeframes: string[];
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ formData, handleChange, timeframes }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">When did this symptom start?*</Label>
        <RadioGroup
          value={formData.symptomOnset}
          onValueChange={(value) => handleChange("symptomOnset", value)}
          className="space-y-2"
        >
          {timeframes.map((timeframe) => (
            <div key={timeframe} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
              <RadioGroupItem value={timeframe} id={timeframe} />
              <Label htmlFor={timeframe} className="text-sm cursor-pointer flex-1">
                {timeframe}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default TimelineSection; 