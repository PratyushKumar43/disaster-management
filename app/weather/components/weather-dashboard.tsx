"use client"

import { useState, useEffect, FormEvent } from "react"
import { useTheme } from "next-themes"
import { Search, MapPin, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import CurrentWeather from "../components/current-weather"
import HourlyForecast from "../components/hourly-forecast"
import DailyForecast from "../components/daily-forecast"
import WeatherCharts from "../components/weather-charts"
import WeatherAnimation from "../components/weather-animation"
import WeatherDetails from "../components/weather-details"
import { fetchWeatherData, defaultWeatherParams, type WeatherParams, type WeatherData } from "@/lib/weather-service"

// Default coordinates (Rourkela, India - from weather-service.ts)
const DEFAULT_LATITUDE = defaultWeatherParams.latitude
const DEFAULT_LONGITUDE = defaultWeatherParams.longitude

export default function WeatherDashboard() {
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [coordinates, setCoordinates] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  })
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch weather data when coordinates change
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        const params: WeatherParams = {
          ...defaultWeatherParams,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }

        const data = await fetchWeatherData(params)
        setWeatherData(data)

        // Get location name from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}`,
          )
          const locationData = await response.json()
          if (locationData.address) {
            const city =
              locationData.address.city ||
              locationData.address.town ||
              locationData.address.village ||
              locationData.address.county
            const state = locationData.address.state
            const country = locationData.address.country
            setLocation(`${city}${state ? `, ${state}` : ""}${country ? `, ${country}` : ""}`)
          }
        } catch (error) {
          console.error("Error fetching location name:", error)
          setLocation("Unknown Location")
        }
      } catch (error) {
        console.error("Error fetching weather data:", error)
        setError("Failed to fetch weather data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [coordinates])

  // Use browser geolocation on initial load
  useEffect(() => {
    // Function to get location
    const getLocation = () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCoordinates({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              })
            },
            (error) => {
              console.log("Geolocation permission denied or error:", error.message)
              // Fallback to default coordinates - no need to show an error to the user
              // Default coordinates are already set in the state
              fetchLocationName(DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
            },
            { timeout: 5000, enableHighAccuracy: false },
          )
        } else {
          console.log("Geolocation is not supported by this browser")
          fetchLocationName(DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
        }
      } catch (error) {
        console.log("Geolocation error:", error)
        fetchLocationName(DEFAULT_LATITUDE, DEFAULT_LONGITUDE)
      }
    }

    // Function to fetch location name for default coordinates
    const fetchLocationName = async (lat: number, lon: number) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        const data = await response.json()
        if (data.address) {
          const city = data.address.city || data.address.town || data.address.village || data.address.county
          const state = data.address.state
          const country = data.address.country
          setLocation(`${city}${state ? `, ${state}` : ""}${country ? `, ${country}` : ""}`)
        }
      } catch (error) {
        console.error("Error fetching default location name:", error)
        setLocation("New York, USA") // Hardcoded fallback for the default location
      }
    }

    // Try to get location
    getLocation()
  }, [])

  // Handle location search
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        setCoordinates({
          latitude: Number.parseFloat(data[0].lat),
          longitude: Number.parseFloat(data[0].lon),
        })
        setSearchQuery("")
      } else {
        setError("Location not found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Error searching location:", error)
      setError("Failed to search location. Please try again.")
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Add this function to display a message about using default location
  const LocationMessage = () => {
    if (coordinates.latitude === DEFAULT_LATITUDE && coordinates.longitude === DEFAULT_LONGITUDE) {
      return (
        <div className="text-sm text-muted-foreground mb-4">
          <p>Using default location (New York). Search for your city above.</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header with theme toggle and search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Weather Forecast</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>

          <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
            <Input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Current location */}
        {location && (
          <>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">{location}</span>
            </div>
            <LocationMessage />
          </>
        )}

        {/* Error message */}
        {error && <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">{error}</div>}

        {/* Weather content */}
        {loading ? (
          <WeatherSkeleton />
        ) : weatherData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current weather and animation */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Current Weather</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  {weatherData.current && (
                    <>
                      <WeatherAnimation weatherData={weatherData} />
                      <CurrentWeather weatherData={weatherData} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Forecast tabs */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="hourly">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="hourly">Hourly</TabsTrigger>
                    <TabsTrigger value="daily">7-Day</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hourly" className="mt-4">
                    <HourlyForecast weatherData={weatherData} />
                  </TabsContent>
                  <TabsContent value="daily" className="mt-4">
                    {weatherData.daily && <DailyForecast weatherData={weatherData} />}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* New Weather Details section */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Additional Weather Metrics</CardTitle>
                <CardDescription>Detailed atmospheric conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherDetails weatherData={weatherData} />
              </CardContent>
            </Card>

            {/* Weather charts */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Weather Details</CardTitle>
              </CardHeader>
              <CardContent>
                <WeatherCharts weatherData={weatherData} />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
