'use client';

import React from 'react';
import dynamic from 'next/dynamic';
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

export default function AvatarPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AgoraProvider>
        <Akool />
      </AgoraProvider>
    </div>
  );
}