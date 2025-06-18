'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AgoraProvider } from '@/contexts/AgoraContext';

// Dynamically import Akool component to prevent SSR issues with Agora SDK
const Akool = dynamic(() => import('@/components/Akool'), {
  ssr: false,
  loading: () => (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
        <div className="w-full h-96 bg-gray-200 rounded-lg mb-6"></div>
        <div className="flex gap-4 justify-center mb-4">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
});

export default function AvatarPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">

        
        <AgoraProvider>
          <Akool />
        </AgoraProvider>
        
      </div>
    </div>
  );
}
