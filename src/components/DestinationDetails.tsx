'use client';

import { useState } from 'react';
import { FaStar, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface DestinationDetailsProps {
  destination: {
    image: string;
    title: string;
    country: string;
    rating: number;
    reviews: number;
    address?: string;
    description?: string;
    attractions?: string[];
    activities?: string[];
    images?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: number; // The position in the itinerary (1-based)
}

export default function DestinationDetails({ destination, isOpen, onClose, orderNumber = 1 }: DestinationDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Generate additional images for carousel if not provided
  const images = destination.images || [
    destination.image,
    destination.image.replace('w=400', 'w=600'),
    destination.image.replace('h=600', 'h=700'),
    destination.image.replace('crop', 'landscape'),
  ];

  // Default content based on destination
  const getDefaultDescription = () => {
    return `Discover the beauty and culture of ${destination.title}. This incredible destination offers a unique blend of history, natural beauty, and unforgettable experiences. Whether you're seeking adventure, relaxation, or cultural immersion, ${destination.title} has something special to offer every traveler.`;
  };

  const getDefaultAttractions = () => {
    const baseAttractions = ['Historic Sites', 'Local Culture', 'Photography'];
    if (destination.title.toLowerCase().includes('beach') || destination.title.toLowerCase().includes('santorini')) {
      return [...baseAttractions, 'Beach', 'Sunset Views', 'Water Sports'];
    }
    if (destination.title.toLowerCase().includes('mountain') || destination.title.toLowerCase().includes('dolomites')) {
      return [...baseAttractions, 'Hiking', 'Mountain Views', 'Nature'];
    }
    if (destination.title.toLowerCase().includes('city') || destination.title.toLowerCase().includes('rio')) {
      return [...baseAttractions, 'City Life', 'Nightlife', 'Food Scene'];
    }
    return [...baseAttractions, 'Sightseeing', 'Adventure'];
  };

  const getDefaultActivities = () => {
    return [
      `Explore the iconic landmarks of ${destination.title}`,
      'Experience the local cuisine and traditional dishes',
      'Take guided tours to learn about the history and culture',
      'Capture stunning photographs at the most scenic spots',
      'Interact with friendly locals and learn about their way of life'
    ];
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full h-[90vh] sm:h-[85vh] sm:max-w-md sm:rounded-t-3xl rounded-t-3xl overflow-hidden animate-slide-up">
        {/* Header with close button */}
        <div className="relative">
          {/* Image carousel */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={destination.title}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all flex items-center justify-center"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all flex items-center justify-center"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all flex items-center justify-center"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Number badge */}
          <div className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
            {orderNumber}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(90vh-16rem)] sm:h-[calc(85vh-16rem)] overflow-y-auto">
          {/* Title and location */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{destination.title}</h1>
              <div className="flex items-center gap-1">
                <FaStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">{destination.rating}</span>
              </div>
            </div>
            <p className="text-gray-600">
              {destination.address || `${destination.country}, Travel Destination`}
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {destination.description || getDefaultDescription()}
            </p>
          </div>

          {/* Attractions */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Attraction</h2>
            <div className="flex flex-wrap gap-2">
              {(destination.attractions || getDefaultAttractions()).map((attraction, index) => (
                <span
                  key={index}
                  className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {attraction}
                </span>
              ))}
            </div>
          </div>

          {/* What to do */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What to do</h2>
            <div className="space-y-3">
              {(destination.activities || getDefaultActivities()).map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 leading-relaxed">{activity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
