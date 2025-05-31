// Weather API integration for golf courses
import { createBrowserClient } from './supabase';

// Weather API key would typically be stored in environment variables
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo_key';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

export interface WeatherForecast {
  date: string;
  condition: string;
  icon: string;
  maxTemp: number;
  minTemp: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  humidity: number;
  sunrise: string;
  sunset: string;
}

export interface CurrentWeather {
  temp: number;
  condition: string;
  icon: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  feelsLike: number;
  precipitation: number;
  uv: number;
}

/**
 * Get current weather for a golf course
 */
export async function getCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeather | null> {
  try {
    // In a real implementation, this would call the actual weather API
    // For demo purposes, we'll simulate a response
    
    // This would be the actual API call:
    // const response = await fetch(
    //   `${WEATHER_API_URL}/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=no`
    // );
    // const data = await response.json();
    
    // Simulated response
    const conditions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Clear'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      temp: Math.floor(Math.random() * 20) + 15, // 15-35°C
      condition: randomCondition,
      icon: `/weather-icons/${randomCondition.toLowerCase().replace(' ', '-')}.png`,
      windSpeed: Math.floor(Math.random() * 30), // 0-30 km/h
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
      feelsLike: Math.floor(Math.random() * 20) + 15, // 15-35°C
      precipitation: Math.random() * 10, // 0-10mm
      uv: Math.floor(Math.random() * 11) // 0-10 UV index
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

/**
 * Get 3-day weather forecast for a golf course
 */
export async function getWeatherForecast(latitude: number, longitude: number): Promise<WeatherForecast[] | null> {
  try {
    // In a real implementation, this would call the actual weather API
    // For demo purposes, we'll simulate a response
    
    // This would be the actual API call:
    // const response = await fetch(
    //   `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=3&aqi=no&alerts=no`
    // );
    // const data = await response.json();
    
    // Simulated response
    const conditions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Clear'];
    const forecast: WeatherForecast[] = [];
    
    // Generate 3-day forecast
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        condition: randomCondition,
        icon: `/weather-icons/${randomCondition.toLowerCase().replace(' ', '-')}.png`,
        maxTemp: Math.floor(Math.random() * 10) + 20, // 20-30°C
        minTemp: Math.floor(Math.random() * 10) + 10, // 10-20°C
        windSpeed: Math.floor(Math.random() * 30), // 0-30 km/h
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        precipitation: Math.random() * 10, // 0-10mm
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
        sunrise: '06:30 AM',
        sunset: '08:00 PM'
      });
    }
    
    return forecast;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return null;
  }
}

/**
 * Save weather data to Supabase for a course
 */
export async function saveWeatherData(courseId: string, weatherData: CurrentWeather) {
  const supabase = createBrowserClient();
  
  try {
    const { error } = await supabase
      .from('weather_data')
      .insert({
        course_id: courseId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        temperature: weatherData.temp,
        condition: weatherData.condition,
        wind_speed: weatherData.windSpeed,
        wind_direction: weatherData.windDirection,
        humidity: weatherData.humidity,
        precipitation: weatherData.precipitation
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error saving weather data:', error);
    return false;
  }
}
