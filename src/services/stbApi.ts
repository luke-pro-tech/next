
const STB_API_BASE_URL = 'http://datamall2.mytransport.sg/ltaodataservice';
const STB_CONTENT_API_BASE_URL = 'https://api.stb.gov.sg/content';

// Valid STB API datasets: [accommodation, attractions, events, food_beverages, mice_events, precincts, shops, tours]
// No mapping needed - use dataset names directly

// Define STB API response interfaces
interface STBAttraction {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  rating?: number;
  reviews?: Array<any>;
  businessHour?: Array<any>;
  contact?: {
    primaryContactNo?: string;
    website?: string;
  };
  tags?: string[];
}

interface STBEvent {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  startDate?: string;
  endDate?: string;
  officialWebsite?: string;
  tags?: string[];
}

interface STBTour {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags?: string[];
}

interface STBFoodBeverage {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  cuisine?: string[];
  rating?: number;
  priceLevel?: string;
  tags?: string[];
}

interface STBShop {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  category?: string[];
  tags?: string[];
}

interface STBPrecinct {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags?: string[];
}

interface STBAccommodation {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  rating?: number;
  amenities?: string[];
  tags?: string[];
}

interface STBMiceEvent {
  uuid: string;
  name: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  startDate?: string;
  endDate?: string;
  eventType?: string;
  tags?: string[];
}

// Card interface for our app
export interface SwipeCard {
  id: string;
  image: string;
  country: string;
  title: string;
  rating: number;
  reviews: number;
  lat?: number;
  lng?: number;
  description?: string;
  website?: string;
  address?: string;
  type: 'accommodation' | 'attraction' | 'event' | 'tour' | 'food_beverage' | 'shop' | 'precinct' | 'mice_event';
  cuisine?: string[];
  priceLevel?: string;
  category?: string[];
  amenities?: string[];
  eventType?: string;
}

class STBApiService {
  private apiKey: string;

  constructor() {
    // In a real app, this should come from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_STB_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('STB API key not provided. Using fallback data for demo purposes.');
    }
  }

  private async fetchFromSTB(dataset: string, latitude?: number, longitude?: number): Promise<any> {
    // Use our local API route to avoid CORS issues
    const url = new URL('/api/stb', window.location.origin);
    
    // Add required parameters
    url.searchParams.append('dataset', dataset);
    if (latitude !== undefined && longitude !== undefined) {
      url.searchParams.append('latitude', latitude.toString());
      url.searchParams.append('longitude', longitude.toString());
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from STB API:', error);
      throw error;
    }
  }

  private transformAttractionToCard(attraction: STBAttraction): SwipeCard {
    const primaryImage = attraction.images?.[0]?.url || '/placeholder-image.svg';
    const rating = attraction.rating || Math.random() * 2 + 3; // Generate rating between 3-5 if not available
    const reviewCount = attraction.reviews?.length || Math.floor(Math.random() * 200) + 50;

    return {
      id: attraction.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: attraction.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: attraction.location?.latitude,
      lng: attraction.location?.longitude,
      description: attraction.description,
      website: attraction.contact?.website,
      address: attraction.location?.address,
      type: 'attraction'
    };
  }

  private transformEventToCard(event: STBEvent): SwipeCard {
    const primaryImage = event.images?.[0]?.url || '/placeholder-image.svg';
    const rating = Math.random() * 2 + 3; // Generate rating between 3-5
    const reviewCount = Math.floor(Math.random() * 200) + 50;

    return {
      id: event.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: event.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: event.location?.latitude,
      lng: event.location?.longitude,
      description: event.description,
      website: event.officialWebsite,
      address: event.location?.address,
      type: 'event'
    };
  }

  private transformTourToCard(tour: STBTour): SwipeCard {
    const primaryImage = tour.images?.[0]?.url || '/placeholder-image.svg';
    const rating = Math.random() * 2 + 3; // Generate rating between 3-5
    const reviewCount = Math.floor(Math.random() * 200) + 50;

    return {
      id: tour.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: tour.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: tour.location?.latitude,
      lng: tour.location?.longitude,
      description: tour.description,
      address: tour.location?.address,
      type: 'tour'
    };
  }

  private transformFoodBeverageToCard(foodBeverage: STBFoodBeverage): SwipeCard {
    const primaryImage = foodBeverage.images?.[0]?.url || '/placeholder-image.svg';
    const rating = foodBeverage.rating || Math.random() * 2 + 3; // Generate rating between 3-5
    const reviewCount = Math.floor(Math.random() * 200) + 50;

    return {
      id: foodBeverage.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: foodBeverage.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: foodBeverage.location?.latitude,
      lng: foodBeverage.location?.longitude,
      description: foodBeverage.description,
      address: foodBeverage.location?.address,
      type: 'food_beverage',
      cuisine: foodBeverage.cuisine,
      priceLevel: foodBeverage.priceLevel
    };
  }

  private transformShopToCard(shop: STBShop): SwipeCard {
    const primaryImage = shop.images?.[0]?.url || '/placeholder-image.svg';
    const rating = Math.random() * 2 + 3; // Generate rating between 3-5
    const reviewCount = Math.floor(Math.random() * 200) + 50;

    return {
      id: shop.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: shop.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: shop.location?.latitude,
      lng: shop.location?.longitude,
      description: shop.description,
      address: shop.location?.address,
      type: 'shop',
      category: shop.category
    };
  }

  private transformPrecinctToCard(precinct: STBPrecinct): SwipeCard {
    const primaryImage = precinct.images?.[0]?.url || '/placeholder-image.svg';
    const rating = Math.random() * 2 + 3; // Generate rating between 3-5
    const reviewCount = Math.floor(Math.random() * 200) + 50;

    return {
      id: precinct.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: precinct.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: precinct.location?.latitude,
      lng: precinct.location?.longitude,
      description: precinct.description,
      address: precinct.location?.address,
      type: 'precinct'
    };
  }

  private transformAccommodationToCard(accommodation: STBAccommodation): SwipeCard {
    const primaryImage = accommodation.images?.[0]?.url || '/placeholder-image.svg';
    const rating = accommodation.rating || Math.random() * 2 + 3; // Generate rating between 3-5
    const reviewCount = Math.floor(Math.random() * 200) + 50;

    return {
      id: accommodation.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: accommodation.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: accommodation.location?.latitude,
      lng: accommodation.location?.longitude,
      description: accommodation.description,
      address: accommodation.location?.address,
      type: 'accommodation',
      amenities: accommodation.amenities
    };
  }

  private transformMiceEventToCard(miceEvent: STBMiceEvent): SwipeCard {
    const primaryImage = miceEvent.images?.[0]?.url || '/placeholder-image.svg';
    const rating = Math.random() * 2 + 3; // Generate rating between 3-5
    const reviewCount = Math.floor(Math.random() * 200) + 50;

    return {
      id: miceEvent.uuid,
      image: primaryImage,
      country: 'Singapore',
      title: miceEvent.name,
      rating: Number(rating.toFixed(1)),
      reviews: reviewCount,
      lat: miceEvent.location?.latitude,
      lng: miceEvent.location?.longitude,
      description: miceEvent.description,
      address: miceEvent.location?.address,
      type: 'mice_event',
      eventType: miceEvent.eventType
    };
  }

  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Default to Singapore center if geolocation is not available
        resolve({ latitude: 1.2835627, longitude: 103.8584985 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error, using Singapore center:', error);
          // Default to Singapore center if geolocation fails
          resolve({ latitude: 1.2835627, longitude: 103.8584985 });
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  async fetchAttractions(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('attractions', location.latitude, location.longitude);
      const attractions: STBAttraction[] = response.data || [];

      return attractions.map(attraction => this.transformAttractionToCard(attraction));
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return [];
    }
  }

  async fetchEvents(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('events', location.latitude, location.longitude);
      const events: STBEvent[] = response.data || [];

      return events.map(event => this.transformEventToCard(event));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async fetchTours(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('tours', location.latitude, location.longitude);
      const tours: STBTour[] = response.data || [];

      return tours.map(tour => this.transformTourToCard(tour));
    } catch (error) {
      console.error('Error fetching tours:', error);
      return [];
    }
  }

  async fetchFoodBeverages(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('food_beverages', location.latitude, location.longitude);
      const foodBeverages: STBFoodBeverage[] = response.data || [];

      return foodBeverages.map(item => this.transformFoodBeverageToCard(item));
    } catch (error) {
      console.error('Error fetching food & beverages:', error);
      return [];
    }
  }

  async fetchShops(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('shops', location.latitude, location.longitude);
      const shops: STBShop[] = response.data || [];

      return shops.map(shop => this.transformShopToCard(shop));
    } catch (error) {
      console.error('Error fetching shops:', error);
      return [];
    }
  }

  async fetchPrecincts(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('precincts', location.latitude, location.longitude);
      const precincts: STBPrecinct[] = response.data || [];

      return precincts.map(precinct => this.transformPrecinctToCard(precinct));
    } catch (error) {
      console.error('Error fetching precincts:', error);
      return [];
    }
  }

  async fetchAccommodation(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('accommodation', location.latitude, location.longitude);
      const accommodations: STBAccommodation[] = response.data || [];

      return accommodations.map(accommodation => this.transformAccommodationToCard(accommodation));
    } catch (error) {
      console.error('Error fetching accommodation:', error);
      return [];
    }
  }

  async fetchMiceEvents(): Promise<SwipeCard[]> {
    try {
      const location = await this.getCurrentLocation();
      const response = await this.fetchFromSTB('mice_events', location.latitude, location.longitude);
      const miceEvents: STBMiceEvent[] = response.data || [];

      return miceEvents.map(miceEvent => this.transformMiceEventToCard(miceEvent));
    } catch (error) {
      console.error('Error fetching MICE events:', error);
      return [];
    }
  }

  async fetchDataByPreferences(selectedDatasets: string[]): Promise<SwipeCard[]> {
    const allCards: SwipeCard[] = [];

    for (const dataset of selectedDatasets) {
      try {
        let cards: SwipeCard[] = [];
        
        switch (dataset) {
          case 'accommodation':
            cards = await this.fetchAccommodation();
            break;
          case 'attractions':
            cards = await this.fetchAttractions();
            break;
          case 'events':
            cards = await this.fetchEvents();
            break;
          case 'food_beverages':
            cards = await this.fetchFoodBeverages();
            break;
          case 'mice_events':
            cards = await this.fetchMiceEvents();
            break;
          case 'precincts':
            cards = await this.fetchPrecincts();
            break;
          case 'shops':
            cards = await this.fetchShops();
            break;
          case 'tours':
            cards = await this.fetchTours();
            break;
          default:
            console.warn(`Unknown dataset: ${dataset}`);
        }

        allCards.push(...cards);
      } catch (error) {
        console.error(`Error fetching ${dataset}:`, error);
      }
    }

    // Remove duplicates based on ID and shuffle the results
    const uniqueCards = allCards.filter((card, index, self) => 
      index === self.findIndex(c => c.id === card.id)
    );

    // Shuffle the array
    for (let i = uniqueCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueCards[i], uniqueCards[j]] = [uniqueCards[j], uniqueCards[i]];
    }

    return uniqueCards;
  }

  // Fallback method with static Singapore data if API fails
  getFallbackCards(): SwipeCard[] {
    return [
      {
        id: 'singapore-marina-bay-sands',
        image: 'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Marina Bay Sands',
        rating: 4.5,
        reviews: 1867,
        lat: 1.2834,
        lng: 103.8607,
        description: 'Luxury resort with infinity pool',
        type: 'accommodation',
        amenities: ['Pool', 'Spa', 'Casino', 'Shopping']
      },
      {
        id: 'singapore-merlion',
        image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Merlion Park',
        rating: 4.2,
        reviews: 1234,
        lat: 1.2868,
        lng: 103.8545,
        description: 'Iconic symbol of Singapore',
        type: 'attraction'
      },
      {
        id: 'singapore-gardens',
        image: 'https://images.unsplash.com/photo-1571077674-d1647c2c5fdf?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Gardens by the Bay',
        rating: 4.7,
        reviews: 2156,
        lat: 1.2816,
        lng: 103.8636,
        description: 'Futuristic gardens with Supertrees',
        type: 'attraction'
      },
      {
        id: 'singapore-f1',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Singapore Grand Prix',
        rating: 4.8,
        reviews: 1432,
        lat: 1.2914,
        lng: 103.8640,
        description: 'Formula 1 night race',
        type: 'event'
      },
      {
        id: 'singapore-hawker',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Maxwell Food Centre',
        rating: 4.6,
        reviews: 892,
        lat: 1.2808,
        lng: 103.8440,
        description: 'Famous hawker center with local delicacies',
        type: 'food_beverage',
        cuisine: ['Local', 'Asian']
      },
      {
        id: 'singapore-convention',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Singapore EXPO',
        rating: 4.3,
        reviews: 678,
        lat: 1.3335,
        lng: 103.9613,
        description: 'Convention and exhibition center',
        type: 'mice_event',
        eventType: 'Convention'
      },
      {
        id: 'singapore-chinatown',
        image: 'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Chinatown',
        rating: 4.3,
        reviews: 987,
        lat: 1.2812,
        lng: 103.8445,
        description: 'Historic cultural district',
        type: 'precinct'
      },
      {
        id: 'singapore-orchard',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Orchard Road',
        rating: 4.1,
        reviews: 1456,
        lat: 1.3048,
        lng: 103.8318,
        description: 'Premier shopping destination',
        type: 'shop',
        category: ['Shopping', 'Retail']
      },
      {
        id: 'singapore-river-cruise',
        image: 'https://images.unsplash.com/photo-1585282263861-f55e341878f8?w=800&h=600&fit=crop',
        country: 'Singapore',
        title: 'Singapore River Cruise',
        rating: 4.4,
        reviews: 1123,
        lat: 1.2868,
        lng: 103.8545,
        description: 'Scenic boat tour along Singapore River',
        type: 'tour'
      }
    ];
  }
}

export const stbApiService = new STBApiService();
