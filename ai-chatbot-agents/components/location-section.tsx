import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { MapPin, ChevronDown } from "lucide-react";
import type { IntakeData } from "@/types/medical-types";

interface LocationSectionProps {
  formData: IntakeData;
  handleChange: (field: keyof IntakeData, value: string | number) => void;
  detectedLocation: string;
  commonCities: string[];
}

const LocationSection: React.FC<LocationSectionProps> = ({ formData, handleChange, detectedLocation, commonCities }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Your Location*</Label>
        {detectedLocation && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-800">Detected: {detectedLocation}</span>
            </div>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-10 w-full text-left">
              {formData.location || "Select your city"}
              <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-64 md:max-w-xs" side="bottom" sideOffset={4} align="end">
            <DropdownMenuRadioGroup value={formData.location} onValueChange={(value) => handleChange('location', value)}>
              {commonCities.map((city) => (
                <DropdownMenuRadioItem key={city} value={city} className="items-start [&>span]:pt-1.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{city}</span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder="Or enter your city manually"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          className="h-10"
        />
        <p className="text-xs text-gray-500">
          This helps us provide location-specific medical resources and emergency services.
        </p>
      </div>
    </div>
  );
};

export default LocationSection; 