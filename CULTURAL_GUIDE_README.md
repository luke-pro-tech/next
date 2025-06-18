# AI Avatar Cultural Guide with Proximity-Based Attractions

This implementation provides an AI Avatar Cultural Guide for Singapore that uses the STB Map API to show attractions as pop-ups on an interactive map when users are within 1km of those landmarks.

## Features

### 🗺️ Interactive Map with Proximity Detection
- **Real-time Location Tracking**: Uses HTML5 Geolocation API for continuous location monitoring
- **Proximity-Based Alerts**: Automatically detects when users are within 1km of attractions
- **Interactive Map**: Built with Leaflet for smooth navigation and marker interactions
- **Custom Markers**: Category-specific icons with visual proximity indicators

### 📱 Mobile-Optimized UI
- **Responsive Design**: Works seamlessly on mobile devices
- **Non-Overlapping Pop-ups**: Intelligent positioning to prevent UI overlap
- **Touch-Friendly**: Optimized for mobile touch interactions
- **Dismissible Notifications**: Users can close and reopen attraction details

### 🤖 AI-Powered Guidance
- **Contextual Responses**: AI generates personalized attraction information
- **Distance-Aware**: Provides walking directions and time estimates
- **Category Insights**: Specialized guidance based on attraction type
- **Nearby Recommendations**: Suggests related attractions within walking distance

### 🔐 Privacy & Security
- **Client-Side Processing**: Location data stays on the device
- **Permission-Based**: Requires explicit user consent for location access
- **Secure Data Handling**: No storage or transmission of personal location data
- **GDPR Compliant**: Follows privacy best practices

## Architecture

```
src/
├── components/
│   ├── CulturalGuide/           # Main component orchestrating the experience
│   ├── ProximityMap/            # Interactive Leaflet map with markers
│   ├── ProximityAlerts/         # Pop-up notifications for nearby attractions
│   └── AIGuideResponse/         # AI-generated contextual responses
├── hooks/
│   ├── useProximityTracking.ts  # Location tracking and proximity detection
│   └── useSTBMap.ts            # STB API integration
├── services/
│   └── stbMapService.ts        # STB Map API service layer
└── utils/
    └── tourismAI.ts            # AI response generation utilities
```

## Key Components

### 1. CulturalGuide (Main Component)
- Orchestrates the entire user experience
- Manages state for attractions, location, and alerts
- Provides user controls for proximity threshold and tracking

### 2. ProximityMap
- Interactive Leaflet map with custom markers
- Real-time user location display with accuracy indicator
- Attraction markers with category-specific icons
- Proximity-based visual indicators (pulsing animations)

### 3. ProximityTracking Hook
- Continuous location monitoring with configurable intervals
- Haversine formula for distance calculations
- Cooldown periods to prevent spam notifications
- Permission management and error handling

### 4. ProximityAlerts
- Non-intrusive notification system
- Auto-dismiss with progress indicators
- Stack management for multiple nearby attractions
- Mobile-optimized positioning

## Implementation Details

### Distance Calculation
Uses the Haversine formula for accurate distance calculation:
```typescript
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### Location Tracking
- Uses `navigator.geolocation.watchPosition()` for continuous tracking
- Fallback to periodic `getCurrentPosition()` calls
- Configurable accuracy requirements and timeout settings
- Graceful degradation when location services are unavailable

### Proximity Logic
```typescript
// Check if user is within proximity threshold
if (distance <= proximityThreshold) {
  // Check cooldown period to prevent spam
  const hasRecentAlert = /* cooldown logic */;
  
  if (!hasRecentAlert) {
    // Create and display proximity alert
    const alert = createProximityAlert(attraction, distance);
    displayAlert(alert);
  }
}
```

## API Integration

### STB Map API
The implementation integrates with Singapore Tourism Board's Map API:

```typescript
interface AttractionSearchParams {
  latitude: number;
  longitude: number;
  category?: string;
  radius?: number; // in meters
  limit?: number;
}

// Search for attractions within radius
const attractions = await stbMapService.searchAttractions({
  latitude: userLocation.latitude,
  longitude: userLocation.longitude,
  radius: 1000, // 1km radius
  limit: 50
});
```

### Fallback Data
Includes comprehensive fallback data to ensure functionality when API is unavailable:
- 50+ Singapore attractions with complete metadata
- Category classifications and ratings
- Opening hours and contact information
- High-quality images and descriptions

## Usage

### Basic Implementation
```typescript
import CulturalGuide from '@/components/CulturalGuide';

export default function TourismPage() {
  return (
    <CulturalGuide 
      defaultProximityThreshold={1000}  // 1km default
      showAvatar={true}                 // Enable AI guide
      enableAudioGuide={false}          // Audio narration
    />
  );
}
```

### Advanced Configuration
```typescript
// Custom proximity tracking
const {
  userLocation,
  proximityAlerts,
  startTracking,
  stopTracking
} = useProximityTracking(attractions, {
  proximityThreshold: 1000,  // 1km radius
  trackingInterval: 10000,   // Check every 10 seconds
  cooldownPeriod: 300000     // 5 minutes between same attraction alerts
});
```

## Mobile Considerations

### Performance Optimization
- Efficient marker clustering for large numbers of attractions
- Lazy loading of map tiles and attraction images
- Debounced location updates to reduce battery drain
- Memory management for long-running sessions

### User Experience
- Touch-friendly interface with appropriate touch targets
- Swipe gestures for dismissing alerts
- Haptic feedback for proximity notifications (where supported)
- Offline capability with cached map tiles

### Battery Optimization
- Configurable tracking intervals (default: 10 seconds)
- Intelligent power management based on movement
- Option to disable continuous tracking
- Background location access handling

## Privacy Implementation

### Data Protection
- No server-side storage of location data
- Client-side only proximity calculations
- Anonymous usage analytics (optional)
- Clear privacy policy and permissions

### User Control
- Granular permission requests
- Easy opt-out mechanisms
- Transparent data usage explanation
- Manual location input as alternative

## Browser Compatibility

### Supported Features
- HTML5 Geolocation API (all modern browsers)
- Web Audio API (for audio guides)
- Service Workers (for offline functionality)
- CSS Transforms and Animations

### Fallbacks
- Manual location entry for devices without GPS
- Static images where WebGL is unavailable
- Text-based directions for accessibility
- Progressive enhancement approach

## Testing Strategy

### Unit Tests
- Distance calculation accuracy
- Proximity detection logic
- Location permission handling
- API service layer functionality

### Integration Tests
- Map component rendering
- Real-time location updates
- Alert notification system
- STB API integration

### User Testing
- Mobile device compatibility
- Battery usage optimization
- User flow validation
- Accessibility compliance

## Future Enhancements

### Planned Features
- **Audio Guides**: Voice narration for attractions
- **AR Integration**: Augmented reality overlays
- **Social Sharing**: Share discoveries with friends
- **Personalized Routes**: AI-generated tour suggestions
- **Multi-language Support**: International visitor support
- **Offline Maps**: Complete offline functionality

### Scalability
- Support for multiple cities/countries
- Plugin architecture for custom attraction types
- Real-time event and festival integration
- Dynamic content management system

## Dependencies

### Core Libraries
- **react-leaflet**: Interactive map component
- **leaflet**: Map functionality and markers
- **@types/leaflet**: TypeScript definitions

### Existing Project Dependencies
- **Next.js 15.3.3**: React framework
- **React 19**: UI library
- **Tailwind CSS**: Styling framework
- **TypeScript**: Type safety

## Deployment Notes

### Environment Setup
1. Install dependencies: `npm install react-leaflet leaflet @types/leaflet`
2. Configure STB API credentials (if available)
3. Set up environment variables for API endpoints
4. Configure map tile service (OpenStreetMap default)

### Production Considerations
- CDN hosting for map tiles and images
- Rate limiting for API requests
- Error monitoring and logging
- Performance monitoring
- SEO optimization for attraction pages

This implementation provides a comprehensive foundation for an AI Avatar Cultural Guide with robust proximity detection, mobile optimization, and extensible architecture for future enhancements.
