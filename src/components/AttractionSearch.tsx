"use client";

import React, { useState } from 'react';
import { useLocationBasedAttractions, useSTBMap } from '../hooks/useSTBMap';
import { SingaporeCategory, stbMapService } from '../services/stbMapService';

interface AttractionSearchProps {
  onAttractionSelect?: (attraction: any) => void;
}

export function AttractionSearch({ onAttractionSelect }: AttractionSearchProps) {
  const [selectedCategory, setSelectedCategory] = useState<SingaporeCategory | ''>('');
  const [searchRadius, setSearchRadius] = useState<number>(1000);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  // Hook for location-based search
  const {
    location,
    attractions: locationAttractions,
    loading: locationLoading,
    error: locationError,
    searchByCategory: locationSearchByCategory
  } = useLocationBasedAttractions(selectedCategory || undefined, searchRadius);

  // Hook for manual search
  const {
    attractions: manualAttractions,
    loading: manualLoading,
    error: manualError,
    searchAttractions,
    searchByCategory,
    availableCategories
  } = useSTBMap();

  const currentAttractions = useCurrentLocation ? locationAttractions : manualAttractions;
  const currentLoading = useCurrentLocation ? locationLoading : manualLoading;
  const currentError = useCurrentLocation ? locationError : manualError;

  const handleManualSearch = async () => {
    const lat = parseFloat(manualLocation.lat);
    const lng = parseFloat(manualLocation.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }

    if (selectedCategory) {
      await searchByCategory(lat, lng, selectedCategory as SingaporeCategory, searchRadius);
    } else {
      await searchAttractions({
        latitude: lat,
        longitude: lng,
        radius: searchRadius,
        limit: 20
      });
    }
  };

  const handleCategoryChange = (category: SingaporeCategory | '') => {
    setSelectedCategory(category);
    
    if (useCurrentLocation && location && category) {
      locationSearchByCategory(location.latitude, location.longitude, category as SingaporeCategory, searchRadius);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🇸🇬 Singapore Tourist Attractions
        </h2>
        
        {/* Search Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Location Toggle */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={useCurrentLocation}
                onChange={() => setUseCurrentLocation(true)}
                className="form-radio"
              />
              <span>Use current location</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!useCurrentLocation}
                onChange={() => setUseCurrentLocation(false)}
                className="form-radio"
              />
              <span>Enter coordinates manually</span>
            </label>
          </div>

          {/* Manual Coordinates */}
          {!useCurrentLocation && (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g., 1.3521)"
                  value={manualLocation.lat}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, lat: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g., 103.8198)"
                  value={manualLocation.lng}
                  onChange={(e) => setManualLocation(prev => ({ ...prev, lng: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleManualSearch}
                disabled={manualLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {manualLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as SingaporeCategory | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius: {stbMapService.formatDistance(searchRadius)}
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Current Location Display */}
      {useCurrentLocation && location && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            📍 Current location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      )}

      {/* Error Display */}
      {currentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">❌ {currentError}</p>
        </div>
      )}

      {/* Loading State */}
      {currentLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Searching for attractions...</span>
        </div>
      )}

      {/* Results */}
      {!currentLoading && currentAttractions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Found {currentAttractions.length} attraction{currentAttractions.length !== 1 ? 's' : ''}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAttractions.map((attraction, index) => (
              <AttractionCard
                key={`${attraction.name}-${index}`}
                attraction={attraction}
                onSelect={() => onAttractionSelect?.(attraction)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!currentLoading && currentAttractions.length === 0 && !currentError && (
        <div className="text-center py-8 text-gray-500">
          <p>No attractions found for the current search criteria.</p>
          <p className="text-sm mt-2">Try adjusting the category or increasing the search radius.</p>
        </div>
      )}
    </div>
  );
}

interface AttractionCardProps {
  attraction: any;
  onSelect?: () => void;
}

function AttractionCard({ attraction, onSelect }: AttractionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      {attraction.imageUrl && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={attraction.imageUrl}
            alt={attraction.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-800 text-sm leading-tight">
            {attraction.name}
          </h4>
          {attraction.rating && (
            <div className="flex items-center text-xs text-yellow-600 ml-2">
              ⭐ {attraction.rating}
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {attraction.description}
        </p>
        
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {attraction.category}
          </div>
          
          {attraction.distance && (
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {stbMapService.formatDistance(attraction.distance)} away
            </div>
          )}
          
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            {attraction.address}
          </div>
        </div>

        {attraction.openingHours && (
          <div className="mt-2 text-xs text-gray-500">
            🕒 {attraction.openingHours}
          </div>
        )}

        {onSelect && (
          <button
            onClick={onSelect}
            className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
          >
            Select Attraction
          </button>
        )}

        {attraction.website && (
          <a
            href={attraction.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800"
          >
            Visit Website →
          </a>
        )}
      </div>
    </div>
  );
}

export default AttractionSearch;
