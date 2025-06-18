import React, { useState } from 'react';
import { config, validateConfig, getClientConfig } from '../../utils/config';

export const ConfigurationStatus: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const validation = validateConfig();
  const clientConfig = getClientConfig();

  const getStatusColor = () => {
    if (validation.isValid) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getStatusIcon = () => {
    if (validation.isValid) return '✅';
    return '⚠️';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getStatusIcon()}</span>
          <div>
            <h3 className="font-medium text-gray-900">
              Configuration Status
            </h3>
            <p className="text-sm text-gray-600">
              {validation.isValid 
                ? 'Environment configuration is valid' 
                : `${validation.errors.length} configuration issue(s) detected`
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {!validation.isValid && (
        <div className={`mt-4 p-3 rounded-md border ${getStatusColor()}`}>
          <h4 className="font-medium mb-2">Configuration Issues:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {showDetails && (
        <div className="mt-4 space-y-4">
          {/* Environment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Application</h4>
              <div className="space-y-1">
                <div>Name: {clientConfig.app.name}</div>
                <div>Version: {clientConfig.app.version}</div>
                <div>Environment: {clientConfig.app.nodeEnv}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Map Settings</h4>
              <div className="space-y-1">
                <div>Center: {clientConfig.map.defaultLatitude.toFixed(4)}, {clientConfig.map.defaultLongitude.toFixed(4)}</div>
                <div>Zoom: {clientConfig.map.defaultZoom}</div>
                <div>Mapbox: {clientConfig.map.mapboxToken ? 'Configured' : 'Not configured'}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Proximity</h4>
              <div className="space-y-1">
                <div>Threshold: {clientConfig.proximity.defaultThreshold}m</div>
                <div>Tracking: {clientConfig.proximity.trackingInterval / 1000}s</div>
                <div>Cooldown: {clientConfig.proximity.cooldownPeriod / 60000}min</div>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Feature Flags</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {Object.entries(clientConfig.features).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="capitalize">{key.replace(/^enable/, '').replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Settings */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Location Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div>High Accuracy: {clientConfig.location.enableHighAccuracy ? 'Enabled' : 'Disabled'}</div>
                <div>Timeout: {clientConfig.location.timeout / 1000}s</div>
                <div>Max Age: {clientConfig.location.maximumAge / 1000}s</div>
              </div>
              <div className="space-y-1">
                <div>Mock Location: {clientConfig.location.mockLocationForTesting ? 'Enabled' : 'Disabled'}</div>
                {clientConfig.location.mockLocationForTesting && (
                  <>
                    <div>Test Lat: {clientConfig.location.testLatitude.toFixed(4)}</div>
                    <div>Test Lng: {clientConfig.location.testLongitude.toFixed(4)}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">API Configuration</h4>
            <div className="text-sm space-y-1">
              <div>STB API: {config.stb.apiKey ? '🔑 Configured' : '❌ No API key'}</div>
              <div>Base URL: {config.stb.baseUrl}</div>
              <div>Analytics: {clientConfig.analytics.googleAnalyticsId ? '📊 Configured' : '📊 Not configured'}</div>
            </div>
          </div>

          {/* Environment Variables Help */}
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Configuration Help</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Copy <code>.env.example</code> to <code>.env.local</code> to customize settings</p>
              <p>• Use <code>NEXT_PUBLIC_</code> prefix for client-side variables</p>
              <p>• Restart the development server after changing environment variables</p>
              <p>• Check the console for detailed configuration validation</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationStatus;
