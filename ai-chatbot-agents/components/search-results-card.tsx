"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Star, CreditCard, AlertTriangle, Navigation } from "lucide-react"

interface SearchResult {
  name: string
  address: string
  phone: string
  type: string
  distance?: string
  hours?: string
  specialties?: string[]
  rating?: number
  acceptsInsurance?: boolean
  emergencyServices?: boolean
}

interface SearchResultsCardProps {
  results: SearchResult[]
  searchType: string
  location: string
}

export function SearchResultsCard({ results, searchType, location }: SearchResultsCardProps) {
  const getTypeIcon = (type: string) => {
    if (type.toLowerCase().includes("emergency")) return "🚨"
    if (type.toLowerCase().includes("urgent")) return "⚡"
    if (type.toLowerCase().includes("pharmacy")) return "💊"
    if (type.toLowerCase().includes("specialist")) return "🩺"
    return "🏥"
  }

  const getTypeColor = (type: string) => {
    if (type.toLowerCase().includes("emergency")) return "bg-red-100 text-red-800 border-red-200"
    if (type.toLowerCase().includes("urgent")) return "bg-orange-100 text-orange-800 border-orange-200"
    if (type.toLowerCase().includes("pharmacy")) return "bg-green-100 text-green-800 border-green-200"
    if (type.toLowerCase().includes("specialist")) return "bg-purple-100 text-purple-800 border-purple-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const handleCallClick = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  const handleDirectionsClick = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com?q=${encodedAddress}`, "_blank")
  }

  if (results.length === 0) {
    return (
      <Card className="mt-4 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-orange-800">No results found for your search in {location}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {searchType === "emergency" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">
                For immediate emergencies, call 911 or go to the nearest emergency room
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{getTypeIcon(result.type)}</span>
                    <span>{result.name}</span>
                  </CardTitle>
                  <Badge className={`mt-2 ${getTypeColor(result.type)}`}>{result.type}</Badge>
                </div>
                {result.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{result.rating}/5</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Address */}
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-700">{result.address}</span>
                  {result.distance && <span className="text-xs text-gray-500 ml-2">({result.distance})</span>}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{result.phone}</span>
              </div>

              {/* Hours */}
              {result.hours && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{result.hours}</span>
                </div>
              )}

              {/* Specialties */}
              {result.specialties && result.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-3">
                {result.acceptsInsurance && (
                  <Badge variant="secondary" className="text-xs">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Insurance Accepted
                  </Badge>
                )}
                {result.emergencyServices && (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    24/7 Emergency
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4">
                <Button size="sm" onClick={() => handleCallClick(result.phone)} className="flex-1">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirectionsClick(result.address)}
                  className="flex-1"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-sm text-blue-800">
            <strong>Important:</strong> Please call ahead to confirm availability and insurance acceptance. For
            emergencies, always call 911 or go to the nearest emergency room.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
