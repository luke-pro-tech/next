'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TourismGenre {
  id: string;
  name: string;
  imageUrl: string;
}

const tourismGenres: TourismGenre[] = [
  { id: 'adventure', name: 'Adventure & Exploration', imageUrl: '/adventure.jpg' },
  { id: 'arts', name: 'Arts & Museums', imageUrl: '/art-musuem.jpg' },
  { id: 'fitness_holistic_wellness', name: 'Fitness & Holistic Wellness', imageUrl: '/wellness.jpg' },
  { id: 'history_culture', name: 'History & Culture', imageUrl: '/historical.jpg' },
  { id: 'recreation_leisure', name: 'Leisure & Recreation', imageUrl: '/recreation.jpg' },
  { id: 'nature_wildlife', name: 'Nature & Wildlife', imageUrl: '/nature&wildlife.jpg' },
  { id: 'entertainment', name: 'Entertainment & Nightlife', imageUrl: '/nightlife.jpg' },
  { id: 'food_beverage', name: 'Food & Beverages', imageUrl: '/food.jpg' },
  { id: 'shopping', name: 'Shopping & Fashion', imageUrl: '/shopping.jpg' },
  { id: 'sport', name: 'Sports & Events', imageUrl: '/universal.jpg' },
  { id: 'others', name: 'Other Attractions', imageUrl: '/others.jpg' }
];

export default function PreferenceForm() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const router = useRouter();

  const handleSelect = (id: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(id)) {
        return prev.filter(genreId => genreId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedGenres.length > 0) {
      // Store selected genres in localStorage for the swipe page to use
      localStorage.setItem('selectedGenres', JSON.stringify(selectedGenres));
      // Navigate to swipe page
      router.push('/swipe');
    } else {
      alert('Please select at least one tourism genre');
    }
  };

  return (
    <form className="p-4">
      <div className="overflow-x-auto pb-4 snap-x snap-mandatory">
        <div className="flex gap-6 w-max">
          {Array.from({ length: Math.ceil(tourismGenres.length / 4) }, (_, pageIndex) => (
            <div key={pageIndex} className="grid grid-cols-2 gap-3 w-80 flex-shrink-0 snap-start snap-always">
              {tourismGenres
                .slice(pageIndex * 4, (pageIndex + 1) * 4)
                .map((genre) => (
                  <div
                    key={genre.id}
                    onClick={() => handleSelect(genre.id)}
                    className={`rounded-xl overflow-hidden relative shadow-md cursor-pointer border-2 transition-all duration-200 hover:shadow-lg ${
                      selectedGenres.includes(genre.id) ? 'border-red-500 ring-2 ring-red-200' : 'border-transparent hover:border-red-200'
                    }`}
                  >
                    <img
                      src={genre.imageUrl}
                      alt={genre.name}
                      className="h-48 w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2">
                      <h3 className="text-xs font-semibold text-center leading-tight">{genre.name}</h3>
                    </div>
                    {selectedGenres.includes(genre.id) && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-4">
          {selectedGenres.length > 0 
            ? `${selectedGenres.length} genre${selectedGenres.length !== 1 ? 's' : ''} selected`
            : 'Swipe horizontally to see all genres'}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedGenres.length === 0}
          className="w-full bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {selectedGenres.length === 0 
            ? 'Select preferences to continue' 
            : `Discover places (${selectedGenres.length} selected)`
          }
        </button>
      </div>
    </form>
  );
}
