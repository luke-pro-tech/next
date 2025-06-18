# STB Map API Integration

This implementation provides a comprehensive integration with the Singapore Tourism Board (STB) Map API to retrieve and utilize tourist attraction information for enhancing AI avatar responses in the tourism guide app.

## 🌟 Features

- **Location-based Search**: Find tourist attractions near any coordinates in Singapore
- **Category Filtering**: Filter attractions by categories (Art & Museums, Nature & Wildlife, etc.)
- **Personalized Recommendations**: AI-powered recommendations based on user preferences
- **Fallback Data**: Comprehensive fallback attraction data when API is unavailable
- **React Hooks**: Easy-to-use React hooks for component integration
- **Distance Calculations**: Automatic distance calculation from user location
- **Error Handling**: Robust error handling and validation

## 📁 File Structure

```
src/
├── services/
│   └── stbMapService.ts          # Core STB API service
├── hooks/
│   └── useSTBMap.ts              # React hooks for STB integration
├── components/
│   └── AttractionSearch.tsx      # Search component with UI
├── utils/
│   └── tourismAI.ts              # AI utilities for tourism context
└── app/
    └── stb-demo/
        └── page.tsx              # Demo page showcasing integration
```

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { stbMapService } from '../services/stbMapService';

// Search for attractions near Marina Bay Sands
const attractions = await stbMapService.searchAttractions({
  latitude: 1.2834,
  longitude: 103.8607,
  radius: 1000,
  category: 'Art & Museums',
  limit: 10
});
```

### 2. Using React Hooks

```typescript
import { useSTBMap, useUserLocation } from '../hooks/useSTBMap';

function MyComponent() {
  const { location } = useUserLocation();
  const { attractions, loading, error, searchAttractions } = useSTBMap();

  useEffect(() => {
    if (location) {
      searchAttractions({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 2000
      });
    }
  }, [location]);

  return (
    <div>
      {loading && <p>Loading attractions...</p>}
      {error && <p>Error: {error}</p>}
      {attractions.map(attraction => (
        <div key={attraction.name}>{attraction.name}</div>
      ))}
    </div>
  );
}
```

### 3. AI Integration

```typescript
import { getPersonalizedRecommendations, getNearbyAttractionsForContext } from '../utils/tourismAI';

// Get AI-powered recommendations
const recommendations = await getPersonalizedRecommendations({
  userLocation: { latitude: 1.3521, longitude: 103.8198 },
  interests: ['Art & Museums', 'Cultural'],
  budget: 'medium',
  travelStyle: 'couple',
  duration: 'full-day'
}, 5);

// Get context for AI avatar responses
const context = await getNearbyAttractionsForContext(1.3521, 103.8198, 1000);
```

## 🔧 API Configuration

### Environment Variables

Add your STB API credentials to your environment:

```env
STB_API_KEY=your_stb_api_key_here
```

### Custom Configuration

```typescript
import { STBMapService } from '../services/stbMapService';

const customSTBService = new STBMapService({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.stb.gov.sg'
});
```

## 📊 Data Types

### TouristAttraction

```typescript
interface TouristAttraction {
  name: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating?: number;
  website?: string;
  openingHours?: string;
  contactInfo?: string;
  distance?: number; // in meters
}
```

### Search Parameters

```typescript
interface AttractionSearchParams {
  latitude: number;
  longitude: number;
  category?: string;
  radius?: number; // in meters
  limit?: number;
}
```

### Tourism Context

```typescript
interface TourismContext {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  interests?: SingaporeCategory[];
  budget?: 'low' | 'medium' | 'high';
  travelStyle?: 'family' | 'solo' | 'couple' | 'group';
  duration?: 'half-day' | 'full-day' | 'multi-day';
}
```

## 🎯 Available Categories

- Art & Museums
- Nature & Wildlife
- Architecture
- Cultural
- Family
- Beach
- Nightlife
- Food & Culinary
- Shopping
- Historical
- Religious
- Adventure
- Wellness
- Festival & Events

## 🔍 Core Methods

### STBMapService Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `searchAttractions()` | Search for attractions | `AttractionSearchParams` |
| `getAttractionsByCategory()` | Get attractions by category | `lat, lng, category, radius?` |
| `getNearbyAttractions()` | Get nearby attractions | `lat, lng, radius?` |
| `formatDistance()` | Format distance for display | `distanceInMeters` |

### AI Utility Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getPersonalizedRecommendations()` | AI-powered recommendations | `AttractionRecommendation[]` |
| `getNearbyAttractionsForContext()` | Context for AI responses | `string` |
| `getCategoryInsights()` | Category-specific insights | `string` |
| `getAttractionDetails()` | Detailed attraction info | `string` |

## 🛡️ Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const attractions = await stbMapService.searchAttractions(params);
} catch (error) {
  if (error.message.includes('Singapore bounds')) {
    // Handle invalid coordinates
  } else if (error.message.includes('STB API error')) {
    // Handle API errors
  } else {
    // Handle other errors
  }
}
```

## 🎨 UI Components

### AttractionSearch Component

A complete search interface with:
- Location input (current location or manual coordinates)
- Category filtering
- Radius selection
- Results display with cards
- Error handling and loading states

```typescript
<AttractionSearch onAttractionSelect={(attraction) => {
  console.log('Selected:', attraction);
}} />
```

## 🚦 Validation

### Coordinate Validation

The service validates that coordinates are within Singapore bounds:
- Latitude: 1.2° to 1.5°N
- Longitude: 103.6° to 104.0°E

### Parameter Validation

- Radius: 500m - 10,000m
- Limit: 1 - 100 results
- Category: Must be from predefined list

## 🔄 Fallback System

When the STB API is unavailable, the service automatically falls back to:
- Comprehensive database of Singapore attractions
- Same interface and data structure
- Distance calculations and filtering
- Category-based organization

## 🧪 Testing the Integration

### Demo Page

Visit `/stb-demo` to see the complete integration in action:
- Interactive search interface
- AI context generation
- Personalized recommendations
- Real-time location detection

### Manual Testing

```typescript
// Test coordinate validation
stbMapService.searchAttractions({
  latitude: 1.3521,
  longitude: 103.8198,
  radius: 1000
});

// Test category filtering
stbMapService.getAttractionsByCategory(
  1.3521, 103.8198, 'Art & Museums', 2000
);

// Test AI recommendations
getPersonalizedRecommendations({
  userLocation: { latitude: 1.3521, longitude: 103.8198 },
  interests: ['Cultural', 'Historical'],
  budget: 'medium'
});
```

## 🔮 AI Avatar Integration

The tourism utilities are designed to provide rich context for AI avatar responses:

1. **Location Context**: Nearby attractions and distances
2. **Personalized Recommendations**: Based on user preferences
3. **Category Insights**: Detailed information about attraction types
4. **Natural Language**: Formatted for conversational responses

Example AI response enhancement:
```typescript
const attraction = await getAttractionDetails('Marina Bay Sands');
const context = await getNearbyAttractionsForContext(1.2834, 103.8607, 500);

// AI can now provide detailed, contextual responses
```

## 📈 Performance Considerations

- **Caching**: Results are not cached by default - implement caching as needed
- **Rate Limiting**: Respect STB API rate limits
- **Batch Requests**: Use category searches for multiple attraction types
- **Fallback Performance**: Fallback data is optimized for quick responses

## 🛠️ Customization

### Adding New Categories

Update the `SINGAPORE_CATEGORIES` array in `stbMapService.ts`:

```typescript
export const SINGAPORE_CATEGORIES = [
  // ...existing categories
  'Your New Category'
] as const;
```

### Custom Scoring Algorithm

Modify the `calculateRecommendationScore` function in `tourismAI.ts` to adjust how attractions are scored and recommended.

### UI Customization

The `AttractionSearch` component uses Tailwind CSS and can be easily customized for your design system.

## 🔗 Integration with Existing App

To integrate with your AI avatar system:

1. Import the tourism utilities
2. Use `getPersonalizedRecommendations()` for user queries
3. Use `getNearbyAttractionsForContext()` for location-based responses
4. Use `formatAttractionForAI()` for natural language responses

## 📚 Additional Resources

- [STB API Documentation](https://api.stb.gov.sg)
- [Singapore Tourism Board](https://www.stb.gov.sg)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [TypeScript Guide](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When extending this integration:

1. Maintain TypeScript interfaces
2. Add comprehensive error handling
3. Include fallback data for new features
4. Update tests and documentation
5. Follow the existing code patterns

## 📄 License

This implementation is part of the tourism guide app and follows the project's licensing terms.
