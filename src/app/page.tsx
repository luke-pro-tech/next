'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AgoraProvider } from '@/contexts/AgoraContext';
import PreferenceForm from '@/components/PreferenceForm';

// Dynamically import Akool component to prevent SSR issues with Agora SDK
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

  return (
    <PreferenceForm></PreferenceForm>
  );
}
