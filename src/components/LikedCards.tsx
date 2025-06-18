'use client';

import { FaHeart, FaStar, FaTimes } from 'react-icons/fa';

interface LikedCard {
  image: string;
  country: string;
  title: string;
  rating: number;
  reviews: number;
  lat?: number;
  lng?: number;
}

interface LikedCardsProps {
  likedCards: LikedCard[];
  onRemove: (title: string) => void;
}

export default function LikedCards({ likedCards, onRemove }: LikedCardsProps) {
  if (likedCards.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaHeart className="text-gray-400" size={14} />
        </div>
        <p className="text-gray-500 text-xs">No liked places yet</p>
        <p className="text-gray-400 text-xs mt-1">Swipe right to add favorites!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Your Wishlist ({likedCards.length})</h3>
      {likedCards.map((card, index) => (
        <div key={`${card.title}-${index}`} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
          <div className="flex">
            <img 
              src={card.image} 
              alt={card.title}
              className="w-12 h-12 object-cover"
            />
            <div className="flex-1 p-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">{card.country}</p>
                  <h4 className="font-semibold text-gray-800 text-xs">{card.title}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <FaStar className="text-yellow-400" size={8} />
                    <span className="text-xs text-gray-600">{card.rating}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(card.title)}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <FaTimes className="text-gray-400 hover:text-red-500" size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
