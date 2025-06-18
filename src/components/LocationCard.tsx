'use client';

import { FaHeart, FaStar, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';

interface LocationCardProps {
  image: string;
  country: string;
  title: string;
  rating: number;
  reviews: number;
  description?: string;
  website?: string;
  address?: string;
  type?: 'accommodation' | 'attraction' | 'event' | 'tour' | 'food_beverage' | 'shop' | 'precinct' | 'mice_event';
  cuisine?: string[];
  priceLevel?: string;
  category?: string[];
  amenities?: string[];
  eventType?: string;
}

export default function LocationCard({
  image,
  country,
  title,
  rating,
  reviews,
  description,
  website,
  address,
  type = 'attraction',
  cuisine,
  priceLevel,
  category,
  amenities,
  eventType,
}: LocationCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder-image.svg';
  };

  const getTypeColor = () => {
    switch (type) {
      case 'accommodation': return 'bg-purple-500/80';
      case 'event': return 'bg-blue-500/80';
      case 'tour': return 'bg-green-500/80';
      case 'food_beverage': return 'bg-orange-500/80';
      case 'shop': return 'bg-pink-500/80';
      case 'precinct': return 'bg-indigo-500/80';
      case 'mice_event': return 'bg-teal-500/80';
      default: return 'bg-red-500/80'; // attraction
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'accommodation': return 'Stay';
      case 'event': return 'Event';
      case 'tour': return 'Tour';
      case 'food_beverage': return 'Food & Drink';
      case 'shop': return 'Shopping';
      case 'precinct': return 'District';
      case 'mice_event': return 'Business';
      default: return 'Attraction';
    }
  };

  return (
    <div className="relative w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mx-auto" style={{ maxHeight: '380px' }}>
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover" 
        onError={handleImageError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
        {/* Type badge */}
        <div className={`absolute top-4 left-4 ${getTypeColor()} px-2 py-1 rounded-full text-xs font-semibold`}>
          {getTypeLabel()}
        </div>

        <div className="space-y-1">
          <p className="text-xs opacity-90">{country}</p>
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          
          {/* Address */}
          {address && (
            <p className="text-xs opacity-80 flex items-center gap-1">
              <FaMapMarkerAlt size={10} />
              <span className="truncate">{address}</span>
            </p>
          )}
          
          {/* Cuisine for food & beverage */}
          {type === 'food_beverage' && cuisine && cuisine.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cuisine.slice(0, 2).map((item, index) => (
                <span key={index} className="text-xs bg-orange-100/20 text-orange-200 px-2 py-0.5 rounded">
                  {item}
                </span>
              ))}
            </div>
          )}
          
          {/* Category for shops */}
          {type === 'shop' && category && category.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {category.slice(0, 2).map((item, index) => (
                <span key={index} className="text-xs bg-pink-100/20 text-pink-200 px-2 py-0.5 rounded">
                  {item}
                </span>
              ))}
            </div>
          )}
          
          {/* Description */}
          {description && (
            <p className="text-xs opacity-80 line-clamp-2 leading-tight">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <FaStar className="text-yellow-400" /> {rating}
              </span>
              <span className="opacity-80">{reviews} reviews</span>
              {/* Price level for food & beverage */}
              {type === 'food_beverage' && priceLevel && (
                <span className="opacity-80">• {priceLevel}</span>
              )}
            </div>
            {website && (
              <FaGlobe className="opacity-60" size={12} />
            )}
          </div>
        </div>
        
        <button className="w-full bg-white/20 hover:bg-white/30 transition rounded-full py-2 text-xs font-semibold backdrop-blur-sm border border-white/20 mt-2">
          See more →
        </button>
      </div>
      <button className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500/80 transition border border-white/20 flex items-center justify-center">
        <FaHeart size={14} />
      </button>
    </div>
  );
}
