'use client';

import TinderCard from 'react-tinder-card';
import LocationCard from './LocationCard';

interface Card {
  image: string;
  country: string;
  title: string;
  rating: number;
  reviews: number;
  lat?: number;
  lng?: number;
}

interface SwipeStackProps {
  onCardLiked?: (card: Card) => void;
}

const cards: Card[] = [
  {
    image: 'https://destinationlesstravel.com/wp-content/uploads/2022/10/The-Christ-the-Redeemer-with-Rio-de-Janeiro-in-the-background-as-seen-from-a-scenic-flight.jpg.webp',
    country: 'Brazil',
    title: 'Rio de Janeiro',
    rating: 5.0,
    reviews: 143,
    lat: -22.9068,
    lng: -43.1729,
  },
  {
    image: 'https://hikingphotographer.uk/wp-content/uploads/2024/08/cadini-de-misurina-dolomites-italy-iStock-1496115573-scaled.jpg',
    country: 'Italy',
    title: 'Dolomites',
    rating: 4.8,
    reviews: 210,
    lat: 46.4102,
    lng: 11.8440,
  },
  {
    image: 'https://media.cntraveller.com/photos/611be9bb69410e829d87e0c2/16:9/w_2240,c_limit/Blue-domed-church-along-caldera-edge-in-Oia-Santorini-greece-conde-nast-traveller-11aug17-iStock.jpg',
    country: 'Greece',
    title: 'Santorini',
    rating: 4.9,
    reviews: 189,
    lat: 36.3932,
    lng: 25.4615,
  },
  {
    image: 'https://a.travel-assets.com/findyours-php/viewfinder/images/res70/490000/490338-lake-kawaguchi.jpg',
    country: 'Japan',
    title: 'Mount Fuji',
    rating: 4.7,
    reviews: 234,
    lat: 35.3606,
    lng: 138.7274,
  },
  {
    image: 'https://images.goway.com/production/styles/hero_s1_3xl/s3/hero/iStock-1339071089.jpg?h=89a15586&itok=zl7tkVHj',
    country: 'Peru',
    title: 'Machu Picchu',
    rating: 4.9,
    reviews: 167,
    lat: -13.1631,
    lng: -72.5450,
  },
  {
    image: 'https://res.cloudinary.com/icelandtours/g_auto,f_auto,c_fill,w_2048,q_auto:good/northern_lights_above_glacier_lagoon_v2osk_unsplash_7d39ca647f.jpg',
    country: 'Iceland',
    title: 'Northern Lights',
    rating: 4.6,
    reviews: 198,
    lat: 64.9631,
    lng: -19.0208,
  }
];

export default function SwipeStack({ onCardLiked }: SwipeStackProps) {
  const swiped = (dir: string, title: string) => {
    console.log(`Swiped ${dir} on ${title}`);
    if (dir === 'right') {
      const card = cards.find(c => c.title === title);
      if (card && onCardLiked) {
        onCardLiked(card);
      }
      console.log(`Added ${title} to favorites!`);
    }
  };

  const outOfFrame = (title: string) => {
    console.log(`${title} left the screen`);
  };

  return (
    <div className="relative flex justify-center items-center h-full w-full max-w-xs mx-auto">
      {cards.map((card, index) => (
        <TinderCard
          key={card.title}
          onSwipe={(dir) => swiped(dir, card.title)}
          onCardLeftScreen={() => outOfFrame(card.title)}
          preventSwipe={['up', 'down']}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          swipeRequirementType="position"
          swipeThreshold={100}
        >
          <div className="touch-pan-y">
            <LocationCard {...card} />
          </div>
        </TinderCard>
      ))}
    </div>
  );
}
