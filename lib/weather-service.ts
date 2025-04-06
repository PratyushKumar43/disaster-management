import { fetchWeatherApi } from 'openmeteo';

export interface WeatherParams {
  latitude: number;
  longitude: number;
  hourly: string[];
  daily?: string[];
  current?: string[];
  timezone: string;
}

export interface WeatherData {
  hourly: {
    time: Date[];
    temperature2m: Float32Array;
    relativeHumidity2m: Float32Array;
    apparentTemperature: Float32Array;
    precipitation: Float32Array;
    rain: Float32Array;
    showers: Float32Array;
    visibility: Float32Array;
    windSpeed80m: Float32Array;
    surfacePressure: Float32Array;
    shortwaveRadiation: Float32Array;
    windSpeed1000hPa: Float32Array;
    weatherCode?: Float32Array | null;
  };
  daily?: {
    time: Date[];
    temperature2mMax: Float32Array;
    temperature2mMin: Float32Array;
    precipitationSum: Float32Array;
    weatherCode: Float32Array;
  };
  current?: {
    time: Date;
    temperature2m: number;
    relativeHumidity2m: number;
    apparentTemperature: number;
    precipitation: number;
    weatherCode: number;
    windSpeed10m: number;
    surfacePressure?: number;
    shortwaveRadiation?: number;
  };
  timezone: string | null;
  timezoneAbbreviation: string | null;
  latitude: number;
  longitude: number;
}

// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

export async function fetchWeatherData(params: WeatherParams): Promise<WeatherData> {
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Process first location
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();
  const latitude = response.latitude();
  const longitude = response.longitude();

  const hourly = response.hourly()!;
  const daily = response.daily();
  const current = response.current();

  // Process the weather data
  const weatherData: WeatherData = {
    hourly: {
      time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      temperature2m: hourly.variables(0)!.valuesArray()!,
      relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
      apparentTemperature: hourly.variables(2)!.valuesArray()!,
      precipitation: hourly.variables(3)!.valuesArray()!,
      rain: hourly.variables(4)!.valuesArray()!,
      showers: hourly.variables(5)!.valuesArray()!,
      visibility: hourly.variables(6)!.valuesArray()!,
      windSpeed80m: hourly.variables(7)?.valuesArray()!,
      surfacePressure: hourly.variables(8)?.valuesArray()!,
      shortwaveRadiation: hourly.variables(9)?.valuesArray()!,
      windSpeed1000hPa: hourly.variables(10)?.valuesArray()!,
      weatherCode: hourly.variables(11)?.valuesArray() || undefined
    },
    timezone,
    timezoneAbbreviation,
    latitude,
    longitude
  };

  // Add daily data if available
  if (daily) {
    weatherData.daily = {
      time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      temperature2mMax: daily.variables(0)!.valuesArray()!,
      temperature2mMin: daily.variables(1)!.valuesArray()!,
      precipitationSum: daily.variables(2)!.valuesArray()!,
      weatherCode: daily.variables(3)!.valuesArray()!
    };
  }

  // Add current data if available
  if (current) {
    weatherData.current = {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature2m: current.variables(0)!.value()!,
      relativeHumidity2m: current.variables(1)!.value()!,
      apparentTemperature: current.variables(2)!.value()!,
      precipitation: current.variables(3)!.value()!,
      weatherCode: current.variables(4)!.value()!,
      windSpeed10m: current.variables(5)!.value()!,
      surfacePressure: current.variables(6)?.value(),
      shortwaveRadiation: current.variables(7)?.value()
    };
  }

  return weatherData;
}

// Default weather parameters for Rourkela, India
export const defaultWeatherParams: WeatherParams = {
  latitude: 22.2567,
  longitude: 84.8146,
  hourly: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation",
    "rain",
    "showers",
    "visibility",
    "wind_speed_80m",
    "surface_pressure",
    "shortwave_radiation",
    "wind_speed_1000hPa",
    "weather_code"
  ],
  daily: [
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "weather_code"
  ],
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "surface_pressure",
    "shortwave_radiation"
  ],
  timezone: "auto"
};