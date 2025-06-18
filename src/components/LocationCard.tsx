'use client';

import { FaHeart, FaStar } from 'react-icons/fa';

interface LocationCardProps {
  image: string;
  country: string;
  title: string;
  rating: number;
  reviews: number;
}

export default function LocationCard({
  image,
  country,
  title,
  rating,
  reviews,
}: LocationCardProps) {
  return (
    <div className="relative w-72 h-80 rounded-2xl overflow-hidden shadow-lg">
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
        <p className="text-xs opacity-90 mb-1">{country}</p>
        <h2 className="text-lg font-bold mb-1">{title}</h2>
        <div className="flex items-center text-xs gap-2 mb-2">
          <span className="flex items-center gap-1">
            <FaStar className="text-yellow-400" /> {rating}
          </span>
          <span className="opacity-80">{reviews} reviews</span>
        </div>
        <button className="w-full bg-white/20 hover:bg-white/30 transition rounded-full py-2 text-xs font-semibold backdrop-blur-sm border border-white/20">
          See more →
        </button>
      </div>
      <button className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500/80 transition border border-white/20">
        <FaHeart size={14} />
      </button>
    </div>
  );
}
