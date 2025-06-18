import React, { useState, useEffect, useCallback } from 'react';
import { ProximityAlert } from '../../hooks/useProximityTracking';

interface ProximityAlertNotificationProps {
  alert: ProximityAlert;
  onDismiss: (alertId: string) => void;
  onViewDetails: (alert: ProximityAlert) => void;
  autoHideDelay?: number;
}

interface ProximityAlertsListProps {
  alerts: ProximityAlert[];
  onDismiss: (alertId: string) => void;
  onViewDetails: (alert: ProximityAlert) => void;
  maxAlerts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ProximityAlertNotification: React.FC<ProximityAlertNotificationProps> = ({
  alert,
  onDismiss,
  onViewDetails,
  autoHideDelay = Number(process.env.NEXT_PUBLIC_ALERT_AUTO_DISMISS_DELAY) || 10000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  // Auto-hide alert after delay
  useEffect(() => {
    if (autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHideDelay]);

  const handleDismiss = useCallback(() => {
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss(alert.id);
    }, 300); // Match CSS animation duration
  }, [alert.id, onDismiss]);

  const handleViewDetails = useCallback(() => {
    onViewDetails(alert);
    handleDismiss();
  }, [alert, onViewDetails, handleDismiss]);

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    }
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const getCategoryEmoji = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'Art & Museums': '🎨',
      'Nature & Wildlife': '🌿',
      'Cultural': '🏛️',
      'Family': '👨‍👩‍👧‍👦',
      'Nightlife': '🌃',
      'Food & Culinary': '🍽️',
      'Shopping': '🛍️',
      'Historical': '🏺',
      'Religious': '⛪',
      'Adventure': '🧗',
      'Wellness': '🧘',
      'Beach': '🏖️',
      'Architecture': '🏢',
      'Festival & Events': '🎪'
    };
    return categoryMap[category] || '📍';
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        proximity-alert
        ${isDismissing ? 'dismissing' : ''}
        bg-white rounded-lg shadow-lg border-l-4 border-orange-500 p-4 mb-3 max-w-sm
        transform transition-all duration-300 ease-in-out
        ${isDismissing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">
            {getCategoryEmoji(alert.attraction.category)}
          </span>
          <div className="flex items-center text-orange-600 text-sm font-medium">
            <span className="mr-1">📍</span>
            <span>Nearby Attraction</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-2"
          title="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 text-base leading-tight">
          {alert.attraction.name}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-2">
          {alert.attraction.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{alert.attraction.category}</span>
          <span>{formatDistance(alert.distance)}</span>
        </div>

        {alert.attraction.rating && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">⭐</span>
            <span>{alert.attraction.rating}/5</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex space-x-2">
        <button
          onClick={handleViewDetails}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar for auto-hide */}
      {autoHideDelay > 0 && (
        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all ease-linear"
            style={{
              animation: `shrink ${autoHideDelay}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export const ProximityAlertsList: React.FC<ProximityAlertsListProps> = ({
  alerts,
  onDismiss,
  onViewDetails,
  maxAlerts = Number(process.env.NEXT_PUBLIC_MAX_PROXIMITY_ALERTS) || 3,
  position = 'top-right'
}) => {
  // Filter out dismissed alerts and limit the number shown
  const activeAlerts = alerts
    .filter(alert => !alert.dismissed)
    .slice(0, maxAlerts)
    .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-[1001] max-w-sm w-full px-4`}>
      {/* Alert count indicator if there are more alerts */}
      {alerts.filter(a => !a.dismissed).length > maxAlerts && (
        <div className="mb-2 text-center">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            +{alerts.filter(a => !a.dismissed).length - maxAlerts} more nearby
          </span>
        </div>
      )}

      {/* Alert notifications */}
      <div className="space-y-3">
        {activeAlerts.map((alert) => (
          <ProximityAlertNotification
            key={alert.id}
            alert={alert}
            onDismiss={onDismiss}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default ProximityAlertsList;
