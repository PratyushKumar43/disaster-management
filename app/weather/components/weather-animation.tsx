"use client"

import { useMemo } from "react"
import { WeatherData } from "@/lib/weather-service"

interface WeatherAnimationProps {
  weatherData: WeatherData;
}

export default function WeatherAnimation({ weatherData }: WeatherAnimationProps) {
  if (!weatherData.current) return null;
  
  const weatherCode = weatherData.current.weatherCode;
  
  const animationClass = useMemo(() => {
    switch (true) {
      // Clear sky
      case weatherCode === 0:
        return "bg-gradient-to-br from-blue-400 to-blue-200"

      // Partly cloudy
      case weatherCode === 1:
      case weatherCode === 2:
      case weatherCode === 3:
        return "bg-gradient-to-br from-blue-300 to-gray-200"

      // Fog
      case weatherCode >= 45 && weatherCode <= 49:
        return "bg-gradient-to-br from-gray-400 to-gray-300"

      // Drizzle
      case weatherCode >= 50 && weatherCode <= 59:
        return "bg-gradient-to-br from-blue-500 to-gray-400"

      // Rain
      case weatherCode >= 60 && weatherCode <= 69:
        return "bg-gradient-to-br from-blue-600 to-gray-500"

      // Snow
      case weatherCode >= 70 && weatherCode <= 79:
        return "bg-gradient-to-br from-blue-100 to-gray-100"

      // Rain showers
      case weatherCode >= 80 && weatherCode <= 84:
        return "bg-gradient-to-br from-blue-700 to-gray-600"

      // Snow showers
      case weatherCode >= 85 && weatherCode <= 86:
        return "bg-gradient-to-br from-blue-200 to-gray-200"

      // Thunderstorm
      case weatherCode >= 95 && weatherCode <= 99:
        return "bg-gradient-to-br from-gray-800 to-gray-700"

      // Default
      default:
        return "bg-gradient-to-br from-blue-400 to-blue-200"
    }
  }, [weatherCode])

  return (
    <div className={`w-32 h-32 rounded-full ${animationClass} mb-4 transition-colors duration-500`} />
  )
}
