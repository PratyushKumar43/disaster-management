"use client"

import { WeatherData } from "@/lib/weather-service"
import { Card, CardContent } from "@/components/ui/card"
import WeatherIcon from "./weather-icon"
import { getWeatherDescription } from "@/lib/weather-utils"

interface DailyData {
  date: Date;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitation: number;
}

interface DailyForecastProps {
  weatherData: WeatherData;
}

interface DailyCardProps {
  dayData: DailyData;
  isToday: boolean;
}

export default function DailyForecast({ weatherData }: DailyForecastProps) {
  if (!weatherData.daily) return null

  const dailyData = weatherData.daily;
  
  // Format the daily forecast data
  const forecast: DailyData[] = Array.from({ length: 7 }, (_, i) => ({
    date: dailyData.time[i],
    maxTemp: dailyData.temperature2mMax[i],
    minTemp: dailyData.temperature2mMin[i],
    weatherCode: dailyData.weatherCode[i],
    precipitation: dailyData.precipitationSum[i],
  }))

  return (
    <div className="space-y-3">
      {forecast.map((day, index) => (
        <DailyCard key={index} dayData={day} isToday={index === 0} />
      ))}
    </div>
  )
}

function DailyCard({ dayData, isToday }: DailyCardProps) {
  const { date, maxTemp, minTemp, weatherCode, precipitation } = dayData

  // Format day name
  const dayName = isToday ? "Today" : date.toLocaleDateString(undefined, { weekday: "long" })

  // Format date
  const dateString = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })

  const weatherDescription = getWeatherDescription(weatherCode)

  return (
    <Card className={isToday ? "border-primary" : ""}>
      <CardContent className="p-4">
        <div className="grid grid-cols-5 items-center">
          <div className="col-span-2">
            <p className="font-medium">{dayName}</p>
            <p className="text-sm text-muted-foreground">{dateString}</p>
          </div>

          <div className="flex items-center justify-center">
            <WeatherIcon weatherCode={weatherCode} className="h-8 w-8" />
          </div>

          <div className="text-right">
            <p className="text-sm">{weatherDescription}</p>
            {precipitation > 0 && <p className="text-xs text-blue-500">{precipitation} mm</p>}
          </div>

          <div className="text-right">
            <p className="font-medium">
              {Math.round(maxTemp)}° <span className="text-muted-foreground">{Math.round(minTemp)}°</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
