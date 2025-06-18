'use client';

import { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import LocationCard from './LocationCard';
import { SwipeCard } from '@/services/stbApi';

interface SwipeStackProps {
  cards: SwipeCard[];
  loading?: boolean;
  onCardLiked?: (card: SwipeCard) => void;
  onAllCardsSwiped?: () => void;
}

export default function SwipeStack({ cards, loading, onCardLiked, onAllCardsSwiped }: SwipeStackProps) {
  const [swipedCards, setSwipedCards] = useState<Set<string>>(new Set());
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);

  // Reset completion state when new cards are loaded
  useEffect(() => {
    if (cards.length > 0) {
      setSwipedCards(new Set());
      setHasTriggeredCompletion(false);
      console.log('Reset swipe state for new cards');
    }
  }, [cards]);

  // Check if all cards are swiped with debounce
  useEffect(() => {
    if (cards.length > 0 && swipedCards.size === cards.length && !hasTriggeredCompletion) {
      console.log('All cards have been swiped!');
      
      // Add small debounce to prevent rapid-fire triggers
      const debounceTimer = setTimeout(() => {
        setHasTriggeredCompletion(true);
        onAllCardsSwiped?.();
      }, 100);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [swipedCards.size, cards.length, onAllCardsSwiped, hasTriggeredCompletion]);

  const swiped = (dir: string, cardId: string) => {
    console.log(`Swiped ${dir} on card ${cardId}`);
    
    // Add card to swiped set
    setSwipedCards(prev => new Set([...prev, cardId]));
    
    if (dir === 'right') {
      const card = cards.find(c => c.id === cardId);
      if (card && onCardLiked) {
        onCardLiked(card);
      }
      console.log(`Added card ${cardId} to favorites!`);
    }
  };

  const outOfFrame = (cardId: string) => {
    console.log(`Card ${cardId} left the screen`);
  };

  if (loading) {
    return (
      <div className="relative w-full h-full flex justify-center items-center max-w-xs mx-auto">
        <div className="animate-pulse bg-gray-300 rounded-2xl w-full aspect-[3/4] flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Loading places...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="relative w-full h-full flex justify-center items-center max-w-xs mx-auto">
        <div className="bg-gray-100 rounded-2xl w-full aspect-[3/4] flex items-center justify-center">
          <div className="text-gray-500 text-center p-4">
            <p className="text-sm mb-2">No places found</p>
            <p className="text-xs text-gray-400">Try selecting different preferences</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex justify-center items-center max-w-xs mx-auto">
      {cards.map((card, index) => (
        <TinderCard
          key={card.id}
          onSwipe={(dir) => swiped(dir, card.id)}
          onCardLeftScreen={() => outOfFrame(card.id)}
          preventSwipe={['up', 'down']}
          className="absolute w-full"
          swipeRequirementType="position"
          swipeThreshold={100}
        >
          <div className="touch-pan-y w-full">
            <LocationCard {...card} />
          </div>
        </TinderCard>
      ))}
    </div>
  );
}
