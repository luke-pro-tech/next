import React, { useState, useEffect } from 'react';
import { TouristAttraction } from '../../services/stbMapService';
import { UserLocation } from '../../hooks/useProximityTracking';

interface AIGuideResponseProps {
  selectedAttraction: TouristAttraction;
  userLocation: UserLocation | null;
  nearbyAttractions: TouristAttraction[];
}

interface GuideContext {
  selectedAttraction: TouristAttraction;
  userLocation: UserLocation | null;
  nearbyAttractions: TouristAttraction[];
}

export const AIGuideResponse: React.FC<AIGuideResponseProps> = ({
  selectedAttraction,
  userLocation,
  nearbyAttractions
}) => {
  const [response, setResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateResponse();
  }, [selectedAttraction, userLocation, nearbyAttractions]);

  const generateResponse = async () => {
    setIsGenerating(true);
    
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const context: GuideContext = {
      selectedAttraction,
      userLocation,
      nearbyAttractions
    };
    
    const aiResponse = generateAIResponse(context);
    setResponse(aiResponse);
    setIsGenerating(false);
  };

  const generateAIResponse = (context: GuideContext): string => {
    const { selectedAttraction, userLocation, nearbyAttractions } = context;
    
    // Calculate distance if user location is available
    const distance = userLocation 
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          selectedAttraction.latitude,
          selectedAttraction.longitude
        )
      : null;

    // Build contextual response
    let response = `Great choice! **${selectedAttraction.name}** is ${selectedAttraction.description.toLowerCase()}`;

    // Add distance context
    if (distance !== null) {
      if (distance <= 100) {
        response += ` You're practically at the entrance! `;
      } else if (distance <= 500) {
        response += ` It's just a short ${Math.round(distance)}m walk from your location. `;
      } else if (distance <= 1000) {
        response += ` It's about ${Math.round(distance)}m away - a pleasant walk through Singapore's streets. `;
      } else {
        response += ` It's ${(distance / 1000).toFixed(1)}km from your current location. `;
      }
    }

    // Add category-specific insights
    response += getCategoryInsights(selectedAttraction.category);

    // Add rating context
    if (selectedAttraction.rating) {
      response += ` Visitors typically rate this attraction ${selectedAttraction.rating} out of 5 stars. `;
    }

    // Add opening hours context
    if (selectedAttraction.openingHours) {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      
      if (currentHour >= 9 && currentHour <= 17) {
        response += ` It's currently open (${selectedAttraction.openingHours}), so it's a perfect time to visit! `;
      } else {
        response += ` Please note the opening hours: ${selectedAttraction.openingHours}. `;
      }
    }

    // Add nearby attractions context
    if (nearbyAttractions.length > 1) {
      const nearbyCount = nearbyAttractions.length - 1; // Exclude current attraction
      response += `\n\n🗺️ **Nearby Attractions**: There ${nearbyCount === 1 ? 'is' : 'are'} ${nearbyCount} other interesting ${nearbyCount === 1 ? 'attraction' : 'attractions'} within walking distance. `;
      
      const topNearby = nearbyAttractions
        .filter(a => a.name !== selectedAttraction.name)
        .slice(0, 2);
      
      if (topNearby.length > 0) {
        response += `Consider visiting ${topNearby.map(a => a.name).join(' and ')} while you're in the area. `;
      }
    }

    // Add helpful tips
    response += generateTips(selectedAttraction);

    return response;
  };

  const getCategoryInsights = (category: string): string => {
    const insights: { [key: string]: string } = {
      'Art & Museums': ' This cultural venue offers a deep dive into Singapore\'s artistic heritage. Take your time to explore the exhibitions and don\'t miss the interactive displays. ',
      'Nature & Wildlife': ' Perfect for nature lovers! Bring comfortable walking shoes and don\'t forget your camera for wildlife spotting. Early morning or late afternoon visits often offer the best experience. ',
      'Cultural': ' This site showcases Singapore\'s rich multicultural heritage. It\'s an excellent opportunity to learn about local traditions and history. ',
      'Family': ' Great for families with children! There are likely interactive activities and child-friendly facilities available. ',
      'Nightlife': ' This venue comes alive in the evening. Consider visiting after sunset for the full experience. ',
      'Food & Culinary': ' A food lover\'s paradise! Come hungry and be ready to explore Singapore\'s incredible culinary diversity. ',
      'Shopping': ' Perfect for retail therapy! You\'ll find everything from local crafts to international brands. ',
      'Historical': ' Step back in time and discover Singapore\'s fascinating history. Look out for historical markers and guided tour information. ',
      'Religious': ' This sacred space offers insight into Singapore\'s spiritual diversity. Please be respectful of local customs and dress appropriately. ',
      'Adventure': ' Get ready for some excitement! Make sure you meet any physical requirements and follow safety guidelines. ',
      'Wellness': ' A perfect spot to relax and rejuvenate. Take your time and enjoy the peaceful atmosphere. ',
      'Beach': ' Enjoy Singapore\'s coastal beauty! Check the weather and consider bringing sun protection. ',
      'Architecture': ' Marvel at the impressive design and engineering. Don\'t forget to look up and appreciate the architectural details. ',
      'Festival & Events': ' Check the current schedule for special events and performances. These often provide unique cultural experiences. '
    };
    
    return insights[category] || ' This unique attraction offers something special for every visitor. ';
  };

  const generateTips = (attraction: TouristAttraction): string => {
    let tips = '\n\n💡 **Helpful Tips**: ';
    
    const tipsList = [
      'Check the weather forecast before your visit',
      'Bring a water bottle to stay hydrated',
      'Consider visiting during off-peak hours for a more relaxed experience'
    ];

    // Add category-specific tips
    if (attraction.category === 'Art & Museums') {
      tipsList.push('Many museums offer free guided tours at specific times');
    } else if (attraction.category === 'Nature & Wildlife') {
      tipsList.push('Early morning visits often provide better wildlife viewing opportunities');
    } else if (attraction.category === 'Food & Culinary') {
      tipsList.push('Come hungry and try multiple dishes to experience the full variety');
    } else if (attraction.category === 'Shopping') {
      tipsList.push('Many shops offer tourist discounts with passport presentation');
    }

    tips += tipsList.slice(0, 2).join(', ') + '.';
    
    return tips;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatResponse = (text: string) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="ai-guide-response">
      {isGenerating ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-blue-700">AI guide is thinking...</span>
        </div>
      ) : (
        <div 
          className="text-blue-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
        />
      )}
    </div>
  );
};

export default AIGuideResponse;
