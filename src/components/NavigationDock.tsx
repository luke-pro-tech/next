'use client';

import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function NavigationDock() {
  const router = useRouter();
  const pathname = usePathname();
  const [activePage, setActivePage] = useState('avatar');    // Update active page based on current path
  useEffect(() => {
    if (pathname === '/map') {
      setActivePage('maps');
    } else if (pathname === '/CulturalGuide') {
      setActivePage('cultural-guide');
    } else if (pathname === '/preferences') {
      setActivePage('preferences');
    }
  }, [pathname]);

  const handlePreferences = () => {
    router.push('/preferences');
  };
  
  const handleAvatar = () => {
    router.push('/');
  };
    const handleMaps = () => {
    router.push('/map');
  };

  const handleCulturalGuide = () => {
    router.push('/CulturalGuide');
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-black/80 backdrop-blur-xl px-4 py-2 border-t border-white/20 shadow-2xl flex items-center justify-center safe-area-inset-bottom">
      <div className="flex items-center justify-evenly w-full max-w-lg">
        {/* Preferences */}
        <button
          onClick={handlePreferences}
          className={`px-2 py-2 rounded-full flex flex-col items-center justify-center transition-all duration-200 min-w-[55px] ${activePage === 'preferences' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
          aria-label="Go to Preferences"
        >
          <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span className="text-xs mt-0.5 text-center">Preferences</span>
        </button>
        
        {/* Cultural Guide */}
        <button
          onClick={handleCulturalGuide}
          className={`px-2 py-2 rounded-full flex flex-col items-center justify-center transition-all duration-200 min-w-[55px] ${activePage === 'cultural-guide' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
          aria-label="Go to Cultural Guide"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs mt-0.5 text-center">Guide</span>
        </button>
        
        {/* Maps */}
        <button
          onClick={handleMaps}
          className={`px-2 py-2 rounded-full flex flex-col items-center justify-center transition-all duration-200 min-w-[55px] ${activePage === 'maps' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
          aria-label="Go to Maps"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-xs mt-0.5 text-center">Maps</span>
        </button>
      </div>
    </div>
  );
}