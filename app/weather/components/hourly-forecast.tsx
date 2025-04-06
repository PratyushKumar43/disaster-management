"use client"

import { WeatherData } from "@/lib/weather-service"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import WeatherIcon from "./weather-icon"

interface HourlyData {
  time: Date;
  temperature: number;
  weatherCode: number;
  precipitation: number;
}

interface HourlyForecastProps {
  weatherData: WeatherData;
}

interface HourlyCardProps {
  hourData: HourlyData;
}

export default function HourlyForecast({ weatherData }: HourlyForecastProps) {
  if (!weatherData.hourly) return null
  
  const hourlyData = weatherData.hourly;

  // Get the next 24 hours of data
  const next24Hours: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
    time: hourlyData.time[i],
    temperature: hourlyData.temperature2m[i],
    weatherCode: hourlyData.weatherCode?.[i] ?? 0,
    precipitation: hourlyData.precipitation[i],
  }))

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 pb-2">
        {next24Hours.map((hour, index) => (
          <HourlyCard key={index} hourData={hour} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

function HourlyCard({ hourData }: HourlyCardProps) {
  const { time, temperature, weatherCode, precipitation } = hourData

  // Format hour
  const hourString = time.toLocaleTimeString([], {
    hour: "2-digit",
    hour12: true,
  })

  // Check if it's the current hour
  const isCurrentHour = new Date().getHours() === time.getHours() && new Date().getDate() === time.getDate()

  return (
    <Card className={`flex-shrink-0 w-[100px] ${isCurrentHour ? "border-primary" : ""}`}>
      <CardContent className="p-3 flex flex-col items-center justify-between">
        <p className="text-sm font-medium">{hourString}</p>
        <WeatherIcon weatherCode={weatherCode} className="my-2 h-8 w-8" />
        <p className="text-lg font-bold">{Math.round(temperature)}°</p>
        {precipitation > 0 && <p className="text-xs text-blue-500">{precipitation} mm</p>}
      </CardContent>
    </Card>
  )
}
