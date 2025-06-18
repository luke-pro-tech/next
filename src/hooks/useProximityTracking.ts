import { useState, useEffect, useCallback, useRef } from 'react';
import { TouristAttraction } from '../services/stbMapService';

export interface ProximityAlert {
  attraction: TouristAttraction;
  distance: number;
  timestamp: number;
  dismissed: boolean;
  id: string;
}

export interface UseProximityTrackingOptions {
  proximityThreshold?: number; // Distance in meters to trigger alerts
  trackingInterval?: number; // How often to check location (ms)
  cooldownPeriod?: number; // Time before showing same attraction again (ms)
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

export function useProximityTracking(
  attractions: TouristAttraction[],
  options: UseProximityTrackingOptions = {}
) {
  const {
    proximityThreshold = Number(process.env.NEXT_PUBLIC_DEFAULT_PROXIMITY_THRESHOLD) || 1000,
    trackingInterval = Number(process.env.NEXT_PUBLIC_TRACKING_INTERVAL) || 10000,
    cooldownPeriod = Number(process.env.NEXT_PUBLIC_COOLDOWN_PERIOD) || 300000
  } = options;

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [proximityAlerts, setProximityAlerts] = useState<ProximityAlert[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  const watchIdRef = useRef<number | null>(null);
  const alertedAttractionsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request location permission and start tracking
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return false;
    }

    try {
      // Check permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        if (permission.state === 'denied') {
          setLocationError('Location access denied. Please enable location permissions.');
          return false;
        }
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      };

      const success = (position: GeolocationPosition) => {
        const newLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        setUserLocation(newLocation);
        setLocationError(null);
        checkProximity(newLocation);
      };

      const error = (err: GeolocationPositionError) => {
        console.error('Geolocation error:', err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('Location access denied by user');
            setPermissionStatus('denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case err.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred while retrieving location');
            break;
        }
      };

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(success, error, options);
      setIsTracking(true);
      setPermissionStatus('granted');
      
      // Also set up periodic checking as backup
      intervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(success, error, options);
      }, trackingInterval);

      return true;
    } catch (err) {
      setLocationError('Failed to start location tracking');
      return false;
    }
  }, [trackingInterval]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsTracking(false);
  }, []);

  // Check proximity to attractions
  const checkProximity = useCallback((location: UserLocation) => {
    const newAlerts: ProximityAlert[] = [];
    const currentTime = Date.now();

    attractions.forEach(attraction => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        attraction.latitude,
        attraction.longitude
      );

      // Check if within proximity threshold
      if (distance <= proximityThreshold) {
        const attractionKey = `${attraction.name}_${attraction.latitude}_${attraction.longitude}`;
        
        // Check if we've already alerted for this attraction recently
        const hasRecentAlert = proximityAlerts.some(alert => 
          alert.attraction.name === attraction.name &&
          !alert.dismissed &&
          (currentTime - alert.timestamp) < cooldownPeriod
        );

        if (!hasRecentAlert && !alertedAttractionsRef.current.has(attractionKey)) {
          const alert: ProximityAlert = {
            attraction: { ...attraction, distance },
            distance,
            timestamp: currentTime,
            dismissed: false,
            id: `${attractionKey}_${currentTime}`
          };
          
          newAlerts.push(alert);
          alertedAttractionsRef.current.add(attractionKey);
          
          // Remove from alerted set after cooldown period
          setTimeout(() => {
            alertedAttractionsRef.current.delete(attractionKey);
          }, cooldownPeriod);
        }
      }
    });

    if (newAlerts.length > 0) {
      setProximityAlerts(prev => [...prev, ...newAlerts]);
    }
  }, [attractions, proximityThreshold, proximityAlerts, cooldownPeriod]);

  // Dismiss an alert
  const dismissAlert = useCallback((alertId: string) => {
    setProximityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setProximityAlerts([]);
  }, []);

  // Get active (non-dismissed) alerts
  const activeAlerts = proximityAlerts.filter(alert => !alert.dismissed);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Auto-start tracking if attractions are available
  useEffect(() => {
    if (attractions.length > 0 && !isTracking && permissionStatus === 'unknown') {
      // Don't auto-start, let user initiate
    }
  }, [attractions, isTracking, permissionStatus]);

  return {
    userLocation,
    proximityAlerts,
    activeAlerts,
    isTracking,
    locationError,
    permissionStatus,
    startTracking,
    stopTracking,
    dismissAlert,
    clearAllAlerts,
    proximityThreshold,
    trackingInterval
  };
}
