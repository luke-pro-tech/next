"use client";

import React, { useEffect } from 'react';
import CulturalGuide from '../../components/CulturalGuide';
import ConfigurationStatus from '../../components/ConfigurationStatus';
import { config, validateConfig, debugConfig } from '../../utils/config';

export default function STBDemoPage() {
  useEffect(() => {
    // Debug configuration in development
    if (config.features.enableDebugMode) {
      debugConfig();
    }
    
    // Validate configuration
    const validation = validateConfig();
    if (!validation.isValid) {
      console.warn('⚠️ Configuration issues detected:', validation.errors);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Configuration Status Panel */}
        {/* <ConfigurationStatus /> */}
        
        {/* Main Cultural Guide */}
        <CulturalGuide 
          defaultProximityThreshold={config.proximity.defaultThreshold}
          showAvatar={true}
          enableAudioGuide={config.features.enableAudioGuide}
        />
      </div>
    </div>
  );
}
