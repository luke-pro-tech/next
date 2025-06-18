# Environment Configuration Guide

This guide explains how to set up environment variables for the AI Cultural Guide Singapore application.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your values:**
   ```bash
   # Required for production
   STB_API_KEY=your_actual_stb_api_key_here
   
   # Optional enhancements
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables Reference

### 🔑 API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `STB_API_KEY` | Singapore Tourism Board API key | - | Production |
| `STB_API_BASE_URL` | STB API base URL | `https://api.stb.gov.sg` | No |
| `STB_API_RATE_LIMIT` | API requests per hour | `100` | No |

### 🗺️ Map Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_DEFAULT_LATITUDE` | Default map center latitude | `1.3521` | No |
| `NEXT_PUBLIC_DEFAULT_LONGITUDE` | Default map center longitude | `103.8198` | No |
| `NEXT_PUBLIC_DEFAULT_ZOOM` | Default map zoom level | `13` | No |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox API token for enhanced features | - | No |

### 📍 Proximity Detection

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_DEFAULT_PROXIMITY_THRESHOLD` | Default detection radius (meters) | `1000` | No |
| `NEXT_PUBLIC_TRACKING_INTERVAL` | Location check frequency (ms) | `10000` | No |
| `NEXT_PUBLIC_COOLDOWN_PERIOD` | Alert cooldown period (ms) | `300000` | No |
| `NEXT_PUBLIC_MAX_PROXIMITY_ALERTS` | Max simultaneous alerts | `3` | No |
| `NEXT_PUBLIC_ALERT_AUTO_DISMISS_DELAY` | Auto-dismiss delay (ms) | `10000` | No |

### 📡 Location Services

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_ENABLE_HIGH_ACCURACY_GPS` | Use high accuracy GPS | `true` | No |
| `NEXT_PUBLIC_GPS_TIMEOUT` | GPS timeout (ms) | `10000` | No |
| `NEXT_PUBLIC_GPS_MAXIMUM_AGE` | Max cached location age (ms) | `60000` | No |
| `NEXT_PUBLIC_MOCK_LOCATION_FOR_TESTING` | Use mock location for testing | `false` | No |
| `NEXT_PUBLIC_TEST_LATITUDE` | Test location latitude | `1.3521` | No |
| `NEXT_PUBLIC_TEST_LONGITUDE` | Test location longitude | `103.8198` | No |

### 🎛️ Feature Flags

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_ENABLE_AUDIO_GUIDE` | Enable audio narration | `false` | No |
| `NEXT_PUBLIC_ENABLE_AR_FEATURES` | Enable AR overlays | `false` | No |
| `NEXT_PUBLIC_ENABLE_SOCIAL_SHARING` | Enable social sharing | `false` | No |
| `NEXT_PUBLIC_ENABLE_OFFLINE_MODE` | Enable offline functionality | `false` | No |
| `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING` | Enable performance tracking | `false` | No |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | Enable debug logging | `true` | No |

### 📊 Analytics & Monitoring

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | - | No |
| `SENTRY_DSN` | Sentry error monitoring DSN | - | No |

### 🤖 AI Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key for Bedrock | - | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for Bedrock | - | No |
| `AWS_REGION` | AWS region | `us-east-1` | No |

## Configuration Validation

The application automatically validates your configuration on startup. Check the browser console or the Configuration Status panel for validation results.

### Common Issues

1. **Missing STB API Key (Production)**
   ```
   Error: STB_API_KEY is required for production
   ```
   **Solution:** Get an API key from Singapore Tourism Board developer portal.

2. **Invalid Coordinates**
   ```
   Error: NEXT_PUBLIC_DEFAULT_LATITUDE must be between -90 and 90
   ```
   **Solution:** Ensure latitude is between -90 and 90, longitude between -180 and 180.

3. **Performance Issues**
   ```
   Warning: NEXT_PUBLIC_TRACKING_INTERVAL should be at least 5 seconds
   ```
   **Solution:** Increase tracking interval to reduce battery usage.

## Environment-Specific Settings

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_LOCATION_FOR_TESTING=true
```

### Production
```env
NODE_ENV=production
STB_API_KEY=your_production_api_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
SENTRY_DSN=your_sentry_dsn
```

### Testing
```env
NEXT_PUBLIC_MOCK_LOCATION_FOR_TESTING=true
NEXT_PUBLIC_TEST_LATITUDE=1.3521
NEXT_PUBLIC_TEST_LONGITUDE=103.8198
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

## Security Best Practices

### ✅ Do's
- Use different API keys for development and production
- Store sensitive variables (API keys) without `NEXT_PUBLIC_` prefix
- Regularly rotate API keys and secrets
- Use `.env.local` for local development (ignored by Git)

### ❌ Don'ts
- Never commit `.env.local` to version control
- Don't expose sensitive data with `NEXT_PUBLIC_` prefix
- Don't hardcode secrets in your code
- Don't share API keys in public channels

## Configuration Monitoring

### Browser Console
In development mode, configuration details are logged to the browser console:
```javascript
// View current configuration
console.log(config);

// Check validation status
console.log(validateConfig());
```

### Configuration Status Panel
Visit `/stb-demo` and expand the "Configuration Status" panel to see:
- Current environment variables
- Validation results
- Feature flag status
- API configuration status

## Troubleshooting

### Environment Variables Not Loading
1. Ensure the file is named exactly `.env.local`
2. Restart the development server after changes
3. Check for syntax errors in the env file
4. Verify variable names are exactly as documented

### Location Services Not Working
1. Check browser permissions for location access
2. Verify `NEXT_PUBLIC_ENABLE_HIGH_ACCURACY_GPS` setting
3. Test with mock location enabled for debugging
4. Check GPS timeout settings for slow devices

### Map Not Loading
1. Verify internet connection for map tiles
2. Check browser console for errors
3. Test with different map providers if available
4. Ensure coordinates are valid for Singapore

### API Rate Limiting
1. Reduce `STB_API_RATE_LIMIT` if hitting limits
2. Implement caching with `NEXT_PUBLIC_CACHE_ATTRACTIONS_TTL`
3. Use fallback data when API is unavailable

## Support

For configuration issues:
1. Check the Configuration Status panel in the app
2. Review browser console for detailed error messages
3. Validate your `.env.local` file syntax
4. Refer to this documentation for variable descriptions

The application includes comprehensive error handling and fallback mechanisms to ensure functionality even with minimal configuration.
