'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { FaMapMarkerAlt, FaCar, FaWalking, FaTrain, FaPlane, FaBus } from 'react-icons/fa';
import DestinationDetails from '@/components/DestinationDetails';

// Add type declarations for Google Maps classes
declare global {
  interface Window {
    google: typeof google;
  }
}

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
    image: 'https://destinationlesstravel.com/wp-content/uploads/2022/10/The-Christ-the-Redeemer-with-Rio-de-Janeiro-in-the-background-as-seen-from-a-scenic-flight.jpg.webp',
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
      'https://destinationlesstravel.com/wp-content/uploads/2022/10/The-Christ-the-Redeemer-with-Rio-de-Janeiro-in-the-background-as-seen-from-a-scenic-flight.jpg.webp',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://hikingphotographer.uk/wp-content/uploads/2024/08/cadini-de-misurina-dolomites-italy-iStock-1496115573-scaled.jpg',
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
      'https://hikingphotographer.uk/wp-content/uploads/2024/08/cadini-de-misurina-dolomites-italy-iStock-1496115573-scaled.jpg',
      'https://images.unsplash.com/photo-1551524164-6cf2ac8ee55a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://media.cntraveller.com/photos/611be9bb69410e829d87e0c2/16:9/w_2240,c_limit/Blue-domed-church-along-caldera-edge-in-Oia-Santorini-greece-conde-nast-traveller-11aug17-iStock.jpg',
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
      'https://media.cntraveller.com/photos/611be9bb69410e829d87e0c2/16:9/w_2240,c_limit/Blue-domed-church-along-caldera-edge-in-Oia-Santorini-greece-conde-nast-traveller-11aug17-iStock.jpg',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://a.travel-assets.com/findyours-php/viewfinder/images/res70/490000/490338-lake-kawaguchi.jpg',
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
      'https://a.travel-assets.com/findyours-php/viewfinder/images/res70/490000/490338-lake-kawaguchi.jpg',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://images.goway.com/production/styles/hero_s1_3xl/s3/hero/iStock-1339071089.jpg?h=89a15586&itok=zl7tkVHj',
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
      'https://images.goway.com/production/styles/hero_s1_3xl/s3/hero/iStock-1339071089.jpg?h=89a15586&itok=zl7tkVHj',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=400&fit=crop'
    ]
  },
  {
    image: 'https://res.cloudinary.com/icelandtours/g_auto,f_auto,c_fill,w_2048,q_auto:good/northern_lights_above_glacier_lagoon_v2osk_unsplash_7d39ca647f.jpg',
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
      'https://res.cloudinary.com/icelandtours/g_auto,f_auto,c_fill,w_2048,q_auto:good/northern_lights_above_glacier_lagoon_v2osk_unsplash_7d39ca647f.jpg',
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
  
  // Map popup state
  const [mapPopup, setMapPopup] = useState<{
    location: LikedCard;
    position: { x: number; y: number };
    visible: boolean;
  } | null>(null);

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
    setIsDestinationDetailsOpen(false);
    
    // Zoom to location on map
    if (map && destination.lat && destination.lng) {
      const targetLocation = { lat: destination.lat, lng: destination.lng };
      
      // Close any existing popup immediately
      setMapPopup(null);
      
      // Smooth pan to the location (Google Maps handles animation automatically)
      map.panTo(targetLocation);
      
      // Smooth zoom animation with delay for better visual effect
      setTimeout(() => {
        map.setZoom(2);
      }, 800); // Delay zoom to create staged animation
      
      // Show popup for this location after a brief delay
      setTimeout(() => {
        setMapPopup({
          location: destination,
          position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          visible: true
        });
        
        // Collapse the itinerary panel after showing the popup
        setTimeout(() => {
          setPanelHeight(minHeight);
        }, 200); // Small delay to let popup appear first
      }, 500); // Wait for pan animation to complete
    }
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
        libraries: ['routes'] // Add routes library for DirectionsService
      });

      try {
        const { Map } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement } = await loader.importLibrary('marker');
        const { DirectionsService } = await loader.importLibrary('routes');

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

        // Add click listener to map to close popup
        mapInstance.addListener('click', () => {
          setMapPopup(null);
        });

        // Add drag/pan listener to map to close popup when user pans
        mapInstance.addListener('dragstart', () => {
          setMapPopup(null);
        });

        // Add user location marker if available
        if (userLocation) {
          const userMarkerElement = document.createElement('div');
          userMarkerElement.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse';
          
          const userMarker = new google.maps.marker.AdvancedMarkerElement({
            position: userLocation,
            map: mapInstance,
            title: 'Your Location',
            content: userMarkerElement,
          });
        }

        // Add markers for each liked location
        likedLocations.forEach((location, index) => {
          if (location.lat && location.lng) {
            // Find all visits to this location (including current one)
            const allVisits = likedLocations
              .map((loc, idx) => ({ loc, idx }))
              .filter(({ loc }) => 
                loc.title === location.title && 
                loc.country === location.country
              )
              .map(({ idx }) => idx + 1); // Convert to 1-based visit numbers

            // Only create marker for the first occurrence of each location
            const isFirstOccurrence = likedLocations.findIndex(loc => 
              loc.title === location.title && loc.country === location.country
            ) === index;

            if (isFirstOccurrence) {
              // Create a single container with both heart and labels together
              const markerContainer = document.createElement('div');
              markerContainer.className = 'relative cursor-pointer';
              markerContainer.style.width = '32px';
              markerContainer.style.height = '32px';
              
              // Create the heart icon as the base
              const heartElement = document.createElement('div');
              heartElement.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors';
              heartElement.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>';
              
              // Create labels container positioned on top of heart
              const labelsContainer = document.createElement('div');
              labelsContainer.className = 'absolute flex items-center gap-1';
              labelsContainer.style.top = '-8px'; // Position above the heart
              labelsContainer.style.left = '50%';
              labelsContainer.style.transform = 'translateX(-50%)'; // Center horizontally
              labelsContainer.style.zIndex = '1000';
              
              // Add a label for each visit to this location
              allVisits.forEach((visitNumber, visitIndex) => {
                const labelElement = document.createElement('div');
                labelElement.className = 'w-5 h-5 bg-blue-600 text-white rounded-full border border-white shadow-md flex items-center justify-center text-xs font-bold';
                labelElement.textContent = visitNumber.toString();
                labelElement.style.fontSize = '10px';
                labelElement.style.fontWeight = 'bold';
                labelElement.style.minWidth = '20px';
                labelElement.style.minHeight = '20px';
                labelsContainer.appendChild(labelElement);
              });
              
              // Add both elements to the container (heart first, then labels on top)
              markerContainer.appendChild(heartElement);
              markerContainer.appendChild(labelsContainer);

              // Create the marker with the composite element
              const marker = new google.maps.marker.AdvancedMarkerElement({
                position: { lat: location.lat, lng: location.lng },
                map: mapInstance,
                title: `${location.title} (Visits: ${allVisits.join(', ')})`,
                content: markerContainer,
              });

              // Add click listener to show location details
              marker.addListener('click', () => {
                // Get marker position in screen coordinates
                const projection = mapInstance.getProjection();
                if (projection) {
                  const latLng = new google.maps.LatLng(location.lat!, location.lng!);
                  const position = projection.fromLatLngToPoint(latLng);
                  
                  if (position) {
                    const scale = Math.pow(2, mapInstance.getZoom()!);
                    
                    // Show popup at center of screen for simplicity
                    const mapDiv = mapRef.current!;
                    const mapBounds = mapDiv.getBoundingClientRect();
                    
                    setMapPopup({
                      location,
                      position: { x: mapBounds.width / 2, y: mapBounds.height / 2 },
                      visible: true
                    });
                  }
                }
              });
            }
          }
        });

        // Add routing between heart markers based on chronological itinerary flow
        if (likedLocations.length > 1) {
          const directionsService = new google.maps.DirectionsService();
          
          // Filter locations with valid coordinates
          const validLocations = likedLocations.filter(loc => loc.lat && loc.lng);
          
          if (validLocations.length >= 2) {
            // Create one complete route through all locations in chronological order
            const origin = validLocations[0];
            const destination = validLocations[validLocations.length - 1];
            const waypoints = validLocations.slice(1, -1).map(location => ({
              location: new google.maps.LatLng(location.lat!, location.lng!),
              stopover: true
            }));

            const request: google.maps.DirectionsRequest = {
              origin: new google.maps.LatLng(origin.lat!, origin.lng!),
              destination: new google.maps.LatLng(destination.lat!, destination.lng!),
              waypoints: waypoints,
              optimizeWaypoints: false, // Keep chronological order
              travelMode: google.maps.TravelMode.DRIVING,
              avoidHighways: false,
              avoidTolls: false
            };

            // Get and display the route
            directionsService.route(request, (result, status) => {
              if (status === 'OK' && result) {
                const route = result.routes[0];
                if (route && route.legs) {
                  // Extract all points along the route
                  const routePoints: google.maps.LatLng[] = [];
                  
                  route.legs.forEach(leg => {
                    leg.steps?.forEach(step => {
                      if (step.path) {
                        routePoints.push(...step.path);
                      }
                    });
                  });

                  if (routePoints.length > 0) {
                    // Create dotted polyline connecting all hearts in chronological order
                    const routePolyline = new google.maps.Polyline({
                      path: routePoints,
                      geodesic: true,
                      strokeColor: '#EF4444', // Red to match heart markers
                      strokeOpacity: 0, // Make stroke transparent to show only dots
                      strokeWeight: 4,
                      icons: [{
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          fillOpacity: 1,
                          fillColor: '#EF4444',
                          strokeColor: '#EF4444',
                          strokeWeight: 1,
                          scale: 3
                        },
                        offset: '0',
                        repeat: '20px' // Spacing between dots
                      }],
                      map: mapInstance
                    });

                    console.log(`Route created connecting ${validLocations.length} heart locations in chronological order`);
                  }
                }
              } else {
                console.warn('Directions request failed:', status);
                
                // Fallback: Create straight line segments if routing fails
                for (let i = 0; i < validLocations.length - 1; i++) {
                  const start = validLocations[i];
                  const end = validLocations[i + 1];
                  
                  const fallbackPath = [
                    { lat: start.lat!, lng: start.lng! },
                    { lat: end.lat!, lng: end.lng! }
                  ];

                  new google.maps.Polyline({
                    path: fallbackPath,
                    geodesic: true,
                    strokeColor: '#EF4444',
                    strokeOpacity: 0,
                    strokeWeight: 3,
                    icons: [{
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillOpacity: 0.7,
                        fillColor: '#EF4444',
                        strokeColor: '#EF4444',
                        strokeWeight: 1,
                        scale: 2
                      },
                      offset: '0',
                      repeat: '25px'
                    }],
                    map: mapInstance
                  });
                }
                console.log('Used fallback straight-line routing');
              }
            });
          }
        }

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
    <div className="h-full map-container relative">
      {/* Map */}
      {mapError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-600">{mapError}</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}

      {/* Map popup for location details */}
      {mapPopup && mapPopup.visible && (
        <div 
          className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${mapPopup.position.x}px`,
            top: `${mapPopup.position.y - 20}px`,
            width: '250px',
            maxWidth: '85vw'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setMapPopup(null)}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Location image */}
          <div className="relative h-30">
            <img
              src={mapPopup.location.image}
              alt={mapPopup.location.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold">{mapPopup.location.title}</h3>
              <p className="text-sm opacity-90">{mapPopup.location.country}</p>
            </div>
          </div>

          {/* Location details */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(mapPopup.location.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-600">
                  {mapPopup.location.rating} ({mapPopup.location.reviews} reviews)
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {mapPopup.location.description}
            </p>

            <button
              onClick={() => {
                setSelectedDestination(mapPopup.location);
                setIsDestinationDetailsOpen(true);
                setMapPopup(null);
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              View Full Details
            </button>
          </div>
        </div>
      )}

      {/* Draggable itinerary panel */}
      <div
        ref={panelRef}
        className="absolute left-0 right-0 bg-white shadow-xl rounded-t-3xl border-t border-gray-200 overflow-hidden"
        style={{ 
          bottom: '64px', // Raised to account for navigation dock
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
        <div className="flex flex-col" style={{ height: `${panelHeight - 56}px` }}>
          {/* Fixed header */}
          <div className="px-4 pt-4 pb-2 bg-white border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              Your Itinerary
            </h2>
          </div>
          
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
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
                  <div 
                    className="relative pl-8 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200"
                    onClick={() => handleDestinationClick(location, index)}
                  >
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
                        className="w-16 h-16 rounded-xl object-cover hover:scale-105 transition-transform duration-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 
                              className="font-semibold text-gray-800 text-base hover:text-orange-600 transition-colors"
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
