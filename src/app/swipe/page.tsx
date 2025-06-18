'use client';

import SwipeStack from '@/components/SwipeStack';
import LikedCards from '@/components/LikedCards';
import { FaArrowLeft, FaHeart, FaTimes, FaMap } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface LikedCard {
  image: string;
  country: string;
  title: string;
  rating: number;
  reviews: number;
  lat?: number;
  lng?: number;
}

export default function SwipePage() {
  const router = useRouter();
  const [likedCards, setLikedCards] = useState<LikedCard[]>([]);

  // Load existing liked cards from localStorage on mount
  useEffect(() => {
    const storedLiked = localStorage.getItem('likedCards');
    if (storedLiked) {
      try {
        const parsed = JSON.parse(storedLiked);
        setLikedCards(parsed);
      } catch (error) {
        console.error('Error loading liked cards from localStorage:', error);
      }
    }
  }, []);

  const handleCardLiked = (card: LikedCard) => {
    const updatedCards = [...likedCards, card];
    setLikedCards(updatedCards);
    // Save to localStorage for the map page
    localStorage.setItem('likedCards', JSON.stringify(updatedCards));
  };

  const handleRemoveLiked = (title: string) => {
    const updatedCards = likedCards.filter(card => card.title !== title);
    setLikedCards(updatedCards);
    // Update localStorage
    localStorage.setItem('likedCards', JSON.stringify(updatedCards));
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="px-4 py-3 max-w-md mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg p-3 shadow-sm">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
          >
            <FaArrowLeft size={16} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Discover Places</h1>
          <button 
            onClick={() => router.push('/map')}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
          >
            <FaMap size={16} />
            <span className="text-sm font-medium">Map</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center mb-3 bg-white rounded-lg p-3 shadow-sm">
          <p className="text-gray-600 mb-2 text-xs">
            Swipe right to like, left to pass
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white">
                <FaTimes size={8} />
              </div>
              <span>Pass</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white">
                <FaHeart size={8} />
              </div>
              <span>Like</span>
            </div>
          </div>
        </div>

        {/* Swipe Stack - Constrained to available space */}
        <main className="flex justify-center mb-3 flex-1 min-h-0 relative">
          <SwipeStack onCardLiked={handleCardLiked} />
        </main>

        {/* Liked Cards Section - Fixed height with scroll */}
        <div className="bg-white rounded-lg p-3 shadow-sm h-32 overflow-y-auto">
          <LikedCards likedCards={likedCards} onRemove={handleRemoveLiked} />
        </div>
      </div>
    </div>
  );
}
