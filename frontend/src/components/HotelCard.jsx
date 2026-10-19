import React from 'react';
import { Link } from 'react-router-dom';

// Distance calculate karne ka function (Haversine Formula)
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const HotelCard = ({ hotel, userLocation }) => {
  const minPrice = hotel.roomTypes && hotel.roomTypes.length > 0
    ? Math.min(...hotel.roomTypes.map(r => r.price))
    : 0;

  // Distance calculate karo agar userLocation majood hai
  let distanceText = null;
  if (userLocation && userLocation.lat && userLocation.lng && hotel.location?.coordinates) {
    // MongoDB mein coordinates [lng, lat] hotay hain
    const hotelLng = hotel.location.coordinates[0];
    const hotelLat = hotel.location.coordinates[1];
    
    const dist = getDistanceKm(userLocation.lat, userLocation.lng, hotelLat, hotelLng);
    distanceText = `${dist.toFixed(1)} km away`;
  }

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
          
          {/* Distance Badge */}
          {distanceText && (
            <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-700 rounded-full shadow-sm">
              📍 {distanceText}
            </span>
          )}

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