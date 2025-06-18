'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { FaMapMarkerAlt, FaCar, FaWalking, FaTrain, FaPlane, FaBus } from 'react-icons/fa';
import DestinationDetails from '@/components/DestinationDetails';

interface LikedCard {
  image: string;
  country: string;
  title: string;
  rating: number;
  reviews: number;
  lat?: number;
  lng?: number;
  address?: string;
  description?: string;
  attractions?: string[];
  activities?: string[];
  images?: string[];
}

interface TravelSegment {
  duration: string; // e.g., "5m", "2h", "45m"
  mode: 'car' | 'walking' | 'train' | 'plane' | 'bus';
  durationMinutes: number; // duration in minutes for calculations
}

// Function to add minutes to a time and format it
const addMinutesToTime = (timeString: string, minutes: number): string => {
  const [hours, mins] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Function to generate realistic travel times and modes between destinations
const generateTravelSegment = (from: LikedCard, to: LikedCard): TravelSegment => {
  if (!from.lat || !from.lng || !to.lat || !to.lng) {
    return { duration: "30m", mode: "car", durationMinutes: 30 };
  }

  // Calculate rough distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km

  // Determine mode and duration based on distance
  if (distance < 2) {
    const minutes = Math.round(distance * 15);
    return { duration: `${minutes}m`, mode: 'walking', durationMinutes: minutes };
  } else if (distance < 50) {
    const minutes = Math.round(distance * 2);
    return { duration: `${minutes}m`, mode: 'car', durationMinutes: minutes };
  } else if (distance < 300) {
    const minutes = Math.round(distance);
    const hours = Math.round(distance / 60);
    return { 
      duration: hours > 1 ? `${hours}h` : `${minutes}m`, 
      mode: 'bus', 
      durationMinutes: minutes 
    };
  } else if (distance < 1000) {
    const minutes = Math.round(distance / 200 * 60);
    const hours = Math.round(distance / 200);
    return { 
      duration: `${hours}h`, 
      mode: 'train', 
      durationMinutes: minutes 
    };
  } else {
    const minutes = Math.round(distance / 500 * 60);
    const hours = Math.round(distance / 500);
    return { 
      duration: `${hours}h`, 
      mode: 'plane', 
      durationMinutes: minutes 
    };
  }
};

// Sample locations with coordinates for the map
const sampleLocations: LikedCard[] = [
  {
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=600&fit=crop&auto=format',
    country: 'Brazil',
    title: 'Rio de Janeiro',
    rating: 5.0,
    reviews: 143,
    lat: -22.9068,
    lng: -43.1729,
    address: 'Rio de Janeiro, State of Rio de Janeiro, Brazil',
    description: 'Rio de Janeiro is a huge seaside city in Brazil, famed for its Copacabana and Ipanema beaches, 38m Christ the Redeemer statue atop Mount Corcovado and for Sugarloaf Mountain, a granite peak with cable cars to its summit.',
    attractions: ['Christ the Redeemer', 'Copacabana Beach', 'Sugarloaf Mountain', 'Carnival', 'Samba'],
    activities: [
      'Visit the iconic Christ the Redeemer statue at Corcovado',
      'Relax on the famous Copacabana and Ipanema beaches',
      'Take a cable car ride to Sugarloaf Mountain for panoramic views',
      'Experience the vibrant nightlife in Lapa district',
      'Explore the colorful Santa Teresa neighborhood'
    ],
    images: [
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&auto=format',
    country: 'Italy',
    title: 'Dolomites',
    rating: 4.8,
    reviews: 210,
    lat: 46.4102,
    lng: 11.8440,
    address: 'Dolomites, Province of South Tyrol, Italy',
    description: 'The Dolomites are a mountain range located in northeastern Italy. They form part of the Southern Limestone Alps and extend from the River Adige in the west to the Piave Valley in the east.',
    attractions: ['Mountain Peaks', 'Alpine Lakes', 'Hiking Trails', 'Ski Resorts', 'Photography'],
    activities: [
      'Hike through spectacular mountain trails and alpine meadows',
      'Take cable car rides to mountain peaks for breathtaking views',
      'Experience world-class skiing and snowboarding in winter',
      'Photography tours of the dramatic limestone formations',
      'Visit traditional mountain huts and taste local South Tyrolean cuisine'
    ],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551524164-6cf2ac8ee55a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=600&fit=crop&auto=format',
    country: 'Greece',
    title: 'Santorini',
    rating: 4.9,
    reviews: 189,
    lat: 36.3932,
    lng: 25.4615,
    address: 'Santorini, South Aegean, Greece',
    description: 'Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape.',
    attractions: ['Sunset Views', 'White Buildings', 'Blue Domes', 'Wine Tasting', 'Volcanic Beaches'],
    activities: [
      'Watch the world-famous sunset from Oia village',
      'Explore the traditional white-washed buildings and blue domes',
      'Visit local wineries and taste unique volcanic wines',
      'Relax on the distinctive black sand beaches',
      'Take a boat tour around the volcanic caldera'
    ],
    images: [
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=600&fit=crop&auto=format',
    country: 'Japan',
    title: 'Mount Fuji',
    rating: 4.7,
    reviews: 234,
    lat: 35.3606,
    lng: 138.7274,
    address: 'Mount Fuji, Honshu, Japan',
    description: 'Mount Fuji is the highest mountain in Japan at 3,776.24 m. An active stratovolcano that last erupted in 1707–1708, Mount Fuji lies about 100 kilometres southwest of Tokyo.',
    attractions: ['Sacred Mountain', 'Cherry Blossoms', 'Five Lakes', 'Shrines', 'Hiking'],
    activities: [
      'Climb to the summit during the official climbing season',
      'Visit the Five Fuji Lakes region for stunning mountain views',
      'Experience cherry blossom season in nearby parks',
      'Explore traditional shrines and temples at the mountain base',
      'Take photos from various viewpoints around the region'
    ],
    images: [
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=600&fit=crop&auto=format',
    country: 'Peru',
    title: 'Machu Picchu',
    rating: 4.9,
    reviews: 167,
    lat: -13.1631,
    lng: -72.5450,
    address: 'Machu Picchu, Cusco Region, Peru',
    description: 'Machu Picchu is an Incan citadel set high in the Andes Mountains in Peru, above the Sacred Valley. Built in the 15th century and later abandoned, it\'s renowned for its sophisticated dry-stone walls.',
    attractions: ['Ancient Ruins', 'Inca Trail', 'Mountain Views', 'History', 'Architecture'],
    activities: [
      'Explore the ancient Incan ruins and learn about their history',
      'Hike the famous Inca Trail to reach the citadel',
      'Watch the sunrise over the ancient city from Huayna Picchu',
      'Visit the Sacred Valley and local indigenous communities',
      'Learn about Incan engineering and astronomical knowledge'
    ],
    images: [
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=400&h=600&fit=crop&auto=format',
    country: 'Iceland',
    title: 'Northern Lights',
    rating: 4.6,
    reviews: 198,
    lat: 64.9631,
    lng: -19.0208,
    address: 'Reykjavik, Capital Region, Iceland',
    description: 'Iceland offers some of the best opportunities to see the Northern Lights (Aurora Borealis) due to its location near the Arctic Circle and minimal light pollution in many areas.',
    attractions: ['Aurora Borealis', 'Geysers', 'Waterfalls', 'Blue Lagoon', 'Glaciers'],
    activities: [
      'Go on guided Northern Lights tours for the best viewing spots',
      'Visit the famous Blue Lagoon geothermal spa',
      'Explore the Golden Circle route with geysers and waterfalls',
      'Take glacier hiking tours and ice cave explorations',
      'Experience the unique Icelandic culture in Reykjavik'
    ],
    images: [
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551524164-0d71dc2f8645?w=600&h=400&fit=crop'
    ]
  }
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [likedLocations, setLikedLocations] = useState<LikedCard[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<LikedCard | null>(null);
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState<number>(0);
  const [isDestinationDetailsOpen, setIsDestinationDetailsOpen] = useState(false);

  // Draggable panel state
  const [panelHeight, setPanelHeight] = useState(120); // Initial collapsed height
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;
  const minHeight = 120;

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(panelHeight);
  };

  // Handle drag move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    
    const deltaY = startY - clientY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight);
    setPanelHeight(newHeight);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Improved snapping logic - only snap if the user hasn't dragged much
    const dragDistance = Math.abs(panelHeight - startHeight);
    
    // If user barely dragged (less than 30px), don't snap aggressively
    if (dragDistance < 30) {
      return; // Keep current position
    }
    
    // Snap to positions based on current height
    const quarterHeight = maxHeight * 0.25;
    const halfHeight = maxHeight * 0.5;
    const threeQuarterHeight = maxHeight * 0.75;
    
    if (panelHeight < quarterHeight) {
      setPanelHeight(minHeight);
    } else if (panelHeight < halfHeight) {
      setPanelHeight(maxHeight * 0.4);
    } else if (panelHeight < threeQuarterHeight) {
      setPanelHeight(maxHeight * 0.6);
    } else {
      setPanelHeight(maxHeight);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      handleDragMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Handle destination click
  const handleDestinationClick = (destination: LikedCard, index: number) => {
    setSelectedDestination(destination);
    setSelectedDestinationIndex(index);
    setIsDestinationDetailsOpen(true);
  };

  const handleCloseDestinationDetails = () => {
    setIsDestinationDetailsOpen(false);
    setSelectedDestination(null);
    setSelectedDestinationIndex(0);
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, startY, startHeight]);

  useEffect(() => {
    // Load liked cards from localStorage or use sample data
    const storedLiked = localStorage.getItem('likedCards');
    if (storedLiked) {
      try {
        const parsed = JSON.parse(storedLiked);
        setLikedLocations(parsed.length > 0 ? parsed : sampleLocations);
      } catch {
        setLikedLocations(sampleLocations);
      }
    } else {
      setLikedLocations(sampleLocations);
    }

    // Set current time
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }));

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Continue without user location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        setMapError('Google Maps API key is not configured. Please add your API key to .env.local');
        return;
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
      });

      try {
        const { Map } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement } = await loader.importLibrary('marker');

        // Calculate center point and zoom level
        let mapCenter;
        let mapZoom;

        if (userLocation) {
          // If we have user location, center on it and zoom in
          mapCenter = userLocation;
          mapZoom = 12; // Good zoom level for city view
        } else if (likedLocations.length > 0) {
          // Otherwise, center on liked locations
          const bounds = new google.maps.LatLngBounds();
          likedLocations.forEach(location => {
            if (location.lat && location.lng) {
              bounds.extend(new google.maps.LatLng(location.lat, location.lng));
            }
          });
          mapCenter = bounds.getCenter();
          mapZoom = 2; // Default world view
        } else {
          // Default to world center
          mapCenter = { lat: 0, lng: 0 };
          mapZoom = 2;
        }

        const mapInstance = new Map(mapRef.current!, {
          zoom: mapZoom,
          center: mapCenter,
          mapId: 'travel-map',
          disableDefaultUI: true, // Removes all default controls
          gestureHandling: 'greedy', // Allows direct map interaction
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add user location marker if available
        if (userLocation) {
          const userMarkerElement = document.createElement('div');
          userMarkerElement.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse';
          
          const userMarker = new AdvancedMarkerElement({
            position: userLocation,
            map: mapInstance,
            title: 'Your Location',
            content: userMarkerElement,
          });
        }

        // Add markers for each liked location
        likedLocations.forEach((location, index) => {
          if (location.lat && location.lng) {
            // Create custom marker element
            const markerElement = document.createElement('div');
            markerElement.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors';
            markerElement.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>';

            const marker = new AdvancedMarkerElement({
              position: { lat: location.lat, lng: location.lng },
              map: mapInstance,
              title: location.title,
              content: markerElement,
            });

            // Add click listener to show location details
            marker.addListener('click', () => {
              // Optional: Could add minimal popup or highlight functionality here
              console.log('Clicked on:', location.title);
            });
          }
        });

        // If we don't have user location but have liked locations, fit bounds to show all
        if (!userLocation && likedLocations.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          likedLocations.forEach(location => {
            if (location.lat && location.lng) {
              bounds.extend(new google.maps.LatLng(location.lat, location.lng));
            }
          });
          mapInstance.fitBounds(bounds);
        }
        setMap(mapInstance);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps. Please check your API key and network connection.');
      }
    };

    initMap();
  }, [likedLocations, userLocation]);

  return (
    <div className="mobile-fullscreen map-container relative">
      {/* Map */}
      {mapError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-600">{mapError}</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}

      {/* Draggable itinerary panel */}
      <div
        ref={panelRef}
        className="absolute bottom-0 left-0 right-0 bg-white shadow-xl rounded-t-3xl border-t border-gray-200 overflow-hidden"
        style={{ 
          height: `${panelHeight}px`,
          transition: isDragging ? 'none' : 'height 0.3s ease-out'
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center items-center py-3 cursor-grab active:cursor-grabbing bg-gray-50 border-b border-gray-100 select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ 
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full pointer-events-none"></div>
        </div>

        {/* Panel content */}
        <div className="p-4 overflow-y-auto" style={{ height: `${panelHeight - 56}px` }}>
          <h2 className="text-xl font-bold text-gray-800 mb-4 sticky top-0 bg-white z-10">
            Your Itinerary
          </h2>
          
          <div className="space-y-6 relative ml-6">
            {likedLocations.map((location, index) => {
              // Calculate arrival time for this destination
              let arrivalTime = currentTime;
              if (index > 0) {
                // Sum up all travel times to get to this destination
                let totalMinutes = 0;
                for (let i = 0; i < index; i++) {
                  const segment = generateTravelSegment(likedLocations[i], likedLocations[i + 1]);
                  totalMinutes += segment.durationMinutes;
                }
                arrivalTime = addMinutesToTime(currentTime, totalMinutes);
              }

              return (
                <div key={index}>
                  {/* Location item */}
                  <div className="relative pl-8">
                    {/* Vertical dashed line */}
                    {index < likedLocations.length - 1 && (
                      <span className="absolute left-2 top-8 h-full border-l-2 border-dashed border-orange-400" />
                    )}

                    {/* Circle index */}
                    <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold z-10">
                      {index + 1}
                    </div>

                    <div className="flex gap-4 items-start">
                      <img
                        src={location.image}
                        alt={location.title}
                        className="w-16 h-16 rounded-xl object-cover cursor-pointer"
                        onClick={() => handleDestinationClick(location, index)}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 
                              className="font-semibold text-gray-800 text-base cursor-pointer hover:text-orange-600 transition-colors"
                              onClick={() => handleDestinationClick(location, index)}
                            >
                              {location.title}
                            </h3>
                            <p className="text-sm text-gray-500">{location.country}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                              {index === 0 ? 'Start' : 'Arrive'}: {arrivalTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full">★ {location.rating}</span>
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{location.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Travel segment between locations */}
                  {index < likedLocations.length - 1 && (() => {
                    const segment = generateTravelSegment(location, likedLocations[index + 1]);
                    const getTransportIcon = (mode: TravelSegment['mode']) => {
                      switch (mode) {
                        case 'car': return <FaCar className="w-3 h-3" />;
                        case 'walking': return <FaWalking className="w-3 h-3" />;
                        case 'train': return <FaTrain className="w-3 h-3" />;
                        case 'plane': return <FaPlane className="w-3 h-3" />;
                        case 'bus': return <FaBus className="w-3 h-3" />;
                        default: return <FaCar className="w-3 h-3" />;
                      }
                    };

                    return (
                      <div className="relative pl-8 py-3">
                        {/* Travel info positioned along the vertical line */}
                        <div className="absolute left-0 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                          <span className="text-blue-500">
                            {getTransportIcon(segment.mode)}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            {segment.duration}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Destination Details Modal */}
      {selectedDestination && (
        <DestinationDetails
          destination={selectedDestination}
          isOpen={isDestinationDetailsOpen}
          onClose={handleCloseDestinationDetails}
          orderNumber={selectedDestinationIndex + 1}
        />
      )}
    </div>
  );
}
