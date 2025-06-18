# Travel Booking App

A modern travel discovery app with Tinder-style swiping and Google Maps integration.

## Features

- **Tourism Genre Selection**: Choose from 17 different tourism categories with horizontal swipe navigation
- **Tinder-Style Discovery**: Swipe right to like places, left to pass
- **Interactive Map**: View all your liked places on Google Maps
- **Wishlist Management**: Keep track of your favorite destinations
- **Mobile-First Design**: Optimized for mobile devices with a beautiful red theme

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Tinder Card** - Swipe functionality
- **Google Maps JavaScript API** - Map integration
- **React Icons** - Icon library

## Setup Instructions

1. **Clone and Install**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up Google Maps API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Maps JavaScript API
   - Create an API key
   - Copy `.env.local` and add your API key:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
     ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Select Preferences**: Choose your tourism interests from 17 categories
2. **Discover Places**: Swipe through beautiful destinations
   - Swipe right to add to wishlist
   - Swipe left to pass
3. **View on Map**: Click the map button to see all your liked places on Google Maps
4. **Manage Wishlist**: Remove places from your wishlist anytime

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main preference selection page
│   ├── swipe/page.tsx        # Tinder-style swipe interface
│   └── map/page.tsx          # Google Maps integration
├── components/
│   ├── PreferenceForm.tsx    # Tourism genre selection
│   ├── SwipeStack.tsx        # Swipeable card stack
│   ├── LocationCard.tsx      # Individual location card
│   └── LikedCards.tsx        # Wishlist display
└── globals.css               # Global styles
```

## API Key Security

- The Google Maps API key is stored in `.env.local` which is gitignored
- The key is only used on the client side for map rendering
- Consider adding domain restrictions in Google Cloud Console for production

## Development Notes

- The app uses `--legacy-peer-deps` due to React 19 compatibility with react-tinder-card
- All location data is currently static but can be easily replaced with real API data
- The map gracefully handles missing API keys with helpful error messages

## Future Enhancements

- Integration with real travel APIs
- User authentication and cloud storage
- Advanced filtering and search
- Booking integration
- Social features and sharing
