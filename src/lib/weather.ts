import { Database } from '@/types/database.types';

type Course = Database['public']['Tables']['courses']['Row'];

// Constants for weather API
const MOCK_WEATHER_DATA = {
  temperature: 72,
  condition: 'Partly cloudy',
  humidity: 65,
  windSpeed: 8,
  icon: 'https://cdn.weatherapi.com/weather/64x64/day/116.png'
};

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(latitude: number, longitude: number ) {
  // For this prototype, we'll return mock data with slight randomization
  const tempVariation = Math.floor(Math.random() * 10) - 5; // -5 to +5 degrees
  const windVariation = Math.floor(Math.random() * 5); // 0 to +5 mph
  
  return {
    ...MOCK_WEATHER_DATA,
    temperature: MOCK_WEATHER_DATA.temperature + tempVariation,
    windSpeed: MOCK_WEATHER_DATA.windSpeed + windVariation
  };
}

/**
 * Get weather forecast for a location
 */
export async function getWeatherForecast(latitude: number, longitude: number) {
  // For this prototype, we'll return mock data
  
  const forecast = [];
  const conditions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Moderate rain'];
  const icons = [
    'https://cdn.weatherapi.com/weather/64x64/day/113.png', // sunny
    'https://cdn.weatherapi.com/weather/64x64/day/116.png', // partly cloudy
    'https://cdn.weatherapi.com/weather/64x64/day/119.png', // cloudy
    'https://cdn.weatherapi.com/weather/64x64/day/296.png', // light rain
    'https://cdn.weatherapi.com/weather/64x64/day/302.png'  // moderate rain
  ];
  
  // Generate 5-day forecast
  for (let i = 0; i < 5; i++ ) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const conditionIndex = Math.floor(Math.random() * conditions.length);
    const baseTemp = 70 + Math.floor(Math.random() * 15) - 5; // 65-80 degrees
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      condition: conditions[conditionIndex],
      icon: icons[conditionIndex],
      high_temp: baseTemp + Math.floor(Math.random() * 5),
      low_temp: baseTemp - Math.floor(Math.random() * 8),
      precipitation: Math.floor(Math.random() * 80),
      wind_speed: 5 + Math.floor(Math.random() * 10)
    });
  }
  
  return forecast;
}
