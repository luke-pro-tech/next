
import { useState, useEffect } from 'react';
import { stbApiService, SwipeCard } from '@/services/stbApi';

interface UseSTBDataReturn {
  cards: SwipeCard[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSTBData(selectedDatasets: string[]): UseSTBDataReturn {
  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!selectedDatasets || selectedDatasets.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching STB data for datasets:', selectedDatasets);
      
      // Try to fetch from STB API
      const stbCards = await stbApiService.fetchDataByPreferences(selectedDatasets);
      
      if (stbCards.length > 0) {
        console.log('Successfully fetched', stbCards.length, 'cards from STB API');
        setCards(stbCards);
      } else {
        console.log('No data from STB API, using fallback cards');
        // Use fallback cards if no data from API
        const fallbackCards = stbApiService.getFallbackCards();
        setCards(fallbackCards);
      }
    } catch (error) {
      console.error('Error fetching STB data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      
      // Use fallback cards on error
      const fallbackCards = stbApiService.getFallbackCards();
      setCards(fallbackCards);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDatasets]);

  const refetch = () => {
    fetchData();
  };

  return {
    cards,
    loading,
    error,
    refetch
  };
}
