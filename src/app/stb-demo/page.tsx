"use client";

import React, { useState, useEffect } from 'react';
import AttractionSearch from '../../components/AttractionSearch';
import { getPersonalizedRecommendations, getNearbyAttractionsForContext, getCategoryInsights, TourismContext } from '../../utils/tourismAI';
import { SingaporeCategory } from '../../services/stbMapService';
import { useUserLocation } from '../../hooks/useSTBMap';

export default function STBDemoPage() {
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { location, loading: locationLoading } = useUserLocation();

  // Demo tourism context
  const [tourismContext, setTourismContext] = useState<TourismContext>({
    interests: ['Art & Museums', 'Cultural'],
    budget: 'medium',
    travelStyle: 'couple',
    duration: 'full-day'
  });

  // Get AI insights when location is available
  useEffect(() => {
    if (location && !locationLoading) {
      generateAIInsights();
    }
  }, [location, locationLoading]);

  const generateAIInsights = async () => {
    if (!location) return;

    setLoading(true);
    try {
      // Get nearby attractions context
      const nearbyContext = await getNearbyAttractionsForContext(
        location.latitude, 
        location.longitude, 
        1000
      );

      // Get category insights for user interests
      let categoryInsights = '';
      if (tourismContext.interests && tourismContext.interests.length > 0) {
        const insights = await Promise.all(
          tourismContext.interests.map(category => 
            getCategoryInsights(category as SingaporeCategory, location)
          )
        );
        categoryInsights = insights.join('\n\n');
      }

      // Get personalized recommendations
      const personalizedRecs = await getPersonalizedRecommendations({
        ...tourismContext,
        userLocation: location
      }, 3);

      setRecommendations(personalizedRecs);

      // Combine insights for AI avatar
      const combinedInsights = `
🌟 AI Tourism Assistant Insights:

📍 Your Location Context:
${nearbyContext}

🎯 Personalized Insights:
${categoryInsights}

💡 Top Recommendations:
${personalizedRecs.map((rec, index) => 
  `${index + 1}. ${rec.attraction.name} - ${rec.reason}${rec.tips ? '\n   Tips: ' + rec.tips.join(', ') : ''}`
).join('\n')}
      `;

      setAiInsights(combinedInsights);

    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsights('Unable to generate AI insights at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttractionSelect = (attraction: any) => {
    setSelectedAttraction(attraction);
  };

  const updateContext = (key: keyof TourismContext, value: any) => {
    setTourismContext(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🇸🇬 STB Map API Integration Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Demonstrating how the Singapore Tourism Board Map API can enhance 
            AI avatar responses with contextual tourist attraction information.
          </p>
        </div>

        {/* Tourism Context Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🤖 AI Tourism Context</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <select
                multiple
                value={tourismContext.interests || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  updateContext('interests', values);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
              >
                <option value="Art & Museums">Art & Museums</option>
                <option value="Nature & Wildlife">Nature & Wildlife</option>
                <option value="Cultural">Cultural</option>
                <option value="Family">Family</option>
                <option value="Nightlife">Nightlife</option>
                <option value="Food & Culinary">Food & Culinary</option>
                <option value="Shopping">Shopping</option>
                <option value="Historical">Historical</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <select
                value={tourismContext.budget || ''}
                onChange={(e) => updateContext('budget', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="low">Low Budget</option>
                <option value="medium">Medium Budget</option>
                <option value="high">High Budget</option>
              </select>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Style
              </label>
              <select
                value={tourismContext.travelStyle || ''}
                onChange={(e) => updateContext('travelStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="solo">Solo</option>
                <option value="couple">Couple</option>
                <option value="family">Family</option>
                <option value="group">Group</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={tourismContext.duration || ''}
                onChange={(e) => updateContext('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="half-day">Half Day</option>
                <option value="full-day">Full Day</option>
                <option value="multi-day">Multi Day</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateAIInsights}
            disabled={loading || locationLoading || !location}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating Insights...' : 'Generate AI Insights'}
          </button>
        </div>

        {/* AI Insights Panel */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              🤖 AI Avatar Response Context
            </h2>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-4 rounded-md border overflow-auto max-h-96">
              {aiInsights}
            </pre>
            <p className="text-xs text-blue-600 mt-2">
              This contextual information would be provided to the AI avatar to enhance its tourism guidance responses.
            </p>
          </div>
        )}

        {/* Recommendations Display */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">🎯 Personalized Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {rec.attraction.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {rec.attraction.description}
                  </p>
                  <div className="text-xs text-blue-600 mb-2">
                    Score: {rec.relevanceScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {rec.reason}
                  </div>
                  {rec.tips && (
                    <div className="text-xs text-green-600">
                      💡 {rec.tips.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Attraction Search Component */}
        <AttractionSearch onAttractionSelect={handleAttractionSelect} />

        {/* Selected Attraction Details */}
        {selectedAttraction && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🏛️ Selected Attraction Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {selectedAttraction.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {selectedAttraction.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>📍 {selectedAttraction.address}</div>
                  <div>🏷️ {selectedAttraction.category}</div>
                  {selectedAttraction.rating && (
                    <div>⭐ {selectedAttraction.rating}/5</div>
                  )}
                  {selectedAttraction.distance && (
                    <div>📏 {selectedAttraction.distance}m away</div>
                  )}
                  {selectedAttraction.openingHours && (
                    <div>🕒 {selectedAttraction.openingHours}</div>
                  )}
                </div>
              </div>
              {selectedAttraction.imageUrl && (
                <div>
                  <img
                    src={selectedAttraction.imageUrl}
                    alt={selectedAttraction.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Example AI Avatar Response */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                🤖 Example AI Avatar Response:
              </h4>
              <p className="text-sm text-blue-700">
                "Great choice! {selectedAttraction.name} is {selectedAttraction.description.toLowerCase()}
                {selectedAttraction.distance ? ` It's about ${Math.round(selectedAttraction.distance)}m from your location, which is ` : ''}
                {selectedAttraction.distance && selectedAttraction.distance <= 500 ? 'a short walk away.' : 
                 selectedAttraction.distance && selectedAttraction.distance <= 1000 ? 'within comfortable walking distance.' : 'easily accessible by public transport.'}
                {selectedAttraction.rating ? ` Visitors typically rate it ${selectedAttraction.rating} out of 5 stars.` : ''}
                {selectedAttraction.openingHours ? ` Please note that it's open ${selectedAttraction.openingHours.toLowerCase()}.` : ''}
                Would you like me to suggest other nearby attractions or help you plan your visit?"
              </p>
            </div>
          </div>
        )}

        {/* Integration Notes */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-3">
            🔧 Integration Notes
          </h2>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li>• The STB Map API service provides real-time tourist attraction data</li>
            <li>• Fallback data ensures the app works even when the API is unavailable</li>
            <li>• AI utilities format attraction data for natural language responses</li>
            <li>• Location-based recommendations consider user preferences and context</li>
            <li>• The service validates coordinates to ensure they're within Singapore</li>
            <li>• Distance calculations help prioritize nearby attractions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
