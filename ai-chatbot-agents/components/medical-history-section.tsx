import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface MedicalHistorySectionProps {
  selectedConditions: string[];
  handleConditionChange: (condition: string, checked: boolean) => void;
  customCondition: string;
  setCustomCondition: React.Dispatch<React.SetStateAction<string>>;
  commonConditions: string[];
}

const MedicalHistorySection: React.FC<MedicalHistorySectionProps> = ({
  selectedConditions,
  handleConditionChange,
  customCondition,
  setCustomCondition,
  commonConditions,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Existing Medical Conditions (check all that apply)</Label>
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
          {commonConditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={selectedConditions.includes(condition)}
                onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
              />
              <Label htmlFor={condition} className="text-sm cursor-pointer">
                {condition}
              </Label>
            </div>
          ))}
        </div>
        <Input
          placeholder="Other condition not listed above"
          value={customCondition}
          onChange={(e) => setCustomCondition(e.target.value)}
          className="h-10"
        />
        <p className="text-xs text-gray-500">If you have no medical conditions, you can skip this section.</p>
      </div>
    </div>
  );
};

export default MedicalHistorySection; 