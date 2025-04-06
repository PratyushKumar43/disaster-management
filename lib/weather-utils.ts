export function getWeatherDescription(code: number) {
  // WMO Weather interpretation codes (WW)
  // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM

  switch (true) {
    // Clear sky
    case code === 0:
      return "Clear sky"

    // Partly cloudy
    case code === 1:
      return "Mainly clear"
    case code === 2:
      return "Partly cloudy"
    case code === 3:
      return "Overcast"

    // Fog
    case code >= 45 && code <= 49:
      return "Fog"

    // Drizzle
    case code >= 50 && code <= 59:
      return "Drizzle"

    // Rain
    case code >= 60 && code <= 69:
      return "Rain"

    // Snow
    case code >= 70 && code <= 79:
      return "Snow"

    // Shower
    case code >= 80 && code <= 84:
      return "Rain showers"

    // Snow shower
    case code >= 85 && code <= 86:
      return "Snow showers"

    // Thunderstorm
    case code >= 95 && code <= 99:
      return "Thunderstorm"

    // Default
    default:
      return "Unknown"
  }
}

