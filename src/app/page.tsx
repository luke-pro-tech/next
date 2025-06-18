'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AgoraProvider } from '@/contexts/AgoraContext';

// Dynamically import Akool component to prevent SSR issues with Agora SDK
const Akool = dynamic(() => import('@/components/Akool'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      
      {/* Loading skeleton */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Initializing AI Avatar...</p>
        </div>
      </div>
      
      {/* Loading particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      </div>
    </div>
  )
});

export default function Home() {
  const router = useRouter();

  const handlePreferences = () => {
    router.push('/swipe');
  };

  const handleMaps = () => {
    router.push('/map');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navigation buttons */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-3">
        {/* Swipe Page button */}
        <button
          onClick={handlePreferences}
          className="bg-black/30 backdrop-blur-xl rounded-full px-4 py-3 border border-white/20 hover:bg-red-500/40 transition-all duration-200 group"
          aria-label="Go to Swipe Page"
        >
          <span className="text-white text-sm font-medium group-hover:text-gray-200">
            Swipe Page
          </span>
        </button>

        {/* Maps button */}
        <button
          onClick={handleMaps}
          className="bg-black/30 backdrop-blur-xl rounded-full px-4 py-3 border border-white/20 hover:bg-red-500/40 transition-all duration-200 group flex items-center gap-2"
          aria-label="Go to Maps"
        >
          <svg
            className="w-4 h-4 text-white group-hover:text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span className="text-white text-sm font-medium group-hover:text-gray-200">
            Maps
          </span>
        </button>
      </div>
      
      <AgoraProvider>
        <Akool />
      </AgoraProvider>
    </div>
  );
}
