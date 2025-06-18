'use client';

import React, { useState, useRef, useEffect } from 'react';
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

// Dynamically import Map component
const MapPage = dynamic(() => import('./map/page'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-600">Loading map...</div>
    </div>
  )
});

export default function Home() {
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const [miniPosition, setMiniPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const miniVideoRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState('avatar');

  const handleSwipe = () => {
    router.push('/swipe');
  };

  const handleMaps = () => {
    router.push('/map');
    setActivePage('maps');
  };

  const handlePreferences = () => {
    router.push('/preferences');
    setActivePage('preferences');
  };
  
  const handleAvatar = () => {
    router.push('/');
    setActivePage('avatar');
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  // Handle dragging for mini video
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = miniVideoRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within screen bounds
      const maxX = window.innerWidth - 250; // 250px is mini video width
      const maxY = window.innerHeight - 150; // 150px is mini video height
      
      setMiniPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (isMinimized) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Map */}
        <MapPage />

        {/* Mini Avatar Video - Draggable */}
        <div
          ref={miniVideoRef}
          className="absolute z-50 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
          style={{
            left: `${miniPosition.x}px`,
            top: `${miniPosition.y}px`,
            width: '250px',
            height: '150px',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Mini video header */}
          <div className="flex items-center justify-between p-2 border-b border-white/20 bg-black/50">
            <span className="text-white text-xs font-medium">AI Travel Guide</span>
            <div className="flex items-center gap-1">
              {/* Maximize button */}
              <button
                onClick={handleMaximize}
                className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Maximize Avatar"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mini video content */}
          <div 
            className="relative overflow-hidden"
            style={{ height: '120px' }}
          >
            <div 
              className="absolute inset-0 transform-gpu"
              style={{
                transform: 'scale(0.31)',
                transformOrigin: 'top left',
                width: '800px',
                height: '600px'
              }}
            >
              <AgoraProvider>
                <Akool />
              </AgoraProvider>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navigation buttons */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-3">
        {/* Minimize button */}
        <button
          onClick={handleMinimize}
          className="bg-black/30 backdrop-blur-xl rounded-full px-4 py-3 border border-white/20 hover:bg-blue-500/40 transition-all duration-200 group flex items-center gap-2"
          aria-label="Minimize Avatar"
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
              d="M20 12H4"
            />
          </svg>
          <span className="text-white text-sm font-medium group-hover:text-gray-200">
            Minimize
          </span>
        </button>

        {/* Swipe Page button */}
        <button
          onClick={handleSwipe}
          className="bg-black/30 backdrop-blur-xl rounded-full px-4 py-3 border border-white/20 hover:bg-red-500/40 transition-all duration-200 group"
          aria-label="Go to Swipe Page"
        >
          <span className="text-white text-sm font-medium group-hover:text-gray-200">
            Swipe Page
          </span>
        </button>
      </div>
      
      <AgoraProvider>
        <Akool />
      </AgoraProvider>
    </div>
  );
}
