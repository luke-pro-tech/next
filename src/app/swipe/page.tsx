'use client';

import SwipeStack from '@/components/SwipeStack';
import LikedCards from '@/components/LikedCards';
import { FaArrowLeft, FaHeart, FaTimes, FaMap, FaRedo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSTBData } from '@/hooks/useSTBData';
import { SwipeCard } from '@/services/stbApi';
import { useAgora } from '@/contexts/AgoraContext';
import { sendMessageToAvatar } from '@/agoraHelper';
import { useBedrockLLM } from '@/hooks/useBedrockLLM';
import { messageTracker } from '@/utils/messageTracker';

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
  const { client } = useAgora();
  const { processWithLLM, isProcessing } = useBedrockLLM();
  const [likedCards, setLikedCards] = useState<LikedCard[]>([]);
  const [allCardsSwiped, setAllCardsSwiped] = useState(false);
  const [isProcessingItinerary, setIsProcessingItinerary] = useState(false);
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  
  // Load selected datasets from localStorage
  useEffect(() => {
    const storedDatasets = localStorage.getItem('selectedDatasets');
    if (storedDatasets) {
      try {
        const parsed = JSON.parse(storedDatasets);
        setSelectedDatasets(parsed);
      } catch (error) {
        console.error('Error loading selected datasets:', error);
      }
    }
  }, []);

  // Clear storage and reset state when page opens
  useEffect(() => {
    // Clear previous swipe session data
    localStorage.removeItem('likedCards');
    setLikedCards([]);
    setAllCardsSwiped(false);
    setIsProcessingItinerary(false);
    setLastProcessedMessageId(null);
    
    // Clear message tracker to prevent false positives from previous sessions
    messageTracker.clear();
    
    console.log('Cleared previous swipe session data and message tracker');
  }, []);

  // Use STB data hook
  const { cards, loading, error, refetch } = useSTBData(selectedDatasets);

  // No need to load existing liked cards since we're clearing them

  const handleCardLiked = (card: SwipeCard) => {
    const likedCard: LikedCard = {
      image: card.image,
      country: card.country,
      title: card.title,
      rating: card.rating,
      reviews: card.reviews,
      lat: card.lat,
      lng: card.lng
    };
    
    const updatedCards = [...likedCards, likedCard];
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

  const handleAllCardsSwiped = async () => {
    // Prevent duplicate processing with multiple checks
    if (isProcessingItinerary || allCardsSwiped) {
      console.log('Already processing itinerary or all cards already swiped, skipping...');
      return;
    }

    // Generate unique message ID for this session
    const currentMessageId = `itinerary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we already processed this exact session
    if (lastProcessedMessageId === currentMessageId) {
      console.log('Already processed this session, skipping...');
      return;
    }

    console.log('All cards swiped! Processing liked cards through Bedrock:', likedCards);
    setAllCardsSwiped(true);
    setIsProcessingItinerary(true);
    setLastProcessedMessageId(currentMessageId);
    
    try {
      let prompt = "I've finished swiping through travel recommendations! ";
      
      if (likedCards.length === 0) {
        prompt += "I didn't find any places that interested me. Could you suggest some different travel options or help me explore other categories?";
      } else {
        prompt += `Here are the ${likedCards.length} place${likedCards.length !== 1 ? 's' : ''} I liked:\n\n`;
        
        likedCards.forEach((card, index) => {
          prompt += `${index + 1}. ${card.title} in ${card.country}`;
          if (card.rating) {
            prompt += ` (${card.rating}⭐)`;
          }
          prompt += '\n';
        });

        prompt += '\nPlease create a personalized travel itinerary based on these places I liked. Include suggestions for timing, transportation between places, and any additional recommendations that would complement these choices. DO NOT call the "searchSTBData" tool again, as I have already selected my preferences. Instead, focus on generating a cohesive itinerary based on the places I liked. DO NOT mention the timing or transportation in the response, just say what I can do at each place.';
      }

      console.log('Sending prompt to Bedrock LLM...');
      
      // First, process through Bedrock LLM to generate itinerary
      const bedrockResponse = await processWithLLM(prompt);
      
      console.log('Received response from Bedrock:', bedrockResponse);

      // Then send the Bedrock response to the avatar for voice output with unique ID
      if (client) {
        await sendMessageToAvatar(client, currentMessageId, bedrockResponse);
        console.log(`Successfully sent itinerary to avatar for voice output with ID: ${currentMessageId}`);
      } else {
        console.warn('Agora client not available for avatar message');
      }

      // Save liked cards to localStorage for the map page
      localStorage.setItem('likedCards', JSON.stringify(likedCards));
      
      // Navigate to map page after processing
      console.log('Navigating to map page...');
      router.push('/map');
      
    } catch (error) {
      console.error('Error processing itinerary through Bedrock:', error);
      
      // Fallback message if Bedrock fails
      if (client) {
        const fallbackMessage = "I've processed your liked places, but encountered an issue generating your itinerary. Let me know if you'd like me to try again or if you have any specific questions about the places you selected.";
        const fallbackMessageId = `itinerary_error_${Date.now()}`;
        await sendMessageToAvatar(client, fallbackMessageId, fallbackMessage);
        
        // Still navigate to map page even on error, but with saved liked cards
        localStorage.setItem('likedCards', JSON.stringify(likedCards));
        router.push('/map');
      }
    } finally {
      setIsProcessingItinerary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="px-4 py-3 max-w-md mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg p-3 shadow-sm">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
          >
            <FaArrowLeft size={16} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">Discover Places</h1>
            {selectedDatasets.length > 0 && (
              <p className="text-xs text-gray-500">{selectedDatasets.length} categor{selectedDatasets.length !== 1 ? 'ies' : 'y'} selected</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <button 
                onClick={refetch}
                className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
                title="Retry loading"
              >
                <FaRedo size={14} />
              </button>
            )}
            <button 
              onClick={() => router.push('/map')}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
            >
              <FaMap size={16} />
              <span className="text-sm font-medium">Map</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        {/* <div className="text-center mb-3 bg-white rounded-lg p-3 shadow-sm">
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
        </div> */}

        {/* Error message */}
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm text-center">
              Unable to load places. Using sample data.
            </p>
          </div>
        )}

        {/* Processing itinerary indicator */}
        {(allCardsSwiped && isProcessingItinerary) && (
          <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600 text-sm">
                Creating your personalized itinerary...
              </p>
            </div>
          </div>
        )}

        {/* Swipe Stack - Now properly sized with avatar space accounted for */}
        <main className="flex justify-center mb-4 relative" style={{ height: 'calc(100vh - 320px)', maxHeight: '400px' }}>
          <SwipeStack 
            cards={cards} 
            loading={loading}
            onCardLiked={handleCardLiked}
            onAllCardsSwiped={handleAllCardsSwiped}
          />
        </main>

        {/* Liked Cards Section - Fixed height with scroll */}
        <div className="bg-white rounded-lg p-3 shadow-sm" style={{ height: '120px', overflowY: 'auto' }}>
          <LikedCards likedCards={likedCards} onRemove={handleRemoveLiked} />
        </div>
      </div>
    </div>
  );
}
