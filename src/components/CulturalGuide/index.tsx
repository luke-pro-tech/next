import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { stbMapService, TouristAttraction } from '../../services/stbMapService';
import { useProximityTracking, ProximityAlert } from '../../hooks/useProximityTracking';
import ProximityAlertsList from '../ProximityAlerts';
import AIGuideResponse from '../AIGuideResponse';

// Dynamically import the map component to avoid SSR issues
const ProximityMap = dynamic(() => import('../ProximityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <div className="text-gray-600">Loading map...</div>
      </div>
    </div>
  )
});

interface CulturalGuideProps {
  className?: string;
  defaultProximityThreshold?: number;
  showAvatar?: boolean;
  enableAudioGuide?: boolean;
}

interface LocationPermissionBannerProps {
  onRequestPermission: () => void;
  onDismiss: () => void;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  onRequestPermission,
  onDismiss,
  permissionStatus
}) => {
  if (permissionStatus === 'granted') return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <span className="text-2xl">📍</span>
        </div>        <div className="flex-1">
          <div className="flex space-x-3">
            <button
              onClick={onRequestPermission}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Enable Location
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
            >
              Continue Without
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-blue-400 hover:text-blue-600 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const CulturalGuide: React.FC<CulturalGuideProps> = ({
  className = '',
  defaultProximityThreshold = Number(process.env.NEXT_PUBLIC_DEFAULT_PROXIMITY_THRESHOLD) || 1000,
  showAvatar = true,
  enableAudioGuide = process.env.NEXT_PUBLIC_ENABLE_AUDIO_GUIDE === 'true'
}) => {
  // Default Singapore center coordinates
  const DEFAULT_SINGAPORE_LOCATION = {
    latitude: 1.3521,
    longitude: 103.8198
  };

  // State management
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<TouristAttraction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationBanner, setShowLocationBanner] = useState(true);
  const [proximityThreshold, setProximityThreshold] = useState(defaultProximityThreshold);
  // Proximity tracking hook
  const {
    userLocation,
    proximityAlerts,
    activeAlerts,
    isTracking,
    locationError,
    permissionStatus,
    startTracking,
    dismissAlert
  } = useProximityTracking(attractions, {
    proximityThreshold,
    trackingInterval: 10000, // Check every 10 seconds
    cooldownPeriod: 300000   // 5 minutes cooldown
  });
  // Load attractions when user location is available
  useEffect(() => {
    if (userLocation && !loading) {
      loadNearbyAttractions();
    }
  }, [userLocation]);  // Auto-start location tracking and load default attractions on mount
  useEffect(() => {
    // Load attractions around Singapore center initially
    loadAttractionsForLocation(DEFAULT_SINGAPORE_LOCATION);
    
    // Auto-start location tracking (silently, without forcing permission)
    const initializeLocation = async () => {
      if (navigator.geolocation && 'permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'granted') {
            // If permission is already granted, start tracking automatically
            startTracking();
            setShowLocationBanner(false);
          }
        } catch (err) {
          // Silently fail if permission check fails
          console.log('Permission check failed:', err);
        }
      }
    };
    
    initializeLocation();
  }, []); // Empty dependency array - run only on mount
  // Load nearby attractions
  const loadNearbyAttractions = useCallback(async () => {
    if (!userLocation) return;
    await loadAttractionsForLocation(userLocation);
  }, [userLocation, proximityThreshold]);
  // Load attractions for any location (user location or default)
  const loadAttractionsForLocation = useCallback(async (location: { latitude: number; longitude: number }) => {
    setLoading(true);
    setError(null);

    try {
      const nearbyAttractions = await stbMapService.searchAttractions({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: proximityThreshold * 2, // Load attractions in slightly wider area for better coverage
        limit: 50
      });

      setAttractions(nearbyAttractions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load attractions';
      setError(errorMessage);
      console.error('Error loading attractions:', err);
    } finally {
      setLoading(false);
    }  }, [proximityThreshold]);

  // Reload attractions when proximity threshold changes
  useEffect(() => {
    if (userLocation) {
      loadAttractionsForLocation(userLocation);
    } else {
      loadAttractionsForLocation(DEFAULT_SINGAPORE_LOCATION);
    }
  }, [proximityThreshold, loadAttractionsForLocation, userLocation]);

  // Handle location permission request
  const handleRequestPermission = useCallback(async () => {
    const success = await startTracking();
    if (success) {
      setShowLocationBanner(false);
    }
  }, [startTracking]);

  // Handle attraction selection from map
  const handleAttractionClick = useCallback((attraction: TouristAttraction) => {
    setSelectedAttraction(attraction);
  }, []);

  // Handle proximity alert actions
  const handleViewAlertDetails = useCallback((alert: ProximityAlert) => {
    setSelectedAttraction(alert.attraction);
  }, []);

  // Handle location update from map click
  const handleLocationUpdate = useCallback((location: any) => {
    // This would typically update user location if manual positioning is allowed
    console.log('Location updated from map:', location);
  }, []);
  // Format distance for display
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter attractions within the specified proximity threshold
  const attractionsInRange = React.useMemo(() => {
    if (!userLocation) {
      // If no user location, show all attractions (default Singapore view)
      return attractions;
    }

    return attractions.filter(attraction => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        attraction.latitude,
        attraction.longitude
      );
      return distance <= proximityThreshold;
    });
  }, [attractions, userLocation, proximityThreshold]);

  return (
    <div className={`cultural-guide ${className}`}>
      {/* Location Permission Banner */}
      {showLocationBanner && permissionStatus !== 'granted' && (
        <LocationPermissionBanner
          onRequestPermission={handleRequestPermission}
          onDismiss={() => setShowLocationBanner(false)}
          permissionStatus={permissionStatus}
        />
      )}      {/* Header */}
      <div className="text-center mb-6">
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🇸🇬 AI Cultural Guide Singapore
        </h1> */}
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore Singapore's attractions on the interactive map.
        </p>
      </div>      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-center gap-8">
          {/* Location Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isTracking ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className="text-sm text-gray-600">
              {isTracking ? 'Location Active' : 'Location Inactive'}
            </span>
          </div>

          {/* Proximity Threshold Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Range:</label>
            <select
              value={proximityThreshold}
              onChange={(e) => setProximityThreshold(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={500}>500m</option>
              <option value={1000}>1km</option>
              <option value={2000}>2km</option>
            </select>
          </div>
        </div>

        {/* Active Alerts - Centered below */}
        {activeAlerts.length > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-3">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm text-orange-600 font-medium">
              {activeAlerts.length} nearby attraction{activeAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Error Display */}
        {(error || locationError) && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-700">
              {error || locationError}
            </div>
          </div>
        )}
      </div>      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <ProximityMap
          attractions={attractionsInRange}
          userLocation={userLocation}
          defaultCenter={DEFAULT_SINGAPORE_LOCATION}
          proximityAlerts={proximityAlerts}
          onAttractionClick={handleAttractionClick}
          onLocationUpdate={handleLocationUpdate}
          height="500px"
          proximityThreshold={proximityThreshold}
        />
      </div>

      {/* Selected Attraction Details */}
      {selectedAttraction && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              🏛️ Attraction Details
            </h2>
            <button
              onClick={() => setSelectedAttraction(null)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {selectedAttraction.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedAttraction.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-20 text-gray-500">Category:</span>
                  <span className="text-gray-800">{selectedAttraction.category}</span>
                </div>
                
                {selectedAttraction.distance && (
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Distance:</span>
                    <span className="text-gray-800">{formatDistance(selectedAttraction.distance)}</span>
                  </div>
                )}

                {selectedAttraction.rating && (
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Rating:</span>
                    <span className="text-gray-800">⭐ {selectedAttraction.rating}/5</span>
                  </div>
                )}

                {selectedAttraction.openingHours && (
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Hours:</span>
                    <span className="text-gray-800">{selectedAttraction.openingHours}</span>
                  </div>
                )}

                <div className="flex items-start">
                  <span className="w-20 text-gray-500">Address:</span>
                  <span className="text-gray-800">{selectedAttraction.address}</span>
                </div>
              </div>
            </div>

            {selectedAttraction.imageUrl && (
              <div>
                <img
                  src={selectedAttraction.imageUrl}
                  alt={selectedAttraction.name}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>          {/* AI Avatar Integration */}
          {showAvatar && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                🤖 AI Guide Response:
              </h4>              <AIGuideResponse 
                selectedAttraction={selectedAttraction}
                userLocation={userLocation}
                nearbyAttractions={attractionsInRange}
              />
            </div>
          )}
        </div>      )}

      {/* Proximity Alerts */}
      <ProximityAlertsList
        alerts={proximityAlerts}
        onDismiss={dismissAlert}
        onViewDetails={handleViewAlertDetails}
        position="top-right"
        maxAlerts={3}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <div className="text-gray-700">Loading nearby attractions...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalGuide;
