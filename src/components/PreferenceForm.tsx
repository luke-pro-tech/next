'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface STBDataset {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

const stbDatasets: STBDataset[] = [
  { 
    id: 'accommodation', 
    name: 'Accommodation', 
    imageUrl: '/accommodation.jpg',
    description: 'Hotels, resorts, and places to stay'
  },
  { 
    id: 'attractions', 
    name: 'Attractions', 
    imageUrl: '/adventure.jpg',
    description: 'Tourist attractions and landmarks'
  },
  { 
    id: 'events', 
    name: 'Events', 
    imageUrl: '/universal.jpg',
    description: 'Festivals, shows, and happenings'
  },
  { 
    id: 'food_beverages', 
    name: 'Food & Beverages', 
    imageUrl: '/food.jpg',
    description: 'Restaurants, cafes, and dining'
  },
  { 
    id: 'mice_events', 
    name: 'MICE Events', 
    imageUrl: '/nightlife.jpg',
    description: 'Business meetings and conferences'
  },
  { 
    id: 'precincts', 
    name: 'Precincts', 
    imageUrl: '/historical.jpg',
    description: 'Districts and neighborhoods'
  },
  { 
    id: 'shops', 
    name: 'Shopping', 
    imageUrl: '/shopping.jpg',
    description: 'Retail stores and shopping centers'
  },
  { 
    id: 'tours', 
    name: 'Tours', 
    imageUrl: '/nature&wildlife.jpg',
    description: 'Guided tours and experiences'
  }
];

export default function PreferenceForm() {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const totalPages = Math.ceil(stbDatasets.length / 4);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const pageWidth = scrollContainer.clientWidth;
      const newPage = Math.round(scrollLeft / (pageWidth * 0.8)); // Approximate page calculation
      setCurrentPage(Math.min(newPage, totalPages - 1));
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [totalPages]);

  const handleSelect = (id: string) => {
    setSelectedDatasets(prev => {
      if (prev.includes(id)) {
        return prev.filter(datasetId => datasetId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedDatasets.length > 0) {
      // Store selected datasets in localStorage for the swipe page to use
      localStorage.setItem('selectedDatasets', JSON.stringify(selectedDatasets));
      // Navigate to swipe page
      router.push('/swipe');
    } else {
      alert('Please select at least one category');
    }
  };

  return (
    <form className="p-4">
      <div 
        ref={scrollRef}
        className="overflow-x-auto pb-4 snap-x snap-mandatory touch-pan-x"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex gap-6 w-max">
          {Array.from({ length: Math.ceil(stbDatasets.length / 4) }, (_, pageIndex) => (
            <div key={pageIndex} className="grid grid-cols-2 gap-3 w-80 flex-shrink-0 snap-start snap-always">
              {stbDatasets
                .slice(pageIndex * 4, (pageIndex + 1) * 4)
                .map((dataset) => (
                  <div
                    key={dataset.id}
                    onClick={() => handleSelect(dataset.id)}
                    className={`rounded-xl overflow-hidden relative shadow-md cursor-pointer border-2 transition-all duration-200 hover:shadow-lg ${
                      selectedDatasets.includes(dataset.id) ? 'border-red-500 ring-2 ring-red-200' : 'border-transparent hover:border-red-200'
                    }`}
                  >
                    <img
                      src={dataset.imageUrl}
                      alt={dataset.name}
                      className="h-48 w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2">
                      <h3 className="text-xs font-semibold text-center leading-tight">{dataset.name}</h3>
                      <p className="text-xs opacity-80 text-center mt-1">{dataset.description}</p>
                    </div>
                    {selectedDatasets.includes(dataset.id) && (
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

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentPage ? 'bg-red-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      <div className="mt-6 mb-24 text-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedDatasets.length === 0}
          className="w-full bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {selectedDatasets.length === 0 
            ? 'Select preferences to continue' 
            : `Discover places (${selectedDatasets.length} selected)`
          }
        </button>
      </div>
    </form>
  );
}
