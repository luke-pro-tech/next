interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

const tools: Tool[] = [
  {
    "name": "getWeather",
    "description": "Get current weather information for a city or location",
    "parameters": {
      "type": "object",
      "properties": {
        "city": { 
          "type": "string", 
          "description": "The city name to get weather for" 
        },
        "country": { 
          "type": "string", 
          "description": "The country name (optional)" 
        }
      },
      "required": ["city"]
    }
  }
];

export const getTools = (): Tool[] => {
  return tools;
};

// Fake weather data generator
export const getFakeWeatherData = (city: string, country?: string): string => {
  const temperatures = [18, 22, 25, 28, 32, 15, 20, 24, 27, 30];
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorms', 'Clear'];
  const humidity = [45, 55, 65, 70, 80, 50, 60];
  const windSpeed = [5, 8, 12, 15, 18, 10, 14];

  const temp = temperatures[Math.floor(Math.random() * temperatures.length)];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const hum = humidity[Math.floor(Math.random() * humidity.length)];
  const wind = windSpeed[Math.floor(Math.random() * windSpeed.length)];

  const location = country ? `${city}, ${country}` : city;
  
  return `Current weather in ${location}: ${temp}°C, ${condition}. Humidity: ${hum}%, Wind: ${wind} km/h. Perfect for exploring the city!`;
};