"use client"

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  type LucideIcon,
  type LucideProps,
} from "lucide-react"

interface WeatherIconProps extends Omit<LucideProps, 'ref'> {
  weatherCode: number;
}

export default function WeatherIcon({ weatherCode, ...props }: WeatherIconProps) {
  const Icon = getWeatherIcon(weatherCode)

  return <Icon {...props} />
}

function getWeatherIcon(code: number): LucideIcon {
  switch (true) {
    // Clear sky
    case code === 0:
      return Sun

    // Partly cloudy
    case code === 1:
    case code === 2:
    case code === 3:
      return Cloud

    // Fog
    case code >= 45 && code <= 49:
      return CloudFog

    // Drizzle
    case code >= 50 && code <= 59:
      return CloudDrizzle

    // Rain
    case code >= 60 && code <= 69:
      return CloudRain

    // Snow
    case code >= 70 && code <= 79:
      return CloudSnow

    // Rain showers
    case code >= 80 && code <= 84:
      return CloudRain

    // Snow showers
    case code >= 85 && code <= 86:
      return CloudSnow

    // Thunderstorm
    case code >= 95 && code <= 99:
      return CloudLightning

    // Default
    default:
      return Cloud
  }
}

