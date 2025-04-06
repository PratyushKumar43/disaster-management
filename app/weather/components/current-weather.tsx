"use client"

import { Card } from "@/components/ui/card"
import { getWeatherDescription } from "@/lib/weather-utils"
import { WeatherData } from "@/lib/weather-service"

interface CurrentWeatherProps {
  weatherData: WeatherData;
}

interface WeatherDetailProps {
  label: string;
  value: string;
}

export default function CurrentWeather({ weatherData }: CurrentWeatherProps) {
  if (!weatherData.current) return null

  const currentWeather = weatherData.current;
  const { temperature2m, relativeHumidity2m, apparentTemperature, precipitation, weatherCode, windSpeed10m } =
    currentWeather

  const weatherDescription = getWeatherDescription(weatherCode)

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-5xl font-bold">{Math.round(temperature2m)}°C</h2>
        <p className="text-xl mt-1">{weatherDescription}</p>
        <p className="text-muted-foreground">Feels like {Math.round(apparentTemperature)}°C</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <WeatherDetail label="Humidity" value={`${Math.round(relativeHumidity2m)}%`} />
        <WeatherDetail label="Wind" value={`${Math.round(windSpeed10m)} km/h`} />
        <WeatherDetail label="Precipitation" value={`${precipitation} mm`} />
        <WeatherDetail label="Visibility" value="Good" />
      </div>
    </div>
  )
}

function WeatherDetail({ label, value }: WeatherDetailProps) {
  return (
    <Card className="p-3">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </Card>
  )
}
