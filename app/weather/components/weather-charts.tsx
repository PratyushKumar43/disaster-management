"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { WeatherData } from "@/lib/weather-service"

// Custom tick component for angled labels
const CustomXAxisTick = (props: any) => {
  const { x, y, payload, dataLength } = props;
  
  // Determine how many ticks to show based on data length
  const interval = dataLength > 72 ? 8 : dataLength > 24 ? 4 : 3;
  const index = payload.index;
  
  if (index % interval !== 0) {
    return null;
  }
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="end" 
        fill="#666"
        fontSize={11}
        transform="rotate(-45)"
      >
        {payload.value}
      </text>
    </g>
  );
};

interface ChartData {
  time: string;
  rawTime: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  rain: number;
  showers: number;
  windSpeed80m: number;
  windSpeed1000hPa: number;
  pressure: number;
  radiation: number;
}

interface WeatherChartsProps {
  weatherData: WeatherData;
}

interface ChartComponentProps {
  data: ChartData[];
}

export default function WeatherCharts({ weatherData }: WeatherChartsProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "48h" | "7d">("24h")

  if (!weatherData) return null

  // Format data for charts
  const formatChartData = (range: "24h" | "48h" | "7d"): ChartData[] => {
    const hours = range === "24h" ? 24 : range === "48h" ? 48 : 168

    return Array.from({ length: hours }, (_, i) => {
      const time = weatherData.hourly.time[i]
      const formattedTime = time.toLocaleTimeString([], {
        hour: "2-digit",
        hour12: true,
      })

      const formattedDate = time.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })

      const label = hours > 24 ? `${formattedDate} ${formattedTime}` : formattedTime

      return {
        time: label,
        rawTime: time,
        temperature: weatherData.hourly.temperature2m[i],
        feelsLike: weatherData.hourly.apparentTemperature[i],
        humidity: weatherData.hourly.relativeHumidity2m[i],
        precipitation: weatherData.hourly.precipitation[i],
        rain: weatherData.hourly.rain[i],
        showers: weatherData.hourly.showers[i],
        windSpeed80m: weatherData.hourly.windSpeed80m[i],
        windSpeed1000hPa: weatherData.hourly.windSpeed1000hPa[i],
        pressure: weatherData.hourly.surfacePressure[i],
        radiation: weatherData.hourly.shortwaveRadiation[i],
      }
    })
  }

  const chartData = formatChartData(timeRange)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="temperature" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
              <TabsTrigger value="wind">Wind</TabsTrigger>
              <TabsTrigger value="atmosphere">Atmosphere</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange("24h")}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === "24h" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                24h
              </button>
              <button
                onClick={() => setTimeRange("48h")}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === "48h" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                48h
              </button>
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === "7d" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                7d
              </button>
            </div>
          </div>

          <TabsContent value="temperature" className="h-[300px]">
            <TemperatureChart data={chartData} />
          </TabsContent>

          <TabsContent value="precipitation" className="h-[300px]">
            <PrecipitationChart data={chartData} />
          </TabsContent>

          <TabsContent value="wind" className="h-[300px]">
            <WindChart data={chartData} />
          </TabsContent>

          <TabsContent value="atmosphere" className="h-[300px]">
            <AtmosphereChart data={chartData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TemperatureChart({ data }: ChartComponentProps) {
  return (
    <ChartContainer
      config={{
        temperature: {
          label: "Temperature",
          color: "hsl(var(--chart-1))",
        },
        feelsLike: {
          label: "Feels Like",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full"
    >
      <LineChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          height={60}
          tickMargin={15}
          tick={<CustomXAxisTick dataLength={data.length} />}
        />
        <YAxis tickFormatter={(value) => `${value}°`} domain={["dataMin - 2", "dataMax + 2"]} />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}°C`} />} />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="feelsLike"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

function PrecipitationChart({ data }: ChartComponentProps) {
  return (
    <ChartContainer
      config={{
        precipitation: {
          label: "Precipitation",
          color: "hsl(var(--chart-3))",
        },
        rain: {
          label: "Rain",
          color: "hsl(var(--chart-4))",
        },
        showers: {
          label: "Showers",
          color: "hsl(var(--chart-5))",
        },
      }}
      className="h-full"
    >
      <BarChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          height={60}
          tickMargin={15}
          tick={<CustomXAxisTick dataLength={data.length} />}
        />
        <YAxis tickFormatter={(value) => `${value} mm`} />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} mm`} />} />
        <Bar dataKey="precipitation" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

function HumidityChart({ data }: ChartComponentProps) {
  return (
    <ChartContainer
      config={{
        humidity: {
          label: "Humidity",
          color: "hsl(var(--chart-6))",
        },
      }}
      className="h-full"
    >
      <AreaChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          height={60}
          tickMargin={15}
          tick={<CustomXAxisTick dataLength={data.length} />}
        />
        <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
        <Area
          type="monotone"
          dataKey="humidity"
          stroke="hsl(var(--chart-6))"
          fill="hsl(var(--chart-6) / 0.2)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function WindChart({ data }: ChartComponentProps) {
  return (
    <ChartContainer
      config={{
        windSpeed80m: {
          label: "Wind Speed (80m)",
          color: "hsl(var(--chart-4))",
        },
        windSpeed1000hPa: {
          label: "Wind Speed (1000hPa)",
          color: "hsl(var(--chart-5))",
        },
      }}
      className="h-full"
    >
      <LineChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          height={60}
          tickMargin={15}
          tick={<CustomXAxisTick dataLength={data.length} />}
        />
        <YAxis tickFormatter={(value) => `${value} km/h`} />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} km/h`} />} />
        <Line
          type="monotone"
          dataKey="windSpeed80m"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="windSpeed1000hPa"
          stroke="hsl(var(--chart-5))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

function AtmosphereChart({ data }: ChartComponentProps) {
  return (
    <ChartContainer
      config={{
        pressure: {
          label: "Surface Pressure",
          color: "hsl(var(--chart-6))",
        },
        radiation: {
          label: "Solar Radiation",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full"
    >
      <LineChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          height={60}
          tickMargin={15}
          tick={<CustomXAxisTick dataLength={data.length} />}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => `${value} hPa`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value} W/m²`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="pressure"
          stroke="hsl(var(--chart-6))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="radiation"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
