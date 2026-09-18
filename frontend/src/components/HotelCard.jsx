import React from 'react';
import { Link } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  const minPrice = hotel.roomTypes && hotel.roomTypes.length > 0
    ? Math.min(...hotel.roomTypes.map(r => r.price))
    : 0;

  return (
    <Link to={`/hotel/${hotel._id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-500">
        <div className="relative h-56 overflow-hidden">
          <img
            src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {hotel.coupleFriendly && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-green-700 rounded-full">
              Couple friendly
            </span>
          )}
        </div>
        <div className="p-6">
          <h3 className="font-serif text-2xl text-gray-900 mb-2">{hotel.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{hotel.address}</p>
          <div className="flex items-center justify-between">
            <span className="text-teal-700 font-medium">
              From PKR {minPrice.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">/ night</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;