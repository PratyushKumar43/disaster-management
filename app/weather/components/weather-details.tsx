"use client"

import { WeatherData } from "@/lib/weather-service"
import { Card, CardContent } from "@/components/ui/card"
import { Wind, Gauge, Sun, CloudRain } from "lucide-react"

interface WeatherDetailsProps {
  weatherData: WeatherData;
}

interface MetricProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export default function WeatherDetails({ weatherData }: WeatherDetailsProps) {
  if (!weatherData?.hourly || !weatherData?.current) return null

  const currentHourIndex = new Date().getHours()

  const metrics: MetricProps[] = [
    {
      label: "Wind Speed (80m)",
      value: `${Math.round(weatherData.hourly.windSpeed80m[currentHourIndex])} km/h`,
      icon: <Wind className="h-4 w-4" />,
    },
    {
      label: "Surface Pressure",
      value: `${Math.round(weatherData.hourly.surfacePressure[currentHourIndex])} hPa`,
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      label: "Solar Radiation",
      value: `${Math.round(weatherData.hourly.shortwaveRadiation[currentHourIndex])} W/m²`,
      icon: <Sun className="h-4 w-4" />,
    },
    {
      label: "Upper Wind (1000hPa)",
      value: `${Math.round(weatherData.hourly.windSpeed1000hPa[currentHourIndex])} km/h`,
      icon: <CloudRain className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}

function MetricCard({ label, value, icon }: MetricProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}