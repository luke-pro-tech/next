'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { RTCClient } from '../agoraHelper';

// Create the context with default value
interface AgoraContextType {
  client: RTCClient | null;
}

const AgoraContext = createContext<AgoraContextType | undefined>(undefined);

// Create a provider component
interface AgoraProviderProps {
  children: ReactNode;
}

export const AgoraProvider: React.FC<AgoraProviderProps> = ({ children }) => {
  const [client, setClient] = useState<RTCClient | null>(null);

  useEffect(() => {
    // Only initialize Agora client on the client side
    if (typeof window !== 'undefined') {
      const initializeClient = async () => {
        try {
          const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
          const agoraClient = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8',
          }) as RTCClient;
          setClient(agoraClient);
        } catch (error) {
          console.error('Failed to initialize Agora client:', error);
        }
      };
      
      initializeClient();
    }
  }, []);

  return <AgoraContext.Provider value={{ client }}>{children}</AgoraContext.Provider>;
};

// Create a custom hook to use the context
export const useAgora = (): AgoraContextType => {
  const context = useContext(AgoraContext);
  if (context === undefined) {
    throw new Error('useAgora must be used within an AgoraProvider');
  }
  return context;
};
