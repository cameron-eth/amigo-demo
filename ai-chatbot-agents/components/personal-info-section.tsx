import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { IntakeData } from "@/types/medical-types";

interface PersonalInfoSectionProps {
  formData: IntakeData;
  handleChange: (field: keyof IntakeData, value: string | number) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ formData, handleChange }) => {
  const ageRanges = [
    { label: "Under 18", value: 16 },
    { label: "18-25", value: 22 },
    { label: "26-35", value: 30 },
    { label: "36-45", value: 40 },
    { label: "46-55", value: 50 },
    { label: "56-65", value: 60 },
    { label: "66-75", value: 70 },
    { label: "Over 75", value: 80 },
  ];

  const handleHeightChange = (field: 'feet' | 'inches', value: string) => {
    const heightInFeet = field === 'feet' ? parseInt(value, 10) : Math.floor(formData.height / 12);
    const heightInInches = field === 'inches' ? parseInt(value, 10) : formData.height % 12;
    handleChange('height', heightInFeet * 12 + heightInInches);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name*
        </Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          placeholder="Enter your full name"
          className="h-10"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Age Range*</Label>
        <RadioGroup
          value={formData.age.toString()}
          onValueChange={(value) => handleChange("age", Number.parseInt(value))}
          className="grid grid-cols-2 gap-3"
        >
          {ageRanges.map((range) => (
            <div key={range.value} className="flex items-center space-x-2">
              <RadioGroupItem value={range.value.toString()} id={`age-${range.value}`} />
              <Label htmlFor={`age-${range.value}`} className="text-sm cursor-pointer">
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Gender*</Label>
        <RadioGroup
          value={formData.gender}
          onValueChange={(value) => handleChange("gender", value)}
          className="grid grid-cols-2 gap-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="text-sm cursor-pointer">
              Male
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="text-sm cursor-pointer">
              Female
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-binary" id="non-binary" />
            <Label htmlFor="non-binary" className="text-sm cursor-pointer">
              Non-binary
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
            <Label htmlFor="prefer-not-to-say" className="text-sm cursor-pointer">
              Prefer not to say
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Height*</Label>
        <div className="flex space-x-2">
          <Input
            type="number"
            value={Math.floor(formData.height / 12)}
            onChange={(e) => handleHeightChange('feet', e.target.value)}
            placeholder="Feet"
            className="h-10"
          />
          <Input
            type="number"
            value={formData.height % 12}
            onChange={(e) => handleHeightChange('inches', e.target.value)}
            placeholder="Inches"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight" className="text-sm font-medium">
          Weight (kg)
        </Label>
        <Input
          id="weight"
          value={formData.weight}
          onChange={(e) => handleChange("weight", e.target.value)}
          placeholder="Enter your weight"
          className="h-10"
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection; 