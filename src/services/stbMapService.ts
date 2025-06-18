/**
 * STB (Singapore Tourism Board) Map API Service
 * This service handles all interactions with the STB Map API for tourist attractions in Singapore
 */

export interface STBApiConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface AttractionSearchParams {
  latitude: number;
  longitude: number;
  category?: string;
  radius?: number; // in meters
  limit?: number;
}

export interface TouristAttraction {
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
  distance?: number; // distance from user location in meters
}

export interface STBApiResponse {
  total: number;
  features: STBFeature[];
}

export interface STBFeature {
  properties: {
    NAME: string;
    DESCRIPTION?: string;
    PHOTOURL?: string;
    ADDRESSBLOCKHOUSENUMBER?: string;
    ADDRESSBUILDINGNAME?: string;
    ADDRESSSTREETNAME?: string;
    ADDRESSPOSTALCODE?: string;
    OFFICIALWEBSITE?: string;
    OPENINGHOURS?: string;
    CONTACT?: string;
    RATING?: number;
    CATEGORY?: string;
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// Singapore attraction categories
export const SINGAPORE_CATEGORIES = [
  'Art & Museums',
  'Nature & Wildlife',
  'Architecture', 
  'Cultural',
  'Family',
  'Beach',
  'Nightlife',
  'Food & Culinary',
  'Shopping',
  'Historical',
  'Religious',
  'Adventure',
  'Wellness',
  'Festival & Events'
] as const;

export type SingaporeCategory = typeof SINGAPORE_CATEGORIES[number];

export class STBMapService {
  private config: STBApiConfig;
  private readonly SINGAPORE_BOUNDS = {
    north: 1.5,
    south: 1.2,
    east: 104.0,
    west: 103.6
  };

  constructor(config: STBApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.STB_API_BASE_URL || 'https://api.stb.gov.sg',
      apiKey: config.apiKey || process.env.STB_API_KEY,
      ...config
    };
  }

  /**
   * Search for tourist attractions near a given location
   */
  async searchAttractions(params: AttractionSearchParams): Promise<TouristAttraction[]> {
    const { latitude, longitude, category, radius = 1000, limit = 20 } = params;

    try {
      // Validate Singapore coordinates
      this.validateCoordinates(latitude, longitude);

      // Try to fetch from STB API first
      const attractions = await this.fetchFromSTBApi(params);
      
      // Calculate distances and sort by proximity
      return this.processAttractions(attractions, latitude, longitude);

    } catch (error) {
      console.warn('STB API unavailable, using fallback data:', error);
      
      // Use fallback data when API is unavailable
      return this.getFallbackAttractions(params);
    }
  }

  /**
   * Get attractions by category
   */
  async getAttractionsByCategory(
    latitude: number, 
    longitude: number, 
    category: SingaporeCategory,
    radius: number = 2000
  ): Promise<TouristAttraction[]> {
    return this.searchAttractions({
      latitude,
      longitude,
      category,
      radius,
      limit: 50
    });
  }

  /**
   * Get nearby attractions within walking distance
   */
  async getNearbyAttractions(
    latitude: number, 
    longitude: number,
    walkingRadius: number = 500
  ): Promise<TouristAttraction[]> {
    return this.searchAttractions({
      latitude,
      longitude,
      radius: walkingRadius,
      limit: 10
    });
  }

  /**
   * Validate if coordinates are within Singapore bounds
   */
  private validateCoordinates(lat: number, lng: number): void {
    const { north, south, east, west } = this.SINGAPORE_BOUNDS;
    
    if (lat < south || lat > north || lng < west || lng > east) {
      throw new Error(
        `Coordinates (${lat}, ${lng}) are outside Singapore bounds. ` +
        `Valid range: ${south}-${north}°N, ${west}-${east}°E`
      );
    }
  }

  /**
   * Fetch attractions from STB Map API
   */
  private async fetchFromSTBApi(params: AttractionSearchParams): Promise<TouristAttraction[]> {
    const { latitude, longitude, category, radius, limit } = params;
    
    const queryParams = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius?.toString() || '1000',
      limit: limit?.toString() || '20'
    });

    if (category) {
      queryParams.append('category', category);
    }

    const url = `${this.config.baseUrl}/attractions/search?${queryParams}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`STB API error: ${response.status} ${response.statusText}`);
    }

    const data: STBApiResponse = await response.json();
    return this.transformSTBResponse(data);
  }

  /**
   * Transform STB API response to standardized format
   */
  private transformSTBResponse(apiResponse: STBApiResponse): TouristAttraction[] {
    return apiResponse.features.map(feature => {
      const props = feature.properties;
      const [longitude, latitude] = feature.geometry.coordinates;

      const addressParts = [
        props.ADDRESSBLOCKHOUSENUMBER,
        props.ADDRESSBUILDINGNAME,
        props.ADDRESSSTREETNAME,
        props.ADDRESSPOSTALCODE
      ].filter(Boolean);

      return {
        name: props.NAME,
        description: props.DESCRIPTION || 'A popular attraction in Singapore',
        category: props.CATEGORY || 'General',
        address: addressParts.join(', ') || 'Singapore',
        latitude,
        longitude,
        imageUrl: props.PHOTOURL,
        rating: props.RATING,
        website: props.OFFICIALWEBSITE,
        openingHours: props.OPENINGHOURS,
        contactInfo: props.CONTACT
      };
    });
  }

  /**
   * Process attractions: calculate distances, sort, and filter
   */
  private processAttractions(
    attractions: TouristAttraction[], 
    userLat: number, 
    userLng: number
  ): TouristAttraction[] {
    return attractions
      .map(attraction => ({
        ...attraction,
        distance: this.calculateDistance(userLat, userLng, attraction.latitude, attraction.longitude)
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  /**
   * Fallback attraction data for when STB API is unavailable
   */
  private getFallbackAttractions(params: AttractionSearchParams): TouristAttraction[] {
    const { latitude, longitude, category, radius } = params;
    
    const fallbackAttractions: TouristAttraction[] = [
      {
        name: 'Marina Bay Sands',
        description: 'Iconic integrated resort with infinity pool, casino, shopping mall, and observation deck offering panoramic city views',
        category: 'Architecture',
        address: '10 Bayfront Ave, Singapore 018956',
        latitude: 1.2834,
        longitude: 103.8607,
        imageUrl: '/architecture.jpg',
        rating: 4.5,
        website: 'https://www.marinabaysands.com',
        openingHours: '24 hours',
        contactInfo: '+65 6688 8888'
      },
      {
        name: 'Gardens by the Bay',
        description: 'Futuristic botanical gardens featuring the iconic Supertree Grove and climate-controlled conservatories',
        category: 'Nature & Wildlife',
        address: '18 Marina Gardens Dr, Singapore 018953',
        latitude: 1.2816,
        longitude: 103.8636,
        imageUrl: '/nature&wildlife.jpg',
        rating: 4.6,
        website: 'https://www.gardensbythebay.com.sg',
        openingHours: '5:00 AM - 2:00 AM daily',
        contactInfo: '+65 6420 6848'
      },
      {
        name: 'Singapore Zoo',
        description: 'World-renowned open-concept zoo home to over 2,800 animals from around the world',
        category: 'Nature & Wildlife',
        address: '80 Mandai Lake Rd, Singapore 729826',
        latitude: 1.4043,
        longitude: 103.7930,
        imageUrl: '/nature&wildlife.jpg',
        rating: 4.4,
        website: 'https://www.wrs.com.sg/singapore-zoo',
        openingHours: '8:30 AM - 6:00 PM daily',
        contactInfo: '+65 6269 3411'
      },
      {
        name: 'Universal Studios Singapore',
        description: 'Southeast Asia\'s first and only Universal Studios theme park with thrilling rides and movie-themed attractions',
        category: 'Family',
        address: '8 Sentosa Gateway, Singapore 098269',
        latitude: 1.2540,
        longitude: 103.8239,
        imageUrl: '/universal.jpg',
        rating: 4.3,
        website: 'https://www.rwsentosa.com/en/attractions/universal-studios-singapore',
        openingHours: '10:00 AM - 7:00 PM (varies by season)',
        contactInfo: '+65 6577 8899'
      },
      {
        name: 'Singapore Art Museum',
        description: 'Premier contemporary art museum showcasing Southeast Asian and international contemporary art',
        category: 'Art & Museums',
        address: '71 Bras Basah Rd, Singapore 189555',
        latitude: 1.2966,
        longitude: 103.8520,
        imageUrl: '/art-musuem.jpg',
        rating: 4.2,
        website: 'https://www.singaporeartmuseum.sg',
        openingHours: '10:00 AM - 7:00 PM (Closed Mondays)',
        contactInfo: '+65 6332 3222'
      },
      {
        name: 'Chinatown Heritage Centre',
        description: 'Historic ethnic quarter featuring traditional shophouses, temples, and authentic Chinese cultural experiences',
        category: 'Cultural',
        address: '48 Pagoda St, Singapore 059207',
        latitude: 1.2831,
        longitude: 103.8448,
        imageUrl: '/cultural.jpg',
        rating: 4.1,
        website: 'https://www.chinatownheritagecentre.com.sg',
        openingHours: '9:00 AM - 8:00 PM daily',
        contactInfo: '+65 6325 2878'
      },
      {
        name: 'Clarke Quay',
        description: 'Vibrant riverside entertainment district with restaurants, bars, and exciting nightlife along the Singapore River',
        category: 'Nightlife',
        address: '3 River Valley Rd, Singapore 179024',
        latitude: 1.2884,
        longitude: 103.8465,
        imageUrl: '/nightlife.jpg',
        rating: 4.0,
        openingHours: '6:00 PM - 2:00 AM (varies by establishment)',
        contactInfo: '+65 6337 3292'
      },
      {
        name: 'Sentosa Beach',
        description: 'Popular beach resort island with sandy beaches, water sports, and recreational activities',
        category: 'Beach',
        address: 'Sentosa Island, Singapore',
        latitude: 1.2494,
        longitude: 103.8303,
        imageUrl: '/beach.jpg',
        rating: 4.2,
        website: 'https://www.sentosa.com.sg',
        openingHours: '24 hours (beach access)',
        contactInfo: '+65 1800 736 8672'
      },
      {
        name: 'Buddha Tooth Relic Temple',
        description: 'Magnificent Buddhist temple housing sacred relics and showcasing Buddhist art and culture',
        category: 'Religious',
        address: '288 South Bridge Rd, Singapore 058840',
        latitude: 1.2807,
        longitude: 103.8454,
        imageUrl: '/religion.jpg',
        rating: 4.3,
        website: 'https://www.btrts.org.sg',
        openingHours: '7:00 AM - 7:00 PM daily',
        contactInfo: '+65 6220 0220'
      },
      {
        name: 'National Museum of Singapore',
        description: 'Singapore\'s oldest museum featuring the country\'s history, culture, and heritage',
        category: 'Historical',
        address: '93 Stamford Rd, Singapore 178897',
        latitude: 1.2966,
        longitude: 103.8484,
        imageUrl: '/historical.jpg',
        rating: 4.1,
        website: 'https://www.nationalmuseum.sg',
        openingHours: '10:00 AM - 7:00 PM daily',
        contactInfo: '+65 6332 3659'
      }
    ];

    // Filter by category if specified
    let filteredAttractions = category 
      ? fallbackAttractions.filter(attraction => 
          attraction.category.toLowerCase().includes(category.toLowerCase())
        )
      : fallbackAttractions;

    // Calculate distances and filter by radius
    filteredAttractions = filteredAttractions
      .map(attraction => ({
        ...attraction,
        distance: this.calculateDistance(latitude, longitude, attraction.latitude, attraction.longitude)
      }))
      .filter(attraction => !radius || attraction.distance! <= radius)
      .sort((a, b) => a.distance! - b.distance!);

    return filteredAttractions;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get available categories for filtering
   */
  getAvailableCategories(): SingaporeCategory[] {
    return [...SINGAPORE_CATEGORIES];
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  }
}

// Create a singleton instance
export const stbMapService = new STBMapService();
