'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AgoraProvider } from '@/contexts/AgoraContext';
import PreferenceForm from '@/components/PreferenceForm';
import Akool from '@/components/Akool';

// Dynamically import Akool component to prevent SSR issues with Agora SDK

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
    <PreferenceForm></PreferenceForm>
  );
}
