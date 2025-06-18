'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AgoraProvider } from '@/contexts/AgoraContext';
import PreferenceForm from '@/components/PreferenceForm';

// Dynamically import Akool component to prevent SSR issues with Agora SDK

export default function Home() {
  const router = useRouter();

  const handlePreferences = () => {
    router.push('/swipe');
  };

  const handleMaps = () => {
    router.push('/map');
  };

  return (
    <PreferenceForm></PreferenceForm>
  );
}
