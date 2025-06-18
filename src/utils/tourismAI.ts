/**
 * Utility functions for AI Avatar to interact with STB Map API
 * These functions provide contextual information about Singapore tourist attractions
 * that can be used to enhance AI responses in the tourism guide app
 */

import { stbMapService, TouristAttraction, SingaporeCategory } from '../services/stbMapService';

export interface TourismContext {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  interests?: SingaporeCategory[];
  budget?: 'low' | 'medium' | 'high';
  travelStyle?: 'family' | 'solo' | 'couple' | 'group';
  duration?: 'half-day' | 'full-day' | 'multi-day';
}

export interface AttractionRecommendation {
  attraction: TouristAttraction;
  reason: string;
  relevanceScore: number;
  tips?: string[];
}

/**
 * Get personalized attraction recommendations for the AI avatar
 */
export async function getPersonalizedRecommendations(
  context: TourismContext,
  limit: number = 5
): Promise<AttractionRecommendation[]> {
  const { userLocation, interests, budget, travelStyle, duration } = context;

  // Default to Singapore city center if no location provided
  const searchLocation = userLocation || {
    latitude: 1.3521, // Singapore city center
    longitude: 103.8198
  };

  let allAttractions: TouristAttraction[] = [];

  try {
    // Search for attractions based on interests
    if (interests && interests.length > 0) {
      // Get attractions for each interest category
      for (const category of interests) {
        const categoryAttractions = await stbMapService.getAttractionsByCategory(
          searchLocation.latitude,
          searchLocation.longitude,
          category,
          3000 // 3km radius
        );
        allAttractions.push(...categoryAttractions);
      }
    } else {
      // Get general nearby attractions
      allAttractions = await stbMapService.searchAttractions({
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        radius: 2000,
        limit: 20
      });
    }

    // Remove duplicates based on attraction name
    const uniqueAttractions = allAttractions.filter((attraction, index, self) =>
      index === self.findIndex(a => a.name === attraction.name)
    );

    // Score and filter attractions based on context
    const recommendations = uniqueAttractions
      .map(attraction => ({
        attraction,
        ...calculateRecommendationScore(attraction, context)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return recommendations;

  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}

/**
 * Get attractions near a specific location for AI context
 */
export async function getNearbyAttractionsForContext(
  latitude: number,
  longitude: number,
  radius: number = 1000
): Promise<string> {
  try {
    const attractions = await stbMapService.getNearbyAttractions(latitude, longitude, radius);
    
    if (attractions.length === 0) {
      return `No major tourist attractions found within ${stbMapService.formatDistance(radius)} of the specified location.`;
    }

    const attractionList = attractions.slice(0, 5).map((attraction, index) => {
      const distance = attraction.distance ? stbMapService.formatDistance(attraction.distance) : '';
      return `${index + 1}. ${attraction.name} (${attraction.category}) - ${distance} away`;
    }).join('\n');

    return `Nearby attractions within ${stbMapService.formatDistance(radius)}:\n${attractionList}`;

  } catch (error) {
    console.error('Error getting nearby attractions for context:', error);
    return 'Unable to retrieve nearby attraction information at this time.';
  }
}

/**
 * Get category-specific information for AI responses
 */
export async function getCategoryInsights(
  category: SingaporeCategory,
  userLocation?: { latitude: number; longitude: number }
): Promise<string> {
  const location = userLocation || { latitude: 1.3521, longitude: 103.8198 };

  try {
    const attractions = await stbMapService.getAttractionsByCategory(
      location.latitude,
      location.longitude,
      category,
      5000 // 5km radius
    );

    if (attractions.length === 0) {
      return `No ${category.toLowerCase()} attractions found in the area.`;
    }

    const topAttractions = attractions.slice(0, 3);
    const insights = generateCategoryInsights(category, topAttractions);

    return insights;

  } catch (error) {
    console.error(`Error getting ${category} insights:`, error);
    return `Unable to retrieve information about ${category.toLowerCase()} attractions at this time.`;
  }
}

/**
 * Get attraction details for AI avatar responses
 */
export async function getAttractionDetails(attractionName: string): Promise<string | null> {
  try {
    // Search for the specific attraction in Singapore
    const attractions = await stbMapService.searchAttractions({
      latitude: 1.3521,
      longitude: 103.8198,
      radius: 10000, // 10km radius to cover most of Singapore
      limit: 50
    });

    const attraction = attractions.find(a => 
      a.name.toLowerCase().includes(attractionName.toLowerCase()) ||
      attractionName.toLowerCase().includes(a.name.toLowerCase())
    );

    if (!attraction) {
      return null;
    }

    let details = `${attraction.name} is ${attraction.description}`;
    
    if (attraction.address) {
      details += ` Located at ${attraction.address}`;
    }
    
    if (attraction.openingHours) {
      details += `. Open ${attraction.openingHours}`;
    }
    
    if (attraction.rating) {
      details += `. Rated ${attraction.rating}/5 stars`;
    }

    if (attraction.category) {
      details += `. Category: ${attraction.category}`;
    }

    return details;

  } catch (error) {
    console.error('Error getting attraction details:', error);
    return null;
  }
}

/**
 * Calculate recommendation score based on user context
 */
function calculateRecommendationScore(
  attraction: TouristAttraction,
  context: TourismContext
): { reason: string; relevanceScore: number; tips?: string[] } {
  let score = 0;
  let reasons: string[] = [];
  let tips: string[] = [];

  // Base score from rating
  if (attraction.rating) {
    score += attraction.rating * 10;
  } else {
    score += 35; // Default score for attractions without ratings
  }

  // Distance scoring (closer is better)
  if (attraction.distance) {
    if (attraction.distance <= 500) {
      score += 20;
      reasons.push('very close to your location');
    } else if (attraction.distance <= 1000) {
      score += 15;
      reasons.push('within walking distance');
    } else if (attraction.distance <= 2000) {
      score += 10;
      reasons.push('easily accessible');
    }
  }

  // Category matching
  if (context.interests?.includes(attraction.category as SingaporeCategory)) {
    score += 25;
    reasons.push(`matches your interest in ${attraction.category.toLowerCase()}`);
  }

  // Budget considerations
  if (context.budget) {
    const budgetScore = getBudgetScore(attraction, context.budget);
    score += budgetScore.score;
    if (budgetScore.reason) {
      reasons.push(budgetScore.reason);
    }
    if (budgetScore.tip) {
      tips.push(budgetScore.tip);
    }
  }

  // Travel style considerations
  if (context.travelStyle) {
    const styleScore = getTravelStyleScore(attraction, context.travelStyle);
    score += styleScore.score;
    if (styleScore.reason) {
      reasons.push(styleScore.reason);
    }
    if (styleScore.tip) {
      tips.push(styleScore.tip);
    }
  }

  // Duration considerations
  if (context.duration) {
    const durationTip = getDurationTip(attraction, context.duration);
    if (durationTip) {
      tips.push(durationTip);
    }
  }

  const reason = reasons.length > 0 
    ? `Recommended because it ${reasons.join(', ')}.`
    : 'A popular attraction in Singapore.';

  return {
    reason,
    relevanceScore: score,
    tips: tips.length > 0 ? tips : undefined
  };
}

/**
 * Get budget-based scoring
 */
function getBudgetScore(attraction: TouristAttraction, budget: string) {
  const freeAttractions = ['beach', 'cultural', 'historical', 'religious'];
  const midRangeAttractions = ['art & museums', 'nature & wildlife', 'architecture'];
  const premiumAttractions = ['family', 'nightlife', 'shopping', 'adventure'];

  const category = attraction.category.toLowerCase();

  switch (budget) {
    case 'low':
      if (freeAttractions.some(cat => category.includes(cat))) {
        return { score: 15, reason: 'fits your budget with free or low-cost entry' };
      }
      return { score: 0, tip: 'Check for free entry times or student discounts' };

    case 'medium':
      if (midRangeAttractions.some(cat => category.includes(cat))) {
        return { score: 10, reason: 'offers good value for money' };
      }
      return { score: 5 };

    case 'high':
      if (premiumAttractions.some(cat => category.includes(cat))) {
        return { score: 10, reason: 'provides premium experiences' };
      }
      return { score: 5 };

    default:
      return { score: 0 };
  }
}

/**
 * Get travel style-based scoring
 */
function getTravelStyleScore(attraction: TouristAttraction, travelStyle: string) {
  const category = attraction.category.toLowerCase();

  switch (travelStyle) {
    case 'family':
      if (category.includes('family') || category.includes('nature') || category.includes('beach')) {
        return { score: 15, reason: 'perfect for family visits', tip: 'Check for family packages and child-friendly facilities' };
      }
      return { score: 0 };

    case 'solo':
      if (category.includes('art') || category.includes('cultural') || category.includes('historical')) {
        return { score: 12, reason: 'ideal for solo exploration and learning' };
      }
      return { score: 0 };

    case 'couple':
      if (category.includes('beach') || category.includes('nightlife') || category.includes('architecture')) {
        return { score: 12, reason: 'romantic and perfect for couples', tip: 'Consider visiting during sunset for better ambiance' };
      }
      return { score: 0 };

    case 'group':
      if (category.includes('adventure') || category.includes('nightlife') || category.includes('family')) {
        return { score: 12, reason: 'great for group activities', tip: 'Look for group discounts and book in advance' };
      }
      return { score: 0 };

    default:
      return { score: 0 };
  }
}

/**
 * Get duration-specific tips
 */
function getDurationTip(attraction: TouristAttraction, duration: string): string | null {
  const category = attraction.category.toLowerCase();

  switch (duration) {
    case 'half-day':
      if (category.includes('museums') || category.includes('cultural')) {
        return 'Allow 2-3 hours for a thorough visit';
      }
      return 'Perfect for a quick 1-2 hour visit';

    case 'full-day':
      if (category.includes('family') || category.includes('adventure') || category.includes('nature')) {
        return 'Plan to spend the whole day here with breaks for meals';
      }
      return 'Can be combined with nearby attractions for a full day itinerary';

    case 'multi-day':
      return 'Consider this as part of a multi-day Singapore exploration';

    default:
      return null;
  }
}

/**
 * Generate category-specific insights
 */
function generateCategoryInsights(category: SingaporeCategory, attractions: TouristAttraction[]): string {
  const count = attractions.length;
  const topAttraction = attractions[0];

  let insights = `Singapore has ${count}+ ${category.toLowerCase()} attractions. `;

  if (topAttraction) {
    insights += `The most popular is ${topAttraction.name} - ${topAttraction.description}`;
  }

  // Add category-specific tips
  switch (category) {
    case 'Art & Museums':
      insights += ' Many museums offer free entry on certain days. Consider getting a Singapore Museum Pass for multiple visits.';
      break;
    case 'Nature & Wildlife':
      insights += ' Best visited early morning or late afternoon. Bring comfortable walking shoes and water.';
      break;
    case 'Family':
      insights += ' Most family attractions offer packages and discounts for advance bookings. Check height restrictions for rides.';
      break;
    case 'Nightlife':
      insights += ' The nightlife scene typically starts after 8 PM. Dress codes may apply at upscale venues.';
      break;
    case 'Cultural':
      insights += ' These attractions offer deep insights into Singapore\'s multicultural heritage. Guided tours are often available.';
      break;
    default:
      insights += ' Check opening hours and book tickets in advance during peak seasons.';
  }

  return insights;
}

/**
 * Format attraction information for AI avatar responses
 */
export function formatAttractionForAI(attraction: TouristAttraction): string {
  let formatted = `${attraction.name} is a ${attraction.category.toLowerCase()} attraction in Singapore. `;
  
  formatted += attraction.description;
  
  if (attraction.distance) {
    formatted += ` It's ${stbMapService.formatDistance(attraction.distance)} from your current location.`;
  }
  
  if (attraction.rating) {
    formatted += ` Visitors rate it ${attraction.rating} out of 5 stars.`;
  }
  
  if (attraction.openingHours) {
    formatted += ` Opening hours: ${attraction.openingHours}.`;
  }

  return formatted;
}
