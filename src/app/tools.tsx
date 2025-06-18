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
//   {
//     "name": "getWeather",
//     "description": "Get current weather information for a city or location",
//     "parameters": {
//       "type": "object",
//       "properties": {
//         "city": { 
//           "type": "string", 
//           "description": "The city name to get weather for" 
//         },
//         "country": { 
//           "type": "string", 
//           "description": "The country name (optional)" 
//         }
//       },
//       "required": ["city"]
//     }
//   },
  {
    "name": "navigateToCultureGuide",
    "description": "Navigate to the Culture Guide page to get recommendations on attractions, hidden gems, recommendations ",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  {
    "name": "searchSTBData",
    "description": "ONLY call this tool when user specifically mentions 'itinerary' or asks to create/plan an itinerary. Search Singapore Tourism Board data by category preferences and navigate to swipe page with curated itinerary options.",
    "parameters": {
      "type": "object",
      "properties": {
        "datasets": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["accommodation", "attractions", "events", "food_beverages", "mice_events", "precincts", "shops", "tours"]
          },
          "description": "Array of STB dataset categories to search for itinerary planning. Valid options: accommodation, attractions, events, food_beverages, mice_events, precincts, shops, tours"
        }
      },
      "required": ["datasets"]
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

// Culture guide navigation handler
export const navigateToCultureGuide = (): string => {
  if (typeof window !== 'undefined') {
    // Use Next.js router for client-side navigation to avoid page reload
    const event = new CustomEvent('navigate-to-culture-guide');
    window.dispatchEvent(event);
  }
  
  return `I'm taking you to the Culture Guide page where you can explore cultural insights, local customs, traditions, etiquette, and travel tips for various destinations around the world.`;
};

// STB data search handler
export const searchSTBData = (datasets: string[]): string => {
  if (typeof window !== 'undefined') {
    // Store selected datasets in localStorage for the swipe page to use
    localStorage.setItem('selectedDatasets', JSON.stringify(datasets));
    // Use custom event for client-side navigation to avoid page reload
    const event = new CustomEvent('navigate-to-swipe');
    window.dispatchEvent(event);
  }
  
  const datasetNames = datasets.map(id => {
    const nameMap: Record<string, string> = {
      'accommodation': 'Accommodation',
      'attractions': 'Attractions', 
      'events': 'Events',
      'food_beverages': 'Food & Beverages',
      'mice_events': 'MICE Events',
      'precincts': 'Precincts',
      'shops': 'Shopping',
      'tours': 'Tours'
    };
    return nameMap[id] || id;
  }).join(', ');
  
  return datasetNames;
};