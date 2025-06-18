export type Credentials = {
  agora_uid: number;
  agora_app_id: string;
  agora_channel: string;
  agora_token: string;
};

export type Session = {
  _id: string;
  // @deprecated, use credentials instead
  stream_urls?: Credentials;
  credentials: Credentials;
};

export type ApiResponse<T> = {
  code: number;
  msg: string;
  data: T;
};

export type Voice = {
  accent: string;
  description: string;
  language: string;
  preview: string;
  voice_id: string;
  name: string;
}

export type Language = {
  lang_code: string;
  lang_name: string;
  url: string;
};

export type Avatar = {
  name: string;
  from: number;
  gender: string;
  url: string;
  avatar_id: string;
  voice_id: string;
  thumbnailUrl: string;
  available: boolean;
};

export type TouristAttraction = {
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
};

export type STBMapApiResponse = {
  total: number;
  features: STBMapFeature[];
};

export type STBMapFeature = {
  properties: {
    NAME: string;
    DESCRIPTION?: string;
    PHOTOURL?: string;
    ADDRESSBLOCKHOUSENUMBER?: string;
    ADDRESSBUILDINGNAME?: string;
    ADDRESSSTREETNAME?: string;
    ADDRESSPOSTALCODE?: string;
    ADDRESSFLOORNUMBER?: string;
    ADDRESSUNITNUMBER?: string;
    OFFICIALWEBSITE?: string;
    OPENINGHOURS?: string;
    CONTACT?: string;
    RATING?: number;
    CATEGORY?: string;
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
};

export type STBSearchParams = {
  latitude: number;
  longitude: number;
  category?: string;
  radius?: number; // in meters, default 1000
  limit?: number; // number of results to return, default 20
};

export class ApiService {
  private openapiHost: string;
  private openapiToken: string;

  constructor(openapiHost: string, openapiToken: string) {
    this.openapiHost = openapiHost;
    this.openapiToken = openapiToken;
  }

  private async fetchApi(endpoint: string, method: string, body?: object) {
    const response = await fetch(`${this.openapiHost}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.openapiToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const responseBody = await response.json();
    if (responseBody.code != 1000) {
      alert(responseBody.msg);
      throw new Error(responseBody.msg);
    }
    return responseBody.data;
  }

  public async createSession(data: {
    avatar_id: string;
    duration: number;
  }): Promise<Session> {
    return this.fetchApi("/api/open/v4/liveAvatar/session/create", "POST", data);
  }

  public async closeSession(id: string) {
    return this.fetchApi("/api/open/v4/liveAvatar/session/close", "POST", {
      id,
    });
  }

  public async getLangList(): Promise<Language[]> {
    const data = await this.fetchApi("/api/open/v3/language/list", "GET");
    return data?.lang_list;
  }

  public async getVoiceList(): Promise<Voice[]> {
    return this.fetchApi("/api/open/v3/voice/list", "GET");
  }

  public async getAvatarList(): Promise<Avatar[]> {
    const data = await this.fetchApi("/api/open/v4/liveAvatar/avatar/list?page=1&size=100", "GET");
    return data?.result;
  }

  /**
   * Search for tourist attractions in Singapore using STB Map API
   * @param params Search parameters including location, category, and radius
   * @returns Array of tourist attractions
   */
  public async searchTouristAttractions(params: STBSearchParams): Promise<TouristAttraction[]> {
    const { latitude, longitude, category, radius = 1000, limit = 20 } = params;

    try {
      // Validate coordinates for Singapore
      if (!this.isValidSingaporeCoordinates(latitude, longitude)) {
        throw new Error('Coordinates must be within Singapore bounds');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: radius.toString(),
        limit: limit.toString(),
      });

      if (category) {
        queryParams.append('category', category);
      }

      // STB Map API endpoint (using a mock endpoint for demo - replace with actual STB API)
      const apiUrl = `https://api.stb.gov.sg/attractions/search?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add STB API key if required
          // 'Authorization': `Bearer ${process.env.STB_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`STB API request failed: ${response.status} ${response.statusText}`);
      }

      const data: STBMapApiResponse = await response.json();
      
      // Transform STB API response to our TouristAttraction format
      return this.transformSTBResponse(data);

    } catch (error) {
      console.error('Error fetching tourist attractions:', error);
      
      // Return fallback data for Singapore attractions if API fails
      return this.getFallbackSingaporeAttractions(latitude, longitude, category, radius);
    }
  }

  /**
   * Validate if coordinates are within Singapore bounds
   * Singapore bounds: approximately 1.2° to 1.5°N, 103.6° to 104.0°E
   */
  private isValidSingaporeCoordinates(lat: number, lng: number): boolean {
    return lat >= 1.2 && lat <= 1.5 && lng >= 103.6 && lng <= 104.0;
  }

  /**
   * Transform STB API response to TouristAttraction format
   */
  private transformSTBResponse(data: STBMapApiResponse): TouristAttraction[] {
    return data.features.map((feature) => {
      const props = feature.properties;
      const [longitude, latitude] = feature.geometry.coordinates;

      // Build full address
      const addressParts = [
        props.ADDRESSBLOCKHOUSENUMBER,
        props.ADDRESSBUILDINGNAME,
        props.ADDRESSSTREETNAME,
        props.ADDRESSPOSTALCODE,
      ].filter(Boolean);

      return {
        name: props.NAME,
        description: props.DESCRIPTION || 'A popular tourist attraction in Singapore',
        category: props.CATEGORY || 'General',
        address: addressParts.join(', ') || 'Singapore',
        latitude,
        longitude,
        imageUrl: props.PHOTOURL,
        rating: props.RATING,
        website: props.OFFICIALWEBSITE,
        openingHours: props.OPENINGHOURS,
        contactInfo: props.CONTACT,
      };
    });
  }

  /**
   * Fallback attractions data for Singapore when API is unavailable
   */
  private getFallbackSingaporeAttractions(
    userLat: number,
    userLng: number,
    category?: string,
    radius?: number
  ): TouristAttraction[] {
    const singaporeAttractions: TouristAttraction[] = [
      {
        name: 'Marina Bay Sands',
        description: 'Iconic integrated resort with infinity pool, casino, shopping mall, and observation deck',
        category: 'Architecture',
        address: '10 Bayfront Ave, Singapore 018956',
        latitude: 1.2834,
        longitude: 103.8607,
        imageUrl: '/architecture.jpg',
        rating: 4.5,
        website: 'https://www.marinabaysands.com',
        openingHours: '24 hours',
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
      },
      {
        name: 'Universal Studios Singapore',
        description: 'Southeast Asia\'s first and only Universal Studios theme park with thrilling rides and attractions',
        category: 'Family',
        address: '8 Sentosa Gateway, Singapore 098269',
        latitude: 1.2540,
        longitude: 103.8239,
        imageUrl: '/universal.jpg',
        rating: 4.3,
        website: 'https://www.rwsentosa.com/en/attractions/universal-studios-singapore',
        openingHours: '10:00 AM - 7:00 PM (varies by season)',
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
      },
      {
        name: 'Chinatown',
        description: 'Historic ethnic quarter featuring traditional shophouses, temples, and authentic Chinese cuisine',
        category: 'Cultural',
        address: 'Chinatown, Singapore',
        latitude: 1.2831,
        longitude: 103.8448,
        imageUrl: '/cultural.jpg',
        rating: 4.1,
        openingHours: 'Varies by establishment',
      },
      {
        name: 'Clarke Quay',
        description: 'Vibrant riverside entertainment district with restaurants, bars, and nightlife',
        category: 'Nightlife',
        address: '3 River Valley Rd, Singapore 179024',
        latitude: 1.2884,
        longitude: 103.8465,
        imageUrl: '/nightlife.jpg',
        rating: 4.0,
        openingHours: '6:00 PM - 2:00 AM (varies by establishment)',
      },
      {
        name: 'Sentosa Beach',
        description: 'Popular beach resort island with sandy beaches, attractions, and recreational activities',
        category: 'Beach',
        address: 'Sentosa Island, Singapore',
        latitude: 1.2494,
        longitude: 103.8303,
        imageUrl: '/beach.jpg',
        rating: 4.2,
        openingHours: '24 hours (beach access)',
      },
    ];

    // Filter by category if specified
    let filteredAttractions = category 
      ? singaporeAttractions.filter(attraction => 
          attraction.category.toLowerCase().includes(category.toLowerCase())
        )
      : singaporeAttractions;

    // Filter by radius if specified
    if (radius) {
      filteredAttractions = filteredAttractions.filter(attraction => {
        const distance = this.calculateDistance(
          userLat, userLng, 
          attraction.latitude, attraction.longitude
        );
        return distance <= radius;
      });
    }

    // Sort by distance from user location
    filteredAttractions.sort((a, b) => {
      const distanceA = this.calculateDistance(userLat, userLng, a.latitude, a.longitude);
      const distanceB = this.calculateDistance(userLat, userLng, b.latitude, b.longitude);
      return distanceA - distanceB;
    });

    return filteredAttractions;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lng1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lng2 Longitude of second point
   * @returns Distance in meters
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}
