import { useState, useEffect, useCallback } from 'react';
import { stbMapService, TouristAttraction, AttractionSearchParams, SingaporeCategory } from '../services/stbMapService';

export interface UseSTBMapResult {
  attractions: TouristAttraction[];
  loading: boolean;
  error: string | null;
  searchAttractions: (params: AttractionSearchParams) => Promise<void>;
  searchByCategory: (lat: number, lng: number, category: SingaporeCategory, radius?: number) => Promise<void>;
  getNearby: (lat: number, lng: number, radius?: number) => Promise<void>;
  clearResults: () => void;
  availableCategories: SingaporeCategory[];
}

export interface UseSTBMapOptions {
  autoSearch?: boolean;
  defaultLocation?: {
    latitude: number;
    longitude: number;
  };
  defaultRadius?: number;
}

/**
 * React hook for interacting with STB Map API
 * Provides tourist attraction search functionality with loading states and error handling
 */
export function useSTBMap(options: UseSTBMapOptions = {}): UseSTBMapResult {
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoSearch = false, defaultLocation, defaultRadius = 1000 } = options;

  /**
   * Search for attractions based on parameters
   */
  const searchAttractions = useCallback(async (params: AttractionSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const results = await stbMapService.searchAttractions(params);
      setAttractions(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search attractions';
      setError(errorMessage);
      console.error('STB Map search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search attractions by category
   */
  const searchByCategory = useCallback(async (
    lat: number, 
    lng: number, 
    category: SingaporeCategory, 
    radius: number = defaultRadius
  ) => {
    await searchAttractions({
      latitude: lat,
      longitude: lng,
      category,
      radius,
      limit: 20
    });
  }, [searchAttractions, defaultRadius]);

  /**
   * Get nearby attractions within walking distance
   */
  const getNearby = useCallback(async (
    lat: number, 
    lng: number, 
    radius: number = 500
  ) => {
    await searchAttractions({
      latitude: lat,
      longitude: lng,
      radius,
      limit: 10
    });
  }, [searchAttractions]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setAttractions([]);
    setError(null);
  }, []);

  /**
   * Get available categories for filtering
   */
  const availableCategories = stbMapService.getAvailableCategories();

  /**
   * Auto-search on mount if enabled and default location provided
   */
  useEffect(() => {
    if (autoSearch && defaultLocation) {
      searchAttractions({
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
        radius: defaultRadius
      });
    }
  }, [autoSearch, defaultLocation, defaultRadius, searchAttractions]);

  return {
    attractions,
    loading,
    error,
    searchAttractions,
    searchByCategory,
    getNearby,
    clearResults,
    availableCategories
  };
}

/**
 * Hook for getting user's current location (requires permission)
 */
export function useUserLocation() {
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
        setLoading(false);
        
        // Fallback to Singapore city center
        setLocation({
          latitude: 1.3521,
          longitude: 103.8198
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    loading,
    error,
    getCurrentLocation
  };
}

/**
 * Combined hook that provides both location and attractions
 */
export function useLocationBasedAttractions(category?: SingaporeCategory, radius?: number) {
  const { location, loading: locationLoading, error: locationError } = useUserLocation();
  const { 
    attractions, 
    loading: attractionsLoading, 
    error: attractionsError, 
    searchAttractions,
    searchByCategory 
  } = useSTBMap();

  // Search for attractions when location is available
  useEffect(() => {
    if (location && !locationLoading) {
      if (category) {
        searchByCategory(location.latitude, location.longitude, category, radius);
      } else {
        searchAttractions({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: radius || 1000
        });
      }
    }
  }, [location, locationLoading, category, radius, searchAttractions, searchByCategory]);

  return {
    location,
    attractions,
    loading: locationLoading || attractionsLoading,
    error: locationError || attractionsError,
    searchAttractions,
    searchByCategory
  };
}
