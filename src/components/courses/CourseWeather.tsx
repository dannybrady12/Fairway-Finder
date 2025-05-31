'use client';

import { useState, useEffect } from 'react';
import { getCurrentWeather, WeatherForecast, getWeatherForecast, CurrentWeather } from '@/lib/weather';
import { Course } from '@/types/database.types';
import { Cloud, Droplets, Wind, Thermometer, Sun } from 'lucide-react';

interface CourseWeatherProps {
  course: Course;
}

export default function CourseWeather({ course }: CourseWeatherProps) {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!course.latitude || !course.longitude) {
          throw new Error('Course location data not available');
        }
        
        // Fetch current weather
        const current = await getCurrentWeather(course.latitude, course.longitude);
        setCurrentWeather(current);
        
        // Fetch forecast
        const forecastData = await getWeatherForecast(course.latitude, course.longitude);
        setForecast(forecastData);
      } catch (err: any) {
        setError(err.message || 'Failed to load weather data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [course]);
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !currentWeather) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">
          {error || 'Weather data is currently unavailable for this course.'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Current weather */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Current Weather</h3>
            <p className="text-blue-100">Updated just now</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{currentWeather.temp}°C</div>
            <div className="text-blue-100">Feels like {currentWeather.feelsLike}°C</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Cloud className="h-5 w-5 mr-2 text-blue-100" />
            <span>{currentWeather.condition}</span>
          </div>
          <div className="flex items-center">
            <Wind className="h-5 w-5 mr-2 text-blue-100" />
            <span>{currentWeather.windSpeed} km/h {currentWeather.windDirection}</span>
          </div>
          <div className="flex items-center">
            <Droplets className="h-5 w-5 mr-2 text-blue-100" />
            <span>{currentWeather.humidity}% humidity</span>
          </div>
          <div className="flex items-center">
            <Sun className="h-5 w-5 mr-2 text-blue-100" />
            <span>UV Index: {currentWeather.uv}</span>
          </div>
        </div>
      </div>
      
      {/* Forecast */}
      {forecast && forecast.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">3-Day Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-lg font-semibold">{day.condition}</div>
                  <div className="text-right">
                    <span className="text-red-500 font-medium">{day.maxTemp}°</span>
                    <span className="mx-1 text-gray-400">/</span>
                    <span className="text-blue-500 font-medium">{day.minTemp}°</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center mb-1">
                    <Wind className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{day.windSpeed} km/h {day.windDirection}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <Droplets className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{day.precipitation}mm precipitation</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Sunrise: {day.sunrise}</span>
                    <span>Sunset: {day.sunset}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Weather data is provided for planning purposes only and may not be accurate.</p>
      </div>
    </div>
  );
}
