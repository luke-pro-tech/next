'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import Akool component to prevent SSR issues with Agora SDK
const Akool = dynamic(() => import('@/components/Akool'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      
      {/* Loading skeleton - centered for any height */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto mb-2"></div>
          <p className="text-white text-sm font-medium">Initializing AI Avatar...</p>
        </div>
      </div>
      
      {/* Loading particles - proportional to container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      </div>
    </div>
  )
});

const ActiveAvatar: React.FC = () => {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 w-full h-40 overflow-hidden z-30">
      <Akool />
    </div>
  );
};

export default ActiveAvatar;
