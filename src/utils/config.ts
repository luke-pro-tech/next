/**
 * Application Configuration
 * Centralizes environment variable handling and provides type-safe configuration
 */

export interface AppConfig {
  // API Configuration
  stb: {
    apiKey: string | undefined;
    baseUrl: string;
    rateLimit: number;
    rateWindow: number;
  };
  
  // Map Configuration
  map: {
    defaultLatitude: number;
    defaultLongitude: number;
    defaultZoom: number;
    mapboxToken: string | undefined;
  };
  
  // Proximity Detection
  proximity: {
    defaultThreshold: number;
    trackingInterval: number;
    cooldownPeriod: number;
    maxAlertsDisplay: number;
    alertAutoDismissDelay: number;
  };
  
  // Location Services
  location: {
    enableHighAccuracy: boolean;
    timeout: number;
    maximumAge: number;
    mockLocationForTesting: boolean;
    testLatitude: number;
    testLongitude: number;
  };
  
  // Content Settings
  content: {
    maxAttractionsDisplay: number;
    cacheAttractionsTTL: number;
    cacheLocationTTL: number;
  };
  
  // Feature Flags
  features: {
    enableAudioGuide: boolean;
    enableARFeatures: boolean;
    enableSocialSharing: boolean;
    enableOfflineMode: boolean;
    enablePerformanceMonitoring: boolean;
    enableDebugMode: boolean;
  };
  
  // Analytics & Monitoring
  analytics: {
    googleAnalyticsId: string | undefined;
    sentryDsn: string | undefined;
  };
  
  // Application Info
  app: {
    name: string;
    version: string;
    nodeEnv: string;
  };
}

/**
 * Get configuration from environment variables with defaults
 */
export const getConfig = (): AppConfig => {
  return {
    stb: {
      apiKey: process.env.STB_API_KEY,
      baseUrl: process.env.STB_API_BASE_URL || 'https://api.stb.gov.sg',
      rateLimit: Number(process.env.STB_API_RATE_LIMIT) || 100,
      rateWindow: Number(process.env.STB_API_RATE_WINDOW) || 3600000,
    },
    
    map: {
      defaultLatitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE) || 1.3521,
      defaultLongitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE) || 103.8198,
      defaultZoom: Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM) || 13,
      mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    },
    
    proximity: {
      defaultThreshold: Number(process.env.NEXT_PUBLIC_DEFAULT_PROXIMITY_THRESHOLD) || 1000,
      trackingInterval: Number(process.env.NEXT_PUBLIC_TRACKING_INTERVAL) || 10000,
      cooldownPeriod: Number(process.env.NEXT_PUBLIC_COOLDOWN_PERIOD) || 300000,
      maxAlertsDisplay: Number(process.env.NEXT_PUBLIC_MAX_PROXIMITY_ALERTS) || 3,
      alertAutoDismissDelay: Number(process.env.NEXT_PUBLIC_ALERT_AUTO_DISMISS_DELAY) || 10000,
    },
    
    location: {
      enableHighAccuracy: process.env.NEXT_PUBLIC_ENABLE_HIGH_ACCURACY_GPS === 'true',
      timeout: Number(process.env.NEXT_PUBLIC_GPS_TIMEOUT) || 10000,
      maximumAge: Number(process.env.NEXT_PUBLIC_GPS_MAXIMUM_AGE) || 60000,
      mockLocationForTesting: process.env.NEXT_PUBLIC_MOCK_LOCATION_FOR_TESTING === 'true',
      testLatitude: Number(process.env.NEXT_PUBLIC_TEST_LATITUDE) || 1.3521,
      testLongitude: Number(process.env.NEXT_PUBLIC_TEST_LONGITUDE) || 103.8198,
    },
    
    content: {
      maxAttractionsDisplay: Number(process.env.NEXT_PUBLIC_MAX_ATTRACTIONS_DISPLAY) || 50,
      cacheAttractionsTTL: Number(process.env.NEXT_PUBLIC_CACHE_ATTRACTIONS_TTL) || 300000,
      cacheLocationTTL: Number(process.env.NEXT_PUBLIC_CACHE_LOCATION_TTL) || 60000,
    },
    
    features: {
      enableAudioGuide: process.env.NEXT_PUBLIC_ENABLE_AUDIO_GUIDE === 'true',
      enableARFeatures: process.env.NEXT_PUBLIC_ENABLE_AR_FEATURES === 'true',
      enableSocialSharing: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_SHARING === 'true',
      enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
      enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
      enableDebugMode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
    },
    
    analytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
      sentryDsn: process.env.SENTRY_DSN,
    },
    
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'AI Cultural Guide Singapore',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  };
};

/**
 * Get client-safe configuration (only NEXT_PUBLIC_ variables)
 */
export const getClientConfig = () => {
  const config = getConfig();
  
  return {
    map: config.map,
    proximity: config.proximity,
    location: config.location,
    content: config.content,
    features: config.features,
    analytics: {
      googleAnalyticsId: config.analytics.googleAnalyticsId,
    },
    app: config.app,
  };
};

/**
 * Validate required environment variables
 */
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = getConfig();
  
  // Check for required production settings
  if (config.app.nodeEnv === 'production') {
    if (!config.stb.apiKey) {
      errors.push('STB_API_KEY is required for production');
    }
    
    if (!config.analytics.googleAnalyticsId) {
      errors.push('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID recommended for production');
    }
  }
  
  // Validate coordinate ranges
  if (config.map.defaultLatitude < -90 || config.map.defaultLatitude > 90) {
    errors.push('NEXT_PUBLIC_DEFAULT_LATITUDE must be between -90 and 90');
  }
  
  if (config.map.defaultLongitude < -180 || config.map.defaultLongitude > 180) {
    errors.push('NEXT_PUBLIC_DEFAULT_LONGITUDE must be between -180 and 180');
  }
  
  // Validate proximity settings
  if (config.proximity.defaultThreshold < 100 || config.proximity.defaultThreshold > 10000) {
    errors.push('NEXT_PUBLIC_DEFAULT_PROXIMITY_THRESHOLD should be between 100m and 10km');
  }
  
  if (config.proximity.trackingInterval < 5000) {
    errors.push('NEXT_PUBLIC_TRACKING_INTERVAL should be at least 5 seconds for battery efficiency');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Debug configuration (development only)
 */
export const debugConfig = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const config = getConfig();
  const validation = validateConfig();
  
  console.group('🔧 App Configuration');
  console.log('Configuration:', config);
  console.log('Validation:', validation);
  
  if (!validation.isValid) {
    console.warn('❌ Configuration issues:', validation.errors);
  } else {
    console.log('✅ Configuration is valid');
  }
  
  console.groupEnd();
};

// Export singleton instance
export const config = getConfig();
