import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { TouristAttraction } from '../../services/stbMapService';
import { ProximityAlert, UserLocation } from '../../hooks/useProximityTracking';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/markers/marker-icon-2x.png',
  iconUrl: '/markers/marker-icon.png',
  shadowUrl: '/markers/marker-shadow.png',
});

interface ProximityMapProps {
  attractions: TouristAttraction[];
  userLocation: UserLocation | null;
  proximityAlerts: ProximityAlert[];
  onAttractionClick?: (attraction: TouristAttraction) => void;
  onLocationUpdate?: (location: UserLocation) => void;
  height?: string;
  zoom?: number;
  proximityThreshold?: number;
  defaultCenter?: { latitude: number; longitude: number };
}

interface AttractionPopupProps {
  attraction: TouristAttraction;
  onClose: () => void;
  onDetailsClick: () => void;
  distance?: number;
  isProximityAlert?: boolean;
}

// Custom user location marker
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #4285f4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          width: 40px;
          height: 40px;
          background: rgba(66, 133, 244, 0.2);
          border-radius: 50%;
          position: absolute;
          top: -10px;
          left: -10px;
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Custom attraction icons based on category
const createAttractionIcon = (category: string, isNearby: boolean = false) => {
  const getCategoryEmoji = (cat: string) => {
    const categoryMap: { [key: string]: string } = {
      'Art & Museums': '🎨',
      'Nature & Wildlife': '🌿',
      'Cultural': '🏛️',
      'Family': '👨‍👩‍👧‍👦',
      'Nightlife': '🌃',
      'Food & Culinary': '🍽️',
      'Shopping': '🛍️',
      'Historical': '🏺',
      'Religious': '⛪',
      'Adventure': '🧗',
      'Wellness': '🧘',
      'Beach': '🏖️',
      'Architecture': '🏢',
      'Festival & Events': '🎪'
    };
    return categoryMap[cat] || '📍';
  };

  const emoji = getCategoryEmoji(category);
  const color = isNearby ? '#ff4444' : '#4285f4';
  const pulseAnimation = isNearby ? 'animation: pulse 1.5s infinite;' : '';

  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ${pulseAnimation}
        position: relative;
      ">
        ${emoji}
        ${isNearby ? `
          <div style="
            width: 50px;
            height: 50px;
            background: rgba(255, 68, 68, 0.3);
            border-radius: 50%;
            position: absolute;
            top: -9px;
            left: -9px;
            animation: proximityPulse 2s infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes proximityPulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    className: `attraction-marker ${isNearby ? 'nearby' : ''}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Attraction popup component
const AttractionPopup: React.FC<AttractionPopupProps> = ({
  attraction,
  onClose,
  onDetailsClick,
  distance,
  isProximityAlert
}) => {
  return (
    <div className="min-w-64 max-w-80">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-800 flex-1 pr-2">
          {attraction.name}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          title="Close"
        >
          ×
        </button>
      </div>
      
      {isProximityAlert && (
        <div className="bg-orange-100 border border-orange-300 rounded-md p-2 mb-3">
          <div className="flex items-center text-orange-800 text-sm">
            <span className="mr-2">📍</span>
            <span className="font-medium">You're nearby!</span>
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <p className="text-gray-600 line-clamp-3">
          {attraction.description}
        </p>
        
        <div className="flex items-center text-gray-500">
          <span className="mr-1">🏷️</span>
          <span>{attraction.category}</span>
        </div>

        {distance && (
          <div className="flex items-center text-gray-500">
            <span className="mr-1">📏</span>
            <span>
              {distance < 1000 
                ? `${Math.round(distance)}m away`
                : `${(distance / 1000).toFixed(1)}km away`
              }
            </span>
          </div>
        )}

        {attraction.rating && (
          <div className="flex items-center text-gray-500">
            <span className="mr-1">⭐</span>
            <span>{attraction.rating}/5</span>
          </div>
        )}

        {attraction.openingHours && (
          <div className="flex items-center text-gray-500">
            <span className="mr-1">🕒</span>
            <span>{attraction.openingHours}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <button
          onClick={onDetailsClick}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Map update component to handle location changes
const MapUpdater: React.FC<{
  userLocation: UserLocation | null;
  attractions: TouristAttraction[];
}> = ({ userLocation, attractions }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation && attractions.length > 0) {
      // Create bounds that include user location and nearby attractions
      const bounds = L.latLngBounds([]);
      bounds.extend([userLocation.latitude, userLocation.longitude]);
      
      attractions.forEach(attraction => {
        bounds.extend([attraction.latitude, attraction.longitude]);
      });
      
      // Fit map to bounds with padding
      map.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 16 
      });
    } else if (userLocation) {
      // Just center on user location
      map.setView([userLocation.latitude, userLocation.longitude], 15);
    }
  }, [map, userLocation, attractions]);

  return null;
};

// Location click handler component
const LocationClickHandler: React.FC<{
  onLocationUpdate?: (location: UserLocation) => void;
}> = ({ onLocationUpdate }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationUpdate) {
        const location: UserLocation = {
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          timestamp: Date.now()
        };
        onLocationUpdate(location);
      }
    },
  });

  return null;
};

export const ProximityMap: React.FC<ProximityMapProps> = ({
  attractions,
  userLocation,
  proximityAlerts,
  onAttractionClick,
  onLocationUpdate,
  height = '500px',
  zoom = 13,
  proximityThreshold = 1000,
  defaultCenter
}) => {
  const [openPopups, setOpenPopups] = useState<Set<string>>(new Set());
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const mapRef = useRef<L.Map | null>(null);
  
  // Use provided defaultCenter or fallback to Singapore center coordinates
  const fallbackCenter: [number, number] = [
    defaultCenter?.latitude || Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE) || 1.3521,
    defaultCenter?.longitude || Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE) || 103.8198
  ];
  
  const center: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : fallbackCenter;

  // Get nearby attractions (within proximity threshold)
  const nearbyAttractions = userLocation 
    ? attractions.filter(attraction => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          attraction.latitude,
          attraction.longitude
        );
        return distance <= proximityThreshold;
      })
    : [];

  // Calculate distance helper
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  }

  // Handle attraction marker click
  const handleAttractionClick = useCallback((attraction: TouristAttraction) => {
    const attractionId = `${attraction.name}_${attraction.latitude}_${attraction.longitude}`;
    
    setOpenPopups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(attractionId)) {
        newSet.delete(attractionId);
      } else {
        newSet.add(attractionId);
      }
      return newSet;
    });

    if (onAttractionClick) {
      onAttractionClick(attraction);
    }
  }, [onAttractionClick]);

  // Handle popup close
  const handlePopupClose = useCallback((attractionId: string) => {
    setOpenPopups(prev => {
      const newSet = new Set(prev);
      newSet.delete(attractionId);
      return newSet;
    });
  }, []);

  // Auto-open popups for proximity alerts
  useEffect(() => {
    proximityAlerts.forEach(alert => {
      if (!alert.dismissed && !dismissedAlerts.has(alert.id)) {
        const attractionId = `${alert.attraction.name}_${alert.attraction.latitude}_${alert.attraction.longitude}`;
        setOpenPopups(prev => new Set([...prev, attractionId]));
      }
    });
  }, [proximityAlerts, dismissedAlerts]);

  // Dismiss proximity alert
  const dismissProximityAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  return (
    <div style={{ height, width: '100%' }} className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Map updater component */}
        <MapUpdater userLocation={userLocation} attractions={attractions} />
        
        {/* Location click handler */}
        <LocationClickHandler onLocationUpdate={onLocationUpdate} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-blue-600 mb-1">📍 Your Location</div>
                <div className="text-sm text-gray-600">
                  Accuracy: ±{userLocation.accuracy ? Math.round(userLocation.accuracy) : 'Unknown'}m
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(userLocation.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Attraction markers */}
        {attractions.map((attraction, index) => {
          const attractionId = `${attraction.name}_${attraction.latitude}_${attraction.longitude}`;
          const isNearby = nearbyAttractions.some(nearby => 
            nearby.name === attraction.name && 
            nearby.latitude === attraction.latitude && 
            nearby.longitude === attraction.longitude
          );
          const isOpen = openPopups.has(attractionId);
          
          const distance = userLocation 
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                attraction.latitude,
                attraction.longitude
              )
            : undefined;

          const relatedAlert = proximityAlerts.find(alert => 
            alert.attraction.name === attraction.name &&
            alert.attraction.latitude === attraction.latitude &&
            alert.attraction.longitude === attraction.longitude &&
            !dismissedAlerts.has(alert.id)
          );

          return (
            <Marker
              key={`${attractionId}_${index}`}
              position={[attraction.latitude, attraction.longitude]}
              icon={createAttractionIcon(attraction.category, isNearby)}
              eventHandlers={{
                click: () => handleAttractionClick(attraction)
              }}
            >              {isOpen && (
                <Popup
                  closeButton={false}
                  autoClose={false}
                  closeOnClick={false}
                >
                  <AttractionPopup
                    attraction={attraction}
                    distance={distance}
                    isProximityAlert={!!relatedAlert}
                    onClose={() => handlePopupClose(attractionId)}
                    onDetailsClick={() => {
                      if (onAttractionClick) {
                        onAttractionClick(attraction);
                      }
                      if (relatedAlert) {
                        dismissProximityAlert(relatedAlert.id);
                      }
                    }}
                  />
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <div className="text-xs font-semibold text-gray-700 mb-2">Map Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">📍</div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-xs">🎨</div>
            <span>Attractions</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex items-center justify-center text-xs animate-pulse">🎨</div>
            <span>Nearby (1km)</span>
          </div>
        </div>
      </div>

      {/* Proximity threshold indicator */}
      {userLocation && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-[1000]">
          <div className="text-xs text-gray-600">
            Proximity: {proximityThreshold}m
          </div>
        </div>
      )}
    </div>
  );
};

export default ProximityMap;
